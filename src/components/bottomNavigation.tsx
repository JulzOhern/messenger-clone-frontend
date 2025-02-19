import { cn } from '@/lib/utils';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { IoChatbubble } from "react-icons/io5";
import { FaArchive } from "react-icons/fa";
import { useUserContext } from '@/providers/userProvider';
import { noProfile } from '@/utils/noProfile';
import { Dialog, DialogTrigger } from './ui/dialog';
import { EditProfile } from './editProfile';
import { IoIosMoon, IoIosSunny } from 'react-icons/io';
import { useTheme } from '@/providers/themeprovider';

export default function BottomNavigation() {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('c');
  const { user } = useUserContext();
  const pathname = useLocation().pathname;
  const { setTheme, theme } = useTheme();

  return (
    <div className={cn('block md:hidden',
      conversationId && 'hidden'
    )}>
      <div className='flex items-center justify-evenly py-2 px-2 bg-card flex-1'>
        <Link
          to="/"
          className={cn('flex flex-col items-center justify-between gap-1 cursor-pointer',
            pathname === '/' && 'text-blue-600'
          )}
        >
          <div className='flex items-center justify-center h-7'>
            <IoChatbubble size={25} />
          </div>
          <p className='text-xs'>Chats</p>
        </Link>

        <Link to='/archived' className={cn('flex flex-col items-center justify-between gap-1 cursor-pointer',
          pathname === '/archived' && 'text-blue-600'
        )}>
          <div className='flex items-center justify-center h-7'>
            <FaArchive size={23} />
          </div>
          <p className='text-xs'>Archive</p>
        </Link>

        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className='flex flex-col items-center justify-between gap-1 cursor-pointer'>
          <div className='flex items-center justify-center h-7'>
            {theme === 'light' ? <IoIosSunny size={29} /> : <IoIosMoon size={29} />}
          </div>
          <p className='text-xs'>Dark</p>
        </button>

        <Dialog>
          <DialogTrigger
            className='flex flex-col items-center justify-between gap-1 cursor-pointer'
          >
            <div className='flex items-center justify-center h-7'>
              <img
                src={user.profile || noProfile()}
                alt="Profile"
                className='w-7 h-7 rounded-full object-cover'
              />
            </div>
            <p className='text-xs truncate max-w-14 text-center'>{user.username}</p>
          </DialogTrigger>

          <EditProfile />
        </Dialog>
      </div>
    </div>
  )
}
