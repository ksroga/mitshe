"use client";

import { useState } from "react";
import {
  FileText,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
}

export function buildFileTree(
  paths: string[],
  basePath: string,
): FileTreeNode[] {
  const root: Record<string, any> = {};

  for (const filePath of paths) {
    const relative = filePath.startsWith(basePath)
      ? filePath.slice(basePath.length + 1)
      : filePath;
    const parts = relative.split("/").filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      if (!current[part]) {
        current[part] = {
          name: part,
          path: parts.slice(0, i + 1).join("/"),
          type: isFile ? "file" : "directory",
          _children: isFile ? null : {},
        };
      }
      if (!isFile) current = current[part]._children;
    }
  }

  function toArray(obj: Record<string, any>): FileTreeNode[] {
    return Object.values(obj)
      .map((n) => ({
        name: n.name,
        path: n.path,
        type: n.type as "file" | "directory",
        children: n._children ? toArray(n._children) : undefined,
      }))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }

  return toArray(root);
}

function FileTreeItem({
  node,
  depth = 0,
  onFileClick,
}: {
  node: FileTreeNode;
  depth?: number;
  onFileClick: (path: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(depth < 1);

  if (node.type === "file") {
    return (
      <div
        className="flex items-center gap-1.5 py-0.5 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded cursor-pointer"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onFileClick(node.path)}
      >
        <FileText className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{node.name}</span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-1 py-0.5 px-2 text-xs font-medium hover:bg-muted/50 rounded cursor-pointer"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        )}
        {isOpen ? (
          <FolderOpen className="w-3.5 h-3.5 shrink-0 text-blue-500" />
        ) : (
          <Folder className="w-3.5 h-3.5 shrink-0 text-blue-500" />
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {isOpen &&
        node.children?.map((child) => (
          <FileTreeItem
            key={child.path}
            node={child}
            depth={depth + 1}
            onFileClick={onFileClick}
          />
        ))}
    </div>
  );
}

export function FileTree({
  files,
  basePath,
  isLoading,
  onFileClick,
}: {
  files: string[];
  basePath: string;
  isLoading: boolean;
  onFileClick: (path: string) => void;
}) {
  const fileTree = buildFileTree(files, basePath);

  return (
    <div className="w-60 border-r shrink-0 flex flex-col overflow-hidden min-h-0">
      <div className="px-3 py-2 border-b shrink-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Files
        </p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="py-1">
          {fileTree.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              {isLoading ? "Loading files..." : "No files"}
            </p>
          ) : (
            fileTree.map((node) => (
              <FileTreeItem
                key={node.path}
                node={node}
                onFileClick={onFileClick}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
