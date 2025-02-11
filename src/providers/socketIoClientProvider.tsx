import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from "socket.io-client";
import { useUserContext } from './userProvider';
import { useQueryClient } from '@tanstack/react-query';
import { MyConversationsType } from '@/pages/chats';

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
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.current = io("http://localhost:9090");
  }, []);

  useEffect(() => {
    // get active users
    socket.current?.emit("user", user?.id);
    socket.current?.on('user', (users) => setActiveUser(users));

    // update convo realtime
    socket.current?.on("chat", (data) => {
      if (data?.userIds?.includes(user?.id)) {
        queryClient.invalidateQueries({ queryKey: ['my-conversations', user.id] });
        queryClient.setQueryData(['my-conversations', user?.id], (old: MyConversationsType[]) => (
          old.map((oldConvo) => oldConvo.id === data.id ? data : oldConvo)
        ));
      };
      queryClient.setQueryData(['convo-messages', data.id], data);
    });
  }, [user?.id, queryClient]);

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