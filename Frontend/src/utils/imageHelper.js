export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  let path = imagePath;
  
  // Upgrade local dev paths to production domain if loaded over HTTPS (prevent Mixed Content errors)
  if (window.location.protocol === 'https:') {
    if (path.startsWith('http://localhost:5000')) {
      let apiBase = import.meta.env.VITE_API_URL || '';
      // If apiBase is local or empty, fall back to current origin
      if (!apiBase || apiBase.includes('localhost') || apiBase.includes('127.0.0.1')) {
        apiBase = window.location.origin;
      }
      const prodApiBaseUrl = apiBase.replace('/api', '');
      path = path.replace('http://localhost:5000', prodApiBaseUrl);
    }

    // Force upgrade http to https if protocol is HTTPS (prevent Mixed Content errors)
    if (path.startsWith('http://') && !path.includes('localhost')) {
      path = path.replace('http://', 'https://');
    }
  }

  // If it's a full URL without http/https (e.g. starting with www.)
  if (path.startsWith('www.')) {
    return `https://${path}`;
  }
  // If it doesn't look like a local uploads path (doesn't start with /uploads or uploads), it's likely a full external URL
  if (!path.startsWith('/uploads') && !path.startsWith('uploads')) {
    return path; // Return as is
  }

  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:') ||
    path.startsWith('/src/') ||
    path.startsWith('/assets/') ||
    path.includes('categoryForU') ||
    path.includes('Category')
  ) {
    return path;
  }
  
  let apiBase = import.meta.env.VITE_API_URL || '';
  if (window.location.protocol === 'https:' && (!apiBase || apiBase.includes('localhost') || apiBase.includes('127.0.0.1'))) {
    apiBase = window.location.origin;
  } else if (!apiBase) {
    apiBase = 'http://localhost:5000';
  }
  
  return `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`;
};
