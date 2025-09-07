'use client'

import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { User } from 'lucide-react'

interface Creator {
  id: string
  creatorCode: string
  displayName: string
  email: string
  profileImage?: string
  bio?: string
  status: string
}

interface FormData {
  displayName: string
  bio: string
  profileImage: string
}

interface CreatorBasicInfoProps {
  creator: Creator
  isEditing: boolean
  formData: FormData
  onInputChange: (field: string, value: string) => void
  onEditToggle: () => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
  className?: string
}

export function CreatorBasicInfo({
  creator,
  isEditing,
  formData,
  onInputChange,
  onEditToggle,
  onSave,
  onCancel,
  isSaving,
  className
}: CreatorBasicInfoProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-token-sm">
            <User className="w-5 h-5" />
            <span>Profile Information</span>
          </CardTitle>
          {!isEditing ? (
            <Button onClick={onEditToggle}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center space-x-token-sm">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={onSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-token-md">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center overflow-hidden">
            {formData.profileImage ? (
              <Image 
                src={formData.profileImage} 
                alt="Profile" 
                width={80}
                height={80}
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <User className="w-8 h-8 text-aurora-nav-muted" />
            )}
          </div>
          {isEditing && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-aurora-nav-muted mb-2">
                Profile Image URL
              </label>
              <Input
                type="url"
                value={formData.profileImage}
                onChange={(e) => onInputChange('profileImage', e.target.value)}
                placeholder="https://example.com/profile-image.jpg"
              />
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-aurora-nav-muted mb-2">
              Display Name
            </label>
            {isEditing ? (
              <Input
                type="text"
                value={formData.displayName}
                onChange={(e) => onInputChange('displayName', e.target.value)}
                maxLength={50}
              />
            ) : (
              <div className="py-2 text-foreground">{creator.displayName}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-aurora-nav-muted mb-2">
              Email
            </label>
            <div className="py-2 text-foreground">{creator.email}</div>
            <p className="text-xs text-aurora-nav-muted">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-aurora-nav-muted mb-2">
              Creator Code
            </label>
            <div className="py-2 font-mono text-amber-600 font-semibold">
              {creator.creatorCode}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-aurora-nav-muted mb-2">
              Status
            </label>
            <Badge 
              variant={
                creator.status === 'approved' ? 'default' :
                creator.status === 'pending' ? 'secondary' :
                creator.status === 'suspended' ? 'destructive' : 'outline'
              }
              className="capitalize"
            >
              {creator.status}
            </Badge>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-aurora-nav-muted mb-2">
            Bio
          </label>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => onInputChange('bio', e.target.value)}
              placeholder="Tell your audience about yourself..."
              className="w-full px-3 py-2 border border-border rounded-token-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              rows={4}
              maxLength={500}
            />
          ) : (
            <div className="py-2 text-foreground">
              {creator.bio || 'No bio provided'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}