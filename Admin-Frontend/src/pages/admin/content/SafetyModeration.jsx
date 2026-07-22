import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Search, Flag, Ban, Eye, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import toast from '../../../utils/toast';

const EVENT_LABELS = {
  CONTENT_REPORTED: 'Content Reported',
  USER_BLOCKED_FOR_SAFETY: 'User Blocked'
};

const REASON_LABELS = {
  spam: 'Spam',
  harassment: 'Harassment or bullying',
  hate_speech: 'Hate speech',
  violence: 'Violence or dangerous content',
  inappropriate_content: 'Sexual or inappropriate content',
  copyright: 'Copyright or intellectual property',
  other: 'Other',
  user_block: 'User block'
};

/**
 * Admin Safety Moderation — developer/admin-visible queue for UGC reports and blocks.
 * Backed by ModerationEvent + ContentReport collections (real persistence, not a fake toast).
 */
const SafetyModeration = () => {
  const [activeTab, setActiveTab] = useState('events'); // events | reports | blocks
  const [events, setEvents] = useState([]);
  const [reports, setReports] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('all');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('adminToken');

  const fetchAll = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const statusQs = reportStatusFilter && reportStatusFilter !== 'all'
        ? `?status=${reportStatusFilter}`
        : '';

      const [eventsRes, reportsRes, blocksRes] = await Promise.all([
        fetch(`${API_BASE}/admin/moderation/events`, { headers }),
        fetch(`${API_BASE}/admin/moderation/reports${statusQs}`, { headers }),
        fetch(`${API_BASE}/admin/moderation/blocks`, { headers })
      ]);

      const [eventsData, reportsData, blocksData] = await Promise.all([
        eventsRes.json(),
        reportsRes.json(),
        blocksRes.json()
      ]);

      if (eventsRes.ok && eventsData.success) setEvents(eventsData.events || []);
      if (reportsRes.ok && reportsData.success) setReports(reportsData.reports || []);
      if (blocksRes.ok && blocksData.success) setBlocks(blocksData.blocks || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load safety moderation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [reportStatusFilter]);

  const markEventRead = async (eventId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/moderation/events/${eventId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEvents((prev) => prev.map((e) => (e._id === eventId ? { ...e, isRead: true } : e)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateReportStatus = async (reportId, status) => {
    try {
      const res = await fetch(`${API_BASE}/admin/moderation/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Report marked as ${status}`);
        setReports((prev) => prev.map((r) => (r._id === reportId ? { ...r, status } : r)));
      } else {
        toast.error(data.message || 'Failed to update report');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error updating report');
    }
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredEvents = events.filter((e) => {
    if (!q) return true;
    const reporter = e.reporterId?.name || e.reporterId?.phone || '';
    return (
      (e.eventType || '').toLowerCase().includes(q) ||
      (e.reason || '').toLowerCase().includes(q) ||
      reporter.toLowerCase().includes(q) ||
      String(e.reportedUserId || '').includes(q)
    );
  });

  const filteredReports = reports.filter((r) => {
    if (!q) return true;
    const reporter = r.reporterId?.name || r.reporterId?.phone || '';
    return (
      (r.reason || '').toLowerCase().includes(q) ||
      (r.status || '').toLowerCase().includes(q) ||
      reporter.toLowerCase().includes(q) ||
      (r.targetId?.username || '').toLowerCase().includes(q)
    );
  });

  const unreadCount = events.filter((e) => !e.isRead).length;

  return (
    <div className="p-6 space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-rose-500" />
            Safety Moderation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Developer/admin queue for Studio content reports and user blocks.
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchAll}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider"
        >
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          {[
            { id: 'events', label: 'Safety Events', icon: AlertCircle },
            { id: 'reports', label: 'Reports', icon: Flag },
            { id: 'blocks', label: 'Blocks', icon: Ban }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search…"
            className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
          Loading…
        </div>
      ) : activeTab === 'events' ? (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Reporter</th>
                <th className="px-4 py-3">Reported User</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No safety events yet.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr
                    key={event._id}
                    className={`border-t border-slate-50 ${!event.isRead ? 'bg-amber-50/40' : ''}`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {EVENT_LABELS[event.eventType] || event.eventType}
                      {event.targetVideoId && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          video: {String(event.targetVideoId).slice(-8)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {event.reporterId?.name || 'User'}
                      <div className="text-[10px] text-slate-400">{event.reporterId?.phone}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {event.reportedUserId ? String(event.reportedUserId).slice(-8) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {REASON_LABELS[event.reason] || event.reason || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {event.createdAt ? new Date(event.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {event.isRead ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Read
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markEventRead(event._id)}
                          className="inline-flex items-center gap-1 text-amber-700 text-xs font-bold hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" /> Mark read
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'reports' ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['all', 'pending', 'reviewing', 'resolved', 'dismissed'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setReportStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  reportStatusFilter === s
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-4 py-3">Content</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      No reports found.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report._id} className="border-t border-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">
                          @{report.targetId?.username || 'unknown'}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 max-w-[200px]">
                          {report.targetId?.caption || report.description || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {report.reporterId?.name || 'User'}
                        <div className="text-[10px] text-slate-400">{report.reporterId?.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        {REASON_LABELS[report.reason] || report.reason}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-bold capitalize text-slate-600">
                          <Clock className="w-3 h-3" />
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {report.createdAt ? new Date(report.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={report.status}
                          onChange={(e) => updateReportStatus(report._id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5"
                        >
                          <option value="pending">pending</option>
                          <option value="reviewing">reviewing</option>
                          <option value="resolved">resolved</option>
                          <option value="dismissed">dismissed</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-4 py-3">Blocker</th>
                <th className="px-4 py-3">Blocked User</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {blocks.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-slate-400">
                    No user blocks yet.
                  </td>
                </tr>
              ) : (
                blocks
                  .filter((b) => {
                    if (!q) return true;
                    const a = b.blockerId?.name || b.blockerId?.phone || '';
                    const c = b.blockedUserId?.name || b.blockedUserId?.phone || '';
                    return a.toLowerCase().includes(q) || c.toLowerCase().includes(q);
                  })
                  .map((block) => (
                    <tr key={block._id} className="border-t border-slate-50">
                      <td className="px-4 py-3">
                        {block.blockerId?.name || 'User'}
                        <div className="text-[10px] text-slate-400">{block.blockerId?.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        {block.blockedUserId?.name || 'User'}
                        <div className="text-[10px] text-slate-400">{block.blockedUserId?.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {block.createdAt ? new Date(block.createdAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SafetyModeration;
