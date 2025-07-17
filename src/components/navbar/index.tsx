import { useState, useEffect } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/vite.svg';
import userlogo from '../../assets/user-image.jpg';
import Modal from '../modal';
import InviteUserForm from '../invite-user';
import ResetPassword from '../reset-password';
import ConfirmationModal from '../confirmation-modal';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/authentication/login';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isInviteModalOpen, setInviteModalOpen] = useState<boolean>(false);
  const [isResetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<string>('Dashboard');
  const user = useAppSelector((state) => state.auth?.user);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
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

  const handleNavClick = (page: string) => {
    setActivePage(page);
    setIsOpen(false);
  };

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    setDropdownOpen(false);
    setConfirmModalOpen(true);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
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
  const displayName =
    userData.username || userData.userName || userData.name || 'User';
  const profileImage = userData.profileUrl || userData.picture || userlogo;
  const userRole = userData.roleId ? `Role ID: ${userData.roleId}` : 'User';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-md text-gray-800'
          : 'bg-gray-900 text-white'
      }`}
    >
      <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img src={Logo} className="h-8 w-auto" alt="Logo" />
              <span className="ml-3 font-semibold text-lg hidden sm:block">
                React
              </span>
            </div>

            <div className="hidden md:ml-8 md:flex md:space-x-2">
              {['Dashboard', 'Page 1', 'Page 2'].map((page) => (
                <a
                  key={page}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(page);
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activePage === page
                      ? isScrolled
                        ? 'bg-gray-200 text-gray-800'
                        : 'bg-gray-700 text-white'
                      : isScrolled
                        ? 'text-gray-600 hover:bg-gray-200'
                        : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {page}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4 cursor-pointer">
            <div className="relative user-dropdown">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="hidden sm:flex sm:flex-col sm:items-end sm:mr-3">
                  <span className="text-sm font-medium">{displayName}</span>
                  <span
                    className={`text-xs ${isScrolled ? 'text-gray-500' : 'text-gray-400'}`}
                  >
                    {userRole}
                  </span>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${
                    isScrolled ? 'bg-gray-200' : 'bg-gray-700'
                  }`}
                >
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => (e.currentTarget.src = userlogo)}
                  />
                </div>
                <ChevronDown
                  size={16}
                  className={`ml-1 hidden sm:block transition-transform duration-200 ${
                    dropdownOpen ? 'transform rotate-180' : ''
                  }`}
                />
              </div>
              <div
                className={`absolute right-0 mt-4 w-48 rounded-md shadow-lg py-1 transition-all duration-200 transform origin-top-right ${
                  dropdownOpen
                    ? 'scale-100 opacity-100'
                    : 'scale-95 opacity-0 pointer-events-none'
                } ${
                  isScrolled
                    ? 'bg-white ring-1 ring-black ring-opacity-5'
                    : 'bg-gray-800'
                }`}
              >
                <p
                  className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                    isScrolled
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-200 hover:bg-gray-700'
                  }`}
                >
                  Profile
                </p>
                <p
                  onClick={(e) => {
                    e.preventDefault();
                    setDropdownOpen(false);
                    setInviteModalOpen(true);
                  }}
                  className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                    isScrolled
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-200 hover:bg-gray-700'
                  }`}
                >
                  Invite User
                </p>
                {user && (
                  <p
                    onClick={() => {
                      setDropdownOpen(false);
                      setResetModalOpen(true);
                    }}
                    className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                      isScrolled
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-gray-200 hover:bg-gray-700'
                    }`}
                  >
                    Reset Password
                  </p>
                )}
                <p
                  onClick={handleSignOut}
                  className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                    isScrolled
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-200 hover:bg-gray-700'
                  }`}
                >
                  Logout
                </p>
              </div>
            </div>
            <button
              className="md:hidden p-2 rounded-md focus:outline-none cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <Menu size={24} aria-hidden="true" />
              ) : (
                <Menu size={24} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-48' : 'max-h-0'
        }`}
      >
        <div
          className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${
            isScrolled ? 'bg-white' : 'bg-gray-900'
          }`}
        >
          {['Dashboard', 'Page 1', 'Page 2'].map((page) => (
            <a
              key={page}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(page);
              }}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                activePage === page
                  ? isScrolled
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-gray-700 text-white'
                  : isScrolled
                    ? 'text-gray-600 hover:bg-gray-200'
                    : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {page}
            </a>
          ))}
          <p
            onClick={handleSignOut}
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
              isScrolled
                ? 'text-gray-600 hover:bg-gray-200'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Logout
          </p>
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
        labelHeading="Confirm Logout"
        label="Are you sure you want to logout?"
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onCancel={() => setConfirmModalOpen(false)}
        onConfirm={handleLogout}
      />
    </nav>
  );
};

export default Navbar;
