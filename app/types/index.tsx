export type IUser = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  is_online: boolean;
  info: IUserInfo;
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

type IUserInfo = {
  birth_date: string;
  city: string;
  phone: string;
  status: string;
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
  members: Array<string>;
  messages: Array<IMessage>;
};

export type IMessage = {
  sender: string;
  content: string;
  date: string;
};
