"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HfInference } from "@huggingface/inference";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { nanoid } from "ai";
import { useChat } from "ai/react";
import { saveAs } from "file-saver";
import { DownloadIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { CodeBlock, atomOneDark } from "react-code-blocks";

interface Message {
  id: string;
  role: string;
  content: string;
}

interface Props {
  messages: Message[];
  handleSubmit: () => void;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  input: string;
}
export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [generatedImage, setGeneratedImage] = useState("");
  const [isGenerated, setGenerated] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const hf = new HfInference(process.env.NEXT_PUBLIC_HF_TOKEN);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  const onImagePromptSubmit = async () => {
    const response = await hf.textToImage({
      inputs: `${input}`,
      model: "runwayml/stable-diffusion-v1-5",
      parameters: {
        negative_prompt: "blurry",
      },
    });
    await setGeneratedImage(URL.createObjectURL(response));
    await setGenerated(true);
  };

  const downloadImage = () => {
    saveAs(generatedImage, `${input ?? "image"}.png`);
  };

  const renderCodeBlocks = (text: string) => {
    return text.split(/```([\s\S]+?)```|`([\s\S]+?)`/g).map((part, index) => {
      if (index % 3 === 0) {
        return part; // Нечетные части - не код, просто возвращаем текст
      } else {
        return (
          <CodeBlock
            key={index}
            text={part}
            language="python"
            theme={atomOneDark}
          />
        );
      }
    });
  };

  return (
    <Tabs defaultValue="chat">
      <TabsList className="flex items-center justify-center mx-auto mt-5 w-[300px] gap-5">
        <TabsTrigger value="chat">Чат</TabsTrigger>
        <TabsTrigger value="image">Генерация картинок</TabsTrigger>
      </TabsList>
      <TabsContent value="chat" className="min-w-3xl">
        <div className="h-[90vh] flex flex-col items-center p-3 w-[70vw] gap-5">
          <Card className="flex flex-col w-[80%] border-2 z-10">
            <CardContent className="flex flex-col">
              <div className="relative flex flex-col text-lg items-center text-center justify-center">
                <div className="flex flex-col items-center justify-center pt-5">
                  🧠 Задайте любой вопрос и получите на него ответ
                  <Popover>
                    <PopoverTrigger>
                      <IoMdInformationCircleOutline className="absolute top-3 right-5 w-6 h-6" />
                    </PopoverTrigger>
                    <PopoverContent className="flex w-80 text-center">
                      Напишите текст в поле снизу и нажмите Enter (либо на
                      кнопку отправить)
                    </PopoverContent>
                  </Popover>
                  <CardDescription>
                    Запросы воспринимаются моделью лучше на английском языке
                  </CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="h-full w-[80%] overflow-auto" ref={chatRef}>
            <div className="px-5 pt-5">
              <div className="flex flex-col">
                {messages.length > 0
                  ? messages.map((message) => (
                      <div
                        key={nanoid()}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        } mb-2`}
                      >
                        <div
                          className={`min-w-[5vw] relative max-w-[70%] p-4 pb-6 rounded-md ${
                            message.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-purple-600 text-white"
                          }`}
                        >
                          {renderCodeBlocks(message.content)}
                          <span className="absolute bottom-0 right-2 text-sm text-gray-400">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))
                  : null}
              </div>
            </div>
          </Card>
          <form onSubmit={handleSubmit} className="w-[80%] h-12 flex gap-5">
            <Input
              value={input}
              placeholder="Введите запрос..."
              onChange={handleInputChange}
            />
            <Button type="submit" size="icon">
              <PaperPlaneIcon />
            </Button>
          </form>
        </div>
      </TabsContent>
      <TabsContent value="image" className="min-w-[50vw] h-screen">
        <div className="h-[90vh] flex flex-col items-center p-3 w-[70vw] gap-5">
          <Card className="flex flex-col w-[80%] border-2 z-10">
            <CardContent className="flex flex-col">
              <div className="relative flex flex-col text-lg items-center text-center justify-center">
                <div className="flex flex-col items-center justify-center pt-5">
                  🖼️ Опишите картинку, которую хотите получить
                  <Popover>
                    <PopoverTrigger>
                      <IoMdInformationCircleOutline className="absolute top-3 right-5 w-6 h-6" />
                    </PopoverTrigger>
                    <PopoverContent className="flex w-80">
                      <div>
                        1. Напишите текст в поле снизу и нажмите{" "}
                        <span className="text-blue-500">Enter</span> (либо на
                        кнопку отправить)
                        <br />
                        2. Для скачивания:{" "}
                        <span className="text-blue-500">ПКМ</span> -{" "}
                        <span className="text-blue-500">Скачать</span>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <CardDescription>
                    Запросы воспринимаются моделью лучше на английском языке
                  </CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="h-full w-[80%] overflow-hidden">
            {isGenerated ? (
              <ContextMenu>
                <ContextMenuTrigger className="w-full h-full">
                  <img
                    alt="Generated image"
                    src={generatedImage}
                    className="w-full h-full"
                  />
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => {
                      downloadImage();
                    }}
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Скачать
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ) : (
              <></>
            )}
          </Card>
          <div className="w-[80%] h-12 flex gap-5">
            <Input
              value={input}
              placeholder="Введите запрос..."
              onChange={handleInputChange}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  onImagePromptSubmit();
                }
              }}
            />
            <Button onSubmit={onImagePromptSubmit} size="icon">
              <PaperPlaneIcon />
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
