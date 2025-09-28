const { format, parse } = require('date-fns');

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

function formatDate(date, use = 'timestamp') {
  if (use === 'timestamp') {
    return format(new Date(date), 'hh:mm aaa · M/d/yy');
  }
  if (use === 'birthday') {
    // Parse date-only string without timezone conversion
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    return format(parsedDate, 'MMM do, y');
  }
  return date;
}

module.exports = {
  reconfigureImage,
  formatDate,
};
