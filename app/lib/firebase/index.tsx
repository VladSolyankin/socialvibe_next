"use client";
import {
  DocumentData,
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, storage, auth, rtdb } from "./config";
import { IUserPhotos } from "@/types";
import { ref, uploadBytes } from "firebase/storage";
import { set, ref as dbRef, get, child, update } from "firebase/database";
import { nanoid } from "ai";

const storageUserId =
  typeof window !== "undefined" ? localStorage.getItem("userAuth") : "";

export const getAllUsers = async () => {
  const users = [];
  const usersSnapshot = await getDocs(query(collection(db, "/users")));

  usersSnapshot.forEach((user) => {
    users.push(user.data());
  });

  return users;
};
export const createUserDocument = async (
  userId: string | undefined,
  fullName: string,
  userEmail: string,
  birthDate: string,
  city?: string
) => {
  try {
    console.log("creating user");
    await setDoc(doc(db, `users/${userId}`), {
      id: userId,
      registration_date: Date.now().toLocaleString("ru-RU"),
      avatar_url: "",
      email: userEmail,
      full_name: fullName,
      info: {
        birth_date: birthDate,
        city: "",
        status: "",
      },
      is_online: true,
      friends: [],
      photos: {
        albums: [],
        user_images: [],
      },
      post_ids: [],
    });

    await addDoc(collection(db, `users/${userId}/chats`), {});

    await addDoc(collection(db, `users/${userId}/posts`), {});
  } catch (error) {
    console.log(error);
  }
};

// Профиль
export const getCurrentUser = async (userId: string) => {
  const currentUser = await getDoc(doc(db, `users/${userId}`));

  return currentUser.data();
};

export const getUser = async () => {
  const currentUser = await getDoc(doc(db, `users/${storageUserId}`));

  return currentUser.data();
};

export const getUsersProfileInfo = async () => {
  const usersData: DocumentData[] = [];

  const q = query(collection(db, "users"));

  const userDocs = await getDocs(q);

  userDocs.forEach((user) => {
    usersData.push({ id: user.id, ...user.data() });
  });

  return usersData;
};

export const changeUserProfileInfo = async () => {
  const userRef = doc(db, `users/${storageUserId}`);
  const userDoc = await getDoc(userRef);
};

export const changeUserImage = async (imageUrl: string) => {
  const userRef = doc(db, `users/${storageUserId}`);
  const userDoc = await getDoc(userRef);

  const userImage = userDoc.data().avatar_url;

  if (userImage !== imageUrl) {
    await updateDoc(userRef, { avatar_url: imageUrl });
  } else {
    return false;
  }
};

export const changeUserOnline = async () => {
  const userRef = doc(db, `users/${storageUserId}`);
  const userDoc = await getDoc(userRef);

  const userIsOnline = userDoc.data().is_online;

  await updateDoc(userRef, { is_online: !userIsOnline });
};

export const addUserFriend = async (id: string) => {
  const userRef = doc(db, `users/${storageUserId}`);
  const userDoc = await getDoc(userRef);

  const userFriends = userDoc.data().friends;

  userFriends.push(id);

  await updateDoc(userRef, { friends: userFriends });
};

export const deleteUserFriend = async (id: string) => {
  const userRef = doc(db, `users/${storageUserId}`);
  const userDoc = await getDoc(userRef);

  const userFriends = userDoc.data().friends;

  const filter = userFriends.filter((friendId: string) => friendId !== id);

  await updateDoc(userRef, { friends: filter });
};

export const getUserFriends = async () => {
  const userRef = doc(db, `users/${storageUserId}`);
  const userDoc = await getDoc(userRef);

  const friendsIds = userDoc.data().friends;

  const friendsPromises = friendsIds.map((id) =>
    getDoc(doc(db, `/users/${id}`))
  );

  const friendsData = (await Promise.all(friendsPromises))
    .map((doc) => doc.data())
    .filter((data) => data);

  return friendsData;
};

// Новости
export const getAllPosts = () => {};

export const getUserPosts = async () => {
  const q = query(collection(db, `users/${storageUserId}/posts`));

  const userPosts = await getDocs(q);

  return userPosts;
};

export const changePostLikeCount = async (postId: string, add: boolean) => {
  const userRef = doc(db, `users/${storageUserId}/posts/${postId}`);
  const userDoc = await getDoc(userRef);

  const likeCount = userDoc.data().likes;

  await updateDoc(userRef, { likes: add ? likeCount + 1 : likeCount - 1 });
};

