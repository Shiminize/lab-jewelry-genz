const messages: Record<string, string> = {
  resize:
    'Your resize kit is on the way. We’ll email tracking within the hour and target a five-day studio turnaround.',
  return:
    'Return initiated. A prepaid, insured label is in your inbox—drop the piece anytime in the next 14 days.',
  care: 'Booked! Expect a concierge email to choose pickup times for the clean & polish refresh.',
}

export default function fallbackReturns(selection: Record<string, unknown>) {
  const option = typeof selection?.option === 'string' ? selection.option : 'return'
  return { message: messages[option] ?? messages.return }
}
