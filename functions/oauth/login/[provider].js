import {
  randomValue,
  sha256Base64Url,
} from "../../_shared/crypto.js";

import {
  transactionCookie,
} from "../../_shared/cookies.js";

import {
  getProvider,
} from "../../_shared/providers.js";

export async function onRequestGet(context) {
  const providerName = context.params.provider;

  if (
    providerName !== "google" &&
    providerName !== "github"
  ) {
    return new Response("Not Found", {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
      },
    });
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
    return new Response("Configuração indisponível.", {
      status: 500,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  const transactionId = randomValue();
  const state = randomValue();
  const codeVerifier = randomValue();

  const nonce =
    providerName === "google"
      ? randomValue()
      : null;

  const transactionHash =
    await sha256Base64Url(transactionId);

  const stateHash =
    await sha256Base64Url(state);

  const codeChallenge =
    await sha256Base64Url(codeVerifier);

  const expiresAt =
    Math.floor(Date.now() / 1000) + 600;

  await context.env.DB
    .prepare(
      `INSERT INTO oauth_transactions
       (
         id_hash,
         provider,
         state_hash,
         nonce,
         code_verifier,
         expires_at
       )
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      transactionHash,
      providerName,
      stateHash,
      nonce,
      codeVerifier,
      expiresAt
    )
    .run();

  const authorizationUrl =
    new URL(provider.authorizationEndpoint);

  authorizationUrl.searchParams.set(
    "client_id",
    provider.clientId
  );

  authorizationUrl.searchParams.set(
    "redirect_uri",
    provider.redirectUri
  );

  authorizationUrl.searchParams.set(
    "response_type",
    "code"
  );

  authorizationUrl.searchParams.set(
    "state",
    state
  );

  authorizationUrl.searchParams.set(
    "code_challenge",
    codeChallenge
  );

  authorizationUrl.searchParams.set(
    "code_challenge_method",
    "S256"
  );

  if (providerName === "google") {
    authorizationUrl.searchParams.set(
      "scope",
      "openid email profile"
    );

    authorizationUrl.searchParams.set(
      "nonce",
      nonce
    );
  }

  return new Response(null, {
    status: 302,

    headers: {
      Location: authorizationUrl.toString(),

      "Set-Cookie":
        transactionCookie(transactionId),

      "Cache-Control": "no-store",
    },
  });
}
