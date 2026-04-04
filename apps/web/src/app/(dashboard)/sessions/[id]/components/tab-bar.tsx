"use client";

import { X, Terminal as TerminalIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Tab {
  id: string;
  title: string;
  type: "terminal" | "file";
  filePath?: string;
  closeable: boolean;
}

export function TabBar({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onCloseOthers,
  onCloseAll,
}: {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  onCloseOthers?: (id: string) => void;
  onCloseAll?: () => void;
}) {
  return (
    <div className="flex items-center border-b bg-background overflow-x-auto shrink-0">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            "group flex items-center gap-1.5 px-3 py-1.5 text-xs border-r cursor-pointer select-none shrink-0",
            "hover:bg-muted/50 transition-colors",
            activeTabId === tab.id
              ? "bg-background text-foreground border-b-2 border-b-primary"
              : "bg-muted/30 text-muted-foreground",
          )}
          onClick={() => onTabClick(tab.id)}
          onAuxClick={(e) => {
            // Middle-click close
            if (e.button === 1 && tab.closeable) {
              e.preventDefault();
              onTabClose(tab.id);
            }
          }}
          onContextMenu={(e) => {
            if (!tab.closeable) return;
            e.preventDefault();
            // Simple context menu via native approach
            const menu = document.createElement("div");
            menu.className =
              "fixed z-50 bg-popover border rounded-md shadow-md py-1 text-xs min-w-[160px]";
            menu.style.left = `${e.clientX}px`;
            menu.style.top = `${e.clientY}px`;

            const items = [
              {
                label: "Close",
                action: () => onTabClose(tab.id),
              },
              ...(onCloseOthers
                ? [
                    {
                      label: "Close Others",
                      action: () => onCloseOthers(tab.id),
                    },
                  ]
                : []),
              ...(onCloseAll
                ? [{ label: "Close All Files", action: () => onCloseAll() }]
                : []),
            ];

            for (const item of items) {
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
          }}
        >
          {tab.type === "terminal" ? (
            <TerminalIcon className="w-3.5 h-3.5" />
          ) : (
            <FileText className="w-3.5 h-3.5" />
          )}
          <span className="max-w-[150px] truncate">{tab.title}</span>
          {tab.closeable && (
            <button
              className="ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/20 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
