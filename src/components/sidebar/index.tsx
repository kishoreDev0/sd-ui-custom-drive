import React from 'react';
import { cn } from '@/lib/utils';
import openFolderIcon from '@/assets/open-folder.png';
import organizationIcon from '@/assets/organization.png';
import defaultLogo from '@/assets/defaultlogo.png';
import logoutIcon from '@/assets/github.png'; // Use github.png as a placeholder for logout
import hamburgerIcon from '@/assets/vite.svg'; // Use vite.svg as a placeholder for menu
import closeIcon from '@/assets/react.svg'; // Use react.svg as a placeholder for close
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAppSelector, useAppDispatch } from '@/store';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../confirmation-modal';
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
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

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
  const image = userInfo?.picture;

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [activeTab]);

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="fixed top-4 left-4 z-30 md:hidden bg-white rounded-full p-2 shadow border border-gray-200 focus:outline-none"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <img src={hamburgerIcon} alt="Menu" className="w-6 h-6 text-gray-700" />
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'bg-white border-r shadow-md h-screen fixed top-0 left-0 z-30 flex flex-col transition-transform duration-300',
          'w-64 md:translate-x-0 md:static md:block',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
        )}
      >
        {/* Header */}
        <div className="p-4  flex items-center gap-3 border-b">
          <div className="bg-gradient-to-tr from-blue-500 to-sky-600 p-2 rounded-lg shadow">
            <img src={defaultLogo} alt="Logo" className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-gray-800">
            CloudDrive
          </h1>
          <button
            className="ml-auto md:hidden p-2 rounded-full hover:bg-gray-100 focus:outline-none"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <img src={closeIcon} alt="Close" className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <nav className="space-y-1">
            <button
              className={cn(
                'w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all',
                activeTab === 'mydrive'
                  ? 'bg-sky-100 text-sky-700 font-semibold'
                  : 'text-gray-600 hover:bg-sky-50',
              )}
              onClick={() => {
                setActiveTab('mydrive');
                setCurrentFolder('root');
                setParentStack([]);
                setCurrentPage(1);
              }}
            >
              <img src={openFolderIcon} alt="My Drive" className="h-5 w-5 mr-3" />
              My Drive
            </button>

            <button
              className={cn(
                'w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all',
                activeTab === 'shared'
                  ? 'bg-sky-100 text-sky-700 font-semibold'
                  : 'text-gray-600 hover:bg-sky-50',
              )}
              onClick={() => {
                setActiveTab('shared');
                setParentStack([]);
                setCurrentPage(1);
              }}
            >
              <img src={organizationIcon} alt="Shared" className="h-5 w-5 mr-3" />
              Shared with Me
            </button>
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t bg-white">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full text-left focus:outline-none hover:bg-gray-50 p-2 rounded-lg">
                <div className="w-9 h-9 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold uppercase">
                    <img src={image} alt="User" />
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-1">
              <DropdownMenuItem
                onClick={() => setConfirmModalOpen(true)}
                className="flex items-center gap-2 text-red-600 font-medium cursor-pointer hover:bg-red-50"
              >
                <img src={logoutIcon} alt="Logout" className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Confirm Logout */}
        <ConfirmationModal
          labelHeading="Confirm Sign Out"
          label="Are you sure you want to sign out?"
          isOpen={isConfirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onCancel={() => setConfirmModalOpen(false)}
          onConfirm={handleLogout}
        />
      </aside>
    </>
  );
};

export default Sidebar;
