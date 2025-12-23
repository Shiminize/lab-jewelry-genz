export default function fallbackOrderStatus(details: Record<string, unknown>) {
  const reference =
    typeof details?.orderId === 'string'
      ? details.orderId
      : typeof details?.email === 'string'
        ? `GG-${details.email.slice(0, 4).toUpperCase()}`
        : 'GG-12345'

  return {
    reference,
    entries: [
      { label: 'Design locked', date: 'Aug 22', status: 'complete' as const },
      { label: 'Stones in micro-setting', date: 'Aug 24', status: 'current' as const },
      { label: 'Quality check', date: 'Aug 27', status: 'upcoming' as const },
      { label: 'Shipping out', date: 'Aug 28', status: 'upcoming' as const },
    ],
    customerEmail: typeof details?.email === 'string' ? details.email : undefined,
  }
}
