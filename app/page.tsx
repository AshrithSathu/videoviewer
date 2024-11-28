"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { FileExplorer } from "@/components/FileExplorer";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ChevronRight } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";

interface FileNode {
  name: string;
  type: "file" | "directory";
  children?: FileNode[];
  path: string;
  file?: File;
}

export default function Page() {
  return (
    <ClientLayout>
      <Home />
    </ClientLayout>
  );
}

function Home() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedVtt, setSelectedVtt] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [folderPath, setFolderPath] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUrls, setFileUrls] = useState<Map<string, string>>(new Map());
  const [isFileExplorerOpen, setIsFileExplorerOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const processDirectory = useCallback(
    async (entry: FileSystemEntry): Promise<FileNode> => {
      if (entry.isFile) {
        return new Promise((resolve) => {
          (entry as FileSystemFileEntry).file((file) => {
            resolve({
              name: entry.name,
              path: entry.fullPath,
              type: "file",
              file,
            });
          });
        });
      } else {
        const dirReader = (entry as FileSystemDirectoryEntry).createReader();
        return new Promise((resolve) => {
          dirReader.readEntries(async (entries) => {
            const children = await Promise.all(
              entries.map((childEntry) => processDirectory(childEntry))
            );
            resolve({
              name: entry.name,
              path: entry.fullPath,
              type: "directory",
              children,
            });
          });
        });
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      fileUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [fileUrls]);

  const processFiles = async (fileList: FileList) => {
    const newUrls = new Map(fileUrls);
    const newFileNodes: FileNode[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const path = file.webkitRelativePath || file.name;

      // Create object URL for the file
      const url = URL.createObjectURL(file);
      newUrls.set(path, url);

      // Build file tree structure
      const parts = path.split("/");
      let currentLevel = newFileNodes;
      let currentPath = "";

      for (let j = 0; j < parts.length - 1; j++) {
        currentPath += (currentPath ? "/" : "") + parts[j];
        let folder = currentLevel.find(
          (node) => node.type === "directory" && node.name === parts[j]
        );

        if (!folder) {
          folder = {
            name: parts[j],
            type: "directory",
            path: currentPath,
            children: [],
          };
          currentLevel.push(folder);
        }
        currentLevel = folder.children!;
      }

      // Add the file
      currentLevel.push({
        name: parts[parts.length - 1],
        type: "file",
        path: path,
        file,
      });
    }

    setFiles(sortFiles(newFileNodes));
    setFileUrls(newUrls);
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const items = Array.from(e.dataTransfer.items);
      const directories = items.filter(
        (item) => item.webkitGetAsEntry()?.isDirectory
      );

      if (directories.length === 0) {
        console.log("No directories found in drop");
        return;
      }

      const fileStructure = await processDirectory(
        directories[0].webkitGetAsEntry() as FileSystemDirectoryEntry
      );
      setFiles([fileStructure]);
    },
    [processDirectory]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileSelect = (path: string) => {
    if (path.toLowerCase().endsWith(".mp4")) {
      // Find the file node to get the file object
      const findFileNode = (
        nodes: FileNode[],
        searchPath: string
      ): FileNode | null => {
        for (const node of nodes) {
          if (node.path === searchPath) return node;
          if (node.children) {
            const found = findFileNode(node.children, searchPath);
            if (found) return found;
          }
        }
        return null;
      };

      const fileNode = findFileNode(files, path);
      if (fileNode?.file) {
        // Clean up old URLs
        if (selectedVideo) {
          URL.revokeObjectURL(selectedVideo);
        }
        if (selectedVtt) {
          URL.revokeObjectURL(selectedVtt);
        }

        // Create new URL for video
        const videoUrl = URL.createObjectURL(fileNode.file);

        // Extract video title and folder path
        const pathParts = path.split("/");
        const fileName = pathParts[pathParts.length - 1];
        const videoName = fileName.replace(".mp4", "");
        const folderPath =
          pathParts.length > 1 ? pathParts.slice(0, -1).join(" / ") : "Root";

        // Look for matching VTT file with various possible extensions
        const possibleVttExtensions = [".vtt", ".en_US.vtt", ".en.vtt"];
        let vttNode = null;

        for (const ext of possibleVttExtensions) {
          const vttPath = path.replace(".mp4", ext);
          console.log("Looking for VTT file at:", vttPath);
          vttNode = findFileNode(files, vttPath);
          if (vttNode?.file) {
            console.log("Found VTT file:", vttPath);
            break;
          }
        }

        // Create URL for VTT file if found
        let vttUrl = null;
        if (vttNode?.file) {
          vttUrl = URL.createObjectURL(vttNode.file);
          console.log("Created VTT URL:", vttUrl);
        } else {
          console.log("No matching VTT file found for:", path);
        }

        // Update all states at once
        setSelectedVideo(videoUrl);
        setSelectedVtt(vttUrl);
        setVideoTitle(videoName);
        setFolderPath(folderPath);
      }
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropzoneRef.current &&
        !dropzoneRef.current.contains(e.target as Node)
      ) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener("click", handleClick);
    }

    return () => {
      if (selectedVideo) {
        URL.revokeObjectURL(selectedVideo);
      }
      if (selectedVtt) {
        URL.revokeObjectURL(selectedVtt);
      }
      if (isDragging) {
        document.removeEventListener("click", handleClick);
      }
    };
  }, [isDragging, selectedVideo, selectedVtt]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      processFiles(fileList);
    }
  };

  const sortFiles = (files: FileNode[]) => {
    return files.sort((a, b) => {
      if (a.type === "directory" && b.type === "file") {
        return -1;
      } else if (a.type === "file" && b.type === "directory") {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    });
  };

  return (
    <div className="h-screen flex">
      {files.length > 0 ? (
        <>
          <div
            className={`bg-background border-r transition-all duration-300 flex flex-col ${
              isFileExplorerOpen ? "w-80" : "w-12"
            }`}
          >
            <div className="p-4 flex items-center justify-between border-b min-h-[64px]">
              {isFileExplorerOpen && (
                <div className="flex items-center justify-between flex-1 gap-2">
                  <h2 className="font-semibold">Files</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      className="shrink-0"
                      title="Choose Folder"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFileExplorerOpen(!isFileExplorerOpen)}
                className={`shrink-0 ${isFileExplorerOpen ? "" : "w-full"}`}
                title={isFileExplorerOpen ? "Collapse" : "Expand"}
              >
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-300 ${
                    isFileExplorerOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>

            {isFileExplorerOpen && (
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <FileExplorer
                  files={files}
                  onSelect={handleFileSelect}
                  className="px-2"
                />
              </div>
            )}
          </div>

          <div className="flex-1 bg-black">
            {selectedVideo ? (
              <div className="w-full h-full flex flex-col">
                <VideoPlayer
                  src={selectedVideo}
                  vttSrc={selectedVtt || undefined}
                  title={videoTitle}
                  folderPath={folderPath}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50">
                <p>Select a video to play</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div
          ref={dropzoneRef}
          className="flex-1 bg-black flex items-center justify-center"
        >
          <div className="text-center">
            <div
              className="p-12 rounded-lg border-2 border-dashed border-white/10 hover:border-white/20 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-white/50" />
              <h3 className="text-xl font-semibold mb-2 text-white">
                Choose a Folder
              </h3>
              <p className="text-white/50">
                Drag & drop a folder here or click to browse
              </p>
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        webkitdirectory=""
        directory=""
      />
    </div>
  );
}
