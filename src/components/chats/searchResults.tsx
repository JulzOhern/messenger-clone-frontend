import { axiosClient } from "@/lib/axiosClient"
import { SearchResultMessengerType } from "@/pages/chats"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

interface SearchResultsProps {
  result: SearchResultMessengerType
}

export function SearchResults({ result }: SearchResultsProps) {
  const navigate = useNavigate();

  const createConversation = useMutation({
    mutationFn: async () => {
      try {
        const resp = await axiosClient.post("/create-convo", { receiverId: result.id });
        /* console.log(resp.data) */
        return resp.data
      } catch (error: any) {
        console.log(error.message);
      }
    },
    onSuccess: (data) => {
      if (data) navigate(`/?c=${data.id}`);
    }
  });

  function handleChatUser() {
    createConversation.mutate();
  }

  return (
    <div onClick={handleChatUser} className="flex items-center gap-2 mx-2 px-2 py-3 hover:bg-[#e3e3e3] hover:dark:bg-[#3b3a3a] rounded-lg cursor-pointer">
      <div>
        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80" alt="" className="rounded-full w-8 h-8" />
      </div>

      <p className="capitalize">{result.username}</p>
    </div>
  )
}
