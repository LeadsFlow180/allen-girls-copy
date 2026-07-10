"use server";

/**
 * Stub for subscription checkout URL creation.
 * The UI expects `{ data?: string }`.
 */
export async function createStripeUrl(): Promise<{ data?: string | null }> {
  return { data: null };
}

