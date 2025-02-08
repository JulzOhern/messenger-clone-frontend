import { IoChatbubble } from "react-icons/io5";
import { FaArchive } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./mode-toggle";
import { SidebarSvg } from "@/utils/sidebarSvg";
import { useSidebar } from "@/lib/zustand";
import { useUserContext } from "@/providers/userProvider";
import { EditProfile } from "./editProfile";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { noProfile } from "@/utils/noProfile";

const sideBarLinks = [
  {
    href: "/",
    name: "Chats",
    icon: <IoChatbubble size={21} className="shrink-0" />,
  },
  {
    href: "/archived",
    name: "Archive",
    icon: <FaArchive size={18} className="shrink-0" />
  }
]

export function Sidebar() {
  const { user } = useUserContext();
  const pathname = useLocation().pathname;
  const { setOpen, isOpen } = useSidebar();

  return (
    <div className={cn("lg:flex hidden flex-col justify-between w-[2.8rem]", isOpen && 'w-[15rem]')}>
      <div className="flex flex-col overflow-hidden">
        {sideBarLinks.map((item) => (
          <Link key={item.href} to={item.href} className={cn("flex items-center h-11 rounded-lg hover:bg-[#e3e3e3] dark:hover:bg-[#2a2929] text-muted-foreground",
            pathname === item.href && "bg-[#e3e3e3] dark:bg-muted text-foreground",
            pathname === '/new' && item.href === '/' && 'bg-[#e3e3e3] dark:bg-muted text-foreground'
          )}>
            <p className="w-[2.8rem] flex items-center justify-center">{item.icon}</p>
            <p className={cn("flex-1 font-medium text-[15px] hidden", isOpen && 'block')}>{item.name}</p>
          </Link>
        ))}
      </div>

      <div>
        <div className={cn("flex flex-col items-center gap-3", isOpen && 'hidden')}>
          <Dialog>
            <DialogTrigger>
              <img
                src={user.profile || noProfile()}
                alt="Profile"
                className="rounded-full w-7 h-7 object-cover"
              />
            </DialogTrigger>

            <EditProfile />
          </Dialog>

          <ModeToggle />

          <button onClick={() => setOpen()} className="flex items-center justify-center h-9 w-9 bg-accent hover:bg-[#e1dfdf] dark:hover:bg-[#303030] rounded-full">
            <SidebarSvg />
          </button>
        </div>

        <div className={cn("hidden items-center justify-between", isOpen && 'flex')}>
          <Dialog>
            <DialogTrigger
              className="flex items-center gap-2 hover:bg-[#e3e3e3] dark:hover:bg-[#2a2929] flex-1 mr-3 rounded-lg p-2 cursor-pointer"
            >
              <img
                src={user?.profile || noProfile()}
                alt="Profile"
                className="rounded-full w-8 h-8 object-cover"
              />

              <div className="truncate flex flex-col leading-3 justify-center font-semibold text-start">
                <p className="truncate">{user?.username}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </DialogTrigger>

            <EditProfile />
          </Dialog>


          <button onClick={() => setOpen()} className="flex items-center justify-center h-9 w-9 bg-accent hover:bg-[#e1dfdf] dark:hover:bg-[#303030] rounded-full">
            <SidebarSvg />
          </button>
        </div>
      </div>
    </div>
  )
}
