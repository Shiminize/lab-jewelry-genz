'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Settings } from 'lucide-react'

interface CreatorSettings {
  emailNotifications: boolean
  publicProfile: boolean
  allowDirectMessages: boolean
}

interface Creator {
  settings: CreatorSettings
}

interface FormData {
  settings: CreatorSettings
}

interface CreatorSettingsProps {
  creator: Creator
  isEditing: boolean
  formData: FormData
  onInputChange: (field: string, value: boolean) => void
  className?: string
}

const SettingsToggle = ({
  title,
  description,
  field,
  isEditing,
  checked,
  displayValue,
  onChange
}: {
  title: string
  description: string
  field: string
  isEditing: boolean
  checked: boolean
  displayValue: boolean
  onChange: (field: string, value: boolean) => void
}) => (
  <div className="flex items-center justify-between">
    <div>
      <div className="font-medium text-foreground">{title}</div>
      <div className="text-sm text-aurora-nav-muted">
        {description}
      </div>
    </div>
    {isEditing ? (
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(field, e.target.checked)}
        className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-border rounded"
      />
    ) : (
      <Badge variant={displayValue ? 'default' : 'secondary'}>
        {getSettingLabel(field, displayValue)}
      </Badge>
    )}
  </div>
)

function getSettingLabel(field: string, value: boolean): string {
  if (field === 'settings.emailNotifications') {
    return value ? 'Enabled' : 'Disabled'
  }
  if (field === 'settings.publicProfile') {
    return value ? 'Public' : 'Private'
  }
  if (field === 'settings.allowDirectMessages') {
    return value ? 'Allowed' : 'Disabled'
  }
  return value ? 'On' : 'Off'
}

export function CreatorSettingsComponent({
  creator,
  isEditing,
  formData,
  onInputChange,
  className
}: CreatorSettingsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-token-sm">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-token-md">
        <div className="space-y-token-md">
          <SettingsToggle
            title="Email Notifications"
            description="Receive emails about commissions, payments, and important updates"
            field="settings.emailNotifications"
            isEditing={isEditing}
            checked={formData.settings.emailNotifications}
            displayValue={creator.settings.emailNotifications}
            onChange={onInputChange}
          />

          <SettingsToggle
            title="Public Profile"
            description="Allow your profile to be visible in our creator directory"
            field="settings.publicProfile"
            isEditing={isEditing}
            checked={formData.settings.publicProfile}
            displayValue={creator.settings.publicProfile}
            onChange={onInputChange}
          />

          <SettingsToggle
            title="Direct Messages"
            description="Allow brands and other creators to contact you directly"
            field="settings.allowDirectMessages"
            isEditing={isEditing}
            checked={formData.settings.allowDirectMessages}
            displayValue={creator.settings.allowDirectMessages}
            onChange={onInputChange}
          />
        </div>
      </CardContent>
    </Card>
  )
}