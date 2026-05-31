import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import AnalyticsChart from '../components/AnalyticsChart';

export default function LinkDetails() {
  const { id } = useParams<{ id: string }>();
  const [url, setUrl] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [urlRes, analyticsRes] = await Promise.all([
          api.get(`/urls/${id}`),
          api.get(`/analytics/${id}`),
        ]);
        setUrl(urlRes.data.data);
        setAnalytics(analyticsRes.data.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading analytics...</div>;
  }

  if (!url) {
    return <div className="text-center py-8 text-red-500">URL not found</div>;
  }

  return (
    <div>
      <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-4 inline-block">
        &larr; Back to Dashboard
      </Link>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold mb-1">/{url.shortCode}</h1>
            <p className="text-gray-600 text-sm truncate max-w-lg">{url.originalUrl}</p>
          </div>
          <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
            url.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {url.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="mt-4 flex gap-6 text-sm text-gray-500">
          <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
          <span>Clicks: <strong className="text-gray-900">{url.clickCount}</strong></span>
          {url.expiresAt && <span>Expires: {new Date(url.expiresAt).toLocaleDateString()}</span>}
        </div>
      </div>

      {analytics && (
        <AnalyticsChart
          clicksPerDay={analytics.clicks_per_day || []}
          devices={(analytics.devices || []).map((d: any) => ({ name: d.device, count: d.count }))}
          browsers={(analytics.browsers || []).map((b: any) => ({ name: b.browser, count: b.count }))}
          countries={(analytics.countries || []).map((c: any) => ({ name: c.country, count: c.count }))}
          totalClicks={analytics.total_clicks || 0}
        />
      )}
    </div>
  );
}
