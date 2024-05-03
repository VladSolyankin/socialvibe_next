"use client";
import { Button } from "@/components/ui/button";
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
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Music, Plus, Volume, Volume1, Volume2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Emoji from "react-emoji-render";
import {
  IoIosSkipBackward,
  IoIosSkipForward,
  IoMdClose,
  IoMdPause,
  IoMdPlay,
} from "react-icons/io";
import { IoAdd } from "react-icons/io5";
import { MdReplay } from "react-icons/md";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SliderProps = React.ComponentProps<typeof Slider>;

export default function MusicPage({ ...props }) {
  const [playlists, setPlaylists] = useState({});
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [popularTracks, setPopularTracks] = useState([]);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState({});
  const [currentTrackProgress, setCurrentTrackProgress] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const audioRef = useRef<HTMLAudioElement | undefined>(
    typeof Audio !== "undefined" ? new Audio("") : undefined
  );

  useEffect(() => {
    fetchPlaylists();
    fetchPopularTracks();
  }, []);
  const fetchPlaylists = async () => {
    const playlists = await getPlaylists("playlists").then((res) =>
      setPlaylists(res)
    );
  };

  const fetchPlaylistTracks = async (index: number) => {
    const playlistTracks = await getPlaylistTracks();
    setPlaylistTracks(() => playlistTracks);
  };

  const fetchPopularTracks = async () => {
    await getPopularTracks()
      .then((res) => res.filter((item) => item.preview_url))
      .then((data) => setPopularTracks(data));
  };

  const onPlaylistOpen = (playlist, index) => {
    fetchPlaylistTracks(index);
    setIsPlaylistOpen(true);
    setCurrentPlaylist(playlist);
  };

  const onTrackPlay = (track) => {
    setCurrentTrackProgress(0);
    setIsPlaying(true);
    setCurrentTrack(track);
    audioRef.current?.play();
    setIsPlayerVisible(true);
    setIsPlaylistOpen(false);
  };

  const handleNextTrack = () => {};
  const handlePrevTrack = () => {};
  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current?.pause();
    } else {
      setIsPlaying(true);
      audioRef.current?.play();
    }
  };

  const handleOnClose = () => {
    setIsPlaylistOpen(false);
    setIsPlayerVisible(false);
    setIsPlaying(false);
    setCurrentTrackIndex(0);
  };

  const updateProgress = () => {
    if (isPlaying) {
      setCurrentTrackProgress((prev) => (prev >= 100 ? 100 : prev + 100 / 30));
      setTimeout(updateProgress, 1000);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      updateProgress();
    }
  }, [isPlaying]);

  console.log(currentTrackProgress);

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
            className="flex flex-col h-full mt-5 mx-2 gap-5"
          >
            <div className="flex justify-end">
              <Button variant="outline" className="flex gap-3">
                <Music className="w-4 h-4" />
                <span className="text-blue-500">Добавить трек</span>
              </Button>
            </div>
            <div>
              <Label className="text-lg">Мои треки</Label>
            </div>
          </TabsContent>
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
                        {popularTracks.slice(i * 5, i * 5 + 5).map((track) => {
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
                <DialogTitle className="flex flex-col gap-2">
                  {currentPlaylist.name ? currentPlaylist.name : `Плейлист 🔥`}
                  <br />
                  <span className="text-blue-500">
                    {playlistTracks.length} треков
                  </span>
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
                <button
                  onClick={() => handlePlayPause()}
                  className="border-blue-300 border-2 rounded-full p-2"
                >
                  {isPlaying ? <IoMdPause /> : <IoMdPlay />}
                </button>
                <button
                  onClick={() => handleNextTrack()}
                  className="p-2 bg-slate-900 rounded-full border-2 border-blue-300"
                >
                  <IoIosSkipForward className="text-white" />
                </button>

                <button
                  onClick={() => handleOnClose()}
                  className="p-2 rounded-full border-2 border-blue-300 hover:bg-red-600"
                >
                  <IoMdClose className="text-white" />
                </button>
                <audio
                  ref={audioRef}
                  src={`${currentTrack?.preview_url || ""}`}
                ></audio>
              </div>
              <div className="flex gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="secondary"
                      className="flex items-center justify-center gap-2"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="flex items-center justify-center gap-3 p-4"
                  >
                    <Label>0</Label>
                    <Slider
                      orientation="horizontal"
                      className="w-[100px]"
                      min={0}
                      max={100}
                      onValueChange={(value) => {
                        setSliderValue(value);
                        audioRef.current.volume = value / 100;
                      }}
                    />
                    <Label>{sliderValue}</Label>
                  </DropdownMenuContent>
                </DropdownMenu>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="secondary"
                        className="flex items-center justify-center gap-2"
                      >
                        <MdReplay
                          className="w-4 h-4"
                          onClick={() => {
                            setCurrentTrackProgress(0);
                            audioRef.current.currentTime = 0;
                            audioRef.current?.play();
                          }}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <Label>Повторить трек</Label>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="secondary"
                        className="flex items-center justify-center gap-2"
                      >
                        <IoAdd className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <Label>Добавить трек</Label>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div
                style={{
                  width: `${currentTrackProgress}%`,
                }}
                className={`absolute top-0 left-0 h-1 bg-purple-500`}
              ></div>
            </div>
          ) : (
            <></>
          )}
        </Tabs>
      </div>
    </div>
  );
}