export const getUserAlbums = async () => {
  const userAlbums = await getDoc(doc(db, `users/${storageUserId}`));

  const data = await userAlbums.data()?.photos.albums;

  return data;
};

export const getUserImages = async () => {
  const userImages = await getDoc(doc(db, `users/${storageUserId}`));

  const data = (await userImages.data()?.photos.user_images) as IUserPhotos[];

  return data;
};

export const addUserImage = async (imageTitle: string, imageUrl: string) => {
  const userRef = doc(db, `users/${storageUserId}`);
  const userImages = await getDoc(userRef);

  const newImage = {
    url: imageUrl,
    date: new Date().toLocaleDateString("ru-RU"),
    title: imageTitle,
  };

  const photos = userImages.data().photos;

  photos.user_images.push(newImage);

  await updateDoc(userRef, { photos });
};

export const addUserAlbum = async (albumTitle: string, imageUrl: string) => {
  const userRef = doc(db, `users/${storageUserId}`);
  const userDoc = await getDoc(userRef);

  const userAlbums = userDoc.data().photos.albums;

  const newAlbum = {
    title: albumTitle,
    images: [],
    preview: imageUrl,
    date: new Date().toLocaleDateString("ru-RU"),
  };

  userAlbums.push(newAlbum);

  await updateDoc(userRef, { photos: { albums: userAlbums } });
};

export const addAlbumImage = async (
  albumIndex: number,
  imageUrl: string,
  imageTitle: string
) => {
  const userRef = doc(db, `users/${storageUserId}`);
  const userDoc = await getDoc(userRef);

  const albumImages = userDoc.data().photos.albums[albumIndex].images;

  const newImage = {
    url: imageUrl,
    date: new Date().toLocaleDateString("ru-RU"),
    title: imageTitle,
  };

  albumImages.push(newImage);

  await updateDoc(userRef, { photos: { albums: { images: albumImages } } });
};

export const addUserStorageImage = async (title: string, file: File) => {
  const userStorageRef = ref(storage, `users/${storageUserId}/images/${title}`);

  await uploadBytes(userStorageRef, file).then(() => console.log("file added"));
};

export const getUserAlbumImages = () => {};

export const deleteUserImage = async (index: number) => {
  const userRef = doc(db, `users/${storageUserId}`);
  const userImages = await getDoc(userRef);

  const photos = userImages.data().photos;

  photos.user_images.splice(index, 1);

  await updateDoc(userRef, { photos });
};

export const initChats = async () => {
  console.log("initChats");
  const chatsRef = collection(db, "chats");
  const querySnapshot = await getDocs(chatsRef);

  if (querySnapshot.empty) {
    const users = await getUserFriends();

    users.forEach(async (user) => {
      if (user.id !== storageUserId) {
        await setDoc(doc(db, `chats/${user.id}`), {
          title: user.full_name,
          users: [storageUserId, user.id],
          messages: [],
          preview: user.avatar_url || "/default_profile.png",
        });
      }
    });
  }
};

export const getChats = async () => {
  console.log("getChats");
  const chatsRef = collection(db, "chats");
  const querySnapshot = await getDocs(chatsRef);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const addChat = async (title: string) => {
  console.log("addChat");
  const chatsRef = collection(db, "chats");

  const newChat = {
    title,
    messages: [],
  };

  await addDoc(chatsRef, newChat);
};

export const sendMessage = async (chatId: string, text: string) => {
  console.log("sendMessage");
  const chatDoc = await getDoc(doc(db, `chats/${chatId}`));

  const message = {
    id: nanoid(),
    text,
    date: new Date().toLocaleDateString("ru-RU"),
  };

  chatDoc.ref.update({
    messages: arrayUnion(message),
  });
};

export const deleteMessage = async (
  chatTitle: string,
  messageIndex: number
) => {
  console.log("deleteMessage");
  const chatsRef = collection(db, "chats");
  const chatQuery = query(chatsRef, where("title", "==", chatTitle));
  const querySnapshot = await getDocs(chatQuery);

  const chatDoc = querySnapshot.docs[0];
  const messages = chatDoc.data().messages;

  messages.splice(messageIndex, 1);

  chatDoc.ref.update({ messages });
};
