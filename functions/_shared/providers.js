export function getProvider(name, env) {
  if (name === "google") {
    return {
      name: "google",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorizationEndpoint:
        "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint:
        "https://oauth2.googleapis.com/token",
      redirectUri:
        `${env.PUBLIC_BASE_URL}/oauth/callback/google`,
    };
  }

  if (name === "github") {
    return {
      name: "github",
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      authorizationEndpoint:
        "https://github.com/login/oauth/authorize",
      tokenEndpoint:
        "https://github.com/login/oauth/access_token",
      redirectUri:
        `${env.PUBLIC_BASE_URL}/oauth/callback/github`,
    };
  }

  return null;
}
