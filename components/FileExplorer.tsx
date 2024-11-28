import React, { useState, useEffect } from "react";
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  FileVideo,
  FileText,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface FileNode {
  name: string;
  type: "file" | "directory";
  children?: FileNode[];
  path: string;
}

interface FileExplorerProps {
  files: FileNode[];
  onSelect: (path: string) => void;
  className?: string;
}

const FileTreeNode = ({
  node,
  level = 0,
  onSelect,
  searchTerm = "",
}: {
  node: FileNode;
  level?: number;
  onSelect: (path: string) => void;
  searchTerm?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [wasExpandedBeforeSearch, setWasExpandedBeforeSearch] = useState(false);
  const isDirectory = node.type === "directory";
  const hasChildren = isDirectory && node.children && node.children.length > 0;

  const hasMatchingDescendant = (node: FileNode): boolean => {
    if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return true;
    }
    if (node.children) {
      return node.children.some((child) => hasMatchingDescendant(child));
    }
    return false;
  };

  const matchesSearch = searchTerm === "" || hasMatchingDescendant(node);

  useEffect(() => {
    if (searchTerm && !wasExpandedBeforeSearch) {
      setWasExpandedBeforeSearch(isExpanded);
    } else if (!searchTerm) {
      setIsExpanded(wasExpandedBeforeSearch);
      setWasExpandedBeforeSearch(false);
    }
  }, [searchTerm]);

  if (searchTerm && !matchesSearch) {
    return null;
  }

  const handleClick = () => {
    if (isDirectory) {
      const newExpandedState = !isExpanded;
      setIsExpanded(newExpandedState);
      if (!searchTerm) {
        setWasExpandedBeforeSearch(newExpandedState);
      }
    } else {
      onSelect(node.path);
    }
  };

  const shouldShowChildren = isDirectory && isExpanded;

  const getFileIcon = (fileName: string) => {
    if (fileName.toLowerCase().endsWith(".mp4")) {
      return <FileVideo size={16} className="text-blue-500 shrink-0" />;
    } else if (fileName.toLowerCase().endsWith(".vtt")) {
      return <FileText size={16} className="text-green-500 shrink-0" />;
    }
    return <File size={16} className="shrink-0" />;
  };

  const sortedChildren = node.children
    ? [...node.children].sort((a, b) => {
        if (a.type === "directory" && b.type === "file") return -1;
        if (a.type === "file" && b.type === "directory") return 1;
        return a.name.localeCompare(b.name);
      })
    : [];

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded py-1",
          level > 0 && "ml-4"
        )}
        onClick={handleClick}
        style={{ paddingLeft: `${level * 12}px` }}
      >
        {isDirectory && hasChildren && (
          <div className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </div>
        )}
        {!isDirectory && <div className="w-4" />}
        {isDirectory ? (
          <Folder size={16} className="text-yellow-500 shrink-0" />
        ) : (
          getFileIcon(node.name)
        )}
        <span className="truncate text-sm">{node.name}</span>
      </div>
      {shouldShowChildren && (
        <div>
          {sortedChildren.map((child, index) => (
            <FileTreeNode
              key={child.path + index}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function FileExplorer({
  files,
  onSelect,
  className,
}: FileExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const sortedFiles = [...files].sort((a, b) => {
    if (a.type === "directory" && b.type === "file") return -1;
    if (a.type === "file" && b.type === "directory") return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="p-2 border-b dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-sm w-full pr-8"
            />
            <Search className="h-4 w-4 absolute right-2.5 top-2 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="overflow-auto flex-1 no-scrollbar">
        <div className="w-full">
          {sortedFiles.map((file, index) => (
            <FileTreeNode
              key={file.path + index}
              node={file}
              onSelect={onSelect}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
