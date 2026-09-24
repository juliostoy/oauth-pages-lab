export function parseCookies(request) {
  const header = request.headers.get("Cookie") || "";
  const cookies = {};

  for (const part of header.split(";")) {
    const index = part.indexOf("=");

    if (index === -1) {
      continue;
    }

    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();

    if (name) {
      cookies[name] = value;
    }
  }

  return cookies;
}

export function transactionCookie(value) {
  return [
    `__Host-oauth-tx=${value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=600",
  ].join("; ");
}

export function clearTransactionCookie() {
  return [
    "__Host-oauth-tx=",
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}

export function sessionCookie(value) {
  return [
    `__Host-session=${value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Max-Age=28800",
  ].join("; ");
}

export function clearSessionCookie() {
  return [
    "__Host-session=",
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Max-Age=0",
  ].join("; ");
}
