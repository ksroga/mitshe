"use client";

import { useState, useCallback } from "react";
import {
  FileText,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
}

export type GitFileStatus =
  | "modified"
  | "added"
  | "deleted"
  | "renamed"
  | "untracked"
  | "changed";

const gitStatusColors: Record<GitFileStatus, string> = {
  modified: "text-yellow-500",
  added: "text-green-500",
  deleted: "text-red-500",
  renamed: "text-blue-400",
  untracked: "text-green-400",
  changed: "text-yellow-400",
};

const gitStatusLetters: Record<GitFileStatus, string> = {
  modified: "M",
  added: "A",
  deleted: "D",
  renamed: "R",
  untracked: "U",
  changed: "C",
};

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

function dirHasChanges(
  node: FileTreeNode,
  gitStatuses: Map<string, GitFileStatus>,
): boolean {
  if (node.type === "file") return gitStatuses.has(node.path);
  return (
    node.children?.some((child) => dirHasChanges(child, gitStatuses)) ?? false
  );
}

function showContextMenu(
  e: React.MouseEvent,
  path: string,
  type: "file" | "directory",
  actions: FileTreeActions,
) {
  e.preventDefault();

  const menu = document.createElement("div");
  menu.className =
    "fixed z-50 bg-popover border rounded-md shadow-md py-1 text-xs min-w-[180px]";
  menu.style.left = `${e.clientX}px`;
  menu.style.top = `${e.clientY}px`;

  const items: Array<{
    label: string;
    action: () => void;
    separator?: boolean;
  }> = [];

  if (type === "file") {
    items.push({ label: "Open", action: () => actions.onFileClick(path) });
  }

  items.push({
    label: "Copy Path",
    action: () => navigator.clipboard.writeText(path),
  });

  items.push({
    label: "Copy Full Path",
    action: () => navigator.clipboard.writeText(`/workspace/${path}`),
  });

  if (actions.onDelete) {
    items.push({
      label: "Delete",
      action: () => actions.onDelete!(path),
      separator: true,
    });
  }

  for (const item of items) {
    if (item.separator) {
      const sep = document.createElement("div");
      sep.className = "border-t my-1";
      menu.appendChild(sep);
    }
    const btn = document.createElement("button");
    btn.className =
      "w-full text-left px-3 py-1.5 hover:bg-muted text-popover-foreground";
    btn.textContent = item.label;
    btn.onclick = () => {
      item.action();
      menu.remove();
    };
    menu.appendChild(btn);
  }

  document.body.appendChild(menu);
  const close = () => {
    menu.remove();
    document.removeEventListener("click", close);
  };
  setTimeout(() => document.addEventListener("click", close), 0);
}

export interface FileTreeActions {
  onFileClick: (path: string) => void;
  onDelete?: (path: string) => void;
}

function FileTreeItem({
  node,
  depth = 0,
  actions,
  gitStatuses,
}: {
  node: FileTreeNode;
  depth?: number;
  actions: FileTreeActions;
  gitStatuses: Map<string, GitFileStatus>;
}) {
  const [isOpen, setIsOpen] = useState(depth < 1);

  const fileStatus = gitStatuses.get(node.path);
  const colorClass = fileStatus ? gitStatusColors[fileStatus] : "";
  const hasChangedChildren =
    node.type === "directory" && dirHasChanges(node, gitStatuses);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) =>
      showContextMenu(e, node.path, node.type, actions),
    [node.path, node.type, actions],
  );

  if (node.type === "file") {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 py-0.5 px-2 text-xs hover:bg-muted/50 rounded cursor-pointer",
          fileStatus
            ? colorClass
            : "text-muted-foreground hover:text-foreground",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => actions.onFileClick(node.path)}
        onContextMenu={handleContextMenu}
      >
        <FileText className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate flex-1">{node.name}</span>
        {fileStatus && (
          <span
            className={cn(
              "text-[10px] font-mono font-bold shrink-0",
              colorClass,
            )}
          >
            {gitStatusLetters[fileStatus]}
          </span>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-0.5 px-2 text-xs font-medium hover:bg-muted/50 rounded cursor-pointer",
          hasChangedChildren && "text-yellow-500",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => setIsOpen(!isOpen)}
        onContextMenu={handleContextMenu}
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
            actions={actions}
            gitStatuses={gitStatuses}
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
  onDelete,
  gitStatuses,
}: {
  files: string[];
  basePath: string;
  isLoading: boolean;
  onFileClick: (path: string) => void;
  onDelete?: (path: string) => void;
  gitStatuses?: Array<{ path: string; status: string }>;
}) {
  const fileTree = buildFileTree(files, basePath);

  const statusMap = new Map<string, GitFileStatus>();
  if (gitStatuses) {
    for (const { path, status } of gitStatuses) {
      statusMap.set(path, status as GitFileStatus);
    }
  }

  const actions: FileTreeActions = { onFileClick, onDelete };

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
                actions={actions}
                gitStatuses={statusMap}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
