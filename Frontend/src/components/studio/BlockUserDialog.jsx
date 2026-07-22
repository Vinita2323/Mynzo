import React, { useState } from 'react';
import { X } from 'lucide-react';
import { blockUser } from '../../utils/moderationApi';
import toast from '../../utils/toast';

/**
 * Confirm + execute block for a Studio content creator.
 */
export default function BlockUserDialog({
  userId,
  username,
  relatedVideoId = null,
  onClose,
  onBlocked
}) {
  const [submitting, setSubmitting] = useState(false);
  const displayName = username ? `@${username.replace(/^@/, '')}` : 'this user';

  const handleBlock = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { ok, data, status } = await blockUser({ userId, relatedVideoId });

      if (status === 401) {
        toast.error('Please log in to block users');
        onClose?.();
        return;
      }

      if (!ok || !data.success) {
        toast.error(data.message || 'Could not block user. Please try again.');
        return;
      }

      toast.success(data.alreadyBlocked ? 'User is already blocked' : `${displayName} has been blocked`);
      onBlocked?.({
        blockedUserId: data.blockedUserId || userId,
        alreadyBlocked: data.alreadyBlocked
      });
      onClose?.();
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
        aria-labelledby="block-user-title"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl z-[140] w-[calc(100%-2rem)] max-w-sm p-6 shadow-2xl font-sans text-slate-800"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 id="block-user-title" className="font-bold text-base pr-8">
          Block {displayName}?
        </h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          You will no longer see content from this user.
        </p>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleBlock}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-rose-700"
          >
            {submitting ? 'Blocking…' : 'Block'}
          </button>
        </div>
      </div>
    </>
  );
}
