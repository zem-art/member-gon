const GUEST_ID_KEY = "belikilat_guest_id";

/**
 * Get or create a persistent guest UUID.
 * Stored in localStorage so it persists across tabs and page reloads
 * within the same browser. A new UUID is generated per browser/profile.
 */
export function getGuestId(): string {
    let guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
}

/** For debug / testing — reset guest identity */
export function resetGuestId(): string {
    const newId = crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, newId);
    return newId;
}
