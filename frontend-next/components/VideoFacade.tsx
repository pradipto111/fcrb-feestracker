"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

interface VideoFacadeProps {
  title: string;
  youtubeUrl: string;
  thumbnailUrl: string;
}

function getYoutubeEmbed(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  const id = match?.[1] ?? "";
  if (!id) return "";
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
}

export function VideoFacade({ title, youtubeUrl, thumbnailUrl }: VideoFacadeProps) {
  const [active, setActive] = useState(false);
  const embedUrl = useMemo(() => getYoutubeEmbed(youtubeUrl), [youtubeUrl]);

  if (active && embedUrl) {
    return (
      <div className="video-frame">
        <iframe
          src={embedUrl}
          title={title}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button className="video-facade" onClick={() => setActive(true)}>
      <Image
        src={thumbnailUrl}
        alt={`${title} video`}
        width={1280}
        height={720}
        sizes="(max-width: 768px) 100vw, 900px"
        loading="lazy"
      />
      <span className="video-play" aria-hidden>
        ▶
      </span>
      <span className="sr-only">Play video</span>
    </button>
  );
}
