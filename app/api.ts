// ─── Neon Auth ───────────────────────────────────────────────────────────────
// Auth Base URL — найди точный адрес в Neon Console → Auth → Configuration tab
const NEON_AUTH_URL =
  "https://ep-aged-voice-alirnpa6.neonauth.c-3.eu-central-1.aws.neon.tech/neondb/auth";

async function neonAuthRequest(path: string, body: object) {
  const res = await fetch(`${NEON_AUTH_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:8081",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      json.error?.message ??
        json.message ??
        JSON.stringify(json) ??
        "Auth error",
    );
  }
  return json;
}

export async function register(email: string, password: string, name?: string) {
  const res = await neonAuthRequest("/sign-up/email", {
    email,
    password,
    name: name?.trim() || email.split("@")[0],
  });
  const token: string = res.session?.token ?? res.token ?? "";
  return { token, user: res.user };
}

export async function login(email: string, password: string) {
  const res = await neonAuthRequest("/sign-in/email", { email, password });
  const token: string = res.session?.token ?? res.token ?? "";
  return { token, user: res.user };
}

export async function getProfile(_token: string) {
  return { user: null };
}

// ─── Business-logic API (direct Neon DB) ─────────────────────────────────────
import { sql } from "../db";

export async function createExchange(
  userId: string,
  from_currency: string,
  to_currency: string,
  from_amount: number,
  rate: number,
  to_amount: number,
) {
  const rows = await sql`
    INSERT INTO exchange_request
      (user_id, from_currency, to_currency, from_amount, to_amount, rate, status)
    VALUES
      (${userId}, ${from_currency}, ${to_currency}, ${from_amount}, ${to_amount}, ${rate}, 'pending')
    RETURNING *
  `;
  return rows[0];
}

export async function getExchanges(userId: string) {
  const rows = await sql`
    SELECT * FROM exchange_request
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return { data: rows };
}

export async function verifyCard(userId: string, card_number: string) {
  const last4 = card_number.slice(-4);
  await sql`
    INSERT INTO card (user_id, card_last4, verified)
    VALUES (${userId}, ${last4}, true)
  `;
  return { card_last4: last4, verified: true };
}

export async function getCards(userId: string) {
  const rows = await sql`SELECT * FROM card WHERE user_id = ${userId}`;
  return { data: rows };
}

export async function syncRates() {
  return {};
}

export async function getRatesHistory() {
  return {};
}

export async function getFAQ() {
  return {};
}

export async function getContacts() {
  return {};
}

export default {
  register,
  login,
  getProfile,
  createExchange,
  getExchanges,
  verifyCard,
  getCards,
  syncRates,
  getRatesHistory,
  getFAQ,
  getContacts,
};
