"use client";
import {
  DocumentData,
  Timestamp,
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  arrayRemove,
} from "firebase/firestore";
import { db, storage, auth, rtdb } from "./config";
import { IGroupChat, IUserPhotos } from "@/types";
import { ref, uploadBytes } from "firebase/storage";
import { set, ref as dbRef, get, child, update } from "firebase/database";
import { nanoid } from "ai";

const storageUserId =
  typeof window !== "undefined" ? localStorage.getItem("userAuth") : "";

export const getAllUsers = async () => {
  const users = [];
  const usersSnapshot = await getDocs(query(collection(db, "users")));

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
        albums: {},
        user_images: [],
      },
      post_ids: [],
    });

    //await addDoc(collection(db, `users/${userId}/chats`), {});

    //await addDoc(collection(db, `users/${userId}/posts`), {});
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

export const getFriendProfile = async (id: string) => {
  const currentUser = await getDoc(doc(db, `users/${id}`));

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

export const changeUserStatus = async (status: string) => {
  const userRef = doc(db, `users/${storageUserId}`);
  const userDoc = await getDoc(userRef);

  const userStatus = userDoc.data().info.status;

  if (userStatus !== status) {
    await updateDoc(userRef, { "info.status": status });
    return true;
  } else {
    return false;
  }
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

export const changeUserOnline = async (isOnline: boolean) => {
  const userRef = doc(db, `users/${storageUserId}`);
  const userDoc = await getDoc(userRef);

  const userIsOnline = userDoc.data().is_online;

  await updateDoc(userRef, { is_online: isOnline });
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

export const getUserFriendsById = async (id: string) => {
  const userRef = doc(db, `users/${id}`);
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

export const getUserPosts = async () => {
  const q = query(collection(db, `users/${storageUserId}/posts`));

  const userPosts = await getDocs(q);

  return userPosts;
};

export const getAllUsersWithPosts = async () => {
  const result = [];
  const q = query(collection(db, "users"));
  const querySnapshot = await getDocs(q);

  for (const doc of querySnapshot.docs) {
    const userData = { id: doc.id, ...doc.data(), posts: [] };
    result.push(userData);

    const postsQuery = query(collection(db, `users/${doc.id}/posts`));
    const postsSnapshot = await getDocs(postsQuery);

    postsSnapshot.forEach((postDoc) => {
      userData.posts.push(postDoc.data());
    });
  }

  return result;
};

export const createUserPost = async (post) => {
  const userRef = collection(db, `users/${storageUserId}/posts`);

  const newPost = {
    id: post.id,
    images: [...post.images],
    comments: [],
    likes: 0,
    date: serverTimestamp(),
    content: post.content,
    users_liked: [],
  };

  await addDoc(userRef, newPost);
};

export const addPostComment = async (postId: string, comment) => {
  console.log(postId);
  const post = await getDocs(
    query(
      collection(db, `users/${storageUserId}/posts`),
      where("id", "==", postId)
    )
  );

  post.forEach((doc) => {
    updateDoc(doc.ref, {
      comments: arrayUnion(comment),
    });
  });
};

export const getPostComments = async (postId: string) => {
  const post = await getDocs(
    query(
      collection(db, `users/${storageUserId}/posts`),
      where("id", "==", postId)
    )
  );

  post.forEach((doc) => {
    return doc.data().comments;
  });
};

export const changePostLikeCount = async (postId: string, add: boolean) => {
  const post = await getDocs(
    query(
      collection(db, `users/${storageUserId}/posts`),
      where("id", "==", postId)
    )
  );

  const likedDoc = post.docs[0];
  const likeCount = post.docs[0].data().likes;
  const userRef = doc(db, `users/${storageUserId}/posts/${likedDoc.id}`);

  likedDoc.data().users_liked.includes(storageUserId)
    ? await updateDoc(userRef, { users_liked: arrayRemove(storageUserId) })
    : await updateDoc(userRef, { users_liked: arrayUnion(storageUserId) });

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

  const photos = userDoc.data().photos;

  const newAlbum = {
    title: albumTitle,
    images: [],
    preview: imageUrl,
    date: new Date().toLocaleDateString("ru-RU"),
  };

  photos.albums.push(newAlbum);

  await updateDoc(userRef, { photos });
};

export const addAlbumImage = async (
  albumIndex: number,
  imageUrl: string,
  imageTitle: string
) => {
  const userRef = doc(db, `users/${storageUserId}`);
  const userDoc = await getDoc(userRef);

  const userAlbums = userDoc.data().photos.albums;
  const userImages = userDoc.data().photos.user_images;

  const newImage = {
    url: imageUrl,
    date: new Date().toLocaleDateString("ru-RU"),
    title: imageTitle,
  };

  userAlbums[albumIndex].images.push(newImage);

  await updateDoc(userRef, {
    photos: { albums: userAlbums, user_images: userImages },
  });
};

export const deleteAlbum = async (albumIndex: number) => {
  const userRef = doc(db, `users/${storageUserId}`);
  const userDoc = await getDoc(userRef);

  const userAlbums = userDoc.data().photos.albums;

  userAlbums.splice(albumIndex, 1);

  await updateDoc(userRef, { photos: { albums: userAlbums } });
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
  const chatsRef = collection(db, `users/${storageUserId}/chats`);
  const querySnapshot = await getDocs(chatsRef);

  const currentUser = await getDoc(doc(db, `users/${storageUserId}`));
  const currentUserData = currentUser.data();

  if (querySnapshot.empty) {
    const users = await getUserFriends();
    users.forEach(async (user) => {
      if (user.id !== storageUserId) {
        await setDoc(doc(db, `users/${storageUserId}/chats/${user.id}`), {
          title: user.full_name,
          users: [storageUserId, user.id],
          messages: [],
          preview: user.avatar_url || "/default_profile.png",
        });
        await setDoc(doc(db, `users/${user.id}/chats/${storageUserId}`), {
          title: currentUserData.full_name,
          users: [user.id, storageUserId],
          messages: [],
          preview: currentUserData.avatar_url || "/default_profile.png",
        });
      }
    });
  }
};

export const getChats = async () => {
  const chatsRef = collection(db, `users/${storageUserId}/chats`);
  const querySnapshot = await getDocs(chatsRef);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getChat = async (chatId: string) => {
  const chatRef = doc(db, `users/${storageUserId}/chats/${chatId}`);
  const chatDoc = await getDoc(chatRef);

  return chatDoc.data();
};

export const addGroupChat = async (groupChat: IGroupChat) => {
  const { id, members } = groupChat;

  for (const user of members) {
    await setDoc(doc(db, `users/${user}/chats/${id}`), groupChat);
  }
};

export const sendMessage = async (chatId: string, text: string) => {
  const chatRef = doc(db, `users/${storageUserId}/chats/${chatId}`);
  const chatDoc = await getDoc(chatRef);

  const message = {
    id: nanoid(),
    text,
    date: new Date().toLocaleTimeString("ru-RU"),
    sender: storageUserId,
  };

  const otherUserId = chatDoc.data().users.find((id) => id !== storageUserId);
  const otherUserChatRef = doc(
    db,
    `users/${otherUserId}/chats/${storageUserId}`
  );

  await Promise.all([
    updateDoc(chatRef, {
      messages: arrayUnion(message),
    }),
    updateDoc(otherUserChatRef, {
      messages: arrayUnion(message),
    }),
  ]);
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
