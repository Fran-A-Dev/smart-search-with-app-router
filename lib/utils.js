/**
 * Strips HTML tags from a string and returns clean text
 * @param {string} html - HTML string to sanitize
 * @param {number} maxLength - Maximum length of returned string
 * @returns {string} - Clean text without HTML tags
 */
export function stripHtml(html, maxLength = null) {
  if (!html) return "";

  // Remove HTML tags
  const cleanText = html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with regular space
    .replace(/&amp;/g, "&") // Replace &amp; with &
    .replace(/&lt;/g, "<") // Replace &lt; with <
    .replace(/&gt;/g, ">") // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#039;/g, "'") // Replace &#039; with '
    .replace(/&hellip;/g, "...") // Replace &hellip; with ...
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing whitespace

  // Truncate if maxLength is specified
  if (maxLength && cleanText.length > maxLength) {
    return cleanText.substring(0, maxLength).trim() + "...";
  }

  return cleanText;
}

/**
 * Formats a date string into a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Truncates text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}
