import { extractGithubToken } from "@/lib/http/cookies";
import { fetchGithubRawFile, parseGithubUrl } from "@/lib/github";

export const runtime = "edge";
export const revalidate = 300; // 5 minutes for public files

function isAllowedGithubHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "github.com" || h === "raw.githubusercontent.com";
}

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const sourceUrl = searchParams.get("url") || "";
    let parsed: ReturnType<typeof parseGithubUrl> = null;
    try {
      const u = new URL(sourceUrl);
      if (!isAllowedGithubHost(u.hostname)) {
        return new Response("Invalid host", { status: 400 });
      }
      parsed = parseGithubUrl(sourceUrl);
    } catch {
      return new Response("Invalid url", { status: 400 });
    }
    if (!parsed) {
      return new Response("Unsupported GitHub URL", { status: 400 });
    }

    // Try public/raw first (cacheable)
    let publicRawUrl: string | null = null;
    if (new URL(sourceUrl).hostname === "github.com") {
      publicRawUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${parsed.branch}/${parsed.path}`;
    } else if (new URL(sourceUrl).hostname === "raw.githubusercontent.com") {
      publicRawUrl = sourceUrl;
    }

    if (publicRawUrl) {
      const pub = await fetch(publicRawUrl, { next: { revalidate: 300 } });
      if (pub.ok) {
        const text = await pub.text();
        return new Response(text, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
          },
        });
      }
      // if unauthorized/private, fall through to token fetch
      if (pub.status !== 404 && pub.status !== 401 && pub.status !== 403) {
        return new Response("GitHub raw error", { status: pub.status });
      }
    }

    // Private or otherwise blocked: use token (do NOT cache sensitive content)
    const token = extractGithubToken(req);
    if (!token) return new Response("Unauthorized", { status: 401 });
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
    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        // No caching for potentially private content
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Failed to fetch file", { status: 500 });
  }
}


