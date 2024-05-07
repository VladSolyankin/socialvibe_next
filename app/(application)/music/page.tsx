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
import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  ChangeEvent,
} from "react";
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
import { BiLandscape } from "react-icons/bi";
import { FileWithPath, useDropzone } from "react-dropzone";
import { addTrackToStorage, getUserTracks } from "@/lib/firebase";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

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
  const [currentUserTrack, setCurrentUserTrack] = useState({});
  const [currentTrackProgress, setCurrentTrackProgress] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [isTrackDialogOpen, setIsAddTrackDialogOpen] = useState(false);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [selectedFileURL, setSelectedFileURL] = useState("");
  const [selectedFile, setSelectedFile] = useState<File>();
  const [userTracks, setUserTracks] = useState([]);
  const audioRef = useRef<HTMLAudioElement | undefined>(
    typeof Audio !== "undefined" ? new Audio("") : undefined
  );
  const { toast } = useToast();

  useEffect(() => {
    fetchPlaylists();
    fetchPopularTracks();
    fetchUserTracks();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      updateProgress();
    }
  }, [isPlaying]);

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

  const fetchUserTracks = async () => {
    const userTracks = await getUserTracks();
    setUserTracks(() => userTracks);
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
    } else {
      setCurrentTrackProgress(currentTrackProgress);
    }
  };

  const onDrop = useCallback((files: FileWithPath[]) => {
    setIsFileSelected(true);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFileURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".svg"],
    },
  });

  const onAddTrackDialogOpen = () => setIsAddTrackDialogOpen(true);

  const onAddTrack = async () => {
    if (!selectedFile) {
      toast({
        title: "❌ Вы не выбрали файл!",
        description: "Выберите файл для добавления",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile) await addTrackToStorage(selectedFile, selectedFileURL);
    setIsAddTrackDialogOpen(false);
    setSelectedFileURL(null);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onPlayUserTrack = () => {};

  console.log(userTracks);

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
              <Button
                variant="outline"
                className="flex gap-3"
                onClick={onAddTrackDialogOpen}
              >
                <Music className="w-4 h-4" />
                <span className="text-blue-500">Добавить трек</span>
              </Button>
            </div>
            <div className="flex flex-col gap-5">
              <Label className="text-lg">Мои треки</Label>
              <div className="flex">
                {userTracks &&
                  userTracks.map((track, index) => (
                    <Card
                      key={nanoid()}
                      className="flex flex-col items-center justify-center w-full text-center p-3"
                      onClick={() => {
                        setCurrentUserTrack(track);
                        onPlayUserTrack();
                      }}
                    >
                      <CardContent className="flex items-center w-full justify-between p-0">
                        <img
                          src={`${track.url || "/default_music.png"}`}
                          alt=""
                          className="w-10 h-10 object-fill rounded-xl"
                        />
                        <Label>{track.title}</Label>
                        <audio src={track.fileUrl} ref={audioRef} controls />
                      </CardContent>
                    </Card>
                  ))}
              </div>
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
            <Carousel className="w-full mb-5">
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

        <Dialog open={isTrackDialogOpen} onOpenChange={setIsAddTrackDialogOpen}>
          <DialogContent className="flex flex-col justify-center">
            <DialogHeader>🪩 Добавьте новый трек</DialogHeader>
            <div className="flex flex-col items-center justify-center gap-4 py-4">
              <div
                className="h-24 w-24 border-4 border-dashed rounded-full flex flex-col items-center justify-center"
                {...getRootProps()}
              >
                <input type="file" id="files" {...getInputProps()} />
                <div
                  className={`${
                    isFileSelected ? "hidden" : "block"
                  } flex flex-col items-center`}
                >
                  <BiLandscape className="w-12 h-12" />
                </div>
                <img
                  src={selectedFileURL}
                  className={`${
                    isFileSelected ? "block" : "hidden"
                  } w-full h-full object-fill rounded-full p-1`}
                />
              </div>
              <Label>Выберите изображение</Label>
            </div>
            <div className="grid items-center gap-3">
              <Label>Файл</Label>
              <Input
                type="file"
                accept=".mp3,.wav"
                onChange={(e) => onFileChange(e)}
              />
            </div>
            <Button onClick={onAddTrack}>Добавить</Button>
          </DialogContent>
        </Dialog>
      </div>
      <Toaster />
    </div>
  );
}
