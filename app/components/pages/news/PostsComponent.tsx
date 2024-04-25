import React from "react";
import Emoji from "react-emoji-render";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { nanoid } from "nanoid";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { FcLike } from "react-icons/fc";
import { FaRegComment, FaRegHeart } from "react-icons/fa6";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { PaperPlaneIcon } from "@radix-ui/react-icons";

const PostsComponent = ({
  userPosts,
  currentUser,
  onLikePost,
  onCommentPost,
  isPostLiked,
}) => {
  return (
    <PostList
      userPosts={userPosts}
      currentUser={currentUser}
      onLikePost={onLikePost}
      onCommentPost={onCommentPost}
      isPostLiked={isPostLiked}
    />
  );
};

const PostList = ({
  userPosts,
  currentUser,
  onLikePost,
  onCommentPost,
  isPostLiked,
}) => {
  return (
    <div className="flex flex-col gap-10 items-center justify-center mt-5">
      {userPosts.length > 0 ? (
        userPosts
          .sort((a, b) => b.date - a.date)
          .map((post) => (
            <Post
              key={nanoid()}
              post={post}
              currentUser={currentUser}
              onLikePost={onLikePost}
              onCommentPost={onCommentPost}
              isPostLiked={isPostLiked}
            />
          ))
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
  );
};

const Post = ({
  post,
  currentUser,
  onLikePost,
  onCommentPost,
  isPostLiked,
}) => {
  const [currentPostComment, setCurrentPostComment] = React.useState("");

  return (
    <Card className="flex flex-col gap-3 border-2 w-[35vw] h-full pt-4 px-8">
      <div className="flex flex-col justify-center gap-3">
        <div className="flex items-center gap-3">
          <img
            src={`${currentUser.avatar_url || "/default_profile.png"}`}
            alt=""
            className="w-10 h-10 rounded-[50%]"
          />
          <span>{currentUser.full_name}</span>
          <span className="ml-auto">
            {post && post.date.toDate().toLocaleString().replace(",", " •")}
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
              <span className="text-md">{post.comments.length}</span>
            </div>
          </Button>
          <div className="flex flex-col"></div>
        </div>
      </div>
      <div id="comments">
        <Accordion collapsible type="single">
          <AccordionItem value="comments-item">
            <AccordionTrigger>Показать комментарии</AccordionTrigger>
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
                        src={`${comment.userPreview || "default_profile.png"}`}
                        className="w-8 h-8"
                        alt=""
                      />
                      <div>
                        <span className="text-blue-500">
                          {comment.userName}
                        </span>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <Label className="flex flex-col items-center text-center text-lg">
                  Комментариев ещё нет.
                  <br />
                  <div>
                    Будьте <span className="text-blue-500">первым!</span>
                  </div>
                </Label>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex items-center justify-center gap-3 my-5">
          <img
            src={`${currentUser.avatar_url || "/default_profile.png"}`}
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
              onChange={(e) => setCurrentPostComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onCommentPost(post, currentPostComment);
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
  );
};

export default PostsComponent;
