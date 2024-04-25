"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  addUserFriend,
  deleteUserFriend,
  getAllUsers,
  getUser,
  getUserFriends,
} from "@/lib/firebase";
import { nanoid } from "nanoid";
import React, { useEffect, useState } from "react";
import Emoji from "react-emoji-render";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { FaUserFriends } from "react-icons/fa";
import PeopleList from "@/components/pages/friends/PeopleList";
import FriendsList from "@/components/pages/friends/FriendsList";

export default function FriendsPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [isAddFriendDialogOpen, setIsAddFriendDialogOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [isSearched, setIsSearched] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchUserProfile();
    fetchAllUsers();
    fetchUserFriends();
  }, []);

  const onSearchUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSearched(true);
    const filter = users.filter((user) =>
      user.full_name.toLowerCase().includes(e.target.value),
    );
    setFilteredUsers(filter);
    if (e.target.value === "") {
      setIsSearched(false);
    }
  };

  const onSearchFriends = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSearched(true);
    const filter = friends.filter((friend) =>
      friend.full_name.toLowerCase().includes(e.target.value),
    );
    setFilteredFriends(filter);
    if (e.target.value === "") {
      setIsSearched(false);
    }
  };

  const fetchAllUsers = async () => {
    const fetchedUsers = await getAllUsers();
    const filteredUsers = fetchedUsers.filter(
      (user) => user.id !== localStorage.getItem("userAuth"),
    );
    setUsers(filteredUsers);
  };

  const fetchUserProfile = async () => {
    const info = await getUser();
    setUserProfile(info);
  };

  const fetchUserFriends = async () => {
    const fetchedFriends = await getUserFriends();
    setFriends(fetchedFriends);
  };

  const onAddFriend = async (id: string) => {
    await addUserFriend(id as string);
    await fetchUserProfile();
    await fetchUserFriends();
  };

  const onTabChange = () => {
    setIsSearched(false);
    setFilteredFriends([]);
    setFilteredUsers([]);
  };

  const onDeleteFriend = async (id: string) => {
    await deleteUserFriend(id);
    await fetchUserProfile();
    await fetchUserFriends();
  };

  return (
    <div className="min-h-screen min-w-[50vw]">
      <Tabs defaultValue="friends">
        <TabsList className="ml-5 mt-5">
          <TabsTrigger value="friends" onClick={onTabChange}>
            Мои друзья
          </TabsTrigger>
          <TabsTrigger value="users" onClick={onTabChange}>
            Все пользователи
          </TabsTrigger>
        </TabsList>
        <TabsContent value="friends">
          <div className="flex flex-col p-5 gap-5">
            <div className="flex flex-col gap-3 items-center">
              <FaUserFriends className="w-6 h-6" />
              <Label>Мои друзья</Label>
              <Label className="text-[12px] text-gray-400">
                Да-да, все здесь...
              </Label>
            </div>
            <Input
              placeholder="🔍 Найти друга..."
              onChange={(e) => onSearchFriends(e)}
            />
            <Card className="flex flex-col h-full p-5">
              {friends.length > 0 ? (
                (isSearched ? filteredFriends : friends).length ? (
                  <FriendsList
                    friends={isSearched ? filteredFriends : friends}
                    onDeleteFriend={onDeleteFriend}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Emoji className="text-5xl">😟</Emoji>
                    <span>Никого не нашли</span>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Emoji className="text-5xl">😟</Emoji>
                  <span>У вас нет друзей</span>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="users">
          <div className="flex flex-col p-5 gap-5">
            <div className="flex flex-col gap-3 items-center">
              <AiOutlineUsergroupAdd className="w-6 h-6" />
              <Label>Пользователи</Label>
              <Label className="text-[12px] text-gray-400">
                Великий глобальный поиск...
              </Label>
            </div>
            <Input
              placeholder="🔍 Найти пользователя..."
              onChange={(e) => onSearchUser(e)}
            />
            <Card className="flex flex-col h-full p-5">
              {users.length ? (
                (isSearched ? filteredFriends : friends) ? (
                  <PeopleList
                    users={users}
                    userProfile={userProfile}
                    onAddFriend={onAddFriend}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Emoji className="text-5xl">😟</Emoji>
                    <span>Никого не нашли</span>
                  </div>
                )
              ) : (
                <Label>Загрузка...</Label>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
