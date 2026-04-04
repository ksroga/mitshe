"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Map file extensions to Monaco language IDs
function getLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    json: "json",
    md: "markdown",
    mdx: "markdown",
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    less: "less",
    py: "python",
    rb: "ruby",
    rs: "rust",
    go: "go",
    java: "java",
    kt: "kotlin",
    swift: "swift",
    c: "c",
    cpp: "cpp",
    h: "cpp",
    cs: "csharp",
    php: "php",
    sql: "sql",
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    yaml: "yaml",
    yml: "yaml",
    toml: "ini",
    ini: "ini",
    xml: "xml",
    svg: "xml",
    graphql: "graphql",
    gql: "graphql",
    dockerfile: "dockerfile",
    prisma: "graphql",
    env: "ini",
    gitignore: "plaintext",
    txt: "plaintext",
    log: "plaintext",
    lock: "json",
  };

  // Check filename-based matches
  const filename = filePath.split("/").pop()?.toLowerCase() || "";
  if (filename === "dockerfile") return "dockerfile";
  if (filename === "makefile") return "plaintext";
  if (filename === "justfile") return "shell";
  if (filename.startsWith(".env")) return "ini";

  return map[ext] || "plaintext";
}

export function FileEditor({
  filePath,
  content,
  isLoading,
}: {
  filePath: string;
  content: string | null;
  isLoading: boolean;
}) {
  const [MonacoEditor, setMonacoEditor] = useState<any>(null);

  useEffect(() => {
    import("@monaco-editor/react").then((mod) => {
      setMonacoEditor(() => mod.default);
    });
  }, []);

  if (isLoading || !MonacoEditor) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (content === null) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-muted-foreground">
        <p className="text-sm">Failed to load file</p>
      </div>
    );
  }

  return (
    <MonacoEditor
      height="100%"
      language={getLanguage(filePath)}
      value={content}
      theme="vs-dark"
      options={{
        readOnly: true,
        minimap: { enabled: true },
        fontSize: 13,
        fontFamily:
          "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        wordWrap: "off",
        automaticLayout: true,
        padding: { top: 8 },
      }}
    />
  );
}
