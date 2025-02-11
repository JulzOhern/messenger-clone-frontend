import { cn } from '@/lib/utils';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { IoChatbubble } from "react-icons/io5";
import { FaArchive } from "react-icons/fa";
import { useUserContext } from '@/providers/userProvider';
import { noProfile } from '@/utils/noProfile';
import { Dialog, DialogTrigger } from './ui/dialog';
import { EditProfile } from './editProfile';

export default function BottomNavigation() {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('c');
  const { user } = useUserContext();
  const pathname = useLocation().pathname;

  return (
    <div className={cn('flex md:hidden border-t',
      conversationId && 'hidden'
    )}>
      <div className='flex items-center justify-around gap-5 py-4 px-5 bg-card flex-1'>
        <Link
          to="/"
          className={cn('flex flex-col items-center justify-between gap-1 cursor-pointer',
            pathname === '/' && 'text-blue-600'
          )}
        >
          <IoChatbubble size={25} />
          <p className='text-xs'>Chats</p>
        </Link>

        <Link to='/archived' className={cn('flex flex-col items-center justify-between gap-1 cursor-pointer',
          pathname === '/archived' && 'text-blue-600'
        )}>
          <FaArchive size={23} />
          <p className='text-xs'>Archive</p>
        </Link>

        <Dialog>
          <DialogTrigger
            className='flex flex-col items-center justify-between gap-1 cursor-pointer'
          >
            <img
              src={user.profile || noProfile()}
              alt="Profile"
              className='w-6 h-6 rounded-full object-cover'
            />
            <p className='text-xs truncate max-w-14 text-center'>{user.username}</p>
          </DialogTrigger>

          <EditProfile />
        </Dialog>
      </div>
    </div>
  )
}
