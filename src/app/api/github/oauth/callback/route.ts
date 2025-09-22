function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const origin = `${url.protocol}//${url.host}`;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookies = req.headers.get("cookie") || "";
  const cookieMap = Object.fromEntries(
    cookies.split(/;\s*/).filter(Boolean).map((c) => {
      const [k, ...rest] = c.split("=");
      return [decodeURIComponent(k), decodeURIComponent(rest.join("="))];
    })
  );
  const expectedState = cookieMap["gh_oauth_state"];

  if (!code || !state || !expectedState || state !== expectedState) {
    return new Response("Invalid OAuth state.", { status: 400 });
  }

  try {
    const clientId = getEnv("GITHUB_CLIENT_ID");
    const clientSecret = getEnv("GITHUB_CLIENT_SECRET");
    const redirectUri = `${origin}/api/github/oauth/callback`;

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri, state }),
      cache: "no-store",
    });
    if (!tokenRes.ok) {
      return new Response("Failed to exchange code.", { status: 502 });
    }
    const data = await tokenRes.json();
    const accessToken = data?.access_token as string | undefined;
    if (!accessToken) {
      return new Response("No access token.", { status: 502 });
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/design/settings?connected=1",
        "Set-Cookie": [
          `gh_token=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
          `gh_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
        ].join(", "),
      },
    });
  } catch {
    return new Response("OAuth callback failed.", { status: 500 });
  }
}


