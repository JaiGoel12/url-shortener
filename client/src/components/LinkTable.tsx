import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

interface UrlItem {
  id: string;
  originalUrl: string;
  shortCode: string;
  clickCount: number;
  isActive: boolean;
  createdAt: string;
  expiresAt: string | null;
}

interface Props {
  urls: UrlItem[];
  loading: boolean;
  onDelete?: (id: string) => void;
}

export default function LinkTable({ urls, loading, onDelete }: Props) {
  function copyToClipboard(shortCode: string) {
    const url = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(url);
    toast.success('Copied to clipboard!');
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    try {
      await api.delete(`/urls/${id}`);
      toast.success('Link deleted');
      onDelete?.(id);
    } catch {
      toast.error('Failed to delete link');
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading your links...</div>;
  }

  if (urls.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No links yet</p>
        <p className="text-sm mt-1">Create your first short URL above</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Short URL</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Original</th>
            <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Clicks</th>
            <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {urls.map((url) => (
            <tr key={url.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <button
                  onClick={() => copyToClipboard(url.shortCode)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                >
                  /{url.shortCode}
                </button>
              </td>
              <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-600">
                {url.originalUrl}
              </td>
              <td className="px-6 py-4 text-center">
                <span className="font-semibold text-gray-900">{url.clickCount}</span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                  url.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {url.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-center space-x-3">
                <Link
                  to={`/links/${url.id}`}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Analytics
                </Link>
                <button
                  onClick={() => handleDelete(url.id)}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
