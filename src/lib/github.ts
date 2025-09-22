export type ParsedGithubUrl = { owner: string; repo: string; branch: string; path: string };

export function parseGithubUrl(input: string): ParsedGithubUrl | null {
    try {
        const u = new URL(input);
        const segments = u.pathname.split("/").filter(Boolean);
        if (u.hostname === "github.com") {
            const blobIdx = segments.indexOf("blob");
            if (blobIdx !== -1 && segments.length > blobIdx + 2) {
                const owner = segments[0];
                const repo = segments[1];
                const branch = segments[blobIdx + 1];
                const path = segments.slice(blobIdx + 2).join("/");
                return { owner, repo, branch, path };
            }
        }
        if (u.hostname === "raw.githubusercontent.com") {
            if (segments.length >= 4) {
                const [owner, repo, branch, ...rest] = segments;
                const path = rest.join("/");
                return { owner, repo, branch, path };
            }
        }
    } catch {
        console.error("Failed to parse GitHub URL", input);
    }
    return null;
}

export async function fetchGithubRawFile(params: { token: string; url: string }): Promise<string> {
    const { token, url } = params;
    const parsed = parseGithubUrl(url);
    if (!parsed) throw new Error("Unsupported URL");

    const apiUrl = new URL(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${parsed.path}`
    );
    apiUrl.searchParams.set("ref", parsed.branch);

    const ghRes = await fetch(apiUrl.toString(), {
        headers: {
            Accept: "application/vnd.github.raw",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });
    if (ghRes.status === 404) throw new Error("Not found");
    if (ghRes.status === 401) throw new Error("Unauthorized");
    if (!ghRes.ok) throw new Error("GitHub API error");
    return await ghRes.text();
}


