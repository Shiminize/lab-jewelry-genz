export default function fallbackStylist(payload: Record<string, unknown>) {
  return {
    ok: true,
    message: 'A GlowGlitch stylist will reach out shortly with renders and next steps.',
    payload,
  }
}
