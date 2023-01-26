import { createContext, ReactNode, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFirebase } from "../services/api";
import nookies, { setCookie } from 'nookies'; 
import jwt from 'jsonwebtoken'; 

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  token: string;
  username: string;
};

type UserNotes = {
  id: string;
  taskText: string;
  userId: string;
  done: string;
};

type UserContextData = {
  user: User | null;
  userNotes: UserNotes[] | [];
  login: (email: string, password: string) => Promise<void>;
  listAllNotes: () => Promise<void>;
};

export const UserContext = createContext({} as UserContextData);

type UserContextProviderProps = {
  children: ReactNode;
};

export function UserContextProvider({ children }: UserContextProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userNotes, setUserNotes] = useState<UserNotes[] | []>([]);

  const navigation = useNavigate();

  async function login(email: string, password: string) {
    const emailVerified = typeof email === "string" && email.length > 0;
    const passwordVerified =
      typeof password === "string" && password.length > 0;

    if (emailVerified && passwordVerified) {
      const response = await apiFirebase.post("/login", {
        data: {
          email,
          password,
        },
      });

      if (response.status === 200) {
        const userData = response.data.result;
        setUser(userData.result);

        setCookie(null, 'auth', userData.result.token);

        await listAllNotes();
        navigation("/home");
      }
    }
  }

  async function listAllNotes() {
    try {
      const cookies = nookies.get();

      const response = await apiFirebase.post("/listAllNotesByUser", {
        data: {
          token: cookies.auth,
        },
      });

      setUserNotes(response.data.result.result);
    } catch (error) {
      throw new Error('Could not get notes');
    }

    
  }

  return (
    <UserContext.Provider
      value={{
        user,
        userNotes,
        login,
        listAllNotes,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  return useContext(UserContext);
};
