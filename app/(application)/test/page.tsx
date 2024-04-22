"use client";

import { useEffect } from "react";
import { getPlaylists, getSearchedTracks } from "@/lib/spotify";

export default function TestPage() {
  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    const playlists = await getPlaylists("playlists").then((r) =>
      console.log(r),
    );
    //объект из объектов
    const tracks = await getSearchedTracks("test", 0);
    const tracksWithPreviewUrl = tracks.items.filter(
      (track) => track.preview_url,
    );
    console.log(tracksWithPreviewUrl);
  };

  return <div>test</div>;
}
