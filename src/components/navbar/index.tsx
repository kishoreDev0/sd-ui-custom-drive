import { useState, useEffect } from 'react';
import menuIcon from '@/assets/vite.svg';
import chevronIcon from '@/assets/react.svg';
import searchIcon from '@/assets/googleLogo.png';
import { useNavigate } from 'react-router-dom';
// import Logo from '../../assets/google-drive-logo.svg'; // Placeholder for Google Drive logo
import userlogo from '../../assets/user-image.jpg';
import Modal from '../modal';
import InviteUserForm from '../invite-user';
import ResetPassword from '../reset-password';
import ConfirmationModal from '../confirmation-modal';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/authentication/login';

const Navbar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isInviteModalOpen, setInviteModalOpen] = useState<boolean>(false);
  const [isResetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const user = useAppSelector((state) => state.auth?.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown') && dropdownOpen) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    setDropdownOpen(false);
    setConfirmModalOpen(true);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality (e.g., navigate to search results)
    console.log('Search query:', searchQuery);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const getUserData = () => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        return JSON.parse(userDataString);
      } catch (error) {
        console.error('Error parsing user data in Navbar:', error);
      }
    }
    return {
      username: 'User',
      role: 'user',
      profileUrl: userlogo,
    };
  };

  const userData = getUserData();
  // User info from localStorage
  const userInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || '{}');
    } catch {
      return {};
    }
  })();
  const displayName = userInfo.name;
  alert(displayName);
  const email = userInfo.email || user?.email || '';
  const avatar = userInfo.picture || '';
  const profileImage = userData.profileUrl || userData.picture || userlogo;
  const userRole = userData.roleId ? `Role: ${userData.roleId}` : 'User';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-md text-gray-800`}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center">
            <button
              className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-expanded={isSidebarOpen}
            >
              <span className="sr-only">Toggle sidebar</span>
              {/* <img src={menuIcon} alt="Menu" className="w-6 h-6 text-gray-600" /> */}
            </button>
            <div className="flex-shrink-0 flex items-center ml-2">
              {/* <img src={"Logo"} className="h-8 w-auto" alt="Google Drive" /> */}
              <span className=" font-medium text-lg text-gray-700 hidden sm:block">
                Customized Drive
              </span>
            </div>
          </div>

          <div className="flex-1 mx-4 max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center w-full bg-gray-100 rounded-full px-4 py-2 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500">
                <img src={searchIcon} alt="Search" className="w-4 h-4 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in Drive"
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-500"
                />
              </div>
            </form>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative user-dropdown">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gray-200">
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => (e.currentTarget.src = userlogo)}
                  />
                </div>
                <img src={chevronIcon} alt="Chevron" className={`ml-1 hidden sm:block transition-transform duration-200 ${dropdownOpen ? 'transform rotate-180' : ''} text-gray-600 w-4 h-4`} />
              </div>
              <div
                className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 transition-all duration-200 transform origin-top-right ${
                  dropdownOpen
                    ? 'scale-100 opacity-100'
                    : 'scale-95 opacity-0 pointer-events-none'
                } bg-white ring-1 ring-black ring-opacity-5`}
              >
                <p className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                  {displayName}
                </p>
                <p
                  onClick={(e) => {
                    e.preventDefault();
                    setDropdownOpen(false);
                    setInviteModalOpen(true);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  Share with others
                </p>
                {user && (
                  <p
                    onClick={() => {
                      setDropdownOpen(false);
                      setResetModalOpen(true);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Reset Password
                  </p>
                )}
                <p
                  onClick={handleSignOut}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  Sign out
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      >
        <InviteUserForm onClose={() => setInviteModalOpen(false)} />
      </Modal>
      <Modal isOpen={isResetModalOpen} onClose={() => setResetModalOpen(false)}>
        <ResetPassword onClose={() => setResetModalOpen(false)} />
      </Modal>
      <ConfirmationModal
        labelHeading="Confirm Sign Out"
        label="Are you sure you want to sign out?"
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onCancel={() => setConfirmModalOpen(false)}
        onConfirm={handleLogout}
      />
    </nav>
  );
};

export default Navbar;
