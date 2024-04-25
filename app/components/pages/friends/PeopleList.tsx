import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { nanoid } from "nanoid";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PeopleList = ({ users, userProfile, onAddFriend }) => {
  return (
    <div className="flex flex-col gap-5">
      {users.map((user) => (
        <PeopleCard
          key={nanoid()}
          user={user}
          userProfile={userProfile}
          onAddFriend={onAddFriend}
        />
      ))}
    </div>
  );
};

const PeopleCard = ({ user, userProfile, onAddFriend }) => {
  const [isAddFriendDialogOpen, setIsAddFriendDialogOpen] = useState(false);

  return (
    <Card className="flex items-center justify-between gap-5 w-full p-3">
      <div className="flex gap-5 items-center">
        <img
          src={user.avatar_url ? user.avatar_url : "/default_profile.png"}
          alt=""
          className="w-8 h-8 rounded-full"
        />
        <span>{user.full_name}</span>
      </div>
      {userProfile.friends && userProfile.friends.includes(user.id) ? (
        <Label className="text-sm text-blue-500">Уже в друзьях</Label>
      ) : (
        <Dialog
          open={isAddFriendDialogOpen}
          onOpenChange={setIsAddFriendDialogOpen}
        >
          <DialogTrigger>
            <Button
              className="text-sm focus-within:ring-1"
              onClick={() => setIsAddFriendDialogOpen(true)}
            >
              Добавить в друзья
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <span>
                Вы уверены, что хотите добавить{" "}
                <span className="text-blue-400"> {user.full_name} </span>в
                друзья?
              </span>
            </DialogHeader>
            <DialogFooter>
              <DialogClose className="flex gap-3">
                <Button variant="destructive">Нет</Button>
                <Button
                  onClick={() => {
                    onAddFriend(user.id);
                    setIsAddFriendDialogOpen(false);
                  }}
                >
                  Да
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default PeopleList;
