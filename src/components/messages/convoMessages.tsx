import { MessagesType } from "@/layouts/mainLayout";
import { ConvoMessageAvatar } from "./convoMessageAvatar";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/providers/userProvider";
import { Fragment, RefObject, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { axiosClient } from "@/lib/axiosClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { noProfile } from "@/utils/noProfile";
import datetimeDifference from "datetime-difference";
import { QuickReactionSvg } from "@/utils/quickReactionSvg";
import { useSocketContext } from "@/providers/socketIoClientProvider";
import { ActiveIcon } from "@/utils/activeIcon";
import { IoPersonAdd } from "react-icons/io5";
import { HiPencil } from "react-icons/hi2";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { FaCheck } from "react-icons/fa";
import { X } from "lucide-react";
import { MyConversationsType } from "@/pages/chats";
import { UseAddPeople, useChangeGcName } from "@/lib/zustand";
import { formatFirstChatTime } from "@/utils/formatFirstChatTime";

interface ConvoMessageProps {
  messages: MessagesType | undefined;
};

interface MessagesRowProps {
  conversation: MessagesType | undefined;
  message: {
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
  },
  index: number;
  scrollRef?: RefObject<HTMLDivElement>
};

interface Peoples {
  id: string;
  username: string;
  email: string;
  profile: string;
}

export function ConvoMessages({ messages }: ConvoMessageProps) {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('c') || "";
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useUserContext();
  const { isChangeName, setIsChangeName } = useChangeGcName();
  const { isAddPeople, setIsAddPeople } = UseAddPeople();
  const [newGcName, setNewGcName] = useState('');
  const [searchPeople, setSearchPeople] = useState('')
  const [selectedPeoples, setSelectedPeoples] = useState<Peoples[]>([]);
  const [isBottom, setIsBottom] = useState(false);
  const queryClient = useQueryClient();
  const { socket } = useSocketContext();
  const [isLoading, setIsLoading] = useState(false);
  const isInGroupChat = messages?.userIds?.includes(user?.id);

  // scroll to bottom when conversationId changes
  useEffect(() => {
    if (scrollRef.current) {
      const ref = scrollRef.current;
      ref.scrollTop = ref.scrollHeight;
    };
  }, [conversationId]);

  // scroll to bottom only in me if i send a message
  useEffect(() => {
    if (scrollRef.current) {
      const ref = scrollRef.current;
      const isLatestMessageMine = messages?.messages?.[messages?.messages?.length - 1]?.userId === user.id;

      if (isBottom) {
        ref.scrollTop = ref.scrollHeight;
      };

      if (isLatestMessageMine) {
        ref.scrollTop = ref.scrollHeight;
      };
    }
  }, [messages?.messages, isBottom, user.id]);

  const handleChangeGcName = async () => {
    try {
      setIsLoading(true)
      const resp = await axiosClient.put('/change-gc-name', {
        conversationId,
        newName: newGcName
      });
      const data = resp.data;
      if (data) {
        setIsChangeName(false);
        toast.success("Change chat name successfully");
        socket.current?.emit("chat", data);
        queryClient.setQueryData(['my-conversations', user.id], (old: MyConversationsType[]) => (
          old.map((oldConvo) => oldConvo.id === data.id ? data : oldConvo)
        ));
        queryClient.setQueryData(['convo-messages', data.id], data);
      };
      return resp.data;
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const { data: peoples } = useQuery({
    queryKey: ['search-people-to-add', searchPeople, messages?.userIds],
    queryFn: async () => {
      try {
        const resp = await axiosClient.post('search-people-to-add', {
          alreadyAdded: messages?.userIds,
          searchPeople,
        });
        return resp.data as Peoples[];
      } catch (error: any) {
        console.log(error.message);
      }
    }
  });

  const handleSelectPeople = (people: Peoples) => {
    setSelectedPeoples(prev => prev.some((item) => item.id === people.id) ? prev.filter((item) => item.id !== people.id) : [...prev, people]);
  };

  const handleAddPeople = async () => {
    const peopleIds = selectedPeoples.map((people) => people.id);
    setIsLoading(true)
    try {
      const resp = await axiosClient.put('/add-people-in-group-chat', {
        conversationId,
        peopleIds,
      });
      const data = resp.data;
      if (data) {
        setSearchPeople('');
        setSelectedPeoples([]);
        setIsAddPeople(false);
        toast.success("Added successfully!");
        socket.current?.emit("chat", data);
        queryClient.setQueryData(['my-conversations', user.id], (old: MyConversationsType[]) => (
          old.map((oldConvo) => oldConvo.id === data.id ? data : oldConvo)
        ));
        queryClient.setQueryData(['convo-messages', data.id], data);
      };
      return resp.data;
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // check if is in bottom of message container
  useEffect(() => {
    if (!scrollRef?.current) return;
    const ref = scrollRef.current

    const clientHeight = ref.clientHeight;
    const scrollHeight = ref.scrollHeight;

    if (scrollHeight <= clientHeight) {
      setIsBottom(scrollHeight <= clientHeight);
    };

    const handleScroll = () => {
      const clientHeight = ref.clientHeight;
      const scrollTop = ref.scrollTop;
      const scrollHeight = ref.scrollHeight;
      setIsBottom((clientHeight + scrollTop) > (scrollHeight - 5));
    };

    ref.addEventListener('scroll', handleScroll);
    return () => ref.removeEventListener('scroll', handleScroll)
  }, [conversationId]);

  // api to seen a not seen messages
  useEffect(() => {
    (async () => {
      if (isBottom && messages?.messages?.length) {
        try {
          const resp = await axiosClient.put('/seen-message', { conversationId });
          const data = resp.data;
          socket.current?.emit("seen-message", data);
          queryClient.setQueryData(['my-conversations', user.id], (old: MyConversationsType[]) => (
            old.map((c) => c.id === data.id ? data : c)
          ));
          queryClient.setQueryData(['convo-messages', data.id], data)
          return data;
        } catch (error: any) {
          console.log(error.message);
        }
      }
    })()
  }, [isBottom, queryClient, messages?.messages?.length, conversationId, user.id]);

  // realtime update seen message using socket io
  useEffect(() => {
    socket.current?.on('seen-message', (data) => {
      queryClient.setQueryData(['my-conversations', user.id], (old: MyConversationsType[]) => (
        old.map((c) => c.id === data.id ? data : c)
      ));
      queryClient.setQueryData(['convo-messages', data.id], data)
    });
  }, [queryClient, user.id]);

  return (
    <div ref={scrollRef} className="absolute inset-0 overflow-auto">
      <ConvoMessageAvatar messages={messages} />

      {messages?.isGroupChat && isInGroupChat && (
        <div className="flex items-center justify-center gap-10 mt-5">
          <div className="flex flex-col items-center">
            <Dialog open={isAddPeople} onOpenChange={(open) => setIsAddPeople(open)}>
              <div className="flex flex-col items-center">
                <button onClick={() => setIsAddPeople(true)} className="p-2 rounded-full bg-[#e3e3e3] dark:bg-[#3b3a3a]">
                  <IoPersonAdd size={20} />
                </button>
                <p className="text-sm">Add</p>
              </div>
              <DialogContent autoFocus={false} className="flex flex-col max-h-[35rem] mt-6 h-full bg-card">
                <DialogHeader className="">
                  <DialogTitle className="text-center">Add people</DialogTitle>
                  <DialogDescription hidden></DialogDescription>
                </DialogHeader>
                <div className="flex flex-col mt-4 flex-1">
                  <Input
                    type="text"
                    onChange={(e) => setSearchPeople(e.target.value)}
                    value={searchPeople}
                    placeholder="Search"
                    className="h-10 focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-[#373737] bg-[#f1f1f1]"
                  />
                  <div className="flex mt-5 h-24 text-xs">
                    {!selectedPeoples.length ? (
                      <p className="flex items-center justify-center text-muted-foreground w-full h-full">No users selected</p>
                    ) : (
                      selectedPeoples?.map((people) => (
                        <div key={people.id} className="flex flex-col gap-1 items-center w-20">
                          <div className="relative shrink-0">
                            <img
                              src={people.profile || noProfile()}
                              alt="Profile"
                              className="w-10 h-10 rounded-full"
                            />
                            <button
                              onClick={() => setSelectedPeoples(prev => prev.filter((p) => p.id !== people.id))} className="absolute -right-1 -top-1 p-[.2rem] rounded-full bg-[#e3e3e3] dark:bg-[#3b3a3a] text-muted-foreground"
                            >
                              <X size={13} />
                            </button>
                          </div>
                          <p
                            className="line-clamp-2 text-center text-muted-foreground font-semibold"
                          >
                            {people.username}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex flex-col flex-1 cursor-pointer overflow-auto max-h-[15.5rem]">
                    {peoples?.map((people) => (
                      <div
                        onClick={() => handleSelectPeople(people)}
                        key={people.id}
                        className="flex items-center justify-between p-2 hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <div className="shrink-0">
                            <img
                              src={people.profile || noProfile()}
                              alt="Profile"
                              className="w-9 h-9 rounded-full"
                            />
                          </div>
                          <p>{people.username}</p>
                        </div>

                        <span className="relative w-6 h-6 rounded-full border-2">
                          {selectedPeoples.some((p) => p.id === people.id) && (
                            <span className="flex items-center justify-center absolute inset-0 rounded-full bg-blue-600">
                              <FaCheck className="text-white" size={10} />
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="shrink-0 mt-5">
                    <Button
                      disabled={!peoples?.length || !selectedPeoples.length || isLoading}
                      onClick={handleAddPeople}
                      className="w-full text-white bg-blue-600 hover:bg-blue-600/70"
                    >
                      Add people
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col items-center">
            <Dialog open={isChangeName} onOpenChange={(open) => setIsChangeName(open)}>
              <div className="flex flex-col items-center">
                <button onClick={() => setIsChangeName(true)} className="p-2 rounded-full bg-[#e3e3e3] dark:bg-[#3b3a3a]">
                  <HiPencil size={20} />
                </button>
                <p className="text-sm">Name</p>
              </div>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-center">Change chat name</DialogTitle>
                  <DialogDescription hidden={true}></DialogDescription>
                </DialogHeader>
                <div>
                  <p className="text-sm mb-2">
                    Changing the name of a group chat changes it for everyone.
                  </p>
                  <Input
                    type="text"
                    onChange={(e) => setNewGcName(e.target.value)}
                    maxLength={500}
                    className="h-12 focus-visible:ring-2 mb-5"
                    placeholder="Chat name"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsChangeName(false)}
                      className="w-full text-bg-[#e3e3e3] dark:bg-[#3b3a3a]"
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={!newGcName || isLoading}
                      onClick={handleChangeGcName}
                      className="w-full text-white bg-blue-600 hover:bg-blue-600/70"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      <div className="space-y-0.5 mt-10 px-4 pt-4 pb-2">
        {messages?.messages
          ?.filter((m) => !m.deletedByIds.includes(user.id))
          ?.map((message, index) => (
            <MessagesRow
              key={message.id}
              conversation={messages}
              message={message}
              index={index}
              scrollRef={scrollRef} />
          ))}
      </div>
    </div>
  )
}

export function MessagesRow({ conversation, message, index }: MessagesRowProps) {
  const { activeUser } = useSocketContext()
  const { user } = useUserContext();
  const messages = conversation?.messages?.filter((m) => !m.deletedByIds.includes(user.id));
  const isActive = activeUser.some((user) => user.userId === message.user.id);

  const messageBeforeMyMessage = messages?.[index - 1];
  const messageAfterMyMessage = messages?.[index + 1];

  const isPreviousMessageMyMessage = messageBeforeMyMessage?.userId === message.userId;
  const isNextMessageMyMessage = messageAfterMyMessage?.userId === message.userId;
  const isMyMessage = user.id === message.userId;

  const replyDateTime = useMemo(() => {
    if (messageAfterMyMessage?.createdAt && message?.createdAt) {
      const userLastMessageTime = new Date(messageAfterMyMessage.createdAt);
      const myFirstMessageTime = new Date(message.createdAt)
      const timeDifferenceInMinutes = datetimeDifference(userLastMessageTime, myFirstMessageTime);

      const dateNow = new Date();
      const allMessagesDate = new Date(messageAfterMyMessage.createdAt);
      const result = datetimeDifference(allMessagesDate, dateNow);

      if (timeDifferenceInMinutes.minutes > 3) {
        if (result.years > 0) {
          const date = new Date(messageAfterMyMessage.createdAt).toLocaleDateString('en-US');
          const time = new Date(messageAfterMyMessage.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });

          return `${date}, ${time}`;
        };

        if (result.months >= 0 && result.days > 6) {
          return new Date(messageAfterMyMessage?.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' });
        };

        if (result.months === 0 && result.days > 0) {
          const day = new Date(messageAfterMyMessage.createdAt).toLocaleDateString('en-US', { weekday: 'short' })
          const time = new Date(messageAfterMyMessage.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });

          return `${day} ${time}`;
        };

        return new Date(messageAfterMyMessage.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
      };
    };
  }, [messageAfterMyMessage?.createdAt, message?.createdAt]);

  const lastChatTimeDifferenceInMinutes = useMemo(() => {
    if (messageAfterMyMessage) {
      const currentMessagesDate = new Date(message.createdAt);
      const nextToCurrentMessageDate = new Date(messageAfterMyMessage.createdAt);
      const result = datetimeDifference(currentMessagesDate, nextToCurrentMessageDate);

      if (result.minutes > 3) return true;
      return false;
    };
  }, [message, messageAfterMyMessage]);

  const firstChatTimeDifferenceInMinutes = useMemo(() => {
    if (messageBeforeMyMessage) {
      const previousToCurrentMessageDate = new Date(messageBeforeMyMessage.createdAt);
      const currentMessagesDate = new Date(message.createdAt);
      const result = datetimeDifference(currentMessagesDate, previousToCurrentMessageDate);

      if (result.minutes > 3) return true;
      return false;
    };
  }, [message, messageBeforeMyMessage]);

  return (
    <div>
      {index === 0 && (
        <p className="text-sm text-center p-4 font-semibold">
          {formatFirstChatTime(message.createdAt)}
        </p>
      )}

      <div
        className={cn("flex items-end gap-2",
          user.id === message.userId ? "justify-end" : "justify-start",
          messageAfterMyMessage && !isNextMessageMyMessage && isMyMessage && !replyDateTime && 'mb-4',
          messageAfterMyMessage && !isNextMessageMyMessage && !isMyMessage && !replyDateTime && 'mb-4',
        )}
      >
        {/** Avatar */}
        {!isMyMessage && (
          <div className="relative shrink-0">
            <img
              src={message.user.profile || noProfile()}
              alt="Profile"
              className={cn("rounded-full w-7 h-7 object-cover",
                !isNextMessageMyMessage ? 'visible' : 'invisible')}
            />
            {!isNextMessageMyMessage && isActive && (
              <ActiveIcon style="right-0 w-[.6rem] h-[.6rem]" />
            )}
          </div>
        )}

        <div className={cn("flex flex-col items-end flex-1 gap-1",
          !isMyMessage && 'flex-row justify-between',
        )}>
          <div
            className={cn("flex flex-col items-end gap-1 max-w-[28rem]",
              !isMyMessage && 'items-start',
              isMyMessage ? 'ml-24' : 'mr-24',
            )}
          >
            {conversation?.isGroupChat && !isMyMessage && !isPreviousMessageMyMessage && (
              <p className="text-xs ml-2 font-semibold">{message.user.username}</p>
            )}
            {message?.text && (
              <p
                className={cn("whitespace-pre-wrap break-words break-all px-3.5 py-2",
                  isMyMessage ? 'bg-blue-600 text-white rounded-r rounded-l-[20px]' : 'bg-[#e3e3e3] dark:bg-[#3b3a3a] rounded-l rounded-r-[20px]',
                  isMyMessage ? 'ml-29' : '',
                  // rounded bottom
                  (firstChatTimeDifferenceInMinutes || !isPreviousMessageMyMessage || !!messageBeforeMyMessage?.quickReaction?.length) && (isMyMessage && 'rounded-[20px] rounded-br' || !isMyMessage && 'rounded-[20px] rounded-bl'),
                  // rounded top  
                  (lastChatTimeDifferenceInMinutes || !isNextMessageMyMessage || !!messageAfterMyMessage?.quickReaction.length) && (isMyMessage && 'rounded-[20px] rounded-tr' || !isMyMessage && 'rounded-[20px] rounded-tl'),
                  // rounded 20px
                  (!messageBeforeMyMessage || !isPreviousMessageMyMessage || messageBeforeMyMessage?.quickReaction?.length || firstChatTimeDifferenceInMinutes) && (!messageAfterMyMessage || !isNextMessageMyMessage || messageAfterMyMessage?.quickReaction?.length || lastChatTimeDifferenceInMinutes) && (isMyMessage && 'rounded-[20px]' || !isMyMessage && 'rounded-[20px]'),
                )}
              >
                {message.text}
              </p>
            )}
            {message?.gif && (
              <img
                src={message.gif}
                loading="eager"
                alt="GIF"
                className={cn("rounded-l rounded-r-[20px]",
                  isMyMessage && 'rounded-r rounded-l-[20px]',
                  //
                  (firstChatTimeDifferenceInMinutes || !isPreviousMessageMyMessage || !!messageBeforeMyMessage?.quickReaction?.length) && (isMyMessage && 'rounded-[20px] rounded-br' || !isMyMessage && 'rounded-[20px] rounded-bl'),
                  //
                  (lastChatTimeDifferenceInMinutes || !isNextMessageMyMessage || !!messageAfterMyMessage?.quickReaction.length) && (isMyMessage && 'rounded-[20px] rounded-tr' || !isMyMessage && 'rounded-[20px] rounded-tl'),
                  // 
                  (!messageBeforeMyMessage || !isPreviousMessageMyMessage || messageBeforeMyMessage?.quickReaction?.length || firstChatTimeDifferenceInMinutes) && (!messageAfterMyMessage || !isNextMessageMyMessage || messageAfterMyMessage?.quickReaction?.length || lastChatTimeDifferenceInMinutes) && (isMyMessage && 'rounded-[20px]' || !isMyMessage && 'rounded-[20px]'),
                )}
              />
            )}
            {message?.file && (
              <img
                src={message.file}
                loading="eager"
                alt="File"
                className={cn("rounded-l rounded-r-[20px]",
                  isMyMessage && 'rounded-r rounded-l-[20px]',
                  // rounded bottom
                  (firstChatTimeDifferenceInMinutes || !isPreviousMessageMyMessage || !!messageBeforeMyMessage?.quickReaction?.length) && (isMyMessage && 'rounded-[20px] rounded-br' || !isMyMessage && 'rounded-[20px] rounded-bl'),
                  // rounded top  
                  (lastChatTimeDifferenceInMinutes || !isNextMessageMyMessage || !!messageAfterMyMessage?.quickReaction.length) && (isMyMessage && 'rounded-[20px] rounded-tr' || !isMyMessage && 'rounded-[20px] rounded-tl'),
                  // rounded 20px
                  (!messageBeforeMyMessage || !isPreviousMessageMyMessage || messageBeforeMyMessage?.quickReaction?.length || firstChatTimeDifferenceInMinutes) && (!messageAfterMyMessage || !isNextMessageMyMessage || messageAfterMyMessage?.quickReaction?.length || lastChatTimeDifferenceInMinutes) && (isMyMessage && 'rounded-[20px]' || !isMyMessage && 'rounded-[20px]'),
                )}
              />
            )}
            {!!message.quickReaction.length && (
              <div className={cn("my-3", !messageAfterMyMessage && 'mb-0')}>
                <QuickReactionSvg quickReactionSize={message.quickReaction[1]} />
              </div>
            )}
          </div>

          {/** Profile of user that seen the message */}
          {message?.seenByIds?.some((id) => !messageAfterMyMessage?.seenByIds.includes(id)) && (
            <div className="flex items-center gap-1">
              {message.seenBy.filter((u) => u.id !== user.id && !messageAfterMyMessage?.seenByIds.includes(u.id))?.map((user) => (
                <Fragment key={user.id}>
                  <img
                    src={user.profile || noProfile()}
                    alt="profile"
                    className="rounded-full w-3 h-3 object-cover"
                  />
                  {/* <small>{user.username}</small> */}
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {!!message?.notif?.length && (
        <div className="flex flex-col justify-center my-5 gap-4">
          {message?.notif?.map((notif) => (
            <Fragment key={notif.id}>
              {!notif?.userIds?.length && (
                <p className="text-xs text-center text-muted-foreground">
                  {notif?.user?.id === user?.id ? 'You' : notif?.user?.username} {notif?.notifMessage}
                </p>
              )}

              {!!notif?.userIds?.length && (
                <p className="text-xs text-center text-muted-foreground">
                  {notif?.user?.id === user.id ? 'You' : notif.user.username} added {' '}
                  {notif?.users?.length === 1 && `${notif.users.slice(0, 1).map((u) => u.id === user.id ? 'You' : u.username)} to the group`}
                  {notif?.users?.length === 2 && `${notif.users.slice(0, 2).map((u) => u.id === user.id ? 'You' : u.username).join(" and ")} to the group`}
                  {notif?.users?.length > 2 && `${notif.users.slice(0, 1).map((u) => u.id === user.id ? 'You' : u.username)} and ${notif.users.length} others`}
                </p>
              )}
            </Fragment>
          ))}
        </div>
      )}

      {replyDateTime && (
        <p className="text-sm text-center p-4 font-semibold">{replyDateTime}</p>
      )}
    </div >
  )
}