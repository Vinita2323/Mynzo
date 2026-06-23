export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  let path = imagePath;
  
  // Upgrade local dev paths to production domain if loaded over HTTPS (prevent Mixed Content errors)
  if (window.location.protocol === 'https:' && path.startsWith('http://localhost:5000')) {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const prodApiBaseUrl = apiBase.replace('/api', '');
    path = path.replace('http://localhost:5000', prodApiBaseUrl);
  }

  // Force upgrade http to https if protocol is HTTPS (prevent Mixed Content errors)
  if (window.location.protocol === 'https:' && path.startsWith('http://') && !path.includes('localhost')) {
    path = path.replace('http://', 'https://');
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
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`;
};
