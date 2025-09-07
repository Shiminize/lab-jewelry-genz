'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface Creator {
  createdAt: string
  approvedAt?: string
  commissionRate: number
  minimumPayout: number
}

interface CreatorAccountInfoProps {
  creator: Creator
  className?: string
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function CreatorAccountInfo({
  creator,
  className
}: CreatorAccountInfoProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-aurora-nav-muted">Member since:</span>
            <div className="font-medium text-foreground">
              {formatDate(creator.createdAt)}
            </div>
          </div>
          {creator.approvedAt && (
            <div>
              <span className="text-aurora-nav-muted">Approved on:</span>
              <div className="font-medium text-foreground">
                {formatDate(creator.approvedAt)}
              </div>
            </div>
          )}
          <div>
            <span className="text-aurora-nav-muted">Commission rate:</span>
            <div className="font-medium text-foreground">
              {creator.commissionRate}%
            </div>
          </div>
          <div>
            <span className="text-aurora-nav-muted">Minimum payout:</span>
            <div className="font-medium text-foreground">
              ${creator.minimumPayout}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}