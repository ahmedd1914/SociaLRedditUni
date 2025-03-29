/**
 * Formats a date to a human-readable "time ago" string
 * @param date The date to format
 * @returns A string representing how long ago the date was
 */
export const timeAgo = (date: Date): string => {
  const now = new Date();
  const secondsAgo = Math.round((now.getTime() - date.getTime()) / 1000);
  
  // Less than a minute
  if (secondsAgo < 60) {
    return 'just now';
  }
  
  // Less than an hour
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return `${minutesAgo}m ago`;
  }
  
  // Less than a day
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return `${hoursAgo}h ago`;
  }
  
  // Less than a week
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 7) {
    return `${daysAgo}d ago`;
  }
  
  // Less than a month
  if (daysAgo < 30) {
    const weeksAgo = Math.floor(daysAgo / 7);
    return `${weeksAgo}w ago`;
  }
  
  // Less than a year
  if (daysAgo < 365) {
    const monthsAgo = Math.floor(daysAgo / 30);
    return `${monthsAgo}mo ago`;
  }
  
  // More than a year
  const yearsAgo = Math.floor(daysAgo / 365);
  return `${yearsAgo}y ago`;
};

/**
 * Formats a date to a localized string (e.g., "Jan 1, 2023")
 */
export const formatDate = (date: Date | string): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Formats a date to show both date and time (e.g., "Jan 1, 2023, 12:30 PM")
 */
export const formatDateTime = (date: Date | string): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 