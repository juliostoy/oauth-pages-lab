const encoder = new TextEncoder();

export function base64UrlEncode(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function base64UrlDecode(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/") + padding;

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

export function randomValue() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export async function sha256(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(value)
  );

  return new Uint8Array(digest);
}

export async function sha256Base64Url(value) {
  return base64UrlEncode(await sha256(value));
}

export function utf8Bytes(value) {
  return encoder.encode(value);
}
