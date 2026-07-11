export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';

  const path = String(imagePath).trim();

  // If it is already a complete URL, return as is
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // If it starts with www.
  if (path.startsWith('www.')) {
    return `https://${path}`;
  }

  // Local frontend assets should not be prepended with base URL
  if (
    path.startsWith('/src/') ||
    path.startsWith('/assets/') ||
    path.startsWith('src/') ||
    path.startsWith('assets/') ||
    path.startsWith('/HopeFinal.webp') ||
    path.includes('categoryForU') ||
    path.includes('Category')
  ) {
    return path;
  }

  // Prepend base URL for upload paths
  if (path.includes('uploads')) {
    // In local development/testing, if the hostname is localhost/127.0.0.1/private network,
    // we should use the local API URL to fetch images so developers can see local uploads.
    const isLocal = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('gitpod') ||
        window.location.hostname.includes('devtunnels.ms') ||
        /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(window.location.hostname));

    let baseUrl = '';
    if (isLocal) {
      baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
    } else {
      baseUrl = import.meta.env.VITE_IMAGE_BASE_URL || import.meta.env.VITE_API_URL || 'https://mynzoworld.com';
    }

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}${cleanPath}`;
  }

  return path;
};

