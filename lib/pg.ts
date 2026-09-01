import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function getPool(): Pool {
  if (!global.__pgPool) {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error(
        "Missing POSTGRES_URL. Connect a Postgres database to this project (Vercel Storage tab), or set POSTGRES_URL locally."
      );
    }
    global.__pgPool = new Pool({ connectionString });
  }
  return global.__pgPool;
}

// Tagged template helper mimicking @vercel/postgres's `sql` API, backed by
// plain `pg` so it works against any Postgres (local dev or Neon/Vercel prod).
export function sql<T extends QueryResultRow = QueryResultRow>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) {
  const text = strings.reduce((acc, chunk, i) => acc + (i > 0 ? `$${i}` : "") + chunk, "");
  return getPool().query<T>(text, values);
}
