import { Convo } from "@/components/chats/convo";
import { SearchResults } from "@/components/chats/searchResults";
import { axiosClient } from "@/lib/axiosClient";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/providers/userProvider";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { HiPencil } from "react-icons/hi2";
import { IoSearch, IoArrowBack } from "react-icons/io5";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";

export interface SearchResultMessengerType {
  id: string;
  username: string;
  email: string;
  profile: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface MyConversationsType {
  id: string;
  isGroupChat: boolean;
  archiveByIds: string[];
  gcName: string;
  gcProfile: string;
  createdAt: Date;
  updatedAt: Date;
  userIds: string[];
  messages: {
    id: string;
    text: string;
    gif: string;
    userId: string;
    conversationId: string;
    seenByIds: string[];
    file: string;
    quickReaction: string[];
    deletedByIds: string[];
    notif: {
      id: string
      messageId: string
      userId: string
      notifMessage: string
      userIds: string[];
      user: {
        id: string;
        username: string;
        email: string;
        profile: string;
        createdAt: Date;
        updatedAt: Date;
      }
      users: {
        id: string;
        username: string;
        email: string;
        profile: string;
        createdAt: Date;
        updatedAt: Date;
      }[]
      createdAt: Date
      updatedAt: Date
    }[];
    seenBy: {
      id: string;
      username: string;
      email: string;
      profile?: string;
      createdAt: Date;
      updatedAt: Date;
    }[]
    user: {
      id: string;
      username: string;
      email: string;
      profile?: string;
      createdAt: Date;
      updatedAt: Date;
    }
    createdAt: Date;
    updatedAt: Date;
  }[];
  users: {
    id: string;
    username: string;
    email: string;
    profile: string;
    createdAt: Date;
    updatedAt: Date;
  }[]
};

export function Chats() {
  const { user } = useUserContext();
  const [isSearchActive, setSearchActive] = useState(false);
  const [inputValue, setInputValue] = useState("")
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("c");
  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!searchContainerRef.current?.contains(e.target as Node)) {
        setSearchActive(false);
        setInputValue("");
      }
    }

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    }
  }, []);

  const searchResults = useQuery({
    queryKey: ['search-messenger', inputValue],
    enabled: inputValue !== "",
    queryFn: async () => {
      try {
        const response = await axiosClient.get(`/search-messenger?search=${inputValue || ""}`);
        return response.data as SearchResultMessengerType[];
      } catch (error) {
        console.log(error);
      }
    }
  });

  const myConvo = useQuery({
    queryKey: ['my-conversations', user.id],
    enabled: !!user.id,
    queryFn: async () => {
      try {
        const response = await axiosClient.get(`/my-conversations`);
        return response.data as MyConversationsType[];
      } catch (error: any) {
        console.log(error.message);
      }
    }
  });

  const notArchiveConvos = myConvo.data?.filter((convo) => !convo.archiveByIds.includes(user.id));

  useEffect(() => {
    if (myConvo.data?.length && !conversationId && pathname === '/') {
      const firstConvoId = myConvo.data[0].id;
      navigate("/?c=" + firstConvoId);
    };
  }, [myConvo.data?.length, conversationId, pathname]);

  return (
    <div className="flex flex-col bg-card rounded-xl flex-1 max-w-[26rem] shadow-sm">
      <div className="flex flex-col gap-3 px-4 pt-2">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Chats</h1>

          <Link to='/new' className="p-[.6rem] rounded-full bg-[#e3e3e3] dark:bg-[#3b3a3a]">
            <HiPencil />
          </Link>
        </div>

        <div ref={searchContainerRef} className={cn("flex items-center gap-1 py pb-3", !isSearchActive && 'border-b dark:border-[#3b3a3a] border-[#e3e3e3]')}>
          {isSearchActive && <button onClick={() => setSearchActive(false)} className="hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] p-2 rounded-full">
            <IoArrowBack size={22} />
          </button>}
          <div onClick={() => setSearchActive(true)} className="flex items-center gap-1 rounded-full py-[.36rem] px-3 dark:bg-[#373737] bg-[#f1f1f1] flex-1">
            <IoSearch size={23} className="text-muted-foreground" />
            <input onChange={(e) => setInputValue(e.target.value)} type="text" value={inputValue} className="w-full bg-inherit placeholder:text-muted-foreground placeholder:tracking-tight outline-none text-card-foreground" placeholder="Search Messenger" />
          </div>
        </div>
      </div>

      {isSearchActive ? (
        searchResults.data?.map((result) => (
          <SearchResults key={result.id} result={result} />
        ))
      ) : (
        !myConvo.data?.length ? (
          <div className="flex items-center justify-center flex-1 text-xl text-muted-foreground font-semibold">
            No chats
          </div>
        ) : (
          <div className="flex-1 relative overflow-auto w-full">
            <div className="absolute inset-0 mx-[.4rem]">
              {notArchiveConvos
                ?.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                ?.filter((c) => !c?.messages?.every((m) => m.deletedByIds.includes(user.id)))
                ?.map((convo) => (
                  <Convo convo={convo} key={convo.id} />
                ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}
