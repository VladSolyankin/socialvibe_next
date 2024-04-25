import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { nanoid } from "nanoid";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const FriendsList = ({ friends, onDeleteFriend }) => {
  const [isAddFriendDialogOpen, setIsAddFriendDialogOpen] = useState(false);
  console.log(friends);
  return (
    <div className="flex flex-col gap-5">
      {friends.map((friend) => (
        <FriendsCard
          key={nanoid()}
          friend={friend}
          onDeleteFriend={onDeleteFriend}
        />
      ))}
    </div>
  );
};

const FriendsCard = ({ friend, onDeleteFriend }) => {
  const [deleteFriendDialogOpen, setDeleteFriendDialogOpen] = useState(false);

  return (
    <Card
      key={nanoid()}
      className="flex items-center justify-between gap-5 w-full p-3"
    >
      <div className="flex gap-5 items-center">
        <img
          src={friend.avatar_url ? friend.avatar_url : "/default_profile.png"}
          alt=""
          className="w-8 h-8 rounded-full"
        />
        <span>{friend.full_name}</span>
      </div>

      <Dialog
        open={deleteFriendDialogOpen}
        onOpenChange={setDeleteFriendDialogOpen}
      >
        <DialogTrigger>
          <Button variant="destructive" className="text-sm focus-within:ring-1">
            Удалить из друзей
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <span>
              Вы уверены, что хотите удалить{" "}
              <span className="text-red-400"> {friend.full_name} </span>
              из друзей?
            </span>
          </DialogHeader>
          <DialogFooter>
            <DialogClose className="flex gap-3">
              <Button>Нет</Button>
              <Button
                variant="destructive"
                onClick={() => onDeleteFriend(friend.id)}
              >
                Да
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FriendsList;
