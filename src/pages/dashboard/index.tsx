import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/sidebar';
import { useSnackbar } from '@/components/snackbar/SnackbarProvider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Download,
  X,
  MoreVertical,
  Link as LinkIcon,
  Pencil,
  Trash2,
  Share2,
  FolderOpen,

  Users,
  Search,
  ChevronDown,
} from 'lucide-react';
import mammoth from 'mammoth';
import { ChevronRight, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import * as XLSX from 'xlsx';
import { decryptToken } from '@/utils/crypto';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';

const FOLDER_MIME = 'application/vnd.google-apps.folder';

type TabType = 'mydrive' | 'shared';

// File type constants for better maintainability
const FILE_TYPES = {
  FOLDER: 'application/vnd.google-apps.folder',
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  XLS: 'application/vnd.ms-excel',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  PPT: 'application/vnd.ms-powerpoint',
  CSV: 'text/csv',
  PLAIN_TEXT: 'text/plain',
  GOOGLE_DOC: 'application/vnd.google-apps.document',
  GOOGLE_SHEET: 'application/vnd.google-apps.spreadsheet',
  GOOGLE_SLIDE: 'application/vnd.google-apps.presentation',
} as const;

// Custom hook for file preview functionality
const useFilePreview = () => {
  const [previewFile, setPreviewFile] = useState<any | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const resetPreview = () => {
    setPreviewFile(null);
    setPreviewContent(null);
    setPreviewType('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setPreviewError(null);
    setPreviewLoading(false);
  };

  return {
    previewFile,
    setPreviewFile,
    previewContent,
    setPreviewContent,
    previewType,
    setPreviewType,
    previewUrl,
    setPreviewUrl,
    previewError,
    setPreviewError,
    previewLoading,
    setPreviewLoading,
    resetPreview,
  };
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [nextPageToken, setNextPageToken] = useState<string | number | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [parentStack, setParentStack] = useState<string[]>([]);
  const [folderNames, setFolderNames] = useState<{ [id: string]: string }>({
    root: 'My Drive',
  });
  const [activeTab, setActiveTab] = useState<TabType>('mydrive');
  // Add state for loading/feedback

  const [loadingMore, setLoadingMore] = useState(false);
  const { showSnackbar } = useSnackbar();

  // Use the custom hook for preview functionality
  const {
    previewFile,
    setPreviewFile,
    previewContent,
    setPreviewContent,
    previewType,
    setPreviewType,
    previewUrl,
    setPreviewUrl,
    previewError,
    setPreviewError,
    previewLoading,
    setPreviewLoading,
    resetPreview,
  } = useFilePreview();

  // Share modal state
  const [shareFile, setShareFile] = useState<any | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState('reader');

  // Enhanced file type detection
  const isSpreadsheetFile = (file: any): boolean => {
    const mime = file.mimeType;
    const ext = getFileExtension(file.name);
    return (
      mime === FILE_TYPES.XLSX ||
      mime === FILE_TYPES.XLS ||
      mime === FILE_TYPES.GOOGLE_SHEET ||
      mime === FILE_TYPES.CSV ||
      ext === 'xlsx' ||
      ext === 'xls' ||
      ext === 'csv'
    );
  };

  // Check if file can be previewed
  const canPreviewFile = (file: any): boolean => {
    const mime = file.mimeType;

    // Images
    if (mime.startsWith('image/')) return true;

    // PDFs
    if (mime === FILE_TYPES.PDF) return true;

    // Documents
    if (isDocumentFile(file)) return true;

    // Spreadsheets
    if (isSpreadsheetFile(file)) return true;

    // Presentations (only Google Slides)
    if (mime === FILE_TYPES.GOOGLE_SLIDE) return true;

    // Media files
    if (mime.startsWith('video/') || mime.startsWith('audio/')) return true;

    // Text files
    if (mime === FILE_TYPES.PLAIN_TEXT) return true;

    // Google Docs
    if (mime === FILE_TYPES.GOOGLE_DOC) return true;

    return false;
  };

  const isPresentationFile = (file: any): boolean => {
    const mime = file.mimeType;
    const ext = getFileExtension(file.name);
    return (
      mime === FILE_TYPES.PPTX ||
      mime === FILE_TYPES.PPT ||
      mime === FILE_TYPES.GOOGLE_SLIDE ||
      ext === 'pptx' ||
      ext === 'ppt'
    );
  };

  const isDocumentFile = (file: any): boolean => {
    const mime = file.mimeType;
    const ext = getFileExtension(file.name);
    return (
      mime === FILE_TYPES.DOCX ||
      mime === FILE_TYPES.GOOGLE_DOC ||
      ext === 'docx' ||
      ext === 'doc'
    );
  };

  // Enhanced CSV to Table with better styling
  function csvToTable(csv: string) {
    try {
      const rows = csv.split('\n').filter(Boolean);
      const cells = rows.map((row) =>
        row.split(',').map((cell) => cell.trim()),
      );

      if (cells.length === 0) {
        return (
          <div className="text-center text-gray-500 p-8">Empty CSV file</div>
        );
      }

      return (
        <div className="overflow-auto w-full h-full">
          <table className="min-w-full text-sm border border-gray-200 bg-white">
            <tbody>
              {cells.map((row, i) => (
                <tr
                  key={i}
                  className={
                    i === 0 ? 'font-bold bg-gray-50' : 'hover:bg-gray-50'
                  }
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="border border-gray-200 px-4 py-3 text-left"
                    >
                      {cell || '\u00A0'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } catch (error) {
      return (
        <div className="text-center text-red-500 p-8">
          Error parsing CSV file
        </div>
      );
    }
  }

  // Enhanced XLSX to Table with better styling
  function xlsxToTable(workbook: XLSX.WorkBook) {
    try {
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        return (
          <div className="text-center text-gray-500 p-8">Empty spreadsheet</div>
        );
      }

      return (
        <div className="overflow-auto w-full h-full">
          <table className="min-w-full text-sm border border-gray-200 bg-white">
            <tbody>
              {jsonData.map((row: any, i) => (
                <tr
                  key={i}
                  className={
                    i === 0 ? 'font-bold bg-gray-50' : 'hover:bg-gray-50'
                  }
                >
                  {Array.isArray(row) ? (
                    row.map((cell: any, j) => (
                      <td
                        key={j}
                        className="border border-gray-200 px-4 py-3 text-left"
                      >
                        {cell !== undefined && cell !== null
                          ? String(cell)
                          : '\u00A0'}
                      </td>
                    ))
                  ) : (
                    <td className="border border-gray-200 px-4 py-3 text-left">
                      {JSON.stringify(row)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } catch (error) {
      return (
        <div className="text-center text-red-500 p-8">
          Error parsing spreadsheet
        </div>
      );
    }
  }

  // Share handler
  const handleShare = async () => {
    if (!shareFile || !shareEmail) return;
    const encrypted = localStorage.getItem('googleAccessToken');
    const googleToken = encrypted ? decryptToken(encrypted) : null;
    if (!googleToken) {
      showSnackbar('Authentication required to share file.', 'error');
      return;
    }
    try {
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${shareFile.id}/permissions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${googleToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: shareRole,
            type: 'user',
            emailAddress: shareEmail,
          }),
        },
      );
      if (!res.ok) throw new Error('Failed to share file');
      showSnackbar('Access granted successfully!', 'success');
      setShareFile(null);
      setShareEmail('');
    } catch (err: any) {
      showSnackbar('Failed to share file: ' + err.message, 'error');
    }
  };

  const FILE_TYPE_FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Documents', value: 'documents' },
    { label: 'Spreadsheets', value: 'spreadsheets' },
    { label: 'Presentations', value: 'presentations' },
    { label: 'Images', value: 'images' },
    { label: 'Videos', value: 'videos' },
    { label: 'Audio', value: 'audio' },
    { label: 'PDFs', value: 'pdfs' },
    { label: 'Archives', value: 'archives' },
    { label: 'Folders', value: 'folders' },
  ];

  const getFileTypeCategory = (file: any) => {
    const mime = file.mimeType;
    const ext = getFileExtension(file.name);
    if (mime === FOLDER_MIME) return 'folders';
    if (mime.startsWith('image/')) return 'images';
    if (mime.startsWith('video/')) return 'videos';
    if (mime.startsWith('audio/')) return 'audio';
    if (mime === 'application/pdf') return 'pdfs';
    if (isDocumentFile(file)) return 'documents';
    if (isSpreadsheetFile(file)) return 'spreadsheets';
    if (isPresentationFile(file)) return 'presentations';
    if (
      [
        'zip',
        'rar',
        '7z',
        'tar',
        'gz',
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/x-tar',
        'application/gzip',
      ].includes(ext) ||
      mime.includes('zip') ||
      mime.includes('rar') ||
      mime.includes('tar') ||
      mime.includes('gzip')
    )
      return 'archives';
    return 'other';
  };

  const [fileTypeFilter, setFileTypeFilter] = useState('all');

  // Define filteredFiles for search filtering
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(search.toLowerCase());
    if (fileTypeFilter === 'all') return matchesSearch;
    return matchesSearch && getFileTypeCategory(file) === fileTypeFilter;
  });

  const itemsPerPage = 20;
  // User info from localStorage
  const userInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || '{}');
    } catch {
      return {};
    }
  })();

  // Logout confirmation state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Header: logout logic
  const handleLogout = () => {
    localStorage.removeItem('googleAccessToken');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  useEffect(() => {
    const encrypted = localStorage.getItem('googleAccessToken');
    const googleToken = encrypted ? decryptToken(encrypted) : null;
    if (!googleToken) {
      navigate('/login', { replace: true });
      return;
    }
    if (activeTab === 'mydrive') {
      fetchDriveFiles(googleToken, currentPage, true, currentFolder);
    } else if (activeTab === 'shared') {
      if (currentFolder === 'root') {
        fetchSharedWithMeFiles(googleToken, currentPage, true, 'root');
      } else {
        fetchDriveFiles(googleToken, currentPage, true, currentFolder);
      }
    }
    // eslint-disable-next-line
  }, [navigate, currentFolder, activeTab, currentPage]);

  async function fetchDriveFiles(
    accessToken: string,
    page: number = 1,
    initial = false,
    folderId: string = 'root',
  ) {
    try {
      if (initial) setLoading(true);
      let url = `https://www.googleapis.com/drive/v3/files?pageSize=${itemsPerPage}&fields=nextPageToken,files(id,name,mimeType,thumbnailLink,webViewLink,parents,shared,owners)`;
      url += `&q='${folderId}' in parents and trashed=false`;
      if (page > 1 && nextPageToken) url += `&pageToken=${nextPageToken}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      setFiles(initial ? data.files || [] : [...files, ...(data.files || [])]);
      setNextPageToken(data.nextPageToken || null);
      setTotalPages(
        typeof nextPageToken === 'string' ? currentPage + 1 : currentPage,
      );
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch Google Drive files');
      setLoading(false);
    }
  }
  // Update fetchSharedWithMeFiles to accept parentFolderId
  async function fetchSharedWithMeFiles(
    accessToken: string,
    page: number = 1,
    initial = false,
    parentFolderId: string | null = null,
  ) {
    try {
      if (initial) setLoading(true);
      let url = `https://www.googleapis.com/drive/v3/files?pageSize=${itemsPerPage}&fields=nextPageToken,files(id,name,mimeType,thumbnailLink,webViewLink,parents,shared,owners)`;
      if (parentFolderId && parentFolderId !== 'root') {
        url += `&q=sharedWithMe=true and trashed=false and '${parentFolderId}' in parents`;
      } else {
        url += `&q=sharedWithMe=true and trashed=false`;
      }
      if (page > 1 && nextPageToken) url += `&pageToken=${nextPageToken}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      setFiles(initial ? data.files || [] : [...files, ...(data.files || [])]);
      setNextPageToken(data.nextPageToken || null);
      setTotalPages(
        typeof nextPageToken === 'string' ? currentPage + 1 : currentPage,
      );
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch shared files');
      setLoading(false);
    }
  }

  function getFileExtension(fileName: string): string {
    if (!fileName.includes('.')) return '';
    return fileName.split('.').pop()?.toLowerCase() || '';
  }

  function getFileIcon(file: any): string {
    const mimeType = file.mimeType;
    const extension = getFileExtension(file.name);

    // Google Drive style icons using emojis that closely match their design
    if (mimeType === FOLDER_MIME) return '📁';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';

    const extensionIcons: { [key: string]: string } = {
      // Documents
      doc: '📝',
      docx: '📝',
      // Spreadsheets
      xls: '📊',
      xlsx: '📊',
      csv: '📊',
      // Presentations
      ppt: '📽️',
      pptx: '📽️',
      // Text files
      txt: '📜',
      // Archives
      zip: '📦',
      rar: '📦',
      '7z': '📦',
      tar: '📦',
      gz: '📦',
      // Images
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      svg: '🖼️',
      webp: '🖼️',
      // Audio
      mp3: '🎵',
      wav: '🎵',
      flac: '🎵',
      aac: '🎵',
      // Video
      mp4: '🎬',
      mov: '🎬',
      avi: '🎬',
      mkv: '🎬',
      webm: '🎬',
      // Other
      pdf: '📄',
      json: '📄',
      xml: '📄',
      html: '📄',
      css: '📄',
      js: '📄',
      ts: '📄',
      py: '📄',
      java: '📄',
      cpp: '📄',
      c: '📄',
      php: '📄',
      rb: '📄',
      go: '📄',
      rs: '📄',
      swift: '📄',
      kt: '📄',
    };

    return extensionIcons[extension] || '📄';
  }

  function formatFileType(file: any): string {
    const mimeType = file.mimeType;
    const extension = getFileExtension(file.name);

    if (mimeType === FOLDER_MIME) return 'Folder';

    const extensionTypes: { [key: string]: string } = {
      doc: 'Word Document',
      docx: 'Word Document',
      xls: 'Excel Spreadsheet',
      xlsx: 'Excel Spreadsheet',
      csv: 'CSV File',
      ppt: 'PowerPoint Presentation',
      pptx: 'PowerPoint Presentation',
      txt: 'Text File',
      zip: 'ZIP Archive',
      rar: 'RAR Archive',
      jpg: 'JPEG Image',
      jpeg: 'JPEG Image',
      png: 'PNG Image',
      gif: 'GIF Image',
      mp3: 'MP3 Audio',
      wav: 'WAV Audio',
      mp4: 'MP4 Video',
      mov: 'MOV Video',
      pdf: 'PDF Document',
    };

    return (
      extensionTypes[extension] ||
      mimeType.split('/').pop()?.toUpperCase() ||
      'File'
    );
  }

  // Enhanced preview logic with comprehensive file type support
  const handlePreview = async (file: any) => {
    setPreviewFile(file);
    setPreviewContent(null);
    setPreviewType(file.mimeType);
    setPreviewUrl('');
    setPreviewError(null);
    setPreviewLoading(true);

    const encrypted = localStorage.getItem('googleAccessToken');
    const googleToken = encrypted ? decryptToken(encrypted) : '';
    if (!googleToken) {
      setPreviewError('Authentication required');
      setPreviewLoading(false);
      return;
    }

    // Check if file can be previewed
    if (!canPreviewFile(file)) {
      setPreviewError(
        'This file type cannot be previewed. Please download the file to view it.',
      );
      setPreviewLoading(false);
      return;
    }

    try {
      // Google Docs and DOCX: use Google Docs embedded viewer
      if (
        file.mimeType === FILE_TYPES.GOOGLE_DOC ||
        file.mimeType === FILE_TYPES.DOCX ||
        file.name.endsWith('.docx') ||
        file.mimeType === 'application/msword'
      ) {
        setPreviewUrl(`https://docs.google.com/document/d/${file.id}/preview`);
        setPreviewType('gdoc-embed');
        setPreviewContent(null);
        setPreviewLoading(false);
        return;
      }
      // Google Slides and PPT/PPTX: use Google Slides embedded viewer
      else if (
        file.mimeType === FILE_TYPES.GOOGLE_SLIDE ||
        file.mimeType === FILE_TYPES.PPTX ||
        file.name.endsWith('.pptx') ||
        file.mimeType === FILE_TYPES.PPT ||
        file.name.endsWith('.ppt')
      ) {
        setPreviewUrl(`https://docs.google.com/presentation/d/${file.id}/preview`);
        setPreviewType('gslides-embed');
        setPreviewContent(null);
        setPreviewLoading(false);
        return;
      }
      // PDF: use iframe
      else if (file.mimeType === FILE_TYPES.PDF || file.name.endsWith('.pdf')) {
        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          {
            headers: { Authorization: 'Bearer ' + googleToken },
          },
        );
        if (!res.ok) throw new Error('Preview not allowed or file not found.');
        const blob = await res.blob();
        setPreviewUrl(URL.createObjectURL(blob));
        setPreviewType('pdf-iframe');
        setPreviewContent(null);
        setPreviewLoading(false);
        return;
      }
      // Image files
      if (file.mimeType.startsWith('image/')) {
        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          {
            headers: { Authorization: 'Bearer ' + googleToken },
          },
        );
        if (!res.ok) throw new Error('Preview not allowed or file not found.');
        const blob = await res.blob();
        setPreviewUrl(URL.createObjectURL(blob));
      }
      // Spreadsheet files (XLSX, XLS, CSV)
      else if (isSpreadsheetFile(file)) {
        if (file.mimeType === FILE_TYPES.CSV || file.name.endsWith('.csv')) {
          // Handle CSV files
        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          {
            headers: { Authorization: 'Bearer ' + googleToken },
          },
        );
          if (!res.ok)
            throw new Error('Preview not allowed or file not found.');
          const text = await res.text();
          setPreviewContent(text);
          setPreviewType('text/csv');
        } else if (file.mimeType === FILE_TYPES.GOOGLE_SHEET) {
          // Handle Google Sheets
          const res = await fetch(
            `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/csv`,
            {
              headers: { Authorization: 'Bearer ' + googleToken },
            },
          );
          if (!res.ok)
            throw new Error('Preview not allowed or file not found.');
          const text = await res.text();
          setPreviewContent(text);
          setPreviewType('text/csv');
        } else {
          // Handle Excel files (XLSX, XLS)
          const res = await fetch(
            `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
            {
              headers: { Authorization: 'Bearer ' + googleToken },
            },
          );
          if (!res.ok)
            throw new Error('Preview not allowed or file not found.');
          const blob = await res.blob();
          const arrayBuffer = await blob.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          setPreviewContent(JSON.stringify(workbook));
          setPreviewType('xlsx');
        }
      }
      // Presentation files (PPTX, PPT)
      else if (isPresentationFile(file)) {
        if (file.mimeType === FILE_TYPES.GOOGLE_SLIDE) {
          // Handle Google Slides
          const res = await fetch(
            `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application/pdf`,
            {
              headers: { Authorization: 'Bearer ' + googleToken },
            },
          );
          if (!res.ok)
            throw new Error('Preview not allowed or file not found.');
        const blob = await res.blob();
        setPreviewUrl(URL.createObjectURL(blob));
          setPreviewType('application/pdf');
        } else {
          // For PowerPoint files, we'll show a message that they need to be downloaded
          setPreviewContent(null);
          setPreviewError(
            'PowerPoint files (.ppt/.pptx) cannot be previewed directly. Please download the file to view it.',
          );
        }
      }
      // Video files
      else if (file.mimeType.startsWith('video/')) {
        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          {
            headers: { Authorization: 'Bearer ' + googleToken },
          },
        );
        if (!res.ok) throw new Error('Preview not allowed or file not found.');
        const blob = await res.blob();
        setPreviewUrl(URL.createObjectURL(blob));
      }
      // Audio files
      else if (file.mimeType.startsWith('audio/')) {
        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          {
            headers: { Authorization: 'Bearer ' + googleToken },
          },
        );
        if (!res.ok) throw new Error('Preview not allowed or file not found.');
        const blob = await res.blob();
        setPreviewUrl(URL.createObjectURL(blob));
      }
      // Text files
      else if (file.mimeType === FILE_TYPES.PLAIN_TEXT) {
        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          {
            headers: { Authorization: 'Bearer ' + googleToken },
          },
        );
        if (!res.ok) throw new Error('Preview not allowed or file not found.');
        const text = await res.text();
        setPreviewContent(text);
      }
      // Google Docs: always preview using Google Docs embedded viewer
      else if (file.mimeType === FILE_TYPES.GOOGLE_DOC) {
        setPreviewUrl(`https://docs.google.com/document/d/${file.id}/preview`);
        setPreviewType('gdoc-embed');
        setPreviewContent(null);
        setPreviewLoading(false);
        return;
      }
      // DOCX: preview as PDF if possible (future: use docx-preview for better fidelity)
      else if (
        file.mimeType === FILE_TYPES.DOCX ||
        file.name.endsWith('.docx')
      ) {
        // Try to preview as PDF if available (for Google Drive exported files)
        // Otherwise, fallback to mammoth or docx-preview in the future
        setPreviewError('Preview as PDF is not available for this DOCX file. Download to view.');
        setPreviewLoading(false);
        return;
      }
      // Unsupported file types
      else {
        setPreviewContent(null);
        setPreviewError(
          'No preview available for this file type. Please download the file to view it.',
        );
      }
    } catch (e: any) {
      setPreviewContent(null);
      setPreviewError(
        e.message || 'Preview failed. Please try again or download the file.',
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  // Reusable Loading Spinner Component
  const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-blue-600 mb-4"></div>
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  );

  // Reusable Preview Content Component
  const PreviewContent = ({
    file,
    previewType,
    previewContent,
    previewUrl,
    previewError,
    previewLoading,
  }: {
    file: any;
    previewType: string;
    previewContent: string | null;
    previewUrl: string;
    previewError: string | null;
    previewLoading: boolean;
  }) => {
    if (previewLoading) {
      return <LoadingSpinner message="Loading preview..." />;
    }

    if (previewError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'calibri, tahoma, verdana, arial, sans serif', color: '#444' }}>
            We can't process this request
          </h2>
          <p className="text-gray-600 mb-4" style={{ fontFamily: 'calibri, tahoma, verdana, arial, sans serif', color: '#444' }}>
            We're sorry, but for some reason we can't open this for you.<br />
            {previewError}
          </p>
          <a
            href="https://support.microsoft.com/en-us/office/file-types-supported-by-office-for-the-web-f0d8d31c-67c5-4f0b-8b3d-51e1a0b7b2fa"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
            style={{ fontFamily: 'calibri, tahoma, verdana, arial, sans serif', fontSize: '10pt', paddingTop: '1em' }}
          >
            Learn more
          </a>
        </div>
      );
    }

    // Render different content based on preview type
    if (previewType === 'docx' && previewContent) {
      return (
        <div className="w-full h-full overflow-auto p-6">
          <div
            className="prose max-w-none bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </div>
      );
    }

    if (previewType === 'xlsx' && previewContent) {
      return (
        <div className="w-full h-full overflow-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {xlsxToTable(JSON.parse(previewContent))}
          </div>
        </div>
      );
    }

    if (previewType === 'text/csv' && previewContent) {
      return (
        <div className="w-full h-full overflow-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {csvToTable(previewContent)}
          </div>
        </div>
      );
    }

    // For DOCX, PDF, and other supported formats
    if ((previewType === 'application/pdf' || previewType === 'docx' || previewType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || previewType === 'application/msword') && previewUrl) {
      const documents = [
        {
          uri: previewUrl,
          fileType: previewType === 'docx' ? 'docx' : previewType.split('/').pop(),
          fileName: previewFile?.name || 'Document',
        },
      ];
    
      return (
        <div className="w-full h-full">
          <DocViewer documents={documents} pluginRenderers={DocViewerRenderers} />
        </div>
      );
    }

    if (previewType?.startsWith('image/') && previewUrl) {
      return (
        <div className="flex items-center justify-center h-full p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <img
              src={previewUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      );
    }

    if (previewType?.startsWith('video/') && previewUrl) {
      return (
        <div className="flex items-center justify-center h-full p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <video
              src={previewUrl}
              controls
              className="max-w-full max-h-full rounded-lg"
              autoPlay={false}
            />
          </div>
        </div>
      );
    }

    if (previewType?.startsWith('audio/') && previewUrl) {
      return (
        <div className="flex items-center justify-center h-full p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full max-w-md">
            <audio src={previewUrl} controls className="w-full" />
          </div>
        </div>
      );
    }

    if (previewType === 'text/plain' && previewContent) {
      return (
        <div className="w-full h-full overflow-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-6 text-gray-700 w-full h-full overflow-auto">
              {previewContent}
            </pre>
          </div>
        </div>
      );
    }

    if (previewType === 'gdoc-embed' && previewUrl && previewFile) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center">
          
          <iframe
            src={previewUrl}
            title="Google Docs Preview"
            className="w-full h-[70vh] min-h-[400px] rounded border bg-white"
            allow="autoplay"
          />
          <div className="text-xs text-gray-500 mt-2 text-center">
            If you see a permission error, make sure the file is shared with your Google account or is public.<br />
            <a
              href={`https://docs.google.com/document/d/${previewFile.id}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline mt-2 inline-block"
            >
              Open in Google Docs
            </a>
          </div>
        </div>
      );
    }
    if (previewType === 'gslides-embed' && previewUrl && previewFile) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <iframe
            src={previewUrl}
            title="Google Slides Preview"
            className="w-full h-[70vh] min-h-[400px] rounded border bg-white"
            allow="autoplay"
          />
          <div className="text-xs text-gray-500 mt-2 text-center">
            If you see a permission error, make sure the file is shared with your Google account or is public.<br />
            <a
              href={`https://docs.google.com/presentation/d/${previewFile.id}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline mt-2 inline-block"
            >
              Open in Google Slides
            </a>
          </div>
        </div>
      );
    }
    if (previewType === 'pdf-iframe' && previewUrl) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <iframe
            src={previewUrl}
            title="PDF Preview"
            className="w-full h-[70vh] min-h-[400px] rounded border bg-white"
            allow="autoplay"
          />
        </div>
      );
    }

    if (previewUrl) {
      return (
        <div className="flex items-center justify-center h-full">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline text-lg hover:text-blue-800"
          >
            Open File in New Tab
          </a>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-gray-500 mb-6">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium mb-2">No Preview Available</p>
          <p className="text-sm mb-6 max-w-md">
            This file type cannot be previewed directly.
          </p>
        </div>
        <Button
          onClick={() =>
            downloadFileWithToken(
              file,
              localStorage.getItem('googleAccessToken')!,
            )
          }
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download File
        </Button>
      </div>
    );
  };

  // Compact Preview Modal Component
  const PreviewModal = ({
    file,
    onClose,
  }: {
    file: any;
    onClose: () => void;
  }) => {
    // Keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
        if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          downloadFileWithToken(
            file,
            localStorage.getItem('googleAccessToken')!,
          );
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [file, onClose]);

    return (
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getFileIcon(file)}</span>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {file.name}
                </h2>
                <p className="text-sm text-gray-500">{formatFileType(file)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 mr-2">
                <span className="hidden sm:inline">Press </span>
                <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">
                  Esc
                </kbd>
                <span className="hidden sm:inline"> to close, </span>
                <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">
                  Ctrl+D
                </kbd>
                <span className="hidden sm:inline"> to download</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadFileWithToken(
                    file,
                    localStorage.getItem('googleAccessToken')!,
                  )
                }
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Close
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden bg-white">
            <PreviewContent
              file={file}
              previewType={previewType}
              previewContent={previewContent}
              previewUrl={previewUrl}
              previewError={previewError}
              previewLoading={previewLoading}
            />
          </div>
        </div>
      </div>
    );
  };

  // Improved download logic
  async function downloadFileWithToken(file: any, accessToken: string) {
    if (!accessToken) {
      showSnackbar('Authentication required to download file.', 'error');
      return;
    }
    let url = '';
    let fileName = file.name;
    if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
      url = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
      fileName += '.xlsx';
    } else if (file.mimeType === 'application/vnd.google-apps.document') {
      url = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application/pdf`;
      fileName += '.pdf';
    } else if (file.mimeType === 'application/vnd.google-apps.presentation') {
      url = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application/pdf`;
      fileName += '.pdf';
    } else {
      url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
    }
    try {
      const decryptTc = decryptToken(accessToken);
      const res = await fetch(url, {
        headers: { Authorization: 'Bearer ' + decryptTc },
      });
      if (res.status === 403) {
        showSnackbar(
          'Download forbidden: You may not have access to this file, or your session has expired. Try re-authenticating.',
          'error',
        );
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      const blob = await res.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlBlob);
      showSnackbar('Download started!', 'success');
    } catch (err: any) {
      showSnackbar('Download failed: ' + err.message, 'error');
    }
  }

  const handleClosePreview = () => {
    resetPreview();
  };

  const handleOpenFolder = (folder: any) => {
    setParentStack((prev) => [...prev, currentFolder]);
    setCurrentFolder(folder.id);
    setFolderNames((prev) => ({ ...prev, [folder.id]: folder.name }));
    setCurrentPage(1);
  };

  const handleBack = () => {
    if (parentStack.length > 0) {
      const prevStack = [...parentStack];
      const parentId = prevStack.pop() || 'root';
      setParentStack(prevStack);
      setCurrentFolder(parentId);
      setCurrentPage(1);
    }
  };

  const currentFolderName = folderNames[currentFolder] || 'My Drive';

  // Create new folder in current folder
  // const handleCreateFolder = async () => {
  //   const folderName = prompt('Enter folder name:');
  //   if (!folderName) return;
  //   setCreatingFolder(true);
  //   const googleToken = localStorage.getItem('googleAccessToken');
  //   if (!googleToken) return;
  //   try {
  //     const res = await fetch('https://www.googleapis.com/drive/v3/files', {
  //       method: 'POST',
  //       headers: {
  //         Authorization: `Bearer ${googleToken}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         name: folderName,
  //         mimeType: FOLDER_MIME,
  //         parents: [currentFolder],
  //       }),
  //     });
  //     if (!res.ok) throw new Error('Failed to create folder');
  //     setCreatingFolder(false);
  //     showSnackbar('Folder created successfully!', 'success');
  //     fetchDriveFiles(googleToken, '', true, currentFolder);
  //   } catch (err: any) {
  //     setCreatingFolder(false);
  //     showSnackbar('Failed to create folder: ' + err.message, 'error');
  //   }
  // };

  // // // Upload file to current folder
  // const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   setUploadingFile(true);
  //   const googleToken = localStorage.getItem('googleAccessToken');
  //   if (!googleToken) return;
  //   try {
  //     // Step 1: Get upload URL
  //     const metadata = {
  //       name: file.name,
  //       parents: [currentFolder],
  //     };
  //     const form = new FormData();
  //     form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  //     form.append('file', file);
  //     const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
  //       method: 'POST',
  //       headers: {
  //         Authorization: `Bearer ${googleToken}`,
  //       },
  //       body: form,
  //     });
  //     if (!res.ok) throw new Error('Failed to upload file');
  //     setUploadingFile(false);
  //     showSnackbar('File uploaded successfully!', 'success');
  //     // Refresh file list
  //     fetchDriveFiles(googleToken, '', true, currentFolder);
  //   } catch (err: any) {
  //     setUploadingFile(false);
  //     showSnackbar('Failed to upload file: ' + err.message, 'error');
  //   }
  // };

  // Suggested Folders Section (horizontal scroll, Google Drive style)
  const suggestedFolders = filteredFiles.filter(
    (file) =>
      file.mimeType === FOLDER_MIME && (file.shared || file.owners?.length > 1),
  );

  // Add state for modals
  const [renameFile, setRenameFile] = useState<any | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteFile, setDeleteFile] = useState<any | null>(null);
  const [moveFile, setMoveFile] = useState<any | null>(null);
  const [moveTarget, setMoveTarget] = useState('');

  // Helper: Get all folders for move dropdown
  const allFolders = files.filter(f => f.mimeType === FOLDER_MIME);

  // Rename handler
  async function handleRename() {
    if (!renameFile || !renameValue.trim()) return;
    const encrypted = localStorage.getItem('googleAccessToken');
    const googleToken = encrypted ? decryptToken(encrypted) : '';
    if (!googleToken) {
      showSnackbar('Authentication required.', 'error');
      return;
    }
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${renameFile.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer ' + googleToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      if (!res.ok) throw new Error('Failed to rename');
      setRenameFile(null);
      setRenameValue('');
      showSnackbar('Renamed successfully!', 'success');
      // Refresh
      if (activeTab === 'mydrive') {
        fetchDriveFiles(googleToken, currentPage, true, currentFolder);
      } else {
        fetchSharedWithMeFiles(googleToken, currentPage, true, currentFolder);
      }
    } catch (err: any) {
      showSnackbar('Rename failed: ' + err.message, 'error');
    }
  }

  // Delete handler
  async function handleDelete() {
    if (!deleteFile) return;
    const encrypted = localStorage.getItem('googleAccessToken');
    const googleToken = encrypted ? decryptToken(encrypted) : '';
    if (!googleToken) {
      showSnackbar('Authentication required.', 'error');
      return;
    }
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${deleteFile.id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + googleToken },
      });
      if (!res.ok) throw new Error('Failed to delete');
      setDeleteFile(null);
      showSnackbar('Deleted successfully!', 'success');
      // Refresh
      if (activeTab === 'mydrive') {
        fetchDriveFiles(googleToken, currentPage, true, currentFolder);
      } else {
        fetchSharedWithMeFiles(googleToken, currentPage, true, currentFolder);
      }
    } catch (err: any) {
      showSnackbar('Delete failed: ' + err.message, 'error');
    }
  }

  // Move handler
  async function handleMove() {
    if (!moveFile || !moveTarget) return;
    const encrypted = localStorage.getItem('googleAccessToken');
    const googleToken = encrypted ? decryptToken(encrypted) : '';
    if (!googleToken) {
      showSnackbar('Authentication required.', 'error');
      return;
    }
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${moveFile.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer ' + googleToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parents: [moveTarget] }),
      });
      if (!res.ok) throw new Error('Failed to move');
      setMoveFile(null);
      setMoveTarget('');
      showSnackbar('Moved successfully!', 'success');
      // Refresh
      if (activeTab === 'mydrive') {
        fetchDriveFiles(googleToken, currentPage, true, currentFolder);
      } else {
        fetchSharedWithMeFiles(googleToken, currentPage, true, currentFolder);
      }
    } catch (err: any) {
      showSnackbar('Move failed: ' + err.message, 'error');
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setCurrentFolder={setCurrentFolder}
        setParentStack={setParentStack}
        setCurrentPage={setCurrentPage}
      />

      {/* Main Content */}
      <div className="flex-1 h-[100vh] overflow-y-scroll">
        <main className="p-4 pt-6 w-full">
          {/* Unified header: Breadcrumbs, Search, Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 w-full">
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-gray-600 gap-1 flex-wrap min-w-0 flex-1 mb-2 sm:mb-0">
              <button
                className="hover:underline font-medium text-blue-600"
                onClick={() => {
                  setCurrentFolder('root');
                  setParentStack([]);
                }}
                disabled={currentFolder === 'root'}
              >
                My Drive
              </button>
              {parentStack.map((folderId, idx) => (
                <span key={folderId} className="flex items-center">
                  <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                  <button
                    className="hover:underline text-blue-600"
                    onClick={() => {
                      setCurrentFolder(folderId);
                      setParentStack(parentStack.slice(0, idx));
                    }}
                  >
                    {folderNames[folderId] || 'Folder'}
                  </button>
                </span>
              ))}
              {currentFolder !== 'root' && (
                <span className="flex items-center">
                  <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                  <span className="font-semibold text-gray-800 truncate max-w-[120px] md:max-w-[200px]">
                    {folderNames[currentFolder] || 'My Drive'}
                  </span>
                </span>
              )}
            </nav>
            {/* Google Drive-style Search Bar */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-full sm:max-w-2xl">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search in Drive"
                  className="w-full pl-12 pr-12 py-2.5 rounded-full border border-gray-200 bg-white text-gray-800 placeholder-gray-400 shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                  aria-label="Search files and folders"
                />
                {search && (
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                    tabIndex={0}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            {/* Google Drive-style Filter Dropdown */}
            <div className="flex items-center sm:ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  >
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="hidden sm:inline">{FILE_TYPE_FILTERS.find(f => f.value === fileTypeFilter)?.label || 'All'}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  {FILE_TYPE_FILTERS.map(opt => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => setFileTypeFilter(opt.value)}
                      className={fileTypeFilter === opt.value ? 'bg-blue-50 text-blue-700 font-semibold' : ''}
                    >
                    {opt.label}
                    </DropdownMenuItem>
                ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {/* Loading State */}
          {loading ? (
            <div className="py-16">
              <LoadingSpinner message="Loading your Google Drive files..." />
            </div>
          ) : error ? (
            <div
              className={cn(
                'bg-red-50 border-l-4 border-red-500 p-4 rounded-md max-w-2xl shadow-sm',
              )}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-16">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                No files found
              </h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your search or filter
              </p>
            </div>
          ) : (
            <>
              {/* Only show suggested folders in root */}
              {currentFolder === 'root' && suggestedFolders.length > 0 && (
                <section className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold text-lg text-gray-800">
                      Suggested folders
                    </span>
                  </div>
                  <div className="flex flex-wrap overflow-x-auto pb-2 hide-scrollbar w-full min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      {suggestedFolders.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center bg-gray-100 hover:bg-gray-200 rounded-2xl px-3 py-2 shadow-sm transition cursor-pointer relative"
                          onClick={() => {
                            setParentStack((prev) => [...prev, currentFolder]);
                            setCurrentFolder(file.id);
                            setFolderNames((prev) => ({
                              ...prev,
                              [file.id]: file.name,
                            }));
                            setCurrentPage(1);
                          }}
                        >
                          {/* Folder Icon with Shared Badge */}
                          <div className="relative mr-4">
                            <div className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center text-white">
                              <span className="text-lg">📁</span>
                            </div>
                            {file.owners?.length > 1 || file.shared ? (
                              <div className="absolute -bottom-1 -right-1 bg-white rounded-full border border-gray-200 p-0.5">
                                <Users className="w-3 h-3 text-gray-500" />
                              </div>
                            ) : null}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate text-base">
                              {file.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {file.owners?.length > 1 || file.shared
                                ? 'In Shared with me'
                                : 'In My Drive'}
                            </div>
                          </div>

                          {/* 3-dots menu */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="ml-2"
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 rounded-full hover:bg-gray-200">
                                  <MoreVertical className="w-4 h-4 text-gray-600" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="min-w-[180px] z-50"
                              >
                                <DropdownMenuItem
                                  onClick={() => handleOpenFolder(file)}
                                >
                                  <FolderOpen className="w-4 h-4 mr-2" /> Open
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setShareFile(file)}
                                >
                                  <Share2 className="w-4 h-4 mr-2" /> Share
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}
              {/* Main grid of files/folders (make more responsive, flex for mobile, grid for desktop) */}
              <div className="flex flex-wrap gap-4">
              {filteredFiles
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage,
                )
                .map((file) => (
                  <div
                    key={file.id}
                      className="w-full sm:w-[48%] lg:w-[32%] flex items-center justify-between px-4 py-3 bg-[#f4f7fb] rounded-xl cursor-pointer hover:shadow-sm transition-all"
                      onClick={() => {
                        if (file.mimeType === FOLDER_MIME) {
                          setParentStack((prev) => [...prev, currentFolder]);
                          setCurrentFolder(file.id);
                          setFolderNames((prev) => ({
                            ...prev,
                            [file.id]: file.name,
                          }));
                          setCurrentPage(1);
                        } else if (canPreviewFile(file)) {
                          handlePreview(file);
                        }
                      }}
                    >
                      {/* Left - Icon and Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-gray-700 flex items-center justify-center text-white">
                          <span className="text-sm">{getFileIcon(file)}</span>
                        </div>
                        <div>
                          <h3
                            className="text-sm font-semibold text-gray-800 truncate max-w-[150px]"
                            title={file.name}
                          >
                            {file.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatFileType(file)}
                          </p>
                        </div>
                      </div>
                      {/* Right - More Options */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative"
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-full hover:bg-gray-200">
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="min-w-[180px] z-50"
                          >
                            {file.mimeType !== FOLDER_MIME &&
                              canPreviewFile(file) && (
                              <DropdownMenuItem
                                onClick={() => handlePreview(file)}
                              >
                                  <FolderOpen className="w-4 h-4 mr-2" />{' '}
                                  Preview
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem
                              onClick={() =>
                                downloadFileWithToken(
                                  file,
                                  localStorage.getItem('googleAccessToken')!,
                                )
                              }
                            >
                              <Download className="w-4 h-4 mr-2" /> Download
                            </DropdownMenuItem>
                            {file.webViewLink && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center"
                                >
                                  <LinkIcon className="w-4 h-4 mr-2" /> Open in
                                  Drive
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled>
                              <Pencil className="w-4 h-4 mr-2" /> Rename (coming
                              soon)
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                              <FolderOpen className="w-4 h-4 mr-2" /> Move
                              (coming soon)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setShareFile(file)}
                            >
                              <Share2 className="w-4 h-4 mr-2" /> Share
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled variant="destructive">
                              <Trash2 className="w-4 h-4 mr-2" /> Remove (coming
                              soon)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </div>
                ))}
            </div>
            </>
          )}

          {/* Pagination: Only show if nextPageToken exists */}
          {nextPageToken && (
            <button
              onClick={() => {
                const encrypted = localStorage.getItem('googleAccessToken');
                const googleToken = encrypted ? decryptToken(encrypted) : null;
                if (activeTab === 'mydrive') {
                  fetchDriveFiles(
                    googleToken!,
                    currentPage + 1,
                    false,
                    currentFolder,
                  );
                } else if (activeTab === 'shared') {
                  fetchSharedWithMeFiles(
                    googleToken!,
                    currentPage + 1,
                    false,
                    currentFolder,
                  );
                }
              }}
              className="mt-6 px-4 py-2 bg-[var(--focus)] text-white rounded hover:bg-[var(--focus)]"
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          )}

          {/* Preview Popup */}
          {previewFile && (
            <PreviewModal file={previewFile} onClose={handleClosePreview} />
          )}
        </main>
      </div>

      {/* Share Modal */}
      {shareFile && (
        // <div className="fixed inset-0 bg-black bg-opacity-10 flex justify-center items-center z-50">
        //   <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        //     <h3 className="text-lg font-semibold mb-2">Share "{shareFile.name}"</h3>
        //     <input
        //       type="email"
        //       placeholder="Email address"
        //       value={shareEmail}
        //       onChange={e => setShareEmail(e.target.value)}
        //       className="w-full mb-2 px-3 py-2 border rounded"
        //     />
        //     <select
        //       value={shareRole}
        //       onChange={e => setShareRole(e.target.value)}
        //       className="w-full mb-2 px-3 py-2 border rounded"
        //     >
        //       <option value="reader">Viewer</option>
        //       <option value="writer">Editor</option>
        //     </select>
        //     <div className="flex gap-2 mt-2">
        //       <button onClick={handleShare} className="px-4 py-2 bg-blue-600 text-white rounded">Share</button>
        //       <button onClick={() => setShareFile(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
        //     </div>
        //   </div>
        // </div>
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setShareFile(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold mb-4">
              Share "{shareFile?.name}"
            </h3>

            {/* Email Field */}
            <div className="mb-3">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Role Selection */}
            <div className="mb-4">
              <Label
                htmlFor="role"
                className="text-sm font-medium text-gray-700"
              >
                Permission
              </Label>
              <select
                id="role"
                value={shareRole}
                onChange={(e) => setShareRole(e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="reader">Viewer</option>
                <option value="writer">Editor</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShareFile(null)}>
                Cancel
              </Button>
              <Button onClick={handleShare}>Share</Button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs text-center">
            <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
            <p className="mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {renameFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs text-center">
            <h3 className="text-lg font-semibold mb-4">Rename</h3>
            <input
              className="w-full border rounded px-3 py-2 mb-4"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3 justify-center">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setRenameFile(null)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={handleRename}>Rename</button>
            </div>
          </div>
        </div>
      )}
      {deleteFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs text-center">
            <h3 className="text-lg font-semibold mb-4">Delete</h3>
            <p className="mb-6">Are you sure you want to delete <span className="font-semibold">{deleteFile.name}</span>?</p>
            <div className="flex gap-3 justify-center">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setDeleteFile(null)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
      {moveFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs text-center">
            <h3 className="text-lg font-semibold mb-4">Move</h3>
            <select
              className="w-full border rounded px-3 py-2 mb-4"
              value={moveTarget}
              onChange={e => setMoveTarget(e.target.value)}
            >
              <option value="">Select folder...</option>
              {allFolders.filter(f => f.id !== moveFile.id).map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <div className="flex gap-3 justify-center">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setMoveFile(null)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={handleMove} disabled={!moveTarget}>Move</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
