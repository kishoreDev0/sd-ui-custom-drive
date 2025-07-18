import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeHttpClient } from '@/axios-setup/axios-interceptor';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearError } from '@/store/slices/authentication/login';
import { loginUser } from '@/store/action/authentication/login';
import googleLogo from '@/assets/googleLogo.png';
import Loader from '../loader/loader';
import { useSnackbar } from '@/components/snackbar/SnackbarProvider';
import { decryptToken } from '@/utils/crypto';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  parents?: string[];
}

interface LoginProps {
  logoSrc?: string;
  logoAlt?: string;
}

const FOLDER_MIME = 'application/vnd.google-apps.folder';

const Login: React.FC<LoginProps> = ({ logoSrc, logoAlt = 'Company Logo' }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { httpClient } = initializeHttpClient();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [parentStack, setParentStack] = useState<string[]>([]);
  const [folderNames, setFolderNames] = useState<{ [id: string]: string }>({
    root: 'My Drive',
  });
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const googleToken = localStorage.getItem('googleAccessToken');
    if (googleToken) {
      navigate('/dashboard');
    }
    dispatch(clearError());
    // eslint-disable-next-line
  }, [navigate, dispatch]);

  async function fetchDriveFiles(
    accessToken: string,
    pageToken: string = '',
    initial = false,
    folderId: string = 'root',
  ) {
    try {
      if (initial) setLoadingFiles(true);
      let url = `https://www.googleapis.com/drive/v3/files?pageSize=20&fields=nextPageToken,files(id,name,mimeType,thumbnailLink,webViewLink,parents)`;
      url += `&q='${folderId}' in parents and trashed=false`;
      if (pageToken) url += `&pageToken=${pageToken}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      setFiles((prev) =>
        initial ? data.files || [] : [...prev, ...(data.files || [])],
      );
    } catch (err) {
      setFileError('Failed to fetch Google Drive files');
      setLoadingFiles(false);
    }
  }

  function getFileIcon(mimeType: string) {
    if (mimeType === FOLDER_MIME) return '📁';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    return '📄';
  }

  function getFilePreview(file: DriveFile) {
    if (file.mimeType === FOLDER_MIME) {
      return <span className="text-3xl">📁</span>;
    }
    if (file.mimeType.startsWith('image/') && file.thumbnailLink) {
      return (
        <img
          src={file.thumbnailLink}
          alt={file.name}
          className="w-12 h-12 object-cover rounded"
        />
      );
    }
    if (file.mimeType === 'application/pdf') {
      return <span className="text-3xl">📄</span>;
    }
    return <span className="text-3xl">{getFileIcon(file.mimeType)}</span>;
  }

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Helper to download a file using fetch + Blob
  async function downloadFileWithToken(
    fileId: string,
    fileName: string,
    accessToken: string,
  ) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      showSnackbar('Download failed: ' + err.message, 'error');
    }
  }

  const handleDownloadAll = () => {
    const encrypted = localStorage.getItem('googleAccessToken');
    const googleToken = encrypted ? decryptToken(encrypted) : null;
    filteredFiles.forEach((file) => {
      if (file.mimeType !== FOLDER_MIME) {
        downloadFileWithToken(file.id, file.name, googleToken!);
      }
    });
  };

  const handleSubmit = async (values: Record<string, string>) => {
    try {
      const result = await dispatch(
        loginUser({
          email: values.email,
          password: values.password,
          api: httpClient,
        }),
      ).unwrap();

      if (result) {
        if (values.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        navigate('/dashboard');
      }
    } catch (err) {
      showSnackbar('Login failed. Please check your credentials.', 'error');
    }
  };

  const encrypted = localStorage.getItem('googleAccessToken');
  const googleToken = encrypted ? decryptToken(encrypted) : null;
  const currentFolderName = folderNames[currentFolder] || 'My Drive';

  return (
    <div className="min-h-screen bg-gradient-to-br bg-white flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-40 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-6xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[400px]">
            {/* Left side - Branding */}
            <div
              className="lg:w-1/2 
            bg-black
            p-12 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

              {/* Header */}
              <div>
                <div className="text-white/70 text-sm font-medium mb-8 tracking-wider uppercase">
                  Cloud Drive Access
                </div>
                {logoSrc && (
                  <div className="mb-8">
                    <img
                      src={logoSrc}
                      alt={logoAlt}
                      className="h-8 w-auto brightness-0 invert"
                    />
                  </div>
                )}
              </div>

              {/* Main content */}
              <div className="flex-1 flex flex-col justify-center">
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Get
                  <br />
                  Everything
                  <br />
                  You Want
                </h1>
                <p className="text-white/80 text-lg mb-8 max-w-sm">
                  You can get everything you want if you work hard, trust the
                  process, and stick to the plan.
                </p>
              </div>

              {/* Footer */}
              <div className="text-white/60 text-sm">
                Secure • Fast • Reliable
              </div>
            </div>

            {/* Right side - Form */}
            <div className="lg:w-1/2 bg-white p-12 flex flex-col justify-center">
              <div className="max-w-sm mx-auto w-full">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        📁
                      </span>
                    </div>
                    <span className="ml-2 text-gray-600 font-medium">
                      Drive
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-gray-600">
                    Enter your email and password to access your account
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                    {error}
                  </div>
                )}

                {/* Google Sign In */}
                {!googleToken && (
                  <button
                    onClick={() => {
                      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
                      const redirectUri =
                        window.location.origin + '/google-auth-success';
                      const scope =
                        'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid';
                      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&include_granted_scopes=true&prompt=consent`;
                      window.location.href = oauthUrl;
                    }}
                    className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <img src={googleLogo} alt="Google" className="w-5 h-5" />
                    <span className="text-gray-700 font-medium">
                      Sign in with Google
                    </span>
                  </button>
                )}

                {/* Footer */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading && <Loader />}
    </div>
  );
};

export default Login;
