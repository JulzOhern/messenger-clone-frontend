import { cn } from "@/lib/utils";
import { MyConversationsType } from "@/pages/chats"
import { useUserContext } from "@/providers/userProvider";
import { noProfile } from "@/utils/noProfile";
import { BsThreeDots } from "react-icons/bs";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect, useState } from "react";
import { BsFillArchiveFill } from "react-icons/bs";
import { AiFillDelete } from "react-icons/ai";
import { HiMiniArrowRightOnRectangle } from "react-icons/hi2";
import { axiosClient } from "@/lib/axiosClient";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ActiveIcon } from "@/utils/activeIcon";
import { useSocketContext } from "@/providers/socketIoClientProvider";

interface ConvoProp {
  convo: MyConversationsType;
  isArchivePage?: boolean;
};

export function Convo({ convo, isArchivePage = false }: ConvoProp) {
  const { activeUser, socket } = useSocketContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const c = searchParams.get("c");
  const { user } = useUserContext();
  const isSelf = convo?.userIds?.every((id) => id === user.id);
  const latestMessage = convo?.messages?.[convo.messages.length - 1];
  const otherProfile = convo?.users?.filter(u => u.id !== user.id);
  const isActive = otherProfile?.some((u) => activeUser.some((active) => active.userId === u.id));

  const userInfo = () => {
    switch (isSelf) {
      case true:
        return convo.users.find((u) => u.id === user.id);
      default:
        return convo.users.find(u => u.id !== user.id);
    }
  };

  const usernameOfLastChatGc = () => {
    const isMe = convo.messages?.[convo.messages.length - 1]?.userId === user.id;
    const username = convo.messages?.[convo.messages?.length - 1]?.user?.username
    const text = latestMessage?.text && latestMessage.text;
    const gif = latestMessage?.gif && "sent a GIF";
    const file = !!latestMessage?.file && 'sent a file';
    const quickReaction = latestMessage?.quickReaction.length > 0 && '👍';
    const isNotif = latestMessage?.notif?.length > 0;
    const notif = latestMessage?.notif?.[latestMessage?.notif?.length - 1];

    if (isNotif) {
      if (!notif?.userIds?.length) {
        return `${notif?.user?.id === user.id ? 'You' : notif?.user?.username} ${notif?.notifMessage}`
      } else {
        return (
          <>
            {notif?.user?.id === user.id ? 'You' : notif.user.username} added {' '}
            {notif?.users?.length === 1 && `${notif.users.slice(0, 1).map((u) => u.id === user.id ? 'You' : u.username)} to the group`}
            {notif?.users?.length === 2 && `${notif.users.slice(0, 2).map((u) => u.id === user.id ? 'You' : u.username).join(" and ")} to the group`}
            {notif?.users?.length > 2 && `${notif.users.slice(0, 1).map((u) => u.id === user.id ? 'You' : u.username)} and ${notif.users.length} others`}
          </>
        )
      }
    }

    // one to one chat
    if (!convo.isGroupChat) {
      if (isMe) return `You: ${text || gif || quickReaction || file}`
      return text || gif || quickReaction || file
    };

    // group chat
    if (convo.isGroupChat) {
      if (isMe) return `You: ${text || gif || quickReaction || file}`
      return `${username}: ${text || gif || quickReaction || file}`
    };
  };

  const handleArchiveConvo = async () => {
    switch (isArchivePage) {
      case false:
        queryClient.setQueryData(['my-conversations', user.id], (old: MyConversationsType[]) => (
          old.filter((oldC) => oldC.id !== convo.id)
        ));
        break;
      case true:
        queryClient.setQueryData(['my-archive'], (old: MyConversationsType[]) => (
          old.filter((oldC) => oldC.id !== convo.id)
        ));
        break;
    }

    try {
      const response = await axiosClient.put("/archive-convo", {
        conversationId: convo.id
      });
      toast.success(isArchivePage ? "Unarchive Successfully" : "Archive Successfully");
      return response.data;
    } catch (error: any) {
      console.log(error.message)
    };
  };

  const handleDeleteChat = async () => {
    try {
      const response = await axiosClient.put('/delete-chat', {
        conversationId: convo.id
      });
      /* console.log(response.data); */
      queryClient.invalidateQueries({ queryKey: ['my-conversations'] })
      navigate('/');
      return response.data;
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const handleLeaveGroupChat = async () => {
    try {
      const response = await axiosClient.put('/leave-group-chat', { conversationId: convo.id });
      const data = response.data;
      socket.current?.emit("leave-gc", { data, userId: user?.id });
      queryClient.setQueryData(['convo-messages', data.id], data);
      queryClient.setQueryData(['my-conversations', user.id], (old: MyConversationsType[]) => (
        old.filter((c) => c.id !== data.id)
      ));
      return data;
    } catch (error: any) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    socket.current?.on('leave-gc', ({ data, userId }) => {
      queryClient.setQueryData(['convo-messages', data.id], data);
      queryClient.setQueryData(['my-conversations', userId], (old: MyConversationsType[]) => (
        old.filter((c) => c.id !== data.id)
      ));
    });
  }, [queryClient]);

  return (
    <div className="relative group">
      <Popover open={isOpenMenu} onOpenChange={setIsOpenMenu}>
        <PopoverTrigger className={cn("flex absolute right-10 inset-y-[24.2%] border dark:border-[#3b3a3a] border-[#e3e3e3] bg-primary-foreground p-2 rounded-full group-hover:visible invisible z-[10]",
          isOpenMenu && 'visible')}
        >
          <BsThreeDots />
        </PopoverTrigger>
        <PopoverContent className="flex flex-col p-1 rounded-lg" align="end">
          <button onClick={handleArchiveConvo} className="flex items-center gap-4 w-full text-start p-2 hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] rounded-lg">
            <span className="flex items-center justify-center w-5 h-5">
              <BsFillArchiveFill size={16} />
            </span>
            {convo.archiveByIds.includes(user.id) ? 'Unarchive Chat' : 'Archive Chat'}
          </button>
          <button onClick={handleDeleteChat} className="flex items-center gap-4 w-full text-start p-2 hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] rounded-lg">
            <span className="flex items-center justify-center w-5 h-5">
              <AiFillDelete size={20} />
            </span>
            Delete Chat
          </button>
          {convo.isGroupChat && (
            <button onClick={handleLeaveGroupChat} className="flex items-center gap-4 w-full text-start p-2 hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] rounded-lg text-red-500">
              <span className="flex items-center justify-center w-5 h-5">
                <HiMiniArrowRightOnRectangle size={20} />
              </span>
              Leave Group
            </button>
          )}
        </PopoverContent>
      </Popover>

      <Link to={isArchivePage ? `/archived?c=${convo.id}` : `/?c=${convo.id}`}>
        <div
          className={cn("flex items-center gap-2 px-3 h-16 hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] rounded-md",
            c === convo.id && 'bg-[#e3e3e3] dark:bg-[#3b3a3a]')}
        >
          {!convo.isGroupChat ? (
            <div className="relative shrink-0">
              <img
                src={isSelf ? convo.users?.[0]?.profile || noProfile() : otherProfile?.[0]?.profile || noProfile()}
                alt="profile"
                className="rounded-full w-12 h-12 shrink-0 object-cover"
              />
              {isActive && <ActiveIcon />}
            </div>
          ) : (
            <div className="relative flex shrink-0">
              {convo.gcProfile ? (
                <img
                  src={convo.gcProfile}
                  alt="profile"
                  className="rounded-full w-12 h-12 shrink-0 object-cover"
                />
              ) : (
                <>
                  <img
                    src={otherProfile?.[0]?.profile || noProfile()}
                    alt="profile"
                    className="rounded-full mt-3 -mr-4 w-8 h-8 relative z-[10] object-cover"
                  />
                  <img
                    src={otherProfile?.[1]?.profile || noProfile()}
                    alt="profile"
                    className="rounded-full w-8 h-8 object-cover"
                  />
                </>
              )}
              {isActive && <ActiveIcon />}
            </div>
          )}

          <div className="flex flex-col truncate flex-1">
            <p className="font-semibold truncate">
              {convo.isGroupChat ? (
                !convo.gcName ? (
                  convo.users.filter(u => u.id !== user.id).map((u) => u.username).join(", ")
                ) : convo.gcName
              ) : (
                userInfo()?.username
              )}
            </p>

            <div className="relative flex flex-1 justify-between">
              <p
                className={cn("truncate text-muted-foreground text-sm w-[0] flex-1",
                  !latestMessage?.seenByIds?.includes(user.id) && 'font-bold text-primary',
                )}
              >
                {usernameOfLastChatGc()}
              </p>

              <div className="flex items-center gap-1">
                {latestMessage?.seenBy?.slice(0, 4)?.filter(s => s.id !== user.id)?.map((s) => (
                  <Fragment key={s.id}>
                    <img
                      src={s.profile || noProfile()}
                      alt="Profile"
                      className="w-3 h-3 rounded-full object-fill shrink-0"
                    />
                    {/* <small>{s.username}</small> */}
                  </Fragment>
                ))}
                {!!latestMessage?.seenBy?.slice(4)?.filter(s => s.id !== user.id).length && (
                  <span className="text-[10px]">+{latestMessage?.seenBy?.slice(4)?.filter(s => s.id !== user.id).length}</span>
                )}
              </div>
            </div>
          </div>

          {!latestMessage?.seenByIds?.includes(user.id) && (
            <span className="absolute right-5 w-3 h-3 rounded-full bg-blue-600" />
          )}
        </div>
      </Link>
    </div>
  )
}
