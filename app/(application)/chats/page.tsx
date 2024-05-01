"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import {
  addGroupChat,
  getChat,
  getChats,
  getUserFriends,
  initChats,
  sendMessage,
} from "@/lib/firebase";
import { IUser } from "@/types";
import { ChevronDown, CornerDownLeft, Mic, Paperclip } from "lucide-react";
import { nanoid } from "nanoid";
import React, { useEffect, useState } from "react";
import { ChatItem } from "react-chat-elements";
import "react-chat-elements/dist/main.css";
import Emoji from "react-emoji-render";
import { BsFilterRight } from "react-icons/bs";
import { MdAddCircleOutline } from "react-icons/md";

export default function ChatsPage() {
  const [userChats, setUserChats] = useState<IUserChats[]>();
  const [userFriends, setUserFriends] = useState([]);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [openedChat, setOpenedChat] = useState({});
  const [currentChatIndex, setCurrentChatIndex] = useState(0);
  const [isNewChatDialog, setIsNewChatDialog] = useState(false);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);

  useEffect(() => {
    fetchedFriends();
  }, []);

  useEffect(() => {
    initializeChats();
  }, []);

  const initializeChats = async () => {
    await initChats();
    const fetchedChats = await getChats();
    setUserChats(() => fetchedChats);
  };

  const fetchedFriends = async () => {
    const fetch = await getUserFriends();
    setUserFriends(() => fetch);
  };

  const onChatSelect = async (index: number) => {
    setIsChatVisible(true);
    setCurrentChatIndex(index);
    //const chatMessages = await getChatMessages(index);
  };

  const onChatSearch = async () => {};

  const onMessageSend = async () => {
    setCurrentMessage("");
    await sendMessage(userChats[currentChatIndex].id, currentMessage);
    const chat = await getChat(userChats[currentChatIndex].id);
    setUserChats(() => {
      const newChats = [...userChats];
      newChats[currentChatIndex] = chat;
      return newChats;
    });
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
    console.log("start");
    if (selectedGroupMembers.length < 3) {
      console.log("fail");
      toast({
        title: "❌ Вы должны выбрать хотя бы 2 человек!",
        description: "Выберите их из списка своих друзей",
      });
      return;
    }

    const chatId = nanoid();
    await addGroupChat({
      id: chatId,
      members: selectedGroupMembers as string[],
      messages: [],
      title: "Новый чат",
      avatar_url: "placeholder",
    });
    setIsNewChatDialog(false);
    setSelectedGroupMembers([]);

    toast({
      title: "✅ Чат создан!",
      description: "Он отобразится в списке всех чатов",
    });
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
                      avatar={chat.preview ?? "/default_profile.png"}
                      alt={"User message"}
                      title={chat.title}
                      subtitle={"Напишите сообщение..."}
                      unread={0}
                      onClick={() => onChatSelect(index)}
                    />
                  </div>
                );
              })}
          </div>
        </div>

        {isChatVisible ? (
          <div className="flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 col-span-2">
            <div className="flex flex-col flex-1 overflow-y-scroll">
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
            <div className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
              <Label htmlFor="message" className="sr-only">
                Message
              </Label>
              <Textarea
                value={currentMessage}
                id="message"
                placeholder="Введите ваше сообщение..."
                className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                onChange={(e) => onMessageChanged(e)}
              />
              <div className="flex items-center p-3 pt-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Paperclip className="size-4" />
                        <span className="sr-only">Прикрепить файл</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Прикрепить файл</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Mic className="size-4" />
                        <span className="sr-only">Голосовой ввод</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Голосовой ввод</TooltipContent>
                  </Tooltip>
                  <Button
                    size="sm"
                    className="ml-auto gap-1.5"
                    onClick={() => onMessageSend()}
                  >
                    Отправить
                    <CornerDownLeft className="size-3.5" />
                  </Button>
                </TooltipProvider>
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
          <Label className="text-xl">Создать новый чат</Label>
          <div className="flex flex-col gap-3">
            <Input placeholder="Название чата" />
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
                        className={`${selectedGroupMembers.includes(friend.id as never) ? "bg-purple-600" : "bg-background"} flex flex-col items-center justify-center p-3 rounded-xl`}
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
                <Button className="mx-auto" onClick={() => onCreateGroupChat()}>
                  Создать
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
