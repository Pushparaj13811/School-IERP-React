/**
 * Formats a 24-hour time string (HH:MM) to a more readable 12-hour format
 * @param time Time in 24-hour format (HH:MM)
 * @returns Time in 12-hour format with AM/PM
 */
export const formatTime = (time: string): string => {
  try {
    if (!time || !time.includes(':')) {
      return time;
    }
    
    const [hourStr, minuteStr] = time.split(':');
    const hour = parseInt(hourStr, 10);
    
    if (isNaN(hour) || hour < 0 || hour > 23) {
      return time;
    }
    
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12; // Convert to 12-hour format
    
    return `${displayHour}:${minuteStr} ${ampm}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return time;
  }
}; 