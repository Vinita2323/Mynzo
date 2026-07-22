const API_BASE = () => import.meta.env.VITE_API_URL || 'http://localhost:5000';

const authHeaders = () => {
  const token = localStorage.getItem('userToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const REPORT_REASON_OPTIONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate_speech', label: 'Hate speech' },
  { value: 'violence', label: 'Violence or dangerous content' },
  { value: 'inappropriate_content', label: 'Sexual or inappropriate content' },
  { value: 'copyright', label: 'Copyright or intellectual property' },
  { value: 'other', label: 'Other' }
];

export async function submitContentReport({ targetId, reason, description = '' }) {
  const res = await fetch(`${API_BASE()}/reports`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      targetType: 'video',
      targetId,
      reason,
      description
    })
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function blockUser({ userId, relatedVideoId = null }) {
  const res = await fetch(`${API_BASE()}/users/${userId}/block`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ relatedVideoId })
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function fetchReelsFeed() {
  const res = await fetch(`${API_BASE()}/reels`, {
    headers: authHeaders()
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
