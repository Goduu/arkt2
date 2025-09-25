export const runtime = "edge";
export const revalidate = 3600; // cache the route response for 1 hour

function isAllowedFigmaHost(hostname: string): boolean {
  if (!hostname) return false;
  const lower = hostname.toLowerCase();
  return lower === "figma.com" || lower.endsWith(".figma.com") || lower === "www.figma.com";
}

function isValidFigmaUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    if (!isAllowedFigmaHost(u.hostname)) return false;
    const first = u.pathname.split("/").filter(Boolean)[0] ?? "";
    return ["file", "design", "proto", "community", "embed"].includes(first);
  } catch {
    return false;
  }
}

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url") ?? "";
    if (!isValidFigmaUrl(targetUrl)) {
      return new Response("Invalid Figma URL", { status: 400 });
    }

    const figmaOembed = `https://www.figma.com/api/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;

    // Use Next.js fetch caching with revalidate
    const res = await fetch(figmaOembed, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      // Forward specific errors when possible
      return new Response("Figma oEmbed error", { status: res.status });
    }

    const text = await res.text();
    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // CDN-friendly caching; clients can re-use and ISR will refresh in background
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response("Failed to fetch oEmbed", { status: 500 });
  }
}


