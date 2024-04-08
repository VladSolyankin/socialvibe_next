import { AUTH_INITIAL_STATE, INITIAL_USER } from "@/constants";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<IUser>(INITIAL_USER);

  const checkUserAuth = async () => {
    if (auth.currentUser) {
      localStorage.setItem("userAuth", auth.currentUser.uid);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const cookieFallback = localStorage.getItem("userAuth");
    if (!cookieFallback) {
      setIsAuthenticated(false);
      navigate("/auth/login");
    }

    checkUserAuth();
  }, []);

  const providerValue = {
    isAuthenticated,
    user,
    setIsAuthenticated,
    setUser,
    checkUserAuth,
  };

  return (
    <AuthContext.Provider value={providerValue}>
      {children}
    </AuthContext.Provider>
  );
};

const AuthContext = createContext<IAuthContext>(AUTH_INITIAL_STATE);
export const useUserContext = () => useContext(AuthContext);
