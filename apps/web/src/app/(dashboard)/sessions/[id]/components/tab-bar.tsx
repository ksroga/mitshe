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
}: {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
}) {
  return (
    <div className="flex items-center border-b bg-background overflow-x-auto shrink-0">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs border-r cursor-pointer select-none shrink-0",
            "hover:bg-muted/50 transition-colors",
            activeTabId === tab.id
              ? "bg-background text-foreground border-b-2 border-b-primary"
              : "bg-muted/30 text-muted-foreground",
          )}
          onClick={() => onTabClick(tab.id)}
        >
          {tab.type === "terminal" ? (
            <TerminalIcon className="w-3.5 h-3.5" />
          ) : (
            <FileText className="w-3.5 h-3.5" />
          )}
          <span className="max-w-[150px] truncate">{tab.title}</span>
          {tab.closeable && (
            <button
              className="ml-1 p-0.5 rounded hover:bg-muted-foreground/20"
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
