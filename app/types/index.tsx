export type IUser = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  is_online: boolean;
  birth_date: string;
  city: string;
  phone: string;
  status: string;
  currentStatus: string;
  friends: Array<string>;
  photos: {
    albums: Array<IUserAlbum>;
    userImages: Array<IUserImage>;
  };
  registration_date: string;
};

export type IUserPhotos = {
  title: string;
  url: string;
};

type IAuthContext = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkUserAuth: () => Promise<boolean>;
};

export type IUserAlbum = {
  images: Array<IUserImage>;
  date: string;
  url: string;
  preview: string;
  title: string;
};

export type IUserImage = {
  url: string;
  date: string;
  title: string;
};

export type IUserPost = {
  comments: Array<{ content: string; user_id: string }>;
  images: Array<string>;
  title: string;
  user_id: string;
};

export type IGroupChat = {
  id: string;
  title: string;
  avatar_url: string;
  users: Array<string>;
  messages: Array<IMessage>;
};

export type IMessage = {
  sender: string;
  content: string;
  date: string;
};

export type IProfileInfo = {
  birth_date: string;
  city: string;
  phone: string;
  currentStatus: string;
};

export type IUserStatus = {
  status: string;
};

const UserStatuses = {
  online: "В сети",
  offline: "Не в сети",
  busy: "Не беспокоить",
};

export type IUserPersonalInfo = {
  firstName: string;
  lastName: string;
  city: string;
  phone: string;
  email: string;
  birthDate: string;
  avatar_url: string;
};
