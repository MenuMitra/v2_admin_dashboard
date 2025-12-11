import React, { useEffect, useRef } from "react";

function YouTubePlayer({ videoId }) {
  const playerRef = useRef(null);

  useEffect(() => {
    // Load the IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    // This function will be called by the YouTube API when it's ready
    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player(playerRef.current, {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          mute: 1, // Needed for autoplay to work in most browsers
          loop: 1,
          playlist: videoId,
          controls: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            event.target.setPlaybackQuality("small"); // 240p
            event.target.playVideo();
          },
        },
      });
    };

    // If API is already loaded, call the function directly
    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }
  }, [videoId]);

  return (
    <div
      ref={playerRef}
      className="w-full h-full rounded-2xl overflow-hidden aspect-video"
    />
  );
}

export default YouTubePlayer;