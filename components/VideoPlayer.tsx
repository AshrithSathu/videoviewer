"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Subtitles,
  FileText,
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
  vttSrc?: string;
  title?: string;
  folderPath?: string;
}

export function VideoPlayer({
  src,
  vttSrc,
  title,
  folderPath,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isCaptionsEnabled, setIsCaptionsEnabled] = useState(false);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;

    if (isMuted) {
      videoRef.current.volume = previousVolume;
      setVolume(previousVolume);
    } else {
      setPreviousVolume(volume);
      videoRef.current.volume = 0;
      setVolume(0);
    }
    setIsMuted(!isMuted);
  }, [isMuted, volume, previousVolume]);

  const toggleCaptions = useCallback(() => {
    if (videoRef.current && videoRef.current.textTracks.length > 0) {
      setIsCaptionsEnabled((prev) => !prev);
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!videoRef.current) return;

    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      setIsCaptionsEnabled(true);
      console.log("Video element initialized, captions enabled");
    }
  }, [videoRef.current]);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;

      // Reset video state when source changes
      video.load();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsLoading(true);

      const handleCanPlay = () => {
        setIsLoading(false);
        if (isPlaying) {
          video.play().catch(console.error);
        }
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);

      return () => {
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
      };
    }
  }, [src]);

  useEffect(() => {
    if (!videoRef.current || !vttSrc) return;
    console.log("Setting up VTT track with source:", vttSrc);

    const video = videoRef.current;

    // Remove existing tracks
    while (video.textTracks.length > 0) {
      const track = video.textTracks[0];
      track.mode = "disabled";
      const trackElem = video.getElementsByTagName("track")[0];
      if (trackElem) {
        video.removeChild(trackElem);
      }
    }

    // Create and add new track
    const track = document.createElement("track");
    track.kind = "captions";
    track.label = "English";
    track.srclang = "en";
    track.src = vttSrc;
    track.default = true;
    video.appendChild(track);

    // Force track to show after a short delay to ensure it's loaded
    const initializeTrack = () => {
      if (video.textTracks[0]) {
        video.textTracks[0].mode = "showing";
        console.log("Track initialized and set to showing");
      }
    };

    // Try immediately and after a delay to ensure it works
    initializeTrack();
    const timeoutId = setTimeout(initializeTrack, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [vttSrc]);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const tracks = video.textTracks;

    if (tracks.length > 0) {
      const track = tracks[0];
      const newMode = isCaptionsEnabled ? "showing" : "hidden";
      console.log("Setting caption mode to:", newMode);
      track.mode = newMode;
    } else {
      console.log("No text tracks available");
    }
  }, [isCaptionsEnabled]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      video::cue {
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 20px;
        line-height: 1.4;
        padding: 4px 8px;
        white-space: pre-line;
        text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
        case "F":
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            video.requestFullscreen();
          }
          break;
        case "m":
        case "M":
          e.preventDefault();
          if (videoRef.current) {
            if (!isMuted) {
              // Store current volume before muting
              setPreviousVolume(volume);
              setVolume(0);
              videoRef.current.volume = 0;
              videoRef.current.muted = true;
              setIsMuted(true);
            } else {
              // Restore previous volume
              setVolume(previousVolume);
              videoRef.current.volume = previousVolume;
              videoRef.current.muted = false;
              setIsMuted(false);
            }
          }
          break;
        case "c":
        case "C":
          e.preventDefault();
          setIsCaptionsEnabled(!isCaptionsEnabled);
          break;
        case "ArrowLeft":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        case "ArrowRight":
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 5);
          break;
        case "ArrowUp":
          e.preventDefault();
          const newVolumeUp = Math.min(1, volume + 0.1);
          setVolume(newVolumeUp);
          if (videoRef.current) {
            videoRef.current.volume = newVolumeUp;
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          const newVolumeDown = Math.max(0, volume - 0.1);
          setVolume(newVolumeDown);
          if (videoRef.current) {
            videoRef.current.volume = newVolumeDown;
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isMuted, isCaptionsEnabled, togglePlay, volume]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const currentTime = video.currentTime;
      const currentDuration = video.duration || 0;

      // Ensure we update duration if it wasn't set correctly initially
      if (currentDuration > 0 && currentDuration !== duration) {
        setDuration(currentDuration);
      }

      setCurrentTime(currentTime);

      // If we're at the end, ensure we show the full duration
      if (video.ended) {
        setCurrentTime(currentDuration);
      }
    }
  }, [duration]);

  const handleSeek = useCallback((value: number) => {
    if (!videoRef.current) return;

    // Pause video during seeking to prevent playback issues
    const wasPlaying = !videoRef.current.paused;
    if (wasPlaying) {
      videoRef.current.pause();
    }

    // Update time
    videoRef.current.currentTime = value;
    setCurrentTime(value);

    // Resume playback after a short delay if it was playing
    if (wasPlaying) {
      setTimeout(() => {
        videoRef.current
          ?.play()
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.error("Error resuming playback after seek:", error);
            setIsPlaying(false);
          });
      }, 100);
    }
  }, []);

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      if (!videoRef.current) return;

      // Clamp volume between 0 and 1
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      videoRef.current.volume = clampedVolume;
      setVolume(clampedVolume);

      // Update muted state
      if (clampedVolume === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    },
    [isMuted]
  );

  const formatTime = useCallback((time: number) => {
    if (isNaN(time)) return "00:00";

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  if (!isClient) return null;

  return (
    <div className="w-full space-y-4">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onClick={(e) => e.preventDefault()}
          crossOrigin="anonymous"
          preload="auto"
          playsInline
        >
          <source src={src} type="video/mp4" />
          {vttSrc && (
            <track
              kind="captions"
              label="English"
              srcLang="en"
              src={vttSrc}
              default
            />
          )}
        </video>

        <div
          className="absolute inset-0 cursor-pointer"
          onClick={togglePlay}
          onDoubleClick={handleFullscreen}
        />

        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm text-white/80">
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={([value]) => handleSeek(value)}
                className="w-full cursor-pointer"
              />
              <div className="text-white text-sm font-medium tabular-nums min-w-[100px] text-right">
                {formatTime(currentTime)}/{formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlay}
                  className="text-white hover:text-white/80"
                >
                  {videoRef.current && videoRef.current.paused ? (
                    <Play className="h-6 w-6" />
                  ) : (
                    <Pause className="h-6 w-6" />
                  )}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="text-white hover:text-white/80"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-6 w-6" />
                    ) : volume < 0.5 ? (
                      <Volume1 className="h-6 w-6" />
                    ) : (
                      <Volume2 className="h-6 w-6" />
                    )}
                  </Button>
                  <Slider
                    value={[volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={([value]) => handleVolumeChange(value / 100)}
                    className="w-[100px] cursor-pointer"
                  />
                </div>

                {vttSrc && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCaptions();
                    }}
                    className="text-white hover:text-white/80"
                    title={
                      isCaptionsEnabled
                        ? "Disable Captions (C)"
                        : "Enable Captions (C)"
                    }
                  >
                    {isCaptionsEnabled ? (
                      <Subtitles className="h-6 w-6" />
                    ) : (
                      <FileText className="h-6 w-6 opacity-50" />
                    )}
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFullscreen}
                  className="text-white hover:text-white/80"
                >
                  <Maximize className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Video information */}
      <div className="space-y-1 px-2">
        {title && (
          <h2 className="text-lg font-medium text-foreground truncate">
            {title}
          </h2>
        )}
        {folderPath && (
          <p className="text-sm text-muted-foreground truncate">
            📁 {folderPath}
          </p>
        )}
      </div>
    </div>
  );
}
