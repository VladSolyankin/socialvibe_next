export const INITIAL_USER = {
  id: "",
  full_name: "",
  email: "",
  avatar_url: "",
  is_online: false,
  info: {
    birth_date: "",
    city: "",
    phone: "",
    status: "",
  },
  friends: [],
  photos: {
    albums: [],
    userImages: [],
  },
  registration_date: "",
};

export const AUTH_INITIAL_STATE = {
  user: INITIAL_USER,
  isAuthenticated: false,
  isLoading: false,
  setIsAuthenticated: () => {},
  setUser: () => {},
  checkUserAuth: async () => false as boolean,
};
