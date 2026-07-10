import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const baseLanguage = body.baseLanguage ?? "English";
    const targetLanguage = body.targetLanguage ?? "Spanish";
    const category = body.category ?? "greetings";
    const count = Number(body.count ?? 6);

    const systemPrompt = `
You create vocabulary mini-lessons for children ages 7–11.
Return exactly ${count} word entries as pure JSON, with NO extra text.

Each item must be:
{
  "id": "short-unique-id",
  "base": "word in ${baseLanguage}",
  "target": "word in ${targetLanguage}",
  "emoji": "one emoji that matches the word",
  "example": "short, kid-friendly sentence in ${targetLanguage} that uses the word"
}

The full response must be a JSON array only, like:
[
  { "id": "...", "base": "...", "target": "...", "emoji": "...", "example": "..." }
]

Do NOT add explanations, backticks, or any extra keys.
Keep vocabulary simple and friendly.
Category: ${category}.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content:
            "Return only the JSON array described, nothing before or after.",
        },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content ?? "[]";
  
    const jsonStart = raw.indexOf("[");
    const jsonEnd = raw.lastIndexOf("]");
    const jsonText =
      jsonStart !== -1 && jsonEnd !== -1
        ? raw.slice(jsonStart, jsonEnd + 1)
        : "[]";

    const words = JSON.parse(jsonText);

    return NextResponse.json({ words });
  } catch (error) {
    console.error("Error in /api/words:", error);
    return NextResponse.json(
      { error: "Failed to generate words" },
      { status: 500 }
    );
  }
}

