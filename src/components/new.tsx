import { axiosClient } from "@/lib/axiosClient";
import { MyConversationsType, SearchResultMessengerType } from "@/pages/chats";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { MessagesForm } from "./messages/messagesForm";
import { useInputFocus, useText } from "@/lib/zustand";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MessagesType } from "@/layouts/mainLayout";
import { MessagesRow } from "./messages/convoMessages";
import { ConvoMessageAvatar } from "./messages/convoMessageAvatar";
import { useUserContext } from "@/providers/userProvider";
import { useSocketContext } from "@/providers/socketIoClientProvider";

export function New() {
  const { user } = useUserContext();
  const [choosenPersons, setChoosenPersons] = useState<
    SearchResultMessengerType[]
  >([]);
  const [search, setSearch] = useState("");
  const { isInputFocus, setInputFocus } = useInputFocus();
  const queryClient = useQueryClient();
  const { setText, text } = useText();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocketContext();

  useEffect(() => {
    function handleRemove(e: KeyboardEvent) {
      if (!search && isInputFocus && e.key === "Backspace") {
        setChoosenPersons((prev) =>
          prev.filter((_, i) => i !== prev.length - 1)
        );
      }
    }
    window.addEventListener("keydown", handleRemove);
    return () => window.removeEventListener("keydown", handleRemove);
  }, [search, isInputFocus]);

  useEffect(() => {
    function handleRemove() {
      setInputFocus(false);
    }
    window.addEventListener("click", handleRemove);
    return () => window.removeEventListener("click", handleRemove);
  }, [setInputFocus]);

  const searchResults = useQuery({
    queryKey: ["search-messenger", search],
    enabled: search !== "",
    queryFn: async () => {
      try {
        const response = await axiosClient.get(
          `/search-messenger?search=${search}`
        );
        return response.data as SearchResultMessengerType[];
      } catch (error) {
        console.log(error);
      }
    },
  });

  const filterSearchResultsByChoosenPerson = searchResults.data?.filter(
    (result) => !choosenPersons.some((item) => item.id === result.id)
  );

  function handleSelectPerson(result: SearchResultMessengerType) {
    setSearch("");
    setChoosenPersons((prev) =>
      !prev.some((item) => item.id === result.id) ? [...prev, result] : prev
    );
  }

  function handleRemoveChoosenPerson(id: string) {
    setChoosenPersons((prev) => prev.filter((item) => item.id !== id));
  }

  const newConvo = useMutation({
    mutationFn: async () => {
      try {
        const response = await axiosClient.post(`/new-convo`, {
          receiverIds: choosenPersons.map((item) => item.id),
          text,
        });
        return response.data;
      } catch (error: any) {
        console.log(error.message);
      }
    },
    onSuccess: async (data) => {
      if (data) {
        setText("");
        socket.current?.emit("chat", data);
        queryClient.invalidateQueries({ queryKey: ['my-conversations'] });
        queryClient.setQueryData(['my-conversations', user.id], (old: MyConversationsType[]) =>
          old.map((oldConvo) => oldConvo.id === data.id ? data : oldConvo));
        queryClient.setQueryData(["convo-messages", data.id], data);
        navigate(`/?c=${data.id}`);
      }
    },
  });

  const handleNewSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      newConvo.mutate();
    },
    [newConvo]
  );

  const newConvoMessages = useQuery({
    queryKey: ["new-convo-messages", ...choosenPersons.map((c) => c.id)],
    enabled: choosenPersons.length > 0,
    queryFn: async () => {
      try {
        const resp = await axiosClient.get(
          `/new-convo-messages?ids=${JSON.stringify(
            choosenPersons.map((c) => c.id)
          )}`
        );
        return resp.data as MessagesType;
      } catch (error: any) {
        console.log(error.message);
      }
    },
  });

  useEffect(() => {
    // scroll to latest chat
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [newConvoMessages.data]);

  return (
    <div className="flex flex-col bg-card md:rounded-xl flex-1 shadow-sm xl:min-w-[25rem] overflow-hidden">
      <div className="flex border-b dark:border-[#3b3a3a] border-[#e3e3e3] px-4 py-[.8rem]">
        <div className="pr-5">
          <p>To:</p>
        </div>

        <div className="flex flex-wrap items-center flex-1 gap-3">
          {choosenPersons.map((choosenPerson) => (
            <div
              key={choosenPerson.id}
              className="flex items-center gap-1 py-1 px-2 text-sm font-semibold dark:bg-[#3b3a3a] bg-[#e3e3e3] rounded-md"
            >
              <p>{choosenPerson.username}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveChoosenPerson(choosenPerson.id);
                }}
                className="hover:bg-[#e3e3e3] hover:dark:bg-[#626262] p-[1px] rounded-full"
              >
                <IoIosClose className="scale-[1.2]" />
              </button>
            </div>
          ))}

          <div className="relative flex-1 max-w-[18rem] min-w-[15rem]">
            <input
              type="text"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              onClick={(e) => e.stopPropagation()}
              onFocus={() => setInputFocus(true)}
              className="outline-none bg-transparent w-full"
              spellCheck={false}
              autoFocus={true}
              key={search}
            />

            <div
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "absolute inset-x-0 h-[25rem] rounded-xl mt-2 border border-zinc-500/10 bg-card shadow-2xl px-2 py-4 overflow-auto z-[100]",
                !isInputFocus && "hidden"
              )}
            >
              {filterSearchResultsByChoosenPerson?.map((result) => (
                <div
                  onClick={() => handleSelectPerson(result)}
                  key={result.id}
                  className="flex items-center gap-3 hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] p-2 rounded-lg cursor-pointer"
                >
                  <div className="shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80"
                      alt=""
                      className="rounded-full w-9 h-9"
                    />
                  </div>

                  <p>{result.username}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex-1">
        {!newConvoMessages?.data?.messages?.length && (
          <div className="absolute inset-0 overflow-auto flex items-center justify-center">
            <p className="font-semibold text-2xl">No results</p>
          </div>
        )}

        {newConvoMessages.isSuccess && !!newConvoMessages.data?.messages?.length && (
          <div ref={scrollRef} className="absolute inset-0 overflow-auto">
            <ConvoMessageAvatar messages={newConvoMessages.data} />

            <div className="space-y-1 mt-10 p-4">
              {newConvoMessages.data?.messages
                ?.filter((m) => !m.deletedByIds.includes(user.id))
                ?.map((message, index) => (
                  <MessagesRow
                    key={message.id}
                    conversation={newConvoMessages.data}
                    message={message}
                    index={index}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {newConvoMessages.isSuccess && !!choosenPersons?.length && (
        <MessagesForm
          handleNewSubmit={handleNewSubmit}
          isNewConvo={choosenPersons?.length > 0}
          newConversationId={newConvoMessages.data?.id}
          receiverIds={choosenPersons.map((item) => item.id)}
        />
      )}
    </div>
  );
}
