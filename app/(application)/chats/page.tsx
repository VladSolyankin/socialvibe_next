"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import {
  addGroupChat,
  getChat,
  getChatUsersProfiles,
  getChats,
  getUserFriends,
  initChats,
  sendMessage,
} from "@/lib/firebase";
import { IUser } from "@/types";
import {
  ChevronDown,
  CornerDownLeft,
  File,
  Paperclip,
  Users,
  Video,
} from "lucide-react";
import { nanoid } from "nanoid";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChatItem } from "react-chat-elements";
import "react-chat-elements/dist/main.css";
import { FileWithPath, useDropzone } from "react-dropzone";
import Emoji from "react-emoji-render";
import { BiLandscape } from "react-icons/bi";
import { BsFilterRight } from "react-icons/bs";
import { MdAddCircleOutline } from "react-icons/md";

export default function ChatsPage() {
  const [userChats, setUserChats] = useState([]);
  const [userFriends, setUserFriends] = useState([]);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentChatIndex, setCurrentChatIndex] = useState(0);
  const [isNewChatDialog, setIsNewChatDialog] = useState(false);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [groupChatTitle, setGroupChatTitle] = useState("");
  const [selectedFileURL, setSelectedFileURL] = useState("");
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [groupChatProfiles, setGroupChatProfiles] = useState([]);
  const [isChatMediaOpen, setIsChatMediaOpen] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchedFriends();
  }, []);

  useEffect(() => {
    initializeChats();
  }, []);

  useEffect(() => scrollToBottom(), [userChats]);

  const initializeChats = async () => {
    await initChats();
    const fetchedChats = await getChats();
    setUserChats(() => fetchedChats);
  };

  const fetchedFriends = async () => {
    const fetch = await getUserFriends();
    setUserFriends(() => fetch);
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

  const onChatSelect = async (index: number) => {
    setGroupChatProfiles([]);
    setIsChatVisible(true);
    setCurrentChatIndex(index);
    if (userChats[currentChatIndex].users.length > 2)
      await getChatUsersProfiles(userChats[currentChatIndex].users).then(
        (res) => {
          setGroupChatProfiles(() => res);
        }
      );
  };

  const onChatSearch = async () => {};

  const onMessageSend = async () => {
    if (currentMessage.length === 0) return;
    setCurrentMessage("");
    console.log(userChats[currentChatIndex], userChats[currentChatIndex].id);
    if (userChats[currentChatIndex]) {
      await sendMessage(userChats[currentChatIndex].id, currentMessage);
      await getChat(userChats[currentChatIndex].id).then((res) => {
        if (res && res.users) {
          setUserChats(() => {
            const newChats = [...userChats];
            newChats[currentChatIndex] = res;
            return newChats;
          });
          userChats[currentChatIndex].avatar_url;
        }
      });
    }
  };

  const onMessageChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value);
  };

  const onAddNewChat = async () => {
    setIsNewChatDialog(true);
    setSelectedGroupMembers([localStorage.getItem("userAuth")]);
  };

  const onSelectGroupMember = async (id: string) => {
    if (!selectedGroupMembers.includes(id as never)) {
      setSelectedGroupMembers([...selectedGroupMembers, id]);
    } else {
      setSelectedGroupMembers(
        selectedGroupMembers.filter((member) => member !== id)
      );
    }
  };

  const onCreateGroupChat = async () => {
    if (selectedGroupMembers.length < 3) {
      toast({
        title: "❌ Вы должны выбрать хотя бы 2 человек!",
        description: "Выберите их из списка своих друзей",
        variant: "destructive",
      });
      return;
    }

    if (groupChatTitle.length < 1) {
      toast({
        title: "❌ Название чата слишком короткое!",
        description: "Придумайте что-нибудь",
        variant: "destructive",
      });
      return;
    }
    userChats[currentChatIndex].avatar_url;

    const chatId = nanoid();
    await addGroupChat({
      id: chatId,
      users: selectedGroupMembers as string[],
      messages: [],
      title: groupChatTitle,
      avatar_url: selectedFileURL || "/default_profile.png",
    });
    setIsNewChatDialog(false);
    setSelectedGroupMembers([]);
    const updatedChats = await getChats();
    setUserChats(() => updatedChats);

    toast({
      title: "✅ Чат создан!",
      description: "Он отобразится в списке всех чатов",
    });
  };

  const scrollToBottom = () => {
    if (chatScrollRef.current)
      chatScrollRef.current.scrollTop = chatScrollRef.current?.scrollHeight;
  };

  return (
    <div className="mt-4 h-screen max-w-5xl">
      <CardContent className="h-full grid grid-cols-3 gap-6">
        <div className="flex flex-col gap-3 col-span-1 p-2">
          <div className="flex items-center justify-between">
            <CardTitle>💬 Сообщения</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="secondary">
                  <BsFilterRight className="w-6 h-6 rounded-xl cursor-pointer" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="flex gap-1 items-center"
                  onClick={onAddNewChat}
                >
                  <MdAddCircleOutline className="w-4 h-4" />
                  Создать новый чат
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>
            Здесь вы можете общаться с друзьями или группами людей
          </CardDescription>
          <Input placeholder="🔍 Найти чат..." />
          <div className="flex flex-col gap-1">
            {userChats &&
              userChats.map((chat, index) => {
                return (
                  <div key={nanoid()}>
                    <ChatItem
                      className="text-black rounded-lg focus-within:ring-1 hover:ring-2 ring-blue-400"
                      avatar={
                        chat.preview ||
                        userChats[index].avatar_url ||
                        "/default_profile.png"
                      }
                      alt={"User message"}
                      title={chat.title}
                      subtitle={
                        userChats[index].messages[
                          userChats[index].messages.length - 1
                        ]?.text ?? "Напишите сообщение..."
                      }
                      unread={1}
                      onClick={() => onChatSelect(index)}
                      dateString={
                        userChats[index].messages[
                          userChats[index].messages.length - 1
                        ]?.date
                      }
                    />
                  </div>
                );
              })}
          </div>
        </div>

        {isChatVisible ? (
          <div className="flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 col-span-2">
            {userChats[currentChatIndex].users.length > 2 ? (
              <div className="flex items-center justify-between h-12 bg-black rounded-xl object-contain px-4 mb-4 ring-1 gap-3">
                <img
                  src={`${userChats[currentChatIndex].avatar_url || "/default_profile.png"}`}
                  alt="Selected chat image"
                  className="h-8 w-8 rounded-full border-2 border-white"
                />
                <Label>{userChats[currentChatIndex].title}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant={"secondary"}>
                      <Users className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel className="text-center">
                      Участники
                    </DropdownMenuLabel>
                    <div>
                      {groupChatProfiles &&
                        groupChatProfiles.map((user: IUser) => {
                          return (
                            <DropdownMenuItem
                              key={nanoid()}
                              className="flex gap-3 items-center justify-start"
                            >
                              <img
                                src={`${user.avatar_url || "/default_profile.png"}`}
                                alt=""
                                className="h-6 w-6 rounded-full"
                              />
                              <Label>{user.full_name}</Label>
                            </DropdownMenuItem>
                          );
                        })}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <></>
            )}
            <div
              className="flex flex-col flex-1 overflow-y-scroll"
              ref={chatScrollRef}
            >
              {userChats[currentChatIndex].messages.length > 0 ? (
                userChats[currentChatIndex].messages.map((message) => {
                  return (
                    <div
                      key={nanoid()}
                      className={`flex ${
                        message.sender === localStorage.getItem("userAuth")
                          ? "justify-end"
                          : "justify-start"
                      } mb-2 pr-3`}
                    >
                      <div
                        className={`min-w-[100px] relative max-w-[70%] text-white p-4 pb-6 rounded-md break-words ${
                          message.sender === localStorage.getItem("userAuth")
                            ? "bg-blue-600 text-right"
                            : "bg-purple-600 text-left"
                        }`}
                      >
                        {message.text}
                        <span className="absolute bottom-0 right-2 text-sm text-gray-400">
                          {message.date}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full flex flex-col items-center justify-center gap-3">
                  <Emoji className="text-5xl">😮</Emoji>
                  <span className="text-lg">Сообщений нет</span>
                </div>
              )}
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring mt-5">
              <Label htmlFor="message" className="sr-only">
                Message
              </Label>
              <Textarea
                value={currentMessage}
                id="message"
                placeholder="Введите ваше сообщение..."
                className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                onChange={(e) => onMessageChanged(e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onMessageSend();
                  }
                }}
              />
              <div className="flex items-center p-3 pt-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsChatMediaOpen(true)}
                    >
                      <Paperclip className="size-4" />
                      <span className="sr-only">Прикрепить файл</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <Button
                    size="sm"
                    className="ml-auto gap-1.5"
                    onClick={() => onMessageSend()}
                  >
                    Отправить
                    <CornerDownLeft className="size-3.5" />
                  </Button>
                  <DropdownMenuContent side="top">
                    <DropdownMenuGroup className="flex flex-col items-start justify-center">
                      <DropdownMenuItem className="flex justify-start">
                        <File className="mr-2 h-4 w-4" />
                        <Label>Файл</Label>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Video className="mr-2 h-4 w-4" />
                        <Label>Видео</Label>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex h-full min-h-[50vh] flex-col justify-center items-center gap-5 rounded-xl bg-muted/50 p-4 col-span-2">
            <Emoji className="text-5xl">👈😎</Emoji>
            <span className="text-lg">Выбери, с кем ты будешь общаться</span>
          </div>
        )}
      </CardContent>
      <Dialog open={isNewChatDialog} onOpenChange={setIsNewChatDialog}>
        <DialogContent className="p-10">
          <Label className="text-xl">💬 Создать новый чат</Label>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 py-4">
              <div
                className="h-24 w-24 basis-1/3 border-4 border-dashed rounded-full flex flex-col items-center justify-center"
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
              <Input
                placeholder="Название чата"
                value={groupChatTitle}
                onChange={(e) => setGroupChatTitle(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Выберите участников
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="flex flex-col py-4">
                <div className="grid grid-cols-5 gap-3 p-4">
                  {userFriends.map((friend: IUser) => {
                    return (
                      <div
                        key={nanoid()}
                        className={`${selectedGroupMembers.includes(friend.id as never) ? "bg-purple-600" : "bg-background"} flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer`}
                        onClick={() => {
                          onSelectGroupMember(friend.id);
                        }}
                      >
                        <img
                          className="h-10 w-10 rounded-full"
                          src={`${friend.avatar_url || "/default_profile.png"}`}
                          alt="List of friends to add in group chat"
                        />
                        <span className="text-md">{friend.full_name}</span>
                      </div>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="mx-auto" onClick={() => onCreateGroupChat()}>
              Создать
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
