'use client'

/**
 * Creator Profile Management Component
 * Allows creators to update their profile information and settings
 */

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  User,
  Settings,
  Globe,
  Instagram,
  Twitter,
  Youtube,
  Save,
  Camera
} from 'lucide-react'

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile Information</span>
            </CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
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
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            {isEditing && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image URL
                </label>
                <Input
                  type="url"
                  value={formData.profileImage}
                  onChange={(e) => handleInputChange('profileImage', e.target.value)}
                  placeholder="https://example.com/profile-image.jpg"
                />
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  maxLength={50}
                />
              ) : (
                <div className="py-2 text-gray-900">{creator.displayName}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="py-2 text-gray-900">{creator.email}</div>
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Creator Code
              </label>
              <div className="py-2 font-mono text-amber-600 font-semibold">
                {creator.creatorCode}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell your audience about yourself..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                rows={4}
                maxLength={500}
              />
            ) : (
              <div className="py-2 text-gray-900">
                {creator.bio || 'No bio provided'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Social Links</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Instagram className="w-4 h-4 inline mr-2" />
              Instagram
            </label>
            {isEditing ? (
              <Input
                type="url"
                value={formData.socialLinks.instagram}
                onChange={(e) => handleInputChange('socialLinks.instagram', e.target.value)}
                placeholder="https://instagram.com/username"
              />
            ) : (
              <div className="py-2 text-gray-900">
                {creator.socialLinks.instagram ? (
                  <a 
                    href={creator.socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-700"
                  >
                    {creator.socialLinks.instagram}
                  </a>
                ) : (
                  'Not provided'
                )}
              </div>
            )}
          </div>

          {/* TikTok */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="w-4 h-4 inline-block mr-2 text-center">🎵</span>
              TikTok
            </label>
            {isEditing ? (
              <Input
                type="url"
                value={formData.socialLinks.tiktok}
                onChange={(e) => handleInputChange('socialLinks.tiktok', e.target.value)}
                placeholder="https://tiktok.com/@username"
              />
            ) : (
              <div className="py-2 text-gray-900">
                {creator.socialLinks.tiktok ? (
                  <a 
                    href={creator.socialLinks.tiktok} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-700"
                  >
                    {creator.socialLinks.tiktok}
                  </a>
                ) : (
                  'Not provided'
                )}
              </div>
            )}
          </div>

          {/* YouTube */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Youtube className="w-4 h-4 inline mr-2" />
              YouTube
            </label>
            {isEditing ? (
              <Input
                type="url"
                value={formData.socialLinks.youtube}
                onChange={(e) => handleInputChange('socialLinks.youtube', e.target.value)}
                placeholder="https://youtube.com/@username"
              />
            ) : (
              <div className="py-2 text-gray-900">
                {creator.socialLinks.youtube ? (
                  <a 
                    href={creator.socialLinks.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-700"
                  >
                    {creator.socialLinks.youtube}
                  </a>
                ) : (
                  'Not provided'
                )}
              </div>
            )}
          </div>

          {/* Twitter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Twitter className="w-4 h-4 inline mr-2" />
              Twitter
            </label>
            {isEditing ? (
              <Input
                type="url"
                value={formData.socialLinks.twitter}
                onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                placeholder="https://twitter.com/username"
              />
            ) : (
              <div className="py-2 text-gray-900">
                {creator.socialLinks.twitter ? (
                  <a 
                    href={creator.socialLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-700"
                  >
                    {creator.socialLinks.twitter}
                  </a>
                ) : (
                  'Not provided'
                )}
              </div>
            )}
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-2" />
              Website
            </label>
            {isEditing ? (
              <Input
                type="url"
                value={formData.socialLinks.website}
                onChange={(e) => handleInputChange('socialLinks.website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            ) : (
              <div className="py-2 text-gray-900">
                {creator.socialLinks.website ? (
                  <a 
                    href={creator.socialLinks.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-700"
                  >
                    {creator.socialLinks.website}
                  </a>
                ) : (
                  'Not provided'
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Email Notifications</div>
                <div className="text-sm text-gray-600">
                  Receive emails about commissions, payments, and important updates
                </div>
              </div>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={formData.settings.emailNotifications}
                  onChange={(e) => handleInputChange('settings.emailNotifications', e.target.checked)}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
              ) : (
                <Badge variant={creator.settings.emailNotifications ? 'default' : 'secondary'}>
                  {creator.settings.emailNotifications ? 'Enabled' : 'Disabled'}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Public Profile</div>
                <div className="text-sm text-gray-600">
                  Allow your profile to be visible in our creator directory
                </div>
              </div>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={formData.settings.publicProfile}
                  onChange={(e) => handleInputChange('settings.publicProfile', e.target.checked)}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
              ) : (
                <Badge variant={creator.settings.publicProfile ? 'default' : 'secondary'}>
                  {creator.settings.publicProfile ? 'Public' : 'Private'}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Direct Messages</div>
                <div className="text-sm text-gray-600">
                  Allow brands and other creators to contact you directly
                </div>
              </div>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={formData.settings.allowDirectMessages}
                  onChange={(e) => handleInputChange('settings.allowDirectMessages', e.target.checked)}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
              ) : (
                <Badge variant={creator.settings.allowDirectMessages ? 'default' : 'secondary'}>
                  {creator.settings.allowDirectMessages ? 'Allowed' : 'Disabled'}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Member since:</span>
              <div className="font-medium text-gray-900">{formatDate(creator.createdAt)}</div>
            </div>
            {creator.approvedAt && (
              <div>
                <span className="text-gray-600">Approved on:</span>
                <div className="font-medium text-gray-900">{formatDate(creator.approvedAt)}</div>
              </div>
            )}
            <div>
              <span className="text-gray-600">Commission rate:</span>
              <div className="font-medium text-gray-900">{creator.commissionRate}%</div>
            </div>
            <div>
              <span className="text-gray-600">Minimum payout:</span>
              <div className="font-medium text-gray-900">${creator.minimumPayout}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}