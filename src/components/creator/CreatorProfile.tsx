'use client'

/**
 * Creator Profile Management Component
 * Allows creators to update their profile information and settings
 */

import { useState } from 'react'
import { CreatorBasicInfo } from './CreatorBasicInfo'
import { CreatorSocialLinks } from './CreatorSocialLinks'
import { CreatorSettingsComponent } from './CreatorSettings'
import { CreatorAccountInfo } from './CreatorAccountInfo'

interface Creator {
  id: string
  creatorCode: string
  displayName: string
  email: string
  profileImage?: string
  bio?: string
  socialLinks: {
    instagram?: string
    tiktok?: string
    youtube?: string
    twitter?: string
    website?: string
  }
  commissionRate: number
  minimumPayout: number
  status: string
  settings: {
    emailNotifications: boolean
    publicProfile: boolean
    allowDirectMessages: boolean
  }
  createdAt: string
  approvedAt?: string
}

interface CreatorProfileProps {
  creator: Creator
  onUpdate: () => void
}

export default function CreatorProfile({ creator, onUpdate }: CreatorProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    displayName: creator.displayName,
    bio: creator.bio || '',
    profileImage: creator.profileImage || '',
    socialLinks: {
      instagram: creator.socialLinks.instagram || '',
      tiktok: creator.socialLinks.tiktok || '',
      youtube: creator.socialLinks.youtube || '',
      twitter: creator.socialLinks.twitter || '',
      website: creator.socialLinks.website || ''
    },
    settings: {
      emailNotifications: creator.settings.emailNotifications,
      publicProfile: creator.settings.publicProfile,
      allowDirectMessages: creator.settings.allowDirectMessages
    }
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.startsWith('socialLinks.')) {
      const socialField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value as string
        }
      }))
    } else if (field.startsWith('settings.')) {
      const settingField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingField]: value as boolean
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleEditToggle = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const response = await fetch('/api/creators', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setIsEditing(false)
        onUpdate()
      } else {
        alert(result.error?.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      displayName: creator.displayName,
      bio: creator.bio || '',
      profileImage: creator.profileImage || '',
      socialLinks: {
        instagram: creator.socialLinks.instagram || '',
        tiktok: creator.socialLinks.tiktok || '',
        youtube: creator.socialLinks.youtube || '',
        twitter: creator.socialLinks.twitter || '',
        website: creator.socialLinks.website || ''
      },
      settings: {
        emailNotifications: creator.settings.emailNotifications,
        publicProfile: creator.settings.publicProfile,
        allowDirectMessages: creator.settings.allowDirectMessages
      }
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <CreatorBasicInfo
        creator={creator}
        isEditing={isEditing}
        formData={formData}
        onInputChange={handleInputChange}
        onEditToggle={handleEditToggle}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />

      <CreatorSocialLinks
        creator={creator}
        isEditing={isEditing}
        formData={formData}
        onInputChange={handleInputChange}
      />

      <CreatorSettingsComponent
        creator={creator}
        isEditing={isEditing}
        formData={formData}
        onInputChange={handleInputChange}
      />

      <CreatorAccountInfo creator={creator} />
    </div>
  )
}