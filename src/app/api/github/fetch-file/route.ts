import { fetchGithubRawFile } from "@/lib/github";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const sourceUrl: string | undefined = body?.url;
    if (!sourceUrl || typeof sourceUrl !== "string") {
      return new Response("Missing url", { status: 400 });
    }

    const cookies = req.headers.get("cookie") || "";
    const tokenMatch = cookies.match(/(?:^|;\s*)gh_token=([^;]+)/);
    if (!tokenMatch) return new Response("Unauthorized", { status: 401 });
    const token = decodeURIComponent(tokenMatch[1]);
    let text: string;
    try {
      text = await fetchGithubRawFile({ token, url: sourceUrl });
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === "Not found") return new Response("Not found", { status: 404 });
        if (e.message === "Unauthorized") return new Response("Unauthorized", { status: 401 });
      }
      return new Response("GitHub API error", { status: 502 });
    }
    return new Response(text, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch {
    return new Response("Failed to fetch file", { status: 500 });
  }
}


