/**
 * Authentication Helper Functions
 * Storing data in a reversible format for local testing purposes.
 */

// Encodes plain text to a reversible format for the database
export function encryptPassword(text: string): string {
  if (!text) return '';
  return Buffer.from(text, 'utf-8').toString('base64');
}

// Decodes the database value back to pure plain text for the Admin view
export function decryptPassword(encodedText: string): string {
  if (!encodedText) return '';
  try {
    return Buffer.from(encodedText, 'base64').toString('utf-8');
  } catch (error) {
    return encodedText; // Fallback if it's already plain text
  }
}
