## Allen Girls Adventures

A Next.js 16 application for the Allen Girls Adventures learning world.

### OpenMAIC Voice Integration

- Integration guide: `OPENMAIC_VOICE_INTEGRATION.md`
- New secure AGA proxy routes:
  - `POST /api/voice/session/start`
  - `POST /api/voice/practice/attempt`
  - `POST /api/voice/session/complete`
- Required env vars for server-to-server voice integration:
  - `OPENMAIC_BASE_URL`
  - `OPENMAIC_SERVICE_TOKEN`
  - `OPENMAIC_TIMEOUT_MS` (optional, defaults to 30000)

### AI School Redirect Integration

- Explore lesson step clicks can be redirected to external AI School site with signed payloads.
- New APIs:
  - `POST /api/learn/course-view` (stores latest course/unit/step view in user metadata)
  - `POST /api/learn/redirect` (returns signed redirect URL)
- Required env vars:
  - `AI_Scool_SiteURl` (requested env name, destination base URL)
  - `AI_SCHOOL_REDIRECT_SECRET` (HMAC signing secret)

### New Auth Entry Pages

- `GET /login`: role-based login form for **Parents** and **Teachers**
- `GET /signup`: role-based signup form for **Parents** and **Teachers**
- Marketing CTA buttons now route to these pages from `src/app/(marketing)/page.tsx` and `src/app/(marketing)/header.tsx`

These pages currently provide the UI and field handling for each role. You can connect them to your backend auth API in the next step.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
