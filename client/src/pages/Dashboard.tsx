import { useState, useEffect, useCallback } from 'react';
import CreateLink from '../components/CreateLink';
import LinkTable from '../components/LinkTable';
import api from '../services/api';

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUrls = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/urls?page=${page}&limit=10`);
      setUrls(data.data.urls);
      setTotalPages(data.data.pagination.totalPages);
    } catch (err) {
      console.error('Failed to fetch URLs:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <CreateLink onCreated={fetchUrls} />
      <LinkTable urls={urls} loading={loading} onDelete={() => fetchUrls()} />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
