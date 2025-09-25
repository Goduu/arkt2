"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type CodeHighlighterProps = {
    code: string;
    className?: string;
    language?: string;
    fileName?: string;
};

// Simple in-memory LRU cache to avoid re-highlighting identical content
const MAX_CACHE_ENTRIES = 50;
const highlightCache = new Map<string, string>();

function setCache(key: string, value: string) {
    if (highlightCache.has(key)) {
        highlightCache.delete(key);
    }
    highlightCache.set(key, value);
    if (highlightCache.size > MAX_CACHE_ENTRIES) {
        const firstKey = highlightCache.keys().next().value;
        if(firstKey) {
            highlightCache.delete(firstKey);
        }
    }
}

function getCache(key: string) {
    const v = highlightCache.get(key);
    if (v != null) {
        // refresh LRU
        highlightCache.delete(key);
        highlightCache.set(key, v);
    }
    return v;
}

function djb2Hash(input: string): number {
    let hash = 5381;
    for (let i = 0; i < input.length; i++) hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
    return hash >>> 0;
}

function buildCacheKey(code: string, lang: string | undefined) {
    // Sample the code to limit hashing cost for very large strings
    const sample = code.length > 20000 ? code.slice(0, 15000) + code.slice(-5000) : code;
    return `${lang || "plain"}::${code.length}::${djb2Hash(sample)}`;
}

function detectLanguageFromFilename(fileName?: string): string | undefined {
    if (!fileName) return undefined;
    const name = fileName.toLowerCase();
    const ext = name.split(".").pop() || "";
    const map: Record<string, string> = {
        js: "javascript",
        mjs: "javascript",
        cjs: "javascript",
        ts: "ts",
        tsx: "tsx",
        jsx: "jsx",
        json: "json",
        css: "css",
        scss: "scss",
        sass: "sass",
        less: "less",
        html: "html",
        htm: "html",
        md: "md",
        mdx: "mdx",
        yml: "yaml",
        yaml: "yaml",
        toml: "toml",
        xml: "xml",
        svg: "svg",
        sh: "bash",
        bash: "bash",
        zsh: "bash",
        ps1: "powershell",
        py: "python",
        rb: "ruby",
        go: "go",
        rs: "rust",
        java: "java",
        kt: "kotlin",
        swift: "swift",
        php: "php",
        cs: "csharp",
        cpp: "cpp",
        cxx: "cpp",
        cc: "cpp",
        c: "c",
        h: "cpp",
        sql: "sql",
        dockerfile: "docker",
        docker: "docker",
        makefile: "make",
        mk: "make",
        ini: "ini",
        conf: "ini",
        env: "dotenv",
        dotenv: "dotenv",
        diff: "diff",
        patch: "diff",
        dart: "dart",
        vue: "vue",
        svelte: "svelte",
        astro: "astro",
        yamlc: "yaml",
        lock: "yaml",
    };
    if (map[ext]) return map[ext];
    // Special names without extension
    if (name === "dockerfile") return "docker";
    if (name === "makefile") return "make";
    return undefined;
}

export function CodeHighlighter({ code, className, language, fileName }: CodeHighlighterProps) {
    const lang = useMemo(() => language || detectLanguageFromFilename(fileName), [language, fileName]);
    const [htmlLight, setHtmlLight] = useState<string | null>(null);
    const [htmlDark, setHtmlDark] = useState<string | null>(null);
    const [failed, setFailed] = useState<boolean>(false);

    const isTooLarge = useMemo(() => {
        if (!code) return false;
        const lines = (code.match(/\n/g) || []).length + 1;
        return code.length > 200_000 || lines > 5000; // Avoid heavy work for very large files
    }, [code]);

    useEffect(() => {
        let cancelled = false;
        setFailed(false);
        if (!code || isTooLarge) {
            setHtmlLight(null);
            setHtmlDark(null);
            return;
        }

        const baseKey = buildCacheKey(code, lang);
        const keyLight = `${baseKey}::light`;
        const keyDark = `${baseKey}::dark`;

        const cachedLight = getCache(keyLight);
        const cachedDark = getCache(keyDark);

        if (cachedLight && cachedDark) {
            setHtmlLight(cachedLight);
            setHtmlDark(cachedDark);
            return;
        }

        (async () => {
            try {
                const shiki = await import("shiki");
                const [generatedLight, generatedDark] = await Promise.all([
                    shiki.codeToHtml(code, { lang: lang || "plaintext", theme: "github-light" }),
                    shiki.codeToHtml(code, { lang: lang || "plaintext", theme: "github-dark" }),
                ]);

                const enhance = (html: string) =>
                    html.replace(
                        '<pre class="shiki',
                        '<pre class="shiki text-sm leading-6 p-4 m-0 whitespace-pre min-w-full overflow-x-auto'
                    );

                const enhancedLight = enhance(generatedLight);
                const enhancedDark = enhance(generatedDark);

                if (!cancelled) {
                    setCache(keyLight, enhancedLight);
                    setCache(keyDark, enhancedDark);
                    setHtmlLight(enhancedLight);
                    setHtmlDark(enhancedDark);
                }
            } catch {
                if (!cancelled) {
                    setFailed(true);
                    setHtmlLight(null);
                    setHtmlDark(null);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [code, lang, isTooLarge]);

    if (failed || isTooLarge) {
        return (
            <pre className={cn("text-sm leading-6 p-4 m-0 whitespace-pre min-w-full overflow-x-auto", className)}>
                <code>{code}</code>
            </pre>
        );
    }

    if (htmlLight == null || htmlDark == null) {
        return (
            <div className={cn("p-4 text-sm text-muted-foreground", className)}>
                Rendering syntax highlight…
            </div>
        );
    }

    return (
        <div className={cn("[&_.shiki]:bg-transparent", className)}>
            <div className="hidden dark:block" dangerouslySetInnerHTML={{ __html: htmlDark }} />
            <div className="block dark:hidden" dangerouslySetInnerHTML={{ __html: htmlLight }} />
        </div>
    );
}

export default CodeHighlighter;


