"use client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getPlaylistTracks,
  getPlaylists,
  getPopularTracks,
} from "@/lib/spotify";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import Emoji from "react-emoji-render";
import {
  IoIosSkipBackward,
  IoIosSkipForward,
  IoMdClose,
  IoMdPause,
  IoMdPlay,
} from "react-icons/io";

export default function MusicPage() {
  const [playlists, setPlaylists] = useState({});
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [popularTracks, setPopularTracks] = useState([]);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState({});
  const audioRef = useRef<HTMLAudioElement | undefined>(
    typeof Audio !== "undefined" ? new Audio("") : undefined
  );

  console.log(popularTracks);
  useEffect(() => {
    fetchPlaylists();
    fetchPopularTracks();
  }, []);
  const fetchPlaylists = async () => {
    const playlists = await getPlaylists("playlists");
    setPlaylists(playlists);
  };

  const fetchPlaylistTracks = async (index: number) => {
    const playlistTracks = await getPlaylistTracks(
      playlists.items[index].tracks.href
    );
    await setPlaylistTracks(playlistTracks);
    console.log(playlistTracks);
  };

  const fetchPopularTracks = async () => {
    await getPopularTracks()
      .then((res) => res.tracks.items.filter((item) => item.preview_url))
      .then((data) => setPopularTracks(data));
  };

  const onPlaylistOpen = (playlist, index) => {
    fetchPlaylistTracks(index);
    setIsPlaylistOpen(true);
    setCurrentPlaylist(playlist);
  };

  const onTrackPlay = (track) => {
    setCurrentTrack(track);
    setIsPlayerVisible(true);
    setIsPlaylistOpen(false);
    if (!isPlaying) {
      audioRef.current?.play();
      setIsPlaying(true);
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const handleNextTrack = () => {};
  const handlePrevTrack = () => {};
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleOnClose = () => {
    setIsPlaylistOpen(false);
    setIsPlayerVisible(false);
    setIsPlaying(false);
    setCurrentTrackIndex(0);
  };

  console.log(currentTrack);

  return (
    <div className="min-w-[700px] min-h-screen mx-3 max-w-xl">
      <div className="flex flex-col items-center justify-center gap-3 py-5">
        <Emoji className="text-3xl">🎧</Emoji>
        <Label>Музыка</Label>
      </div>
      <div className="flex flex-col">
        <Tabs defaultValue="my-music">
          <TabsList className="flex px-1 space-x-1">
            <TabsTrigger value="my-music">Моя музыка</TabsTrigger>
            <TabsTrigger value="search">Поиск</TabsTrigger>
          </TabsList>
          <TabsContent
            value="my-music"
            className="h-full flex-1 mt-5 mx-2"
          ></TabsContent>
          <TabsContent
            value="search"
            className="h-full flex flex-col flex-1 gap-5 mx-3 mt-5"
          >
            <Input placeholder="🔎 Найти музыку..." className="w-full" />
            <Label>Плейлисты</Label>
            <Carousel className="w-full">
              <CarouselContent>
                {playlists && playlists.items ? (
                  playlists.items.map((playlist, index) => (
                    <CarouselItem
                      key={nanoid()}
                      className="flex flex-col text-center basis-1/3"
                      onClick={() => onPlaylistOpen(playlist, index)}
                    >
                      <Card>
                        <CardContent className="flex items-center justify-center p-0">
                          <img
                            src={`${playlist.images[0].url}`}
                            alt=""
                            className="w-64 h-52 object-fill rounded-xl"
                          />
                        </CardContent>
                      </Card>
                      <div className="flex flex-col mt-2">
                        <Label>
                          {playlist.name ? playlist.name : `Плейлист ${index}`}
                        </Label>
                        <span className="text-gray-400">
                          {playlist.tracks.total > 100
                            ? "100+"
                            : playlist.tracks.total}{" "}
                          треков
                        </span>
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <>
                    <Skeleton className="h-52 basis-1/3 bg-slate-800 mr-1" />
                    <Skeleton className="h-52 basis-1/3 bg-slate-800 mr-1" />
                    <Skeleton className="h-52 basis-1/3 bg-slate-800 mr-1" />
                  </>
                )}
              </CarouselContent>
            </Carousel>

            <Label>Популярные треки</Label>
            <Carousel className="w-full">
              <CarouselContent>
                {popularTracks ? (
                  Array.from({
                    length: Math.ceil(popularTracks.length / 3),
                  }).map((_, i) => (
                    <CarouselItem
                      key={nanoid()}
                      className="flex flex-col items-center gap-2"
                    >
                      <Card className="w-full">
                        {popularTracks.slice(i * 3, i * 3 + 3).map((track) => {
                          return (
                            <CardContent
                              key={nanoid()}
                              className="flex gap-x-2 items-center text-center hover:bg-slate-800 hover:rounded-xl p-2"
                              onClick={() => onTrackPlay(track)}
                            >
                              <div className="flex basis-1/6">
                                <img
                                  src={`${track.album.images[0].url}`}
                                  alt=""
                                  className="w-12 h-12 object-cover rounded-xl"
                                />
                              </div>
                              <span className="break-words basis-3/6">
                                {track.name}
                              </span>
                              <span className="text-gray-400 basis-2/6">
                                {track.artists
                                  .map((artist) => artist.name)
                                  .join(", ")}
                              </span>
                            </CardContent>
                          );
                        })}
                      </Card>
                    </CarouselItem>
                  ))
                ) : (
                  <Skeleton className="w-full h-[120px] bg-slate-800" />
                )}
              </CarouselContent>
            </Carousel>
          </TabsContent>
          <Dialog open={isPlaylistOpen} onOpenChange={setIsPlaylistOpen}>
            <DialogContent className=" min-w-[50vw] h-[calc(100vh-64px)] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {currentPlaylist.name ? currentPlaylist.name : `Плейлист 🔥`}
                </DialogTitle>
                <DialogDescription>
                  Треки текущего плейлиста:{" "}
                </DialogDescription>
              </DialogHeader>

              <Card className="w-full">
                {playlistTracks &&
                  playlistTracks.map((track) => {
                    return (
                      <CardContent
                        key={nanoid()}
                        className="flex gap-x-2 items-center text-center hover:bg-slate-800 hover:rounded-xl p-2"
                        onClick={() => onTrackPlay(track.track)}
                      >
                        <div className="flex basis-1/6">
                          <img
                            src={`${track.track.album.images[0].url}`}
                            alt=""
                            className="w-12 h-12 object-cover rounded-xl"
                          />
                        </div>
                        <span className="break-words basis-3/6">
                          {track.track.name}
                        </span>
                        <span className="text-gray-400 basis-2/6">
                          {track.track.artists
                            .map((artist) => artist.name)
                            .join(", ")}
                        </span>
                      </CardContent>
                    );
                  })}
              </Card>
            </DialogContent>
          </Dialog>
          {isPlayerVisible ? (
            <div className="fixed flex justify-evenly items-center text-center inset-x-0 bottom-0 h-20 w-full bg-black rounded-b-lg shadow-md overflow-hidden z-50">
              <img
                src={`${currentTrack?.album.images[0].url}`}
                alt=""
                className="w-16 h-16 object-cover rounded-xl"
              />
              <div className="flex flex-col justify-center h-full p-4 space-y-2">
                <span className="break-words">{currentTrack?.name}</span>
                <span className="text-gray-500">
                  {currentTrack?.artists
                    .map((artist) => artist.name)
                    .join(", ")}
                </span>
              </div>
              <div className="flex justify-center space-x-4 relative">
                <button
                  onClick={() => handlePrevTrack()}
                  className="p-2 bg-slate-900 rounded-full border-2 border-blue-300"
                >
                  <IoIosSkipBackward className="text-white" />
                </button>
                <audio
                  src={`${currentTrack?.preview_url || ""}`}
                  controls
                ></audio>
                <button
                  onClick={() => handleNextTrack()}
                  className="p-2 rounded-full border-2 border-blue-300"
                >
                  <IoIosSkipForward className="text-white" />
                </button>

                <button
                  onClick={() => handleOnClose()}
                  className="p-2 rounded-full border-2 border-blue-300 hover:bg-red-600"
                >
                  <IoMdClose className="text-white" />
                </button>
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
            </div>
          ) : (
            <></>
          )}
        </Tabs>
      </div>
    </div>
  );
}
