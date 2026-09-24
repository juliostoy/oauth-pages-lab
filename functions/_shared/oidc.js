import {
  base64UrlDecode,
  utf8Bytes,
} from "./crypto.js";

function decodeJsonPart(part) {
  try {
    const bytes = base64UrlDecode(part);
    const text = new TextDecoder().decode(bytes);
    return JSON.parse(text);
  } catch {
    throw new Error("Token OIDC inválido.");
  }
}

export async function validateGoogleIdToken({
  idToken,
  clientId,
  expectedNonce,
}) {
  if (!idToken) {
    throw new Error("id_token ausente.");
  }

  const parts = idToken.split(".");

  if (parts.length !== 3) {
    throw new Error("Formato JWT inválido.");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  const header = decodeJsonPart(encodedHeader);
  const payload = decodeJsonPart(encodedPayload);

  if (header.alg !== "RS256") {
    throw new Error("Algoritmo OIDC inválido.");
  }

  if (!header.kid) {
    throw new Error("kid ausente.");
  }

  const discoveryResponse = await fetch(
    "https://accounts.google.com/.well-known/openid-configuration",
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!discoveryResponse.ok) {
    throw new Error("Falha ao obter configuração OIDC.");
  }

  const discovery = await discoveryResponse.json();

  if (
    discovery.issuer !== "https://accounts.google.com" ||
    !discovery.jwks_uri
  ) {
    throw new Error("Configuração OIDC inválida.");
  }

  const jwksResponse = await fetch(discovery.jwks_uri, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!jwksResponse.ok) {
    throw new Error("Falha ao obter chaves OIDC.");
  }

  const jwks = await jwksResponse.json();

  if (!Array.isArray(jwks.keys)) {
    throw new Error("JWKS inválido.");
  }

  const jwk = jwks.keys.find(
    (key) =>
      key.kid === header.kid &&
      key.kty === "RSA"
  );

  if (!jwk) {
    throw new Error("Chave OIDC não encontrada.");
  }

  const publicKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["verify"]
  );

  const signingInput =
    `${encodedHeader}.${encodedPayload}`;

  const signature = base64UrlDecode(encodedSignature);

  const validSignature = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    signature,
    utf8Bytes(signingInput)
  );

  if (!validSignature) {
    throw new Error("Assinatura OIDC inválida.");
  }

  const now = Math.floor(Date.now() / 1000);

  if (payload.iss !== "https://accounts.google.com") {
    throw new Error("Emissor OIDC inválido.");
  }

  const validAudience = Array.isArray(payload.aud)
    ? payload.aud.includes(clientId)
    : payload.aud === clientId;

  if (!validAudience) {
    throw new Error("Audiência OIDC inválida.");
  }

  if (
    typeof payload.exp !== "number" ||
    payload.exp <= now
  ) {
    throw new Error("Token OIDC expirado.");
  }

  if (
    typeof payload.iat !== "number" ||
    payload.iat > now + 60
  ) {
    throw new Error("iat OIDC inválido.");
  }

  if (
    !expectedNonce ||
    payload.nonce !== expectedNonce
  ) {
    throw new Error("Nonce OIDC inválido.");
  }

  if (
    typeof payload.sub !== "string" ||
    payload.sub.length === 0
  ) {
    throw new Error("Subject OIDC inválido.");
  }

  return {
    issuer: payload.iss,
    subject: payload.sub,
    email:
      typeof payload.email === "string"
        ? payload.email
        : null,
    displayName:
      typeof payload.name === "string"
        ? payload.name
        : null,
  };
}
