import { MessagesType } from "@/layouts/mainLayout";
import { cn } from "@/lib/utils";
import { UseAddPeople, useChangeGcName, useOpenConvoInformation } from "@/lib/zustand";
import { useSocketContext } from "@/providers/socketIoClientProvider";
import { useUserContext } from "@/providers/userProvider";
import { ActiveIcon } from "@/utils/activeIcon";
import { noProfile } from "@/utils/noProfile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HiMiniArrowRightOnRectangle, HiPencil } from "react-icons/hi2";
import { RiGalleryFill } from "react-icons/ri";
import { UploadButton } from "@/lib/uploadthing";
import { axiosClient } from "@/lib/axiosClient";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { BsThreeDots } from "react-icons/bs";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { MdAdminPanelSettings } from "react-icons/md";
import { HiUserRemove } from "react-icons/hi";
import { MyConversationsType } from "@/pages/chats";
import { IoPersonAdd } from "react-icons/io5";
import { useEffect } from "react";
import { IoArrowBackOutline } from "react-icons/io5";

type ConvoInformationType = {
  conversation: MessagesType | undefined;
};

export function ConvoInformation({ conversation }: ConvoInformationType) {
  const { socket } = useSocketContext();
  const { isOpen, setIsOpen } = useOpenConvoInformation();
  const { user } = useUserContext();
  const { activeUser } = useSocketContext();
  const { setIsChangeName } = useChangeGcName();
  const { setIsAddPeople } = UseAddPeople();
  const isGroupChat = conversation?.isGroupChat;
  const isSelf = conversation?.userIds.every((userId) => userId === user.id);
  const convoUsers = conversation?.users;
  const otherUsers = conversation?.users?.filter((cUser) => cUser.id !== user.id);
  const isActive = activeUser?.some((user) => otherUsers?.some((oUser) => oUser.id === user.userId));
  const queryClient = useQueryClient();
  const isAdmin = conversation?.userAdminIds.includes(user?.id);

  useEffect(() => {
    if (!conversation?.id) {
      setIsOpen(false);
    }
  }, [conversation?.id, setIsOpen]);

  const onMakeAdmin = async (userId: string) => {
    try {
      const response = await axiosClient.put("/make-admin", {
        conversationId: conversation?.id,
        userId,
      });
      const data = response.data;
      socket.current?.emit("chat", data);
      queryClient.invalidateQueries({ queryKey: ['my-conversations'] });
      queryClient.setQueryData(["convo-messages", conversation?.id], data);
      return data;
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const onRemoveMember = async (userId: string) => {
    try {
      const response = await axiosClient.put("/remove-member", {
        conversationId: conversation?.id,
        userId,
      });
      const data = response.data;
      socket.current?.emit("leave-gc", { data, userId });
      queryClient.setQueryData(['convo-messages', data.id], data);
      queryClient.setQueryData(['my-conversations', userId], (old: MyConversationsType[]) => (
        old.filter((c) => c.id !== data.id)
      ));
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const onLeaveGroup = async () => {
    const response = await axiosClient.put('/leave-group-chat', { conversationId: conversation?.id });
    const data = response.data;
    socket.current?.emit("leave-gc", { data, userId: user?.id });
    queryClient.setQueryData(['convo-messages', data.id], data);
    queryClient.setQueryData(['my-conversations', user.id], (old: MyConversationsType[]) => (
      old.filter((c) => c.id !== data.id)
    ));
    return data;
  };

  return (
    <div
      className={cn(
        "hidden relative xl:max-w-[19.5rem] flex-1",
        isOpen && "flex flex-col",
        !conversation?.isGroupChat && 'hidden'
      )}
    >
      <div className="absolute inset-0 bg-card md:rounded-xl flex-1 shadow-sm p-3 overflow-auto">
        <div className="relative flex flex-col">
          <button onClick={() => setIsOpen(false)}>
            <IoArrowBackOutline size={25} className="absolute left-2 top-2" />
          </button>

          <div className="flex justify-center">
            {!isGroupChat ? (
              <div className="relative">
                <img
                  src={
                    isSelf
                      ? convoUsers?.[0]?.profile || noProfile()
                      : convoUsers?.[0]?.profile || noProfile()
                  }
                  alt="Profile"
                  className="rounded-full w-20 h-20 object-cover"
                />
                {isActive && (
                  <ActiveIcon style="right-1 w-[.88rem] h-[.88rem]" />
                )}
              </div>
            ) : (
              <div className="relative flex shrink-0">
                {conversation?.gcProfile ? (
                  <img
                    src={conversation.gcProfile}
                    alt="Profile"
                    className="rounded-full w-20 h-20 object-cover"
                  />
                ) : (
                  <>
                    <img
                      src={convoUsers?.[0]?.profile || noProfile()}
                      alt="Profile"
                      className="rounded-full mt-6 -mr-7 w-14 h-14 relative z-[10] object-cover"
                    />
                    <img
                      src={convoUsers?.[1]?.profile || noProfile()}
                      alt="Profile"
                      className="rounded-full w-14 h-14 object-cover"
                    />
                  </>
                )}
                {isActive && (
                  <ActiveIcon style="right-1 w-[.88rem] h-[.88rem]" />
                )}
              </div>
            )}
          </div>

          <div>
            {!conversation?.gcName ? (
              <p className="text-center font-semibold mt-2 line-clamp-2 text-[1.1rem] leading-5">
                {otherUsers
                  ?.slice(0, 4)
                  .map((user) => user.username)
                  .join(", ")}
              </p>
            ) : (
              <p className="text-center font-semibold mt-2 text-[1.2rem] leading-5">
                {conversation?.gcName}
              </p>
            )}

            <p className="text-muted-foreground text-center text-[.8rem] font-semibold mt-1">
              {isActive ? "Active now" : "Offline"}
            </p>
          </div>
        </div>

        {isGroupChat && (
          <Accordion type="multiple" className="w-full mt-5">
            <AccordionItem value="customize-chat" className="border-none">
              <AccordionTrigger className="hover:no-underline hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] px-2 h-12 rounded-md text-base">
                Customize chat
              </AccordionTrigger>

              <AccordionContent
                onClick={() => setIsChangeName(true)}
                className="flex items-center gap-2 hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] px-2 py-0 h-12 rounded-md text-base cursor-pointer"
              >
                <span className="p-[.5rem] rounded-full bg-[#e3e3e3] dark:bg-[#2e2d2d]">
                  <HiPencil size={14} />
                </span>
                Change chat name
              </AccordionContent>

              <label>
                <UploadButton
                  endpoint="imageUploader"
                  className="hidden"
                  onClientUploadComplete={async (res) => {
                    const response = await axiosClient.put("/change-gc-profile", {
                      conversationId: conversation?.id,
                      photoUrl: res?.[0]?.url,
                    });
                    const data = response.data;
                    toast.dismiss();
                    toast.success("Uploaded successfully");
                    socket.current?.emit("chat", data);
                    queryClient.setQueryData(['convo-messages', data.id], data);
                    queryClient.setQueryData(['my-conversations', user.id], (old: MyConversationsType[]) => (
                      old.map((c) => c.id === data.id ? data : c)
                    ));
                    return data;
                  }}
                  onUploadBegin={() => toast.loading("Uploading...")}
                />
                <AccordionContent className="flex items-center gap-2 hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] px-2 py-0 h-12 rounded-md text-base cursor-pointer">
                  <span className="p-[.5rem] rounded-full bg-[#e3e3e3] dark:bg-[#2e2d2d]">
                    <RiGalleryFill size={14} />
                  </span>
                  Change photo
                </AccordionContent>
              </label>
            </AccordionItem>

            <AccordionItem value="chat-members" className="border-none">
              <AccordionTrigger className="hover:no-underline hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] px-2 h-12 rounded-md text-base">
                Chat members
              </AccordionTrigger>

              {convoUsers?.map((convoUser) => (
                <AccordionContent key={convoUser.id} className="p-2">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2 flex-1">
                      <img
                        src={convoUser.profile || noProfile()}
                        alt="Profile"
                        className="w-10 h-10 rounded-full shrink-0 object-cover"
                      />

                      <div>
                        <p className="font-semibold text-[1rem]">
                          {convoUser.username}
                        </p>
                        {conversation?.userAdminIds.includes(convoUser?.id) && (
                          <small className="text-muted-foreground font-semibold">
                            Admin
                          </small>
                        )}
                      </div>
                    </div>

                    <Popover>
                      {!isAdmin && convoUser.id === user.id && (
                        <PopoverTrigger className="relative flex items-center justify-center hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] h-9 w-9 rounded-full">
                          <BsThreeDots
                            size={20}
                            className={cn("relative z-[1] text-xl")}
                          />
                        </PopoverTrigger>
                      )}

                      {isAdmin && (
                        <PopoverTrigger className="relative flex items-center justify-center hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] h-9 w-9 rounded-full">
                          <BsThreeDots
                            size={20}
                            className={cn("relative z-[1] text-xl")}
                          />
                        </PopoverTrigger>
                      )}

                      <PopoverContent
                        align="end"
                        className="flex flex-col p-1 rounded-lg"
                      >
                        {isAdmin && convoUser.id !== user.id && (
                          <button
                            onClick={() => onMakeAdmin(convoUser?.id)}
                            className="flex items-center gap-4 w-full text-start p-2 hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] rounded-lg"
                          >
                            <span className="flex items-center justify-center w-5 h-5">
                              <MdAdminPanelSettings />
                            </span>
                            {conversation.userAdminIds.includes(convoUser?.id) ? 'Remove as Admin' : 'Make admin'}
                          </button>
                        )}

                        {isAdmin && convoUser.id !== user.id && (
                          <button
                            onClick={() => onRemoveMember(convoUser?.id)}
                            className="flex items-center gap-4 w-full text-start p-2 hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] rounded-lg"
                          >
                            <span className="flex items-center justify-center w-5 h-5">
                              <HiUserRemove />
                            </span>
                            Remove Member
                          </button>
                        )}

                        {convoUser.id === user.id && (
                          <button
                            onClick={onLeaveGroup}
                            className="flex items-center gap-4 w-full text-start p-2 hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] rounded-lg text-red-500"
                          >
                            <span className="flex items-center justify-center w-5 h-5">
                              <HiMiniArrowRightOnRectangle size={20} />
                            </span>
                            Leave Group
                          </button>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                </AccordionContent>
              ))}

              <AccordionContent
                onClick={() => setIsAddPeople(true)}
                className="flex items-center gap-2 hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] px-2 py-0 h-12 rounded-md text-base cursor-pointer"
              >
                <span className="p-[.6rem] rounded-full bg-[#e3e3e3] dark:bg-[#2e2d2d]">
                  <IoPersonAdd size={19} />
                </span>
                Add people
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </div>
  );
}
