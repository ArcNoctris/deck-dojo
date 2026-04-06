/**
 * Safely generates a random UUID.
 * Uses the native `crypto.randomUUID()` if available (secure contexts/localhost).
 * Falls back to a math-based pseudo-random string for non-secure local IP testing.
 */
export function generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers or non-secure contexts (like accessing via local IP without HTTPS)
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}