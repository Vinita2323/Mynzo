import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Flag, StickyNote, Clock, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

const REASON_LABELS = {
  spam: 'Spam',
  harassment: 'Harassment or bullying',
  hate_speech: 'Hate speech',
  violence: 'Violence or dangerous content',
  inappropriate_content: 'Sexual or inappropriate content',
  copyright: 'Copyright or intellectual property',
  other: 'Other'
};

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  reviewing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  dismissed: 'bg-slate-100 text-slate-600 border-slate-200'
};

export default function ReportNotesPage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/reports/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReports(data.reports || []);
      } else {
        setError(data.message || 'Could not load report notes');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchReports();
  }, [user]);

  return (
    <div className="min-h-[100dvh] bg-slate-50 font-sans pb-24">
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="p-2 -ml-2 rounded-full hover:bg-slate-50"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-sm font-black text-[#02006c] uppercase tracking-wider">
          Report Notes
        </h1>
        <button
          type="button"
          onClick={fetchReports}
          className="p-2 -mr-2 rounded-full hover:bg-slate-50"
          aria-label="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">
        <p className="text-xs text-slate-500 leading-relaxed px-1">
          Updates from our safety team on videos you reported.
        </p>

        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <span className="w-8 h-8 border-4 border-[#ee4923]/30 border-t-[#ee4923] rounded-full animate-spin" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Loading…</span>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-sm text-rose-600 font-semibold">
            {error}
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center space-y-2">
            <Flag className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No reports yet</p>
            <p className="text-xs text-slate-400">
              When you report a Studio video, updates from admin will appear here.
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-[#02006c] truncate">
                    @{report.target?.username || 'unknown'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {REASON_LABELS[report.reason] || report.reason}
                  </div>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border ${
                    STATUS_STYLES[report.status] || STATUS_STYLES.pending
                  }`}
                >
                  {report.status}
                </span>
              </div>

              {report.target?.caption && (
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {report.target.caption}
                </p>
              )}

              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                <Clock className="w-3 h-3" />
                Reported{' '}
                {report.createdAt
                  ? new Date(report.createdAt).toLocaleString()
                  : '—'}
              </div>

              {report.adminNote ? (
                <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                    <StickyNote className="w-3.5 h-3.5" />
                    Admin note
                  </div>
                  <p className="text-[13px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {report.adminNote}
                  </p>
                  {report.adminNoteUpdatedAt && (
                    <p className="text-[10px] text-indigo-400">
                      Updated{' '}
                      {new Date(report.adminNoteUpdatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl px-3 py-2.5 text-[11px] text-slate-400 font-medium">
                  No admin note yet — we&apos;ll update this when our team reviews your report.
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
