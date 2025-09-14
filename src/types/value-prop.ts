export interface ValueProp {
  icon: string
  headline: string
  description: string
  trustSignals: Array<{
    icon: string
    text: string
    variant?: 'default' | 'accent' | 'success'
  }>
}