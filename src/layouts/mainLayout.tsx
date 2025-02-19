import { Messages } from "@/components/messages/messages";
import { ConvoInformation } from "@/components/convoInformation";
import { Sidebar } from "@/components/sidebar";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/axiosClient";
import { New } from "@/components/new";
import BottomNavigation from "@/components/bottomNavigation";

export interface MessagesType {
  id: string;
  isGroupChat: boolean;
  gcName: string;
  gcProfile: string;
  userAdminIds: string[];
  createdAt: Date;
  updatedAt: Date;
  messages: {
    id: string;
    conversationId: string;
    userId: string;
    text: string;
    gif: string;
    seenByIds: string[];
    file: string;
    quickReaction: string[];
    deletedByIds: string[];
    notif: {
      id: string;
      messageId: string;
      userId: string;
      notifMessage: string;
      userIds: string[];
      user: {
        id: string;
        username: string;
        email: string;
        profile: string;
        createdAt: Date;
        updatedAt: Date;
      };
      users: {
        id: string;
        username: string;
        email: string;
        profile: string;
        createdAt: Date;
        updatedAt: Date;
      }[];
      createdAt: Date;
      updatedAt: Date;
    }[];
    seenBy: {
      id: string;
      username: string;
      email: string;
      profile?: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
    user: {
      id: string;
      username: string;
      email: string;
      profile?: string;
      createdAt: Date;
      updatedAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
  }[];
  userIds: string[];
  users: {
    id: string;
    username: string;
    email: string;
    profile: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  userAdmin: {
    id: string;
    username: string;
    email: string;
    profile: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

export default function MainLayout() {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("c") || "";
  const pathname = useLocation().pathname;

  const {
    data: messages,
    isLoading: isLoadingMessages,
  } = useQuery({
    queryKey: ["convo-messages", conversationId],
    enabled: conversationId !== "",
    queryFn: async () => {
      try {
        const resp = await axiosClient.get(`/convo-messages/${conversationId}`);
        return resp.data as MessagesType;
      } catch (error: any) {
        console.log(error.message);
      }
    },
  });

  return (
    <div className="relative flex flex-col md:p-4 min-h-[100dvh] bg-gray-100 dark:bg-black">
      <div className="flex flex-1 gap-4">
        <Sidebar />
        <Outlet />
        {pathname !== "/new" ? (
          <Messages
            messages={messages}
            isLoadingMessages={isLoadingMessages}
          />
        ) : (
          <New />
        )}
        <ConvoInformation conversation={messages} />
      </div>

      <BottomNavigation />
    </div>
  );
}
