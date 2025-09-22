import crypto from "node:crypto";

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const origin = `${url.protocol}//${url.host}`;

  const clientId = getEnv("GITHUB_CLIENT_ID");
  const redirectUri = `${origin}/api/github/oauth/callback`;

  const stateBytes = crypto.randomBytes(16);
  const state = stateBytes.toString("hex");

  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  // We need private repo read to fetch private file contents via API
  authUrl.searchParams.set("scope", "repo");
  authUrl.searchParams.set("state", state);

  const res = new Response(null, {
    status: 302,
    headers: {
      Location: authUrl.toString(),
      "Set-Cookie": `gh_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
  return res;
}


