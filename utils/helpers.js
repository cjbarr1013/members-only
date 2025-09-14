function reconfigureImage(url, size = 'sm', username = 'default') {
  const sizes = { sm: 100, lg: 300 };

  if (!url) return `/images/placeholder-${size}.png`;
  try {
    const u = new URL(url);
    if (u.hostname.includes('i.pravatar.cc')) {
      u.pathname = `/${sizes[size]}`;
      u.searchParams.set('u', username);
      return u.toString();
    } else {
      u.search = '';
      u.searchParams.set('w', sizes[size]);
      u.searchParams.set('auto', 'format');
      return u.toString();
    }
  } catch {
    return url;
  }
}

module.exports = {
  reconfigureImage,
};
