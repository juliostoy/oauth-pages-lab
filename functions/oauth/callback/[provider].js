import {
  randomValue,
  sha256Base64Url,
} from "../../_shared/crypto.js";

import {
  parseCookies,
  clearTransactionCookie,
  sessionCookie,
} from "../../_shared/cookies.js";

import {
  getProvider,
} from "../../_shared/providers.js";

import {
  validateGoogleIdToken,
} from "../../_shared/oidc.js";


function noStoreResponse(message, status = 400) {
  return new Response(message, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}


async function exchangeCode(provider, code, codeVerifier) {
  const body = new URLSearchParams();

  body.set("client_id", provider.clientId);
  body.set("client_secret", provider.clientSecret);
  body.set("code", code);
  body.set("redirect_uri", provider.redirectUri);
  body.set("code_verifier", codeVerifier);

  if (provider.name === "google") {
    body.set("grant_type", "authorization_code");
  }

  const response = await fetch(provider.tokenEndpoint, {
    method: "POST",

    headers: {
      "Content-Type":
        "application/x-www-form-urlencoded",
      Accept: "application/json",
    },

    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error("Falha na troca do código.");
  }

  return response.json();
}


async function identifyGoogle(provider, tokenData, nonce) {
  if (
    !tokenData ||
    typeof tokenData.id_token !== "string"
  ) {
    throw new Error("id_token ausente.");
  }

  return validateGoogleIdToken({
    idToken: tokenData.id_token,
    clientId: provider.clientId,
    expectedNonce: nonce,
  });
}


async function identifyGitHub(provider, tokenData) {
  if (
    !tokenData ||
    typeof tokenData.access_token !== "string" ||
    typeof tokenData.token_type !== "string" ||
    tokenData.token_type.toLowerCase() !== "bearer"
  ) {
    throw new Error("Token GitHub inválido.");
  }

  const accessToken = tokenData.access_token;

  const userResponse = await fetch(
    "https://api.github.com/user",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
        "User-Agent": "oauth-pages-lab",
      },
    }
  );

  if (!userResponse.ok) {
    throw new Error("Falha ao consultar perfil GitHub.");
  }

  const profile = await userResponse.json();

  if (!Number.isInteger(profile.id)) {
    throw new Error("Identidade GitHub inválida.");
  }

  const basicCredentials = btoa(
    `${provider.clientId}:${provider.clientSecret}`
  );

  const revokeResponse = await fetch(
    `https://api.github.com/applications/${encodeURIComponent(
      provider.clientId
    )}/grant`,
    {
      method: "DELETE",

      headers: {
        Authorization: `Basic ${basicCredentials}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2026-03-10",
        "User-Agent": "oauth-pages-lab",
      },

      body: JSON.stringify({
        access_token: accessToken,
      }),
    }
  );

  if (revokeResponse.status !== 204) {
    throw new Error(
      "Não foi possível revogar a autorização GitHub."
    );
  }

  return {
    issuer: "https://github.com",
    subject: String(profile.id),

    email:
      typeof profile.email === "string"
        ? profile.email
        : null,

    displayName:
      typeof profile.name === "string" &&
      profile.name.length > 0
        ? profile.name
        : profile.login,
  };
}


export async function onRequestGet(context) {
  const providerName = context.params.provider;

  if (
    providerName !== "google" &&
    providerName !== "github"
  ) {
    return noStoreResponse("Not Found", 404);
  }

  const provider = getProvider(
    providerName,
    context.env
  );

  if (
    !provider ||
    !provider.clientId ||
    !provider.clientSecret ||
    !context.env.PUBLIC_BASE_URL ||
    !context.env.DB
  ) {
    return noStoreResponse(
      "Configuração indisponível.",
      500
    );
  }

  const url = new URL(context.request.url);

  if (url.searchParams.has("error")) {
    return noStoreResponse(
      "Autenticação recusada.",
      400
    );
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return noStoreResponse(
      "Retorno OAuth inválido.",
      400
    );
  }

  const cookies = parseCookies(context.request);
  const transactionId = cookies["__Host-oauth-tx"];

  if (!transactionId) {
    return noStoreResponse(
      "Transação OAuth ausente.",
      400
    );
  }

  const transactionHash =
    await sha256Base64Url(transactionId);

  const now = Math.floor(Date.now() / 1000);

  const transaction = await context.env.DB
    .prepare(
      `SELECT
         provider,
         state_hash,
         nonce,
         code_verifier,
         expires_at
       FROM oauth_transactions
       WHERE id_hash = ?
         AND expires_at > ?`
    )
    .bind(transactionHash, now)
    .first();

  if (!transaction) {
    return noStoreResponse(
      "Transação OAuth inválida ou expirada.",
      400
    );
  }

  if (transaction.provider !== providerName) {
    return noStoreResponse(
      "Provedor OAuth inválido.",
      400
    );
  }

  const receivedStateHash =
    await sha256Base64Url(state);

  if (receivedStateHash !== transaction.state_hash) {
    return noStoreResponse(
      "Estado OAuth inválido.",
      400
    );
  }

  /*
   * A transação é consumida ANTES da troca do código.
   * Assim, o callback não poderá ser reutilizado.
   */
  await context.env.DB
    .prepare(
      `DELETE FROM oauth_transactions
       WHERE id_hash = ?`
    )
    .bind(transactionHash)
    .run();

  try {
    const tokenData = await exchangeCode(
      provider,
      code,
      transaction.code_verifier
    );

    let identity;

    if (providerName === "google") {
      identity = await identifyGoogle(
        provider,
        tokenData,
        transaction.nonce
      );
    } else {
      identity = await identifyGitHub(
        provider,
        tokenData
      );
    }

    const sessionId = randomValue();

    const sessionHash =
      await sha256Base64Url(sessionId);

    const createdAt =
      Math.floor(Date.now() / 1000);

    const expiresAt =
      createdAt + 28800;

    await context.env.DB
      .prepare(
        `INSERT INTO sessions
         (
           id_hash,
           issuer,
           subject,
           email,
           display_name,
           expires_at,
           created_at
         )
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        sessionHash,
        identity.issuer,
        identity.subject,
        identity.email,
        identity.displayName,
        expiresAt,
        createdAt
      )
      .run();

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
      clearTransactionCookie()
    );

    headers.append(
      "Set-Cookie",
      sessionCookie(sessionId)
    );

    return new Response(null, {
      status: 302,
      headers,
    });
  } catch {
    const headers = new Headers({
      "Cache-Control": "no-store",
    });

    headers.append(
      "Set-Cookie",
      clearTransactionCookie()
    );

    return new Response(
      "Falha na autenticação.",
      {
        status: 400,
        headers,
      }
    );
  }
}
