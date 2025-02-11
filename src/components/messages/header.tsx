import { MessagesType } from "@/layouts/mainLayout"
import { cn } from "@/lib/utils";
import { useOpenConvoInformation } from "@/lib/zustand";
import { useSocketContext } from "@/providers/socketIoClientProvider";
import { useUserContext } from "@/providers/userProvider";
import { ActiveIcon } from "@/utils/activeIcon";
import { CallSvg } from "@/utils/callSvg";
import { noProfile } from "@/utils/noProfile";
import { VideoCallSvg } from "@/utils/videoCallSvg";
import { BsThreeDots } from "react-icons/bs";
import { IoArrowBackOutline } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";

interface HeaderProps {
  messages: MessagesType | undefined
}

export default function Header({ messages }: HeaderProps) {
  const { activeUser } = useSocketContext();
  const { user } = useUserContext();
  const isSelf = messages?.userIds?.every(id => id === user.id);
  const otherProfile = messages?.users?.filter(u => u.id !== user.id);
  const isActive = otherProfile?.some((user) => activeUser.some((u) => u.userId === user.id));
  const { isOpen, setIsOpen } = useOpenConvoInformation();
  const [searchParams, setSearchParams] = useSearchParams()

  const onBackToChats = () => {
    searchParams.delete('c');
    setSearchParams(searchParams);
  };

  return (
    <div className="flex items-center justify-between p-[.3rem] shadow">
      <div className="flex items-center">
        <button
          onClick={onBackToChats}
          className="lg:hidden p-2 hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] text-violet-600 rounded-full"
        >
          <IoArrowBackOutline size={23} />
        </button>

        <div className="flex items-center gap-2 px-[.4rem] py-[.2rem] hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] rounded-md">
          {!messages?.isGroupChat ? (
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={isSelf ? messages?.users?.[0]?.profile || noProfile() : otherProfile?.[0]?.profile || noProfile()}
                  alt="Profile"
                  className="rounded-full w-9 h-9 object-cover"
                />
                {isActive && <ActiveIcon />}
              </div>

              <div>
                <p className="font-semibold">{isSelf ? messages?.users?.find(u => u.id === user.id)?.username : messages?.users?.find(u => u.id !== user.id)?.username}</p>
                <p className="text-sm text-muted-foreground">
                  {isActive ? 'Active now' : "Offline"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative flex shrink-0">
                {messages?.gcProfile ? (
                  <img
                    src={messages?.gcProfile}
                    alt="Profile"
                    className="rounded-full w-9 h-9 object-cover"
                  />
                ) : (
                  <>
                    <img
                      src={otherProfile?.[0]?.profile || noProfile()}
                      alt="Profile"
                      className="rounded-full mt-3 -mr-4 w-6 h-6 relative z-[10] object-cover"
                    />
                    <img
                      src={otherProfile?.[1]?.profile || noProfile()}
                      alt="Profile"
                      className="rounded-full w-6 h-6 object-cover"
                    />
                  </>
                )}
                {isActive && <ActiveIcon style="-right-1" />}
              </div>

              <div>
                <p
                  className="font-semibold"
                >
                  {!messages?.gcName ? (
                    messages?.users?.slice(0, 4)
                      ?.filter(u => u.id !== user.id)?.map((u) => u.username)?.join(", ")
                  ) : (
                    messages?.gcName
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isActive ? 'Active now' : "Offline"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 px-[.7rem]">
        {!isSelf && (
          <>
            <div className="flex items-center justify-center hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] h-9 w-9 rounded-full">
              <CallSvg />
            </div>

            <div className="flex items-center justify-center hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] h-9 w-9 rounded-full">
              <VideoCallSvg />
            </div>
          </>
        )}

        {messages?.isGroupChat && (
          <button
            onClick={() => setIsOpen(isOpen ? false : true)}
            className={cn("relative flex items-center justify-center hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] h-9 w-9 rounded-full", isOpen && 'after:absolute after:inset-[9px] after:bg-violet-600 after:rounded-full')}
          >
            <BsThreeDots
              className={cn("relative z-[1] text-xl text-violet-600", isOpen && 'text-black text-xs')}
            />
          </button>
        )}
      </div>
    </div>
  )
};