import { GallerySvg } from "@/utils/gallerySvg";
import { GifSvg } from "@/utils/gifSvg";
import { LikeSvg } from "@/utils/likeSvg";
import TextareaAutosize from 'react-textarea-autosize';
import EmojiSvg from "@/utils/emojiSvg";
import { FormEvent, useEffect, useRef, useState } from "react";
import SendSvg from "@/utils/sendSvg";
import { useInputFocus, useText } from "@/lib/zustand";
import { axiosClient } from "@/lib/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import GifPicker, { TenorImage, Theme } from 'gif-picker-react';
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/themeprovider";
import { uploadFiles } from "@/lib/uploadthing";
import { IoClose } from "react-icons/io5";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useSocketContext } from "@/providers/socketIoClientProvider";
import { useUserContext } from "@/providers/userProvider";
import { MyConversationsType } from "@/pages/chats";

interface MessagesFormProp {
  handleNewSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  isNewConvo?: boolean;
  newConversationId?: string;
  receiverIds?: string[];
}

export function MessagesForm({
  handleNewSubmit,
  isNewConvo,
  newConversationId,
  receiverIds,
}: MessagesFormProp) {
  const { theme } = useTheme();
  const [isOpenGif, setOpenGif] = useState(false);
  const [isOpenEmoji, setOpenEmoji] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { text, setText } = useText();
  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiContainerRef = useRef<HTMLDivElement>(null);
  const conversationId = searchParams.get("c");
  const queryClient = useQueryClient();
  const gifRef = useRef<HTMLDivElement>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const [quickReactionSize, setQuickReactionSize] = useState("");
  const [quickReactionCancelled, setQuickReactionCancelled] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const { setInputFocus } = useInputFocus();
  const navigate = useNavigate();
  const { socket } = useSocketContext();
  const { user } = useUserContext();
  const pathname = useLocation().pathname;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!gifRef.current?.contains(e.target as Node)) {
        setOpenGif(false);
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!emojiContainerRef.current?.contains(e.target as Node)) {
        if (isOpenEmoji) {
          textareaRef.current?.focus();
        }
        setOpenEmoji(false);
      }
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isOpenEmoji]);

  useEffect(() => {
    let interval: any;

    if (isLongPress) {
      interval = setInterval(async () => {
        switch (quickReactionSize) {
          case 'small':
            setQuickReactionSize("medium");
            break;
          case 'medium':
            setQuickReactionSize("large");
            await new Promise((resolve) => setTimeout(resolve, 1300));
            setIsLongPress(false);
            setQuickReactionSize('');
            setQuickReactionCancelled(true);
            break;
        };
      }, 1300);
    };

    return () => {
      clearInterval(interval);
    };
  }, [isLongPress, quickReactionSize]);

  useEffect(() => {
    if (textareaRef.current) {
      const ref = textareaRef.current
      ref.selectionEnd = cursorPosition;
    }
  }, [cursorPosition]);

  async function handleSendGift(gif: TenorImage) {
    try {
      const resp = await axiosClient.post("/send-gif", {
        conversationId,
        gif: gif.url
      });
      const data = resp.data;
      setOpenGif(false);
      socket.current?.emit("chat", data);
      queryClient.setQueryData(['my-conversations', user.id], (old: MyConversationsType[]) => (
        old.map((oldConvo) => oldConvo.id === data.id ? data : oldConvo)
      ));
      queryClient.setQueryData(['convo-messages', data.id], data);
      return resp.data;
    } catch (error: any) {
      console.log(error.message)
    }
  };

  const sendChat = useMutation({
    mutationFn: async ({ urls }: { urls: string[] }) => {
      try {
        const response = await axiosClient.post("/send-chat", {
          conversationId,
          text,
          urls,
        });
        return response.data;
      } catch (error: any) {
        console.log(error.message);
      }
    },
    onSuccess: async (data) => {
      if (data) {
        setText("");
        setFiles([]);
        socket.current?.emit("chat", data);
        queryClient.setQueryData(['my-conversations', user.id], (old: MyConversationsType[]) => (
          old.map((oldConvo) => oldConvo.id === data.id ? data : oldConvo)
        ));
        queryClient.setQueryData(['convo-messages', data.id], data);
      }
    },
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    let urls: string[] = [];

    if (files.length) {
      const response = await uploadFiles("imagesUploader", {
        files,
      });
      urls = response.map((file) => file.url);
    };

    if (!text && !urls.length) return;

    sendChat.mutate({ urls });
  };

  function handleMouseDownQuickReaction() {
    setQuickReactionCancelled(false);
    setQuickReactionSize("small");
    setIsLongPress(true);
  };

  async function handleMouseUpQuickReaction() {
    if (quickReactionCancelled) return
    setIsLongPress(false);
    setQuickReactionSize("");

    if (!conversationId && !newConversationId) {
      const response = await axiosClient.post('/new-quick-reaction', {
        receiverIds,
        quickReaction: ["Like", quickReactionSize],
      });
      const data = response.data;
      socket.current?.emit("chat", data);
      queryClient.setQueryData(['my-conversations', user.id], (old: MyConversationsType[]) => (
        !old.some((c) => c.id === data.id) ? [...old, data] : old.map((oldConvo) => oldConvo.id === data.id ? data : oldConvo)
      ));
      queryClient.setQueryData(['convo-messages', data.id], data);
      navigate(`/?c=${data.id}`);
      return data;
    }

    try {
      const response = await axiosClient.post('/quick-reaction', {
        conversationId: conversationId || newConversationId,
        quickReaction: ["Like", quickReactionSize],
      });
      const data = response.data;
      socket.current?.emit("chat", data);
      queryClient.setQueryData(['my-conversations', user.id], (old: MyConversationsType[]) => (
        old.map((oldConvo) => oldConvo.id === data.id ? data : oldConvo)
      ));
      queryClient.setQueryData(['convo-messages', data.id], data);
      navigate(`/?c=${data.id}`);
      return data;
    } catch (error: any) {
      console.log(error.message)
    };
  };

  function handleEmojiClick(emoji: any) {
    if (textareaRef.current) {
      const ref = textareaRef.current
      ref.focus();
      const currentText = ref.value;
      const startText = currentText.substring(0, ref.selectionStart);
      const endText = currentText.substring(ref.selectionStart);
      setCursorPosition(startText.length + emoji.native.length);
      ref.selectionEnd = startText.length + emoji.native.length;
      setText(startText + emoji.native + endText);
      ref.focus();
    };
  };

  useEffect(() => {
    socket.current?.on("chat", (data) => {
      if (data?.userIds?.includes(user?.id)) {
        queryClient.setQueryData(['my-conversations', user?.id], (old: MyConversationsType[]) => (
          !old.some((c) => c.id === data.id) ? [...old, data] : old.map((oldConvo) => oldConvo.id === data.id ? data : oldConvo)
        ));
      };
      queryClient.setQueryData(['convo-messages', data.id], data);
    });
  }, [queryClient, user.id]);

  return (
    <div className="flex items-end gap-2 p-3">
      {pathname !== '/new' && (
        <div className="flex items-center">
          <div>
            <label
              htmlFor="file"
              className=" hover:bg-[#e1dfdf] dark:hover:bg-[#5b5b5b] h-9 w-9 flex justify-center items-center rounded-full cursor-pointer"
            >
              <GallerySvg />
            </label>
            <input
              onChange={(e) => {
                const newFiles = Array.from(e.target.files as FileList || []);
                setFiles(prev => [...prev, ...newFiles]);
              }}
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              id="file"
            />
          </div>

          <div ref={gifRef} className="relative">
            <button
              onClick={() => setOpenGif(prev => !prev)}
              className={cn("relative hover:bg-[#e1dfdf] dark:hover:bg-[#5b5b5b] h-9 w-9 flex justify-center items-center rounded-full",
                isOpenGif && "bg-[#e1dfdf] dark:bg-[#5b5b5b]")}
            >
              <GifSvg />
            </button>

            {isOpenGif && (
              <div onClick={(e) => e.stopPropagation()} className="absolute -left-11 bottom-12">
                <GifPicker
                  onGifClick={handleSendGift}
                  theme={theme as Theme}
                  tenorApiKey={import.meta.env.VITE_TENOR_API_KEY}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={isNewConvo ? handleNewSubmit : handleSubmit}
        className="flex items-end gap-2 flex-1"
      >
        <div className="flex-1 dark:bg-[#373737] bg-[#f1f1f1] rounded-[20px]">
          {!!files.length && (
            <div className="flex p-3">
              {/** Display images */}
              {files.map((file, idx) =>
                <div key={idx} className="relative">
                  <button
                    type="button"
                    onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute -right-1 -top-1 flex items-center justify-center rounded-full w-6 h-6 bg-white z-[10] text-black shadow-xl"
                  >
                    <IoClose size={14} />
                  </button>
                  {file.type.includes('document') && (
                    <p>File</p>
                  )}
                  {file.type.includes('image') && (
                    <img
                      src={URL.createObjectURL(file)}
                      className="w-12 h-12 object-cover rounded-xl m-1"
                      alt="files"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          <div className="relative flex flex-1 py-[.36rem] px-3">
            <TextareaAutosize
              ref={textareaRef}
              onClick={(e) => {
                e.stopPropagation();
                setInputFocus(false);
              }}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                };
              }}
              value={text}
              maxRows={5}
              placeholder="Aa"
              className="bg-transparent w-full resize-none caret-[#0e92eb] outline-none mr-6"
            />

            {/** Emoji row */}
            <div ref={emojiContainerRef} className="absolute right-1 bottom-1">
              {isOpenEmoji && (
                <div className="absolute right-0 bottom-11">
                  <Picker data={data} onEmojiSelect={handleEmojiClick} />
                </div>
              )}
              <button
                type="button"
                className={cn("flex items-center scale-[1.2] hover:bg-[#e1dfdf] dark:hover:bg-[#5b5b5b] rounded-full", isOpenEmoji && 'bg-[#e1dfdf] dark:bg-[#5b5b5b]')}
                onClick={() => {
                  textareaRef.current?.focus();
                  setOpenEmoji(prev => !prev)
                }}
              >
                <span className="scale-[.8]">
                  <EmojiSvg />
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          {(text || !!files.length) && (
            <button
              disabled={sendChat.isPending}
              type='submit'
              className="hover:bg-[#e1dfdf] dark:hover:bg-[#5b5b5b] h-9 w-9 flex justify-center items-center rounded-full"
            >
              <SendSvg />
            </button>
          )}
          {!text && !files.length && (
            <button
              type='button'
              onMouseDown={handleMouseDownQuickReaction}
              onMouseUp={handleMouseUpQuickReaction}
              className={cn("relative hover:bg-[#e1dfdf] dark:hover:bg-[#5b5b5b] h-9 w-9 flex justify-center items-center rounded-full", isLongPress && "hover:bg-transparent dark:hover:bg-transparent")}
            >
              <span className="absolute bottom-2">
                <LikeSvg quickReactionSize={quickReactionSize} />
              </span>
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
