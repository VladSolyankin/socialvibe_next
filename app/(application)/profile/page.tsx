"use client";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  changeUserImage,
  changeUserStatus,
  getUser,
  getUserFriends,
  getUsersProfileInfo,
} from "@/lib/firebase";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCallback, useEffect, useState } from "react";
import Emoji from "react-emoji-render";
import { FileWithPath, useDropzone } from "react-dropzone";
import { BiLandscape } from "react-icons/bi";
import { Input } from "@/components/ui/input";
import { nanoid } from "ai";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { IoPencilSharp } from "react-icons/io5";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "@/components/shared/Loader";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState({});
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileWithPath>();
  const [selectedFileURL, setSelectedFileURL] = useState<string>();
  const [isProfileChangeOpen, setIsProfileChangeOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditStatusOpen, setIsEditStatusOpen] = useState(false);
  const [userFriends, setUserFriends] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 3000);
  });
  useEffect(() => {
    fetchUserProfile();
    fetchUserFriends();
  }, []);

  const fetchUserProfile = async () => {
    const user = await getUser();
    setCurrentUser(user);
  };

  const fetchUserFriends = async () => {
    const friends = await getUserFriends();
    setUserFriends(friends);
  };

  const onDrop = useCallback((files: FileWithPath[]) => {
    setIsFileSelected(true);
    //setSelectedFileURL(URL.createObjectURL(files[0]));
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

  const onHandleSave = async () => {
    changeUserImage(selectedFileURL);
    await fetchUserProfile();
    setIsProfileChangeOpen(false);
    setIsFileSelected(false);
    setSelectedFile(undefined);
    setSelectedFileURL(undefined);
  };

  const onStatusChange = async (newStatus: string) => {
    const response = await changeUserStatus(newStatus);
    if (response) {
      setIsEditStatusOpen(false);
      toast({
        title: "✅ Успешно",
        description: "Статус изменился",
        variant: "default",
      });
    } else {
      toast({
        title: "❗ У вас уже такой статус",
        description: "Придумайте другой",
        variant: "destructive",
      });
    }

    await fetchUserProfile();
  };

  return (
    <div className="flex flex-col items-center p-3">
      {isLoaded ? (
        <div>
          <div className="flex flex-col items-center gap-3">
            <Emoji className="text-5xl">👀</Emoji>
            <Label className="text-xl">Ваш профиль</Label>
          </div>
          <div className="max-w-[70vw] flex gap-5 p-5">
            <div className="flex flex-col gap-5 mb-4">
              <div className="flex flex-col justify-center items-center border-2 p-5 gap-3 rounded-xl text-center">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="relative">
                            <img
                              src={`${currentUser?.avatar_url}`}
                              className="rounded-full border-2 h-24 w-24 object-cover hover:brightness-75 transition duration-150 ease-in-out"
                              alt=""
                            />
                            <div
                              className={`absolute bottom-0 right-0 flex justify-center items-center border border-white rounded-full w-5 h-5 ${
                                currentUser?.is_online
                                  ? "bg-green-600"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <Button
                            variant={"secondary"}
                            onClick={() => {
                              setIsFileSelected(false);
                              setSelectedFileURL("");
                              setIsProfileChangeOpen(true);
                            }}
                          >
                            Изменить фотографию
                          </Button>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div>
                  <Label className="text-2xl font-bold">
                    {currentUser?.full_name}
                  </Label>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 border-2 p-5 rounded-xl">
                <Label>Дата регистрации</Label>
                <p className="text-gray-400">
                  {currentUser?.registration_date || "Когда-то было"}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-10">
              <div className="border-2 mb-4 p-5 rounded-xl">
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 items-center justify-center relative">
                    <Label className="text-xl">Статус</Label>
                    <Button
                      variant={"ghost"}
                      className="focus:outline-none absolute right-0 top-0"
                      onClick={() => setIsEditStatusOpen(true)}
                    >
                      <IoPencilSharp className="h-5 w-5 text-gray-400 hover:text-primary-foreground" />
                    </Button>
                    <Label className="text-sm text-gray-400">
                      {currentUser.info && currentUser?.info.status}
                    </Label>
                  </div>
                  <Separator />
                  <p>
                    <b className="mr-2">Город:</b>{" "}
                    {(currentUser.info && currentUser?.info.city) ||
                      "Не указано"}
                  </p>
                  <p>
                    <b className="mr-2">Телефон:</b> +7 900 000-00-00
                  </p>
                  <p>
                    <b className="mr-2">Статус:</b> Работаю
                  </p>
                  <p className="text-gray-400">О себе:</p>
                  <p className="text-gray-600">
                    Я отличный программист, который никогда не задерживается с
                    дедлайнами.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => setIsEditOpen(true)}
                  >
                    Изменить информацию
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-3 border-2 mb-4 p-5 rounded-xl">
                <h2 className="text-2xl font-bold">Друзья</h2>
                <p className="text-gray-400">
                  Здесь будут твои друзья, которые тоже используют эту платформу
                </p>
                <div className="flex -space-x-3 hover:gap-5 overflow-hidden">
                  {userFriends.map((friend) => {
                    return (
                      <div
                        className="flex -space-x-1 transition duration-300 overflow-hidden"
                        key={nanoid()}
                      >
                        <Image
                          className="h-10 w-10 rounded-3xl"
                          src={`${friend.avatar_url || "/default_profile.png"}`}
                          alt="Friends profile images"
                          width={10}
                          height={10}
                          quality={100}
                          unoptimized={true}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="border-2 mb-4 p-5 rounded-xl">
                <h2 className="text-2xl font-bold">Посты</h2>
                <p className="text-gray-400">
                  Здесь будут посты, которые ты публикуешь
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Loader />
      )}
      <Dialog open={isProfileChangeOpen} onOpenChange={setIsProfileChangeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменение фотографии</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
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
            <Button onClick={onHandleSave}>Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование информации</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button onClick={onHandleSave}>Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditStatusOpen} onOpenChange={setIsEditStatusOpen}>
        <DialogContent className="p-10">
          <DialogHeader>
            <Input
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="✏️ Введите новый статус..."
            />
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button onClick={() => onStatusChange(status)}>Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
