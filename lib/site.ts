/** The live site's address, used in links people share. */
export const SITE_URL = "https://dealguru.netlify.app";

/** A WhatsApp link that opens a chat with a message ready to send. */
export function whatsAppShareUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
