"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  addAlbumImage,
  addUserAlbum,
  addUserImage,
  deleteAlbum,
  deleteUserImage,
  getUserAlbums,
  getUserImages,
} from "@/lib/firebase";
import { IUserAlbum, IUserImage, IUserPhotos } from "@/types";
import { nanoid } from "nanoid";
import React, { useCallback, useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import Emoji from "react-emoji-render";
import { BiLandscape, BiSolidSave } from "react-icons/bi";
import { CiCirclePlus } from "react-icons/ci";
import { FcGenericSortingAsc } from "react-icons/fc";
import dynamic from "next/dynamic";
import { Loader } from "@/components/shared/Loader";

const Viewer = dynamic(() => import("react-viewer"), {
  ssr: false,
});

export default function PhotosPage() {
  const [userImages, setUserImages] = useState<Array<IUserPhotos>>([]);
  const [userAlbums, setUserAlbums] = useState<Array<IUserAlbum>>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [selectedFileURL, setSelectedFileURL] = useState("");
  const [isImageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedFile, setSelectedFile] = useState();
  const [addImageTitle, setAddImageTitle] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteImageIndex, setDeleteImageIndex] = useState(NaN);
  const [isAlbumOpen, setIsAlbumOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<IUserAlbum>({});
  const [filteredImages, setFilteredImages] = useState([]);
  const [isAlbumDialogOpen, setIsAlbumDialogOpen] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserImages();
  }, []);

  useEffect(() => {
    fetchUserAlbums();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 3000);
  });

  const fetchUserImages = async () => {
    const userImages = await getUserImages();
    setUserImages(() => userImages);
  };

  const fetchUserAlbums = async () => {
    const userAlbums = await getUserAlbums();
    setUserAlbums(() => userAlbums);
  };

  const onDrop = useCallback((files: FileWithPath[]) => {
    setIsFileSelected(true);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(file);
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

  const onAddDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const onAddDialogClose = () => {
    setIsFileSelected(false);
    setSelectedFileURL("");
    setIsDialogOpen(false);
  };

  const onImageDialogClose = () => {
    setImageDialogOpen(false);
  };

  const onAddFormSubmit = async () => {
    if (addImageTitle.length === 0) {
      toast({
        title: "❌ Название не может быть пустым!",
        description: "Заполните поле с названием",
        variant: "destructive",
      });
      return;
    }

    if (addImageTitle.length > 20) {
      toast({
        title: "❌ Название не может быть больше 20 символов!",
        description: "Сделайте название короче",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFileURL) {
      toast({
        title: "❌ Вы не выбрали файл!",
        description: "Выберите файл для добавления",
        variant: "destructive",
      });
    }

    await addUserImage(addImageTitle, selectedFileURL);
    await fetchUserImages();
  };

  const onDeleteUserImage = async () => {
    await deleteUserImage(deleteImageIndex);
    await fetchUserImages();
    setImageDialogOpen(false);
    setDeleteImageIndex(NaN);
  };

  const onSelectUserAlbum = (album: object) => {
    setIsAlbumOpen(true);
    setSelectedAlbum(album);
  };

  const onDeleteAlbum = () => {
    setIsConfirmOpen(true);
  };

  const onAlbumDeleteConfirmed = async () => {
    await deleteAlbum(userAlbums?.indexOf(selectedAlbum) as number);
    await fetchUserAlbums();
    setIsConfirmOpen(false);
    setIsAlbumOpen(false);
    setSelectedAlbum({});
  };

  const onSearchImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSearched(true);
    const searchQuery = e.target.value.toLowerCase();
    const foundImages = userImages.filter((image) =>
      image.title.toLowerCase().includes(searchQuery)
    );
    setFilteredImages(foundImages);
  };

  const onAddNewAlbum = (title: string, imageUrl: string) => {
    setIsAlbumOpen(false);
    addUserAlbum(title, imageUrl)
      .then(() => {
        fetchUserAlbums();
        setAddImageTitle("");
      })
      .catch((err) => console.log(err));
  };

  const onAddNewAlbumImage = async () => {
    await addAlbumImage(
      userAlbums?.indexOf(selectedAlbum),
      selectedFileURL,
      addImageTitle
    )
      .then(() => {
        fetchUserAlbums();
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <Tabs defaultValue="photos" className="p-5 min-w-3xl">
        <div className="w-full flex justify-between gap-3">
          <TabsList>
            <TabsTrigger value="photos">🖼️ Изображения </TabsTrigger>
            <TabsTrigger value="albums">Альбомы</TabsTrigger>
          </TabsList>
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  className="flex gap-2"
                  onClick={() => {
                    onAddDialogOpen;
                  }}
                >
                  <CiCirclePlus className="w-6 h-6" />
                  <span>Добавить</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="flex flex-col gap-3">
                <Dialog onOpenChange={() => onAddDialogClose()}>
                  <DialogTrigger>
                    <Button
                      variant="secondary"
                      className="flex gap-2 w-full"
                      onClick={() => {
                        onAddDialogOpen;
                      }}
                    >
                      <span>Изображение</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>🖼️ Добавить изображение</DialogTitle>
                      <DialogDescription>
                        Дайте название и выберите файл (или перетащите его в
                        выделенную область):
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                      <Input
                        id="title"
                        placeholder="Название изображения..."
                        className="col-span-3"
                        onChange={(e) => setAddImageTitle(e.target.value)}
                      />
                      <div
                        className="h-64 border-4 border-dashed rounded-xl flex flex-col items-center justify-center"
                        {...getRootProps()}
                      >
                        <input type="file" id="files" {...getInputProps()} />
                        <div
                          className={`${
                            isFileSelected ? "hidden" : "block"
                          } flex flex-col items-center`}
                        >
                          <BiLandscape className="w-12 h-12" />
                          Выберите или перетащите изображение
                        </div>
                        <img
                          src={selectedFileURL}
                          className={`${
                            isFileSelected ? "block" : "hidden"
                          } w-full h-full object-fill rounded-xl p-1`}
                          alt="Selected Image"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose>
                        <Button
                          type="submit"
                          className="flex gap-2 items-center"
                          onClick={() => onAddFormSubmit()}
                        >
                          <BiSolidSave />
                          Сохранить
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog onOpenChange={() => onAddDialogClose()}>
                  <DialogTrigger>
                    <Button
                      variant="secondary"
                      className="flex gap-2 w-full"
                      onClick={() => {
                        onAddDialogOpen;
                      }}
                    >
                      <span>Альбом</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>🖼️ Добавить альбом</DialogTitle>
                      <DialogDescription>
                        Дайте название и выберите файл (или перетащите его в
                        выделенную область):
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                      <Input
                        id="title"
                        placeholder="Название альбома..."
                        className="col-span-3"
                        onChange={(e) => setAddImageTitle(e.target.value)}
                      />
                      <div
                        className="h-64 border-4 border-dashed rounded-xl flex flex-col items-center justify-center"
                        {...getRootProps()}
                      >
                        <input type="file" id="files" {...getInputProps()} />
                        <div
                          className={`${
                            isFileSelected ? "hidden" : "block"
                          } flex flex-col items-center`}
                        >
                          <BiLandscape className="w-12 h-12" />
                          Выберите или перетащите изображение
                        </div>
                        <img
                          src={selectedFileURL}
                          className={`${
                            isFileSelected ? "block" : "hidden"
                          } w-full h-full object-fill rounded-xl p-1`}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose>
                        <Button
                          type="submit"
                          className="flex gap-2 items-center"
                          onClick={() =>
                            onAddNewAlbum(addImageTitle, selectedFileURL)
                          }
                        >
                          <BiSolidSave />
                          Сохранить
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isImageDialogOpen} onOpenChange={onImageDialogClose}>
              <DialogContent>
                <Card className="flex flex-col gap-3">
                  <img
                    className="h-full rounded-t-xl object-contain"
                    src={selectedImage}
                    alt=""
                  />
                  <div className="flex p-3 gap-3 flex-row-reverse">
                    <span></span>
                    <Button variant="ghost" className="text-sm">
                      ↗ Поделиться
                    </Button>
                    <Button
                      variant="destructive"
                      className="text-sm"
                      onClick={() => setIsConfirmOpen(true)}
                    >
                      Удалить
                    </Button>
                    <Dialog
                      open={isConfirmOpen}
                      onOpenChange={setIsConfirmOpen}
                    >
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Вы уверены что хотите удалить эту фотографию?
                          </DialogTitle>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose className="flex gap-5">
                            <Button>Нет</Button>
                            <Button
                              variant="destructive"
                              onClick={() => onDeleteUserImage()}
                            >
                              Да
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <TabsContent value="photos" className="slide-in-left min-h-[50vh]">
          <Card className="min-h-[50vh]">
            <CardHeader>
              <CardTitle>Ваши изображения</CardTitle>
              <CardDescription>
                Здесь вы можете управлять своими изображениями. Нажмите на
                изображение, чтобы посмотреть его
              </CardDescription>
              <Input
                placeholder="🔍 Найти фотографию..."
                onChange={(e) => onSearchImage(e)}
              />
            </CardHeader>
            <CardContent className="grid grid-cols-3 place-content-center gap-x-12 gap-y-16 mx-5">
              {isLoaded ? (
                userImages && userImages.length > 0 ? (
                  userImages && isSearched ? (
                    filteredImages.map((photo: IUserImage, index) => (
                      <div
                        key={nanoid()}
                        className="flex flex-col items-center"
                      >
                        <img
                          className="w-52 h-52 rounded-xl"
                          src={photo.url}
                          alt="User photo"
                          onClick={() => {
                            setIsViewerVisible(true);
                            setSelectedImage(photo.url);
                          }}
                        />
                        <span>{photo.title}</span>
                      </div>
                    ))
                  ) : (
                    userImages.map((photo, index) => (
                      <div
                        key={nanoid()}
                        className="flex flex-col items-center"
                      >
                        <img
                          className="w-52 h-52 rounded-xl"
                          src={photo.url}
                          alt="User photo"
                          onClick={() => setIsViewerVisible(true)}
                        />
                        <Viewer
                          className="w-40 h-40 rounded-xl"
                          visible={isViewerVisible}
                          onClose={() => setIsViewerVisible(false)}
                          images={[{ src: photo.url }]}
                        />
                        <span>{photo.title}</span>
                      </div>
                    ))
                  )
                ) : (
                  <div className="flex flex-col items-center col-span-3 mx-auto h-full">
                    <Emoji className="text-5xl">😟</Emoji>
                    <span>У вас нет фотографий</span>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center col-span-3 mx-auto">
                  <Loader />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="albums" className="slide-in-right min-h-[50vh]">
          <Card className="min-h-[50vh]">
            <CardHeader>
              <CardTitle>Ваши альбомы</CardTitle>
              <CardDescription>
                Создавайте уникальные коллекции изображений и просматривайте их
                разом
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 place-content-center gap-x-12 gap-y-16 grid-flow-row">
              {userAlbums && userAlbums.length > 0 ? (
                userAlbums &&
                userAlbums.map((album: IUserAlbum) => (
                  <div
                    key={nanoid()}
                    className="relative flex flex-col items-center"
                  >
                    <img
                      className="w-52 h-52 rounded-xl z-30"
                      src={album.preview}
                      alt="User photo"
                      onClick={() => {
                        onSelectUserAlbum(album);
                        setIsViewerVisible(false);
                      }}
                    />
                    <span className="z-10">{album.title}</span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center col-span-3 mx-auto h-full">
                  <Emoji className="text-5xl">🥺</Emoji>
                  <span>У вас нет альбомов</span>
                </div>
              )}
            </CardContent>
          </Card>
          <Dialog open={isAlbumOpen} onOpenChange={setIsAlbumOpen}>
            <DialogContent className="min-w-[50vw]">
              <DialogHeader>{selectedAlbum.title}</DialogHeader>
              <div className="grid grid-cols-4 gap-5">
                {selectedAlbum.images ? (
                  selectedAlbum.images.map((image: IUserImage) => {
                    return (
                      <div
                        className="flex flex-col items-center"
                        key={nanoid()}
                      >
                        <img
                          className="w-52 h-52 rounded-xl"
                          src={image.url}
                          alt="User photo"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsViewerVisible(true);
                            setIsAlbumOpen(false);
                          }}
                        />
                        <span>{image.title}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center col-span-3 mx-auto h-full">
                    <Emoji className="text-5xl">🥺</Emoji>
                    <span>У альбома нет изображений</span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="destructive" onClick={onDeleteAlbum}>
                  Удалить
                </Button>
                <Button onClick={() => setIsAlbumDialogOpen(true)}>
                  Добавить изображение
                </Button>
                <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Вы уверены что хотите удалить этот альбом?
                      </DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose className="flex gap-5">
                        <Button>Нет</Button>
                        <Button
                          variant="destructive"
                          onClick={() => onAlbumDeleteConfirmed()}
                        >
                          Да
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isAlbumDialogOpen} onOpenChange={setIsAlbumDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>🖼️ Добавить изображение в альбом</DialogTitle>
                <DialogDescription>
                  Дайте название и выберите файл (или перетащите его в
                  выделенную область):
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <Input
                  id="title"
                  placeholder="Название изображения..."
                  className="col-span-3"
                  onChange={(e) => setAddImageTitle(e.target.value)}
                />
                <div
                  className="h-64 border-4 border-dashed rounded-xl flex flex-col items-center justify-center"
                  {...getRootProps()}
                >
                  <input type="file" id="files" {...getInputProps()} />
                  <div
                    className={`${
                      isFileSelected ? "hidden" : "block"
                    } flex flex-col items-center`}
                  >
                    <BiLandscape className="w-12 h-12" />
                    Выберите или перетащите изображение
                  </div>
                  <img
                    src={selectedFileURL}
                    className={`${
                      isFileSelected ? "block" : "hidden"
                    } w-full h-full object-fill rounded-xl p-1`}
                    alt="Selected Image"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose>
                  <Button
                    type="submit"
                    className="flex gap-2 items-center"
                    onClick={() => onAddNewAlbumImage()}
                  >
                    <BiSolidSave />
                    Сохранить
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {selectedAlbum.images && (
            <Viewer
              className="w-40 h-40 rounded-xl"
              visible={isViewerVisible}
              onClose={() => setIsViewerVisible(false)}
              images={selectedAlbum.images.map((image) => ({
                src: image.url,
              }))}
              zIndex={1000}
            />
          )}
          <Viewer
            className="w-40 h-40 rounded-xl"
            visible={isViewerVisible}
            onClose={() => setIsViewerVisible(false)}
            images={[{ src: selectedImage }]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
