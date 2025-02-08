import { MessagesType } from "@/layouts/mainLayout";
import { useSocketContext } from "@/providers/socketIoClientProvider";
import { useUserContext } from "@/providers/userProvider";
import { ActiveIcon } from "@/utils/activeIcon";
import { noProfile } from "@/utils/noProfile";

interface ConvoMessageAvatarProps {
  messages: MessagesType | undefined;
}

export function ConvoMessageAvatar({ messages }: ConvoMessageAvatarProps) {
  const { activeUser } = useSocketContext();
  const { user } = useUserContext();
  const isSelf = messages?.userIds?.every(id => id === user.id);
  const otherProfile = messages?.users?.filter(u => u.id !== user.id);
  const isActive = otherProfile?.some((user) => activeUser.some((u) => u.userId === user.id));

  return (
    <div className="flex justify-center mt-10">
      {!messages?.isGroupChat ? (
        <div className="flex flex-col items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={isSelf ? messages?.users?.[0]?.profile || noProfile() : otherProfile?.[0]?.profile || noProfile()}
              alt="Profile"
              className="rounded-full w-16 h-16 object-cover"
            />
            {isActive && <ActiveIcon style="right-[.3rem] w-[.95rem] h-[.95rem]" />}
          </div>

          <div className="flex flex-col items-center">
            <p className="text-lg font-semibold">{isSelf ? messages?.users?.find(u => u.id === user.id)?.username : messages?.users?.find(u => u.id !== user.id)?.username}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex shrink-0">
            {messages.gcProfile ? (
              <img
                src={messages?.gcProfile}
                alt="Profile"
                className="rounded-full w-16 h-16 object-cover"
              />
            ) : (
              <>
                <img
                  src={otherProfile?.[0]?.profile || noProfile()}
                  alt="Profile"
                  className="rounded-full mt-3 -mr-4 w-12 h-12 relative z-[10] object-cover"
                />
                <img
                  src={otherProfile?.[1]?.profile || noProfile()}
                  alt="Profile"
                  className="rounded-full w-12 h-12 object-cover"
                />
              </>
            )}
            {isActive && <ActiveIcon style="right-[.3rem] w-[.95rem] h-[.95rem]" />}
          </div>

          <div className="flex flex-col items-center">
            <p className="text-lg font-semibold">
              {!messages?.gcName ? (
                messages?.users?.slice(0, 4)?.filter(u => u.id !== user.id)?.map((u) => u.username).join(", ")
              ) : (
                messages?.gcName
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
