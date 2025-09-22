import { z } from "zod";
import { fetchGithubRawFile } from "@/lib/github";

export function buildGithubFetchTool(githubToken?: string) {
    return {
        fetchGithubFile: {
            type: "function" as const,
            description:
                "Fetch the raw text of a GitHub file given a GitHub web or raw URL (requires user GitHub auth). Use to inspect specific files when needed.",
            inputSchema: z.object({
                url: z
                    .string()
                    .url()
                    .describe(
                        "A GitHub file URL, e.g. https://github.com/owner/repo/blob/branch/path/to/file.ts or https://raw.githubusercontent.com/owner/repo/branch/path/to/file.ts"
                    ),
            }),
            execute: async ({ url }: { url: string }) => {
                if (!githubToken) {
                    return { error: "Unauthorized: no GitHub token. Ask the user to connect GitHub." };
                }

                try {
                    const content = await fetchGithubRawFile({ token: githubToken, url });
                    const MAX_LEN = 200_000;
                    if (content.length > MAX_LEN) {
                        return { content: content.slice(0, MAX_LEN) + "\n...[truncated]", truncated: true };
                    }
                    return { content };
                } catch (error) {
                    console.error("[ai/tools] Failed to fetch file:", error);
                    return { error: error instanceof Error ? error.message : "Failed to fetch file" };
                }
            },
        },
    } as const;
}


