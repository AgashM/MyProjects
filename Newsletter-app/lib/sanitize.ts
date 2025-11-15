import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

/**
 * Sanitize HTML content to prevent XSS attacks
 * This is especially important for user-generated content from the rich text editor
 */
export function sanitizeHtml(dirty: string): string {
  // On server-side, create a DOM environment for DOMPurify
  const dom = typeof window === 'undefined' ? new JSDOM('').window : window;
  const purify = DOMPurify(dom as any);
  
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Sanitize plain text to prevent injection attacks
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .slice(0, 10000); // Limit length
}

