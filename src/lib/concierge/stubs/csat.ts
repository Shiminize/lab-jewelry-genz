export default function fallbackCsat(response: Record<string, unknown>) {
  return {
    ok: true,
    response,
  }
}
