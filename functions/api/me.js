import {
  sha256Base64Url,
} from "../_shared/crypto.js";

import {
  parseCookies,
} from "../_shared/cookies.js";


function unauthorized() {
  return new Response(
    JSON.stringify({
      authenticated: false,
    }),
    {
      status: 401,

      headers: {
        "Content-Type":
          "application/json; charset=UTF-8",

        "Cache-Control": "no-store",
      },
    }
  );
}


export async function onRequestGet(context) {
  const cookies = parseCookies(context.request);
  const sessionId = cookies["__Host-session"];

  if (!sessionId) {
    return unauthorized();
  }

  const sessionHash =
    await sha256Base64Url(sessionId);

  const now = Math.floor(Date.now() / 1000);

  const session = await context.env.DB
    .prepare(
      `SELECT
         issuer,
         subject,
         email,
         display_name
       FROM sessions
       WHERE id_hash = ?
         AND expires_at > ?`
    )
    .bind(sessionHash, now)
    .first();

  if (!session) {
    return unauthorized();
  }

  return new Response(
    JSON.stringify({
      issuer: session.issuer,
      subject: session.subject,
      email: session.email,
      displayName: session.display_name,
    }),
    {
      status: 200,

      headers: {
        "Content-Type":
          "application/json; charset=UTF-8",

        "Cache-Control": "no-store",
      },
    }
  );
}
