export function extractCookie(req: Request, name: string): string | undefined {
    const cookieHeader = req.headers.get("cookie") || "";
    const pattern = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`);
    const match = cookieHeader.match(pattern);
    return match ? decodeURIComponent(match[1]) : undefined;
}

export function extractGithubToken(req: Request): string | undefined {
    return extractCookie(req, 'gh_token');
}


