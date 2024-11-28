import { Github } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function GitHubLink() {
  const githubUrl = "https://github.com/ashrithsathu/videoviewer/";
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
            >
              <Github className="w-6 h-6 text-white hover:text-white/80" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-black/90 text-white border-none">
            <p>{githubUrl}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
