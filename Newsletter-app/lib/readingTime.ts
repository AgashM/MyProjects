/**
 * Calculate reading time based on content
 * Average reading speed: 200-250 words per minute
 * We use 200 as a conservative estimate
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 0;
  
  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  
  // Count words
  const words = text.trim().split(/\s+/).length;
  
  // Calculate reading time (200 words per minute)
  const readingTime = Math.ceil(words / 200);
  
  return Math.max(1, readingTime); // Minimum 1 minute
}

/**
 * Format reading time for display
 * @param minutes - Number of minutes to read
 * @returns Formatted string like "5 min read"
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
