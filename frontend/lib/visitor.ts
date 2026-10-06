// One anonymous browser identity shared by tabs and retained across sessions.
// If storage is unavailable, read statistics without inventing a new visitor.
export function visitorId(): string | null {
  try {
    const key = "devlog-visitor";
    const existing = localStorage.getItem(key);
    if (
      existing &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        existing,
      )
    )
      return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    return id;
  } catch {
    return null;
  }
}
