import React from 'react';
import { cn } from '@/lib/utils';
import {
  Star,
  HardDrive,
  Users,
  FolderGit2,
  CircleUser,
  Settings,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAppSelector } from '@/store';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../confirmation-modal';
import { useAppDispatch } from '@/store';
import { logout } from '@/store/slices/authentication/login';

interface SidebarProps {
  activeTab: 'mydrive' | 'shared';
  setActiveTab: (tab: 'mydrive' | 'shared') => void;
  setCurrentFolder: (folder: string) => void;
  setParentStack: (stack: string[] | ((prev: string[]) => string[])) => void;
  setCurrentPage: (page: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  setCurrentFolder,
  setParentStack,
  setCurrentPage,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isConfirmModalOpen, setConfirmModalOpen] = React.useState(false);
  // Header: logout logic
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  const userInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || '{}');
    } catch {
      return {};
    }
  })();

  const displayName = userInfo?.name;
  const email = userInfo?.email || user?.email || '';

  return (
    <aside className="w-64 bg-background border-r h-screen fixed top-0 left-0 z-10 flex flex-col">
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-center gap-3 ">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-lg">
            <FolderGit2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">CloudDrive</h1>
            {/* <p className="text-xs text-muted-foreground">Secure file management</p> */}
          </div>
        </div>

        {/* New Button */}
        {/* <button
          className={cn(
            "w-full flex items-center justify-center py-3 text-sm font-medium transition-all",
            "bg-primary text-primary-foreground rounded-lg hover:bg-primary/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "shadow-sm hover:shadow-md mb-4"
          )}
        >
          <Plus className="h-4 w-4 mr-2" />
          New File
        </button> */}
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <nav className="space-y-1">
          <button
            className={cn(
              'w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              activeTab === 'mydrive'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50',
            )}
            onClick={() => {
              setActiveTab('mydrive');
              setCurrentFolder('root');
              setParentStack([]);
              setCurrentPage(1);
            }}
          >
            <div className="border-t my-4 mx-2" />
            <HardDrive className="h-5 w-5 mr-3 text-blue-500" />
            <span>My Drive</span>
          </button>

          <button
            className={cn(
              'w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              activeTab === 'shared'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50',
            )}
            onClick={() => {
              setActiveTab('shared');
              setParentStack([]);
              setCurrentPage(1);
            }}
          >
            <Users className="h-5 w-5 mr-3 text-green-500" />
            <span>Shared with Me</span>
          </button>

          {/* <button
            className={cn(
              "w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "text-muted-foreground hover:bg-accent/50"
            )}
          >
            <Star className="h-5 w-5 mr-3 text-yellow-500 fill-yellow-400/20" />
            <span>Starred</span>
          </button> */}
        </nav>

        {/* Divider */}
        <div className="border-t my-4 mx-2" />

        {/* Folders Section */}
        {/* <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Folders
        </div>
        <div className="space-y-1">
          {['Projects', 'Documents', 'Images', 'Archives'].map((folder, index) => (
            <button
              key={index}
              className="w-full flex items-center px-4 py-2 text-sm rounded-lg text-muted-foreground hover:bg-accent/50 transition-colors"
            >
              <Folder className="h-4 w-4 mr-3 text-amber-500" />
              <span>{folder}</span>
            </button>
          ))}
        </div> */}
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full text-left focus:outline-none">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.username}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">{displayName || 'User'}</p>
                <p className="text-xs text-muted-foreground">
                  {email || 'user@gmail'}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56 p-1">
            <DropdownMenuItem
              onClick={() => setConfirmModalOpen(true)}
              className="flex items-center gap-2 text-red-500 cursor-pointer"
            >
              <LogOut size={16} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ConfirmationModal
        labelHeading="Confirm Sign Out"
        label="Are you sure you want to sign out?"
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onCancel={() => setConfirmModalOpen(false)}
        onConfirm={handleLogout}
      />
    </aside>
  );
};

export default Sidebar;
