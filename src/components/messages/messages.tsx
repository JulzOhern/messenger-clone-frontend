import { MessagesType } from "@/layouts/mainLayout"
import Header from "./header";
import { MessagesForm } from "./messagesForm";
import { ConvoMessages } from "./convoMessages";
import { NoChatsSelectedSvg } from "@/utils/noChatsSelectedSvg";
import { useSearchParams } from "react-router-dom";
import { useUserContext } from "@/providers/userProvider";
import { LuLoaderCircle } from "react-icons/lu";
import { useOpenConvoInformation } from "@/lib/zustand";
import { cn } from "@/lib/utils";

interface MessagesProps {
	messages: MessagesType | undefined;
	isLoadingMessages: boolean;
}

export function Messages({
	messages,
	isLoadingMessages,
}: MessagesProps) {
	const [searchParams] = useSearchParams()
	const conversationId = searchParams.get("c");
	const { user } = useUserContext();
	const { isOpen } = useOpenConvoInformation();

	const isInGroupChat = messages?.userIds?.includes(user?.id);

	if (!conversationId) {
		return (
			<div className={cn("flex flex-col items-center justify-center bg-card rounded-xl flex-1 shadow-sm min-w-[25rem] overflow-hidden",
				!conversationId && 'lg:flex hidden'
			)}>
				<NoChatsSelectedSvg />
				<p>No chats selected</p>
			</div>
		)
	};

	if (isLoadingMessages) {
		return (
			<div className="flex flex-col justify-center items-center bg-card rounded-xl flex-1 shadow-sm min-w-[25rem] overflow-hidden">
				<LuLoaderCircle className="animate-spin text-muted-foreground" size={50} />
			</div>
		)
	};

	return (
		<div className={cn("flex flex-col bg-card md:rounded-xl flex-1 shadow-sm xl:min-w-[38rem] overflow-hidden",
			isOpen && 'xl:flex hidden',
		)}>
			<Header messages={messages} />

			<div className="relative flex-1">
				<ConvoMessages messages={messages} />
			</div>

			{isInGroupChat ? (
				<MessagesForm />
			) : (
				<div className="flex flex-col items-center border-t p-3 mt-3">
					<h1>You can't message this group</h1>
					<small className="text-muted-foreground">You're no longer in this group and can't send or receive calls or messages unless you are added back to it.</small>
				</div>
			)}
		</div>
	)
};
