import {
  sha256Base64Url,
} from "../_shared/crypto.js";

import {
  parseCookies,
  clearSessionCookie,
} from "../_shared/cookies.js";


export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response(
      "Method Not Allowed",
      {
        status: 405,

        headers: {
          Allow: "POST",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const origin =
    context.request.headers.get("Origin");

  if (origin !== context.env.PUBLIC_BASE_URL) {
    return new Response(
      "Origem inválida.",
      {
        status: 403,

        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const cookies = parseCookies(context.request);
  const sessionId = cookies["__Host-session"];

  if (sessionId) {
    const sessionHash =
      await sha256Base64Url(sessionId);

    await context.env.DB
      .prepare(
        `DELETE FROM sessions
         WHERE id_hash = ?`
      )
      .bind(sessionHash)
      .run();
  }

  const headers = new Headers();

  headers.set(
    "Location",
    context.env.PUBLIC_BASE_URL
  );

  headers.set(
    "Cache-Control",
    "no-store"
  );

  headers.append(
    "Set-Cookie",
    clearSessionCookie()
  );

  return new Response(null, {
    status: 303,
    headers,
  });
}
