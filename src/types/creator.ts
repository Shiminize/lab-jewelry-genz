export type CreatorApplicationStatus = 'received' | 'reviewing' | 'approved' | 'declined'

export type CreatorMediaKitStatus = 'not_requested' | 'pending' | 'sent' | 'failed'

export interface CreatorApplicationSource {
  userAgent?: string
  ip?: string
  referer?: string
}

export interface CreatorApplicationRecord {
  id?: string
  name: string
  email: string
  platform: string
  audience: string
  wantsMediaKit: boolean
  status: CreatorApplicationStatus
  mediaKitStatus: CreatorMediaKitStatus
  notes?: string
  createdAt?: Date
  updatedAt?: Date
  mediaKitSentAt?: Date
  mediaKitMessageId?: string
  mediaKitError?: string
  source?: CreatorApplicationSource
}
