/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import {
  addPostComment,
  changePostLikeCount,
  createUserPost,
  getUser,
  getUserPosts,
} from "@/lib/firebase";
import { IUserPost } from "@/types";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { nanoid } from "nanoid";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaRegComment, FaRegHeart } from "react-icons/fa6";
import { FcAddImage, FcLike } from "react-icons/fc";

export default function NewsPage() {
  const [userPosts, setUserPosts] = useState(Array);
  const [userPostInfo, setUserPostInfo] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImages, setNewPostImages] = useState(Array<string>);
  const [currentPostComment, setCurrentPostComment] = useState("");
  const [currentPostIndex, setCurrentPostIndex] = useState();

  useEffect(() => {
    getPostsFromFirestore();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const response = await getUser();
    setCurrentUser(() => response);
  };

  const getPostsFromFirestore = async () => {
    await getUserPosts()
      .then((res) => res.docs.map((post) => post.data()))
      .then((posts) => setUserPosts(posts));
  };

  const onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImages([...newPostImages, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".svg"],
    },
  });

  const onAddNewPost = async () => {
    if (!newPostContent) {
      toast({
        title: "❗️ Нельзя оставлять пост пустым",
        description: "Это ведь как никак пост!",
      });
      return;
    }

    if (newPostImages.length > 10) {
      toast({
        title: "❗️ Нельзя добавлять более 10 изображений",
        description: "Многовато будет!",
      });
      return;
    }
    const newPost = {
      id: nanoid(),
      images: newPostImages,
      comments: [],
      likes: 0,
      content: newPostContent,
    };
    await createUserPost(newPost);
    await getPostsFromFirestore();
    setNewPostContent("");
    setNewPostImages([]);
  };

  const onDeleteNewPostImage = (index: number) => {
    setNewPostImages((images) => images.filter((_, i) => i != index));
  };

  const onLikePost = (post) => {
    if (isPostLiked) {
      setIsPostLiked(false);
      changePostLikeCount(post.id, false);
    } else {
      setIsPostLiked(true);
      changePostLikeCount(post.id, true);
    }
  };

  const onCommentPost = async (post) => {
    const newPostComment = {
      userId: currentUser.id,
      userPreview: currentUser.avatar_url || "/default_profile.png",
      userName: currentUser.full_name,
      content: currentPostComment,
    };

    await addPostComment(post.id, newPostComment);
    setCurrentPostComment("");
  };

  return (
    <div
      id="posts"
      className="flex flex-col items-center gap-10 border-2 rounded-xl p-3 min-w-[50vw]"
    >
      <div className="flex flex-col gap-3 w-[35vw] justify-center">
        <div className="w-full flex items-center justify-center gap-3">
          <img
            src={`${currentUser.avatar_url || "/default_profile.png"}`}
            alt="Profile picture"
            className="w-8 h-8"
          />
          <Textarea
            placeholder="Расскажите что-то новое..."
            onChange={(e) => setNewPostContent(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-5 gap-3">
          {newPostImages ? (
            newPostImages.map((url, index) => {
              return (
                <div className="relative w-24 h-24" key={nanoid()}>
                  <Image
                    src={url}
                    alt="Added image post"
                    className="h-20 w-20 rounded-sm"
                    quality={100}
                    width={20}
                    height={20}
                  />
                  <AiFillCloseCircle
                    className="h-4 w-4 absolute top-0 right-0 object-contain"
                    onClick={() => onDeleteNewPostImage(index)}
                  />
                </div>
              );
            })
          ) : (
            <></>
          )}
        </div>
        <div className="flex flex-row-reverse items-center gap-3">
          <Button className="text-sm" onClick={() => onAddNewPost()}>
            Создать пост
          </Button>

          <div {...getRootProps()}>
            <input type="file" {...getInputProps()} />
            <FcAddImage className="h-6 w-6 cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-10 items-center justify-center">
        {userPosts.length > 0 &&
          userPosts
            .sort((a, b) => b.date - a.date)
            .map((post: IUserPost, index) => {
              return (
                <Card
                  key={nanoid()}
                  className="flex flex-col gap-3 border-2 w-[35vw] h-full pt-4 px-8"
                >
                  <div className="flex flex-col justify-center gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={`${
                          currentUser.avatar_url || "/default_profile.png"
                        }`}
                        alt=""
                        className="w-10 h-10"
                      />
                      <span>{currentUser.full_name}</span>
                      <span className="ml-auto">
                        {post &&
                          post.date
                            .toDate()
                            .toLocaleString()
                            .replace(",", " •")}
                      </span>
                    </div>
                    <div>{post.content}</div>
                    <Carousel>
                      <CarouselContent>
                        {post.images &&
                          post.images.map((image) => (
                            <CarouselItem
                              key={nanoid()}
                              className="w-full flex items-center justify-center"
                            >
                              <img
                                src={image}
                                alt="Carousel image"
                                className="rounded-xl max-h-[500px]"
                              />
                            </CarouselItem>
                          ))}
                      </CarouselContent>
                      {post.images.length > 0 && (
                        <>
                          <CarouselPrevious />
                          <CarouselNext />
                        </>
                      )}
                    </Carousel>
                    <div className="flex items-center">
                      <Button
                        className="text-sm"
                        variant={"ghost"}
                        onClick={() => onLikePost(post)}
                      >
                        <div className="flex items-center gap-3">
                          {isPostLiked ? (
                            <FcLike className="w-6 h-6" />
                          ) : (
                            <FaRegHeart className="w-6 h-6" />
                          )}
                          <span className="text-md">{post.likes}</span>
                        </div>
                      </Button>
                      <Button variant={"ghost"}>
                        <div className="flex gap-3 items-center">
                          <FaRegComment className="w-6 h-6" />
                          <span className="text-md">
                            {post.comments.length}
                          </span>
                        </div>
                      </Button>
                      <div className="flex flex-col"></div>
                    </div>
                  </div>
                  <div id="post-buttons" className=""></div>
                  <div id="comments">
                    <Accordion collapsible type="single">
                      <AccordionItem value="comments-item">
                        {post.comments.length >= 3 && (
                          <AccordionTrigger>
                            Показать комментарии
                          </AccordionTrigger>
                        )}
                        <AccordionContent>
                          {post.comments.map((comment) => {
                            return (
                              <div
                                key={nanoid()}
                                id="comment"
                                className="flex items-center border-t-2 border-gray-800 p-2 gap-3"
                              >
                                <img
                                  src={"/default_profile.png" ?? ""}
                                  className="w-8 h-8"
                                  alt=""
                                />
                                <div>
                                  <span className="text-blue-500">
                                    Some user
                                  </span>
                                  <p className="text-sm">{comment.content}</p>
                                </div>
                              </div>
                            );
                          })}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    <div className="flex items-center justify-center gap-3 my-5">
                      <img
                        src={`${
                          currentUser.avatar_url || "/default_profile.png"
                        }`}
                        alt="Profile picture"
                        className="w-8 h-8 border-blue-400 border-[2px] rounded-[50%]"
                      />
                      <form
                        className="w-[35vw] flex items-center justify-center"
                        onSubmit={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <Input
                          className="h-12"
                          type="text"
                          placeholder="Напишите новый комментарий..."
                          name="comment"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              onCommentPost(post);
                              e.target.value = "";
                            }
                          }}
                        />
                      </form>
                      <Button onSubmit={() => {}} size="icon">
                        <PaperPlaneIcon />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
      </div>
      <Toaster />
    </div>
  );
}
