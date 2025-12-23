export default function fallbackShortlist(payload: Record<string, unknown>) {
  return {
    ok: true,
    shortlistId: 'stub-shortlist',
    items: payload?.items ?? [],
  }
}
