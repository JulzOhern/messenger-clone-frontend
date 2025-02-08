import { axiosClient } from '@/lib/axiosClient';
import { useQuery } from '@tanstack/react-query';
import React, { createContext, useContext } from 'react'

interface UserProviderProps {
  children: React.ReactNode
}

interface ContextType {
  user: {
    id: string;
    username: string;
    email: string;
    profile: string;
    createdAt: Date;
    updatedAt: Date;
  },
  isLoading: boolean;
}

const Context = createContext({} as ContextType);

export function UserProvider({ children }: UserProviderProps) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response = await axiosClient.get("/user", {
          withCredentials: true,
        });

        return response.data;
      } catch (error: any) {
        console.log(error.message);
      }
    }
  });

  return (
    <Context.Provider value={{ user, isLoading }}>{children}</Context.Provider>
  )
}

export function useUserContext() {
  return useContext(Context);
}
