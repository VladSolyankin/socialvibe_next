/* eslint-disable @next/next/no-img-element */
"use client";

import { Loader } from "@/components/shared/Loader";
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import {
  addPostComment,
  changePostLikeCount,
  changeUserOnline,
  createUserPost,
  getAllUsers,
  getAllUsersWithPosts,
  getUser,
  getUserPosts,
} from "@/lib/firebase";
import { IUser, IUserPost } from "@/types";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { nanoid } from "nanoid";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Emoji from "react-emoji-render";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaRegComment, FaRegHeart } from "react-icons/fa6";
import { FcAddImage, FcLike } from "react-icons/fc";
import { onSnapshot } from "@firebase/firestore";
import { collection, query } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { INITIAL_USER } from "@/constants";

export default function NewsPage() {
  const storageUserId =
    typeof window !== "undefined" ? localStorage.getItem("userAuth") : "";
  const [userPosts, setUserPosts] = useState(Array);
  const [userPostInfo, setUserPostInfo] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [currentUser, setCurrentUser] = useState<IUser>(INITIAL_USER);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImages, setNewPostImages] = useState(Array<string>);
  const [currentPostComment, setCurrentPostComment] = useState("");
  const [currentPostIndex, setCurrentPostIndex] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [usersWithPosts, setUsersWithPosts] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 3000);

    fetchUser();
    getPostsFromFirestore();
    fetchAllUsersWithPosts();
    changeUserOnline(true);
  }, []);

  const fetchAllUsersWithPosts = async () => {
    const usersWithPosts = await getAllUsersWithPosts();
    setUsersWithPosts(() => usersWithPosts);
  };

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

  const onLikePost = async (likedPost) => {
    await changePostLikeCount(likedPost.id, !isPostLiked);
    const updatedPosts = userPosts.map((post) => {
      if (post.id === likedPost.id) {
        return {
          ...post,
          likes: isPostLiked ? post.likes - 1 : post.likes + 1,
        };
      }
      return post;
    });
    setUserPosts(updatedPosts);
    setIsPostLiked(!isPostLiked);
  };

  const onCommentPost = async (post) => {
    const newPostComment = {
      userId: currentUser.id,
      userPreview: currentUser.avatar_url || "/default_profile.png",
      userName: currentUser.full_name,
      content: currentPostComment,
    };

    await addPostComment(post.id, newPostComment);
    const updatedPosts = userPosts.map((post) => {
      if (post.id === post.id) {
        return {
          ...post,
          comments: [...post.comments, newPostComment],
        };
      }
      return post;
    });
    setUserPosts(updatedPosts);
  };

  return (
    <div id="posts">
      {isLoaded ? (
        <div className="flex flex-col items-center justify-center gap-10 border-2 rounded-xl p-10 min-w-[50vw]">
          <Tabs defaultValue="my-posts">
            <TabsList className="w-[35vw] flex items-center justify-center mb-5">
              <TabsTrigger value="news">Лента</TabsTrigger>
              <TabsTrigger value="my-posts">Мои посты</TabsTrigger>
            </TabsList>
            <TabsContent value="my-posts">
              <div className="flex flex-col gap-3 w-[35vw] justify-center">
                <div className="w-full flex items-center justify-center gap-3">
                  <img
                    src={`${(currentUser && currentUser.avatar_url) || "/default_profile.png"}`}
                    alt="Profile picture"
                    className="w-8 h-8 rounded-[50%]"
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
              <div className="flex flex-col gap-10 items-center justify-center mt-5">
                {userPosts.length > 0 ? (
                  userPosts
                    .sort((a, b) => b.date - a.date)
                    .map((post: IUserPost, index) => {
                      return (
                        <>
                          <Card className="flex flex-col gap-3 border-2 w-[35vw] h-full pt-4 px-8">
                            <div className="flex flex-col justify-center gap-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={`${
                                    (currentUser && currentUser.avatar_url) ||
                                    "/default_profile.png"
                                  }`}
                                  alt=""
                                  className="w-10 h-10 rounded-[50%]"
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
                                    <span className="text-md">
                                      {post.likes}
                                    </span>
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
                            <div id="comments">
                              <Accordion collapsible type="single">
                                <AccordionItem value="comments-item">
                                  <AccordionTrigger>
                                    Показать комментарии
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    {post.comments.length > 0 ? (
                                      post.comments.map((comment) => {
                                        return (
                                          <div
                                            key={nanoid()}
                                            id="comment"
                                            className="flex items-center border-t-2 border-gray-800 p-2 gap-3"
                                          >
                                            <img
                                              src={`${
                                                comment.userPreview ||
                                                "default_profile.png"
                                              }`}
                                              className="w-8 h-8"
                                              alt=""
                                            />
                                            <div>
                                              <span className="text-blue-500">
                                                {comment.userName}
                                              </span>
                                              <p className="text-sm">
                                                {comment.content}
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <Label className="flex flex-col items-center text-center text-lg">
                                        Комментариев ещё нет.
                                        <br />
                                        <div>
                                          Будьте{" "}
                                          <span className="text-blue-500">
                                            первым!
                                          </span>
                                        </div>
                                      </Label>
                                    )}
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                              <div className="flex items-center justify-center gap-3 my-5">
                                <img
                                  src={`${
                                    (currentUser && currentUser.avatar_url) ||
                                    "/default_profile.png"
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
                                    placeholder="Напишите новый комментарий..."
                                    name="comment"
                                    value={currentPostComment}
                                    onChange={(e) =>
                                      setCurrentPostComment(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        onCommentPost(post);
                                        setCurrentPostComment("");
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
                        </>
                      );
                    })
                ) : (
                  <div className="w-[35vw] flex flex-col items-center justify-center gap-5 mt-5">
                    <Emoji className="text-5xl">🤔</Emoji>
                    <Label className="text-xl text-center">
                      Вы ещё не добавляли постов.
                      <br />
                      Нужно исправить!
                    </Label>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="news">
              <div className="flex flex-col gap-5 items-center justify-center">
                {isLoaded ? (
                  usersWithPosts &&
                  usersWithPosts.map((user: IUserPost, index) => {
                    return (
                      <>
                        <div className="flex flex-col gap-10">
                          {user &&
                            user.posts.map((post) => {
                              return (
                                <>
                                  <Card className="flex flex-col gap-3 border-2 w-[35vw] h-full pt-4 px-8">
                                    <div className="flex flex-col justify-center gap-3">
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={`${
                                            user.avatar_url ||
                                            "/default_profile.png"
                                          }`}
                                          alt=""
                                          className="w-10 h-10 rounded-[50%]"
                                        />
                                        <span>{user.full_name}</span>
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
                                            <span className="text-md">
                                              {post.likes}
                                            </span>
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
                                    <div>
                                      <Accordion collapsible type="single">
                                        <AccordionItem value="comments-item">
                                          <AccordionTrigger>
                                            Показать комментарии
                                          </AccordionTrigger>
                                          <AccordionContent>
                                            {post.comments.length > 0 ? (
                                              post.comments.map((comment) => {
                                                return (
                                                  <div
                                                    key={nanoid()}
                                                    id="comment"
                                                    className="flex items-center border-t-2 border-gray-800 p-2 gap-3"
                                                  >
                                                    <img
                                                      src={`${
                                                        comment.userPreview ||
                                                        "default_profile.png"
                                                      }`}
                                                      className="w-8 h-8"
                                                      alt=""
                                                    />
                                                    <div>
                                                      <span className="text-blue-500">
                                                        {comment.userName}
                                                      </span>
                                                      <p className="text-sm">
                                                        {comment.content}
                                                      </p>
                                                    </div>
                                                  </div>
                                                );
                                              })
                                            ) : (
                                              <Label className="flex flex-col items-center text-center text-lg">
                                                Комментариев ещё нет.
                                                <br />
                                                <div>
                                                  Будьте{" "}
                                                  <span className="text-blue-500">
                                                    первым!
                                                  </span>
                                                </div>
                                              </Label>
                                            )}
                                          </AccordionContent>
                                        </AccordionItem>
                                      </Accordion>
                                      <div className="flex items-center justify-center gap-3 my-5">
                                        <img
                                          src={`${
                                            (currentUser &&
                                              currentUser.avatar_url) ||
                                            "/default_profile.png"
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
                                            placeholder="Напишите новый комментарий..."
                                            name="comment"
                                            onChange={(e) => {
                                              setCurrentPostComment(
                                                e.target.value
                                              );
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                e.preventDefault();
                                                onCommentPost(post);
                                                setCurrentPostComment("");
                                              }
                                            }}
                                          />
                                        </form>
                                        <Button size="icon">
                                          <PaperPlaneIcon />
                                        </Button>
                                      </div>
                                    </div>
                                  </Card>
                                </>
                              );
                            })}
                        </div>
                      </>
                    );
                  })
                ) : (
                  <>ww</>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <Loader />
      )}

      <Toaster />
    </div>
  );
}
