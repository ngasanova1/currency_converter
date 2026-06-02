import { neon } from "@neondatabase/serverless";

// Direct Neon connection — for prototype only
// In production: move credentials to a backend API
export const sql = neon(
  "postgresql://neondb_owner:npg_cSvWiA5mFGD7@ep-aged-voice-alirnpa6-pooler.c-3.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
);
