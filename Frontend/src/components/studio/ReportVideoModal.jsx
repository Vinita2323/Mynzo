import React, { useState } from 'react';
import { X } from 'lucide-react';
import { REPORT_REASON_OPTIONS, submitContentReport } from '../../utils/moderationApi';
import toast from '../../utils/toast';

/**
 * Report flow for Studio / product video content.
 * Steps: select reason → optional details → submit → success.
 */
export default function ReportVideoModal({ videoId, onClose, onSuccess }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || submitting) return;

    setSubmitting(true);
    try {
      const { ok, data, status } = await submitContentReport({
        targetId: videoId,
        reason,
        description
      });

      if (status === 401) {
        toast.error('Please log in to report content');
        onClose?.();
        return;
      }

      if (!ok || !data.success) {
        toast.error(data.message || 'Could not submit report. Please try again.');
        return;
      }

      setSubmitted(true);
      onSuccess?.(data);
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[130]" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-video-title"
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[140] flex flex-col max-w-md mx-auto shadow-2xl max-h-[85dvh] font-sans text-slate-800"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 id="report-video-title" className="font-bold text-[15px] uppercase tracking-wider">
            Report Video
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
            aria-label="Close report dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 space-y-4 text-center">
            <p className="text-sm font-semibold text-slate-800 leading-relaxed">
              Thanks. We&apos;ve received your report and will review it.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-[#ee4923] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>
              <p className="text-xs text-slate-500 font-medium">
                Why are you reporting this video?
              </p>
              <fieldset className="space-y-2" disabled={submitting}>
                <legend className="sr-only">Report reason</legend>
                {REPORT_REASON_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      reason === opt.value
                        ? 'border-[#ee4923] bg-orange-50'
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={opt.value}
                      checked={reason === opt.value}
                      onChange={() => setReason(opt.value)}
                      className="accent-[#ee4923] w-4 h-4"
                    />
                    <span className="text-[13px] font-semibold text-slate-800">{opt.label}</span>
                  </label>
                ))}
              </fieldset>

              <div>
                <label htmlFor="report-details" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Additional details (optional)
                </label>
                <textarea
                  id="report-details"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                  rows={3}
                  disabled={submitting}
                  placeholder="Add any context that helps our review…"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#ee4923]/30 resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button
                type="submit"
                disabled={!reason || submitting}
                className="w-full bg-[#ee4923] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
