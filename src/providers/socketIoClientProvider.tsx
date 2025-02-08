import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from "socket.io-client";
import { useUserContext } from './userProvider';

interface SocketIoClientProviderProps {
  children: React.ReactNode
}

interface ActiveUserType {
  userId: string;
  socketId: string;
}

interface ContextType {
  activeUser: ActiveUserType[];
  socket: React.RefObject<Socket>
}

const Context = createContext({} as ContextType);

export function SocketIoClientProvider({ children }: SocketIoClientProviderProps) {
  const { user } = useUserContext();
  const socket = useRef<Socket | null>(null);
  const [activeUser, setActiveUser] = useState<ActiveUserType[]>([]);

  useEffect(() => {
    socket.current = io("http://localhost:9090");
  }, []);

  useEffect(() => {
    // get active users
    socket.current?.emit("user", user?.id);
    socket.current?.on('user', (users) => setActiveUser(users));
  }, [user?.id]);

  return (
    <Context.Provider
      value={{
        activeUser,
        socket
      }}
    >
      {children}
    </Context.Provider>
  )
};

export const useSocketContext = () => useContext(Context);