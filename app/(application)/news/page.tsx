/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { changePostLikeCount, getUserPosts } from "@/lib/firebase";
import { IUserPost } from "@/types";
import { nanoid } from "nanoid";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaRegComment, FaRegHeart } from "react-icons/fa6";
import { FcAddImage, FcLike } from "react-icons/fc";
import DefaultProfile from "../../../public/default_profile.png";

export default function NewsPage() {
  const [userPosts, setUserPosts] = useState(Array);
  const [userPostInfo, setUserPostInfo] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [newPostImages, setNewPostImages] = useState(Array<string>);
  const [isPostLiked, setIsPostLiked] = useState(false);

  useEffect(() => {
    const getPostsFromFirestore = async () => {
      await getUserPosts()
        .then((res) => res.docs.map((post) => post.data()))
        .then((posts) => setUserPosts(posts));
    };

    getPostsFromFirestore();
  }, []);

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

  const onAddNewPost = () => {};

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

  return (
    <div id="posts" className="flex flex-col gap-10 border-2 rounded-xl p-3">
      <div className="flex flex-col gap-3">
        <div className="w-full flex items-center justify-center gap-3">
          <img
            src="/default_profile.png"
            alt="Profile picture"
            className="w-8 h-8"
          />
          <Textarea placeholder="Расскажите что-то новое..." />
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
          userPosts.map((post: IUserPost) => {
            return (
              <Card
                key={nanoid()}
                className="flex flex-col gap-3 border-2 w-[35vw]"
              >
                <div className="flex flex-col p-2 gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={"/default_profile.png" ?? ""}
                      alt=""
                      className="w-10 h-10"
                    />
                    <span>{post.full_name}</span>
                    <span className="ml-auto">
                      {post.date.toDate().toLocaleString().replace(",", " •")}
                    </span>
                  </div>
                  <div>{post.content}</div>
                  <img src={post.images[0]} alt="" className="rounded-xl" />
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
                        <span className="text-md">{post.comments.length}</span>
                      </div>
                    </Button>
                    <div className="flex flex-col"></div>
                  </div>
                </div>
                <div id="post-buttons" className=""></div>
                <div id="comments">
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
                          <span className="text-blue-500">Some user</span>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
