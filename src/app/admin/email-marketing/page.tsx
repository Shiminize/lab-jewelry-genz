import { Metadata } from 'next'
import EmailMarketingDashboard from '@/components/admin/EmailMarketingDashboard'

export const metadata: Metadata = {
  title: 'Email Marketing | GenZ Jewelry Admin',
  description: 'Manage email campaigns, customer segments, automation triggers, and analytics',
}

export default function EmailMarketingPage() {
  return <EmailMarketingDashboard />
}