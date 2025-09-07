'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Globe, Instagram, Twitter, Youtube } from 'lucide-react'

interface SocialLinks {
  instagram?: string
  tiktok?: string
  youtube?: string
  twitter?: string
  website?: string
}

interface Creator {
  socialLinks: SocialLinks
}

interface FormData {
  socialLinks: SocialLinks
}

interface CreatorSocialLinksProps {
  creator: Creator
  isEditing: boolean
  formData: FormData
  onInputChange: (field: string, value: string) => void
  className?: string
}

const SocialLinkField = ({
  icon,
  label,
  field,
  placeholder,
  value,
  displayValue,
  isEditing,
  onChange
}: {
  icon: React.ReactNode
  label: string
  field: string
  placeholder: string
  value: string
  displayValue?: string
  isEditing: boolean
  onChange: (field: string, value: string) => void
}) => (
  <div>
    <label className="block text-sm font-medium text-aurora-nav-muted mb-2">
      {icon}
      {label}
    </label>
    {isEditing ? (
      <Input
        type="url"
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
      />
    ) : (
      <div className="py-2 text-foreground">
        {displayValue ? (
          <a 
            href={displayValue} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-amber-600 hover:text-amber-700"
          >
            {displayValue}
          </a>
        ) : (
          'Not provided'
        )}
      </div>
    )}
  </div>
)

export function CreatorSocialLinks({
  creator,
  isEditing,
  formData,
  onInputChange,
  className
}: CreatorSocialLinksProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-token-sm">
          <Globe className="w-5 h-5" />
          <span>Social Links</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-token-md">
        <SocialLinkField
          icon={<Instagram className="w-4 h-4 inline mr-2" />}
          label="Instagram"
          field="socialLinks.instagram"
          placeholder="https://instagram.com/username"
          value={formData.socialLinks.instagram || ''}
          displayValue={creator.socialLinks.instagram}
          isEditing={isEditing}
          onChange={onInputChange}
        />

        <SocialLinkField
          icon={<span className="w-4 h-4 inline-block mr-2 text-center">🎵</span>}
          label="TikTok"
          field="socialLinks.tiktok"
          placeholder="https://tiktok.com/@username"
          value={formData.socialLinks.tiktok || ''}
          displayValue={creator.socialLinks.tiktok}
          isEditing={isEditing}
          onChange={onInputChange}
        />

        <SocialLinkField
          icon={<Youtube className="w-4 h-4 inline mr-2" />}
          label="YouTube"
          field="socialLinks.youtube"
          placeholder="https://youtube.com/@username"
          value={formData.socialLinks.youtube || ''}
          displayValue={creator.socialLinks.youtube}
          isEditing={isEditing}
          onChange={onInputChange}
        />

        <SocialLinkField
          icon={<Twitter className="w-4 h-4 inline mr-2" />}
          label="Twitter"
          field="socialLinks.twitter"
          placeholder="https://twitter.com/username"
          value={formData.socialLinks.twitter || ''}
          displayValue={creator.socialLinks.twitter}
          isEditing={isEditing}
          onChange={onInputChange}
        />

        <SocialLinkField
          icon={<Globe className="w-4 h-4 inline mr-2" />}
          label="Website"
          field="socialLinks.website"
          placeholder="https://yourwebsite.com"
          value={formData.socialLinks.website || ''}
          displayValue={creator.socialLinks.website}
          isEditing={isEditing}
          onChange={onInputChange}
        />
      </CardContent>
    </Card>
  )
}