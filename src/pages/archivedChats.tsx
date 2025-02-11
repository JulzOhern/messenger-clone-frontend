import { Convo } from "@/components/chats/convo";
import { axiosClient } from "@/lib/axiosClient";
import { useQuery } from "@tanstack/react-query"
import { MyConversationsType } from "./chats";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

export function ArchivedChats() {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('c');

  const { data: myArchive } = useQuery({
    queryKey: ['my-archive'],
    queryFn: async () => {
      try {
        const response = await axiosClient.get('/my-archive');
        return response.data as MyConversationsType[];
      } catch (error: any) {
        console.log(error.message);
      }
    }
  });

  return (
    <div className={cn("flex flex-col bg-card md:rounded-xl flex-1 lg:max-w-[26rem] shadow-sm",
      conversationId && 'lg:flex hidden'
    )}>
      <div className="p-3">
        <h1 className="text-2xl font-bold px-3">Archived chats</h1>
      </div>

      {!myArchive?.length ? (
        <div className="flex items-center justify-center flex-1 text-xl text-muted-foreground font-semibold">
          No archive chats
        </div>
      ) : (
        <div className="flex-1 mx-[.4rem]">
          {myArchive?.map((convo) => (
            <Convo convo={convo} key={convo.id} isArchivePage={true} />
          ))}
        </div>
      )}
    </div>
  )
}
