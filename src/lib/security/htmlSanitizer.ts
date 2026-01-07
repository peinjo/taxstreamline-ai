import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @param options - DOMPurify configuration options
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string, options?: Record<string, unknown>): string {
  if (!html) return '';
  
  const defaultConfig = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['class'],
    FORBID_SCRIPTS: true,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'],
  };
  
  return String(DOMPurify.sanitize(html, { ...defaultConfig, ...options }));
}

/**
 * Strips all HTML tags from a string
 * @param html - The HTML string to strip
 * @returns Plain text string
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Truncates text to a maximum length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Safely renders HTML content by sanitizing it first
 * @param html - The HTML string to render
 * @param maxLength - Optional maximum length for truncation
 * @returns Object with sanitized HTML for dangerouslySetInnerHTML
 */
export function createSafeHTML(html: string, maxLength?: number): { __html: string } {
  let sanitized = sanitizeHtml(html);
  if (maxLength) {
    sanitized = truncateText(stripHtml(sanitized), maxLength);
  }
  return { __html: sanitized };
}