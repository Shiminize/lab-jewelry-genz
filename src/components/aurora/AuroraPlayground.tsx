'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AuroraButton,
  AuroraCard,
  AuroraCardHeader,
  AuroraCardContent,
  AuroraCardTitle,
  AuroraContainer,
  AuroraGrid,
  AuroraFlex,
  AuroraTextGradient
} from '@/components/aurora'
import { AuroraHero, AuroraStatement, AuroraTitleM, AuroraBodyM } from '@/components/foundation/Typography'
import { cn } from '@/lib/utils'

// =========================================
// PLAYGROUND TYPES
// =========================================

interface PlaygroundState {
  component: 'button' | 'card' | 'typography' | 'gradient'
  props: Record<string, any>
  code: string
  preview: boolean
}

interface ComponentConfig {
  name: string
  props: PropConfig[]
  defaultProps: Record<string, any>
  generateCode: (props: Record<string, any>) => string
}

interface PropConfig {
  name: string
  type: 'select' | 'boolean' | 'range' | 'text' | 'color'
  options?: string[]
  min?: number
  max?: number
  step?: number
  default: any
}

// =========================================
// COMPONENT CONFIGURATIONS
// =========================================

const componentConfigs: Record<string, ComponentConfig> = {
  button: {
    name: 'AuroraButton',
    props: [
      {
        name: 'variant',
        type: 'select',
        options: ['primary', 'secondary', 'outline', 'ghost', 'accent'],
        default: 'primary'
      },
      {
        name: 'size',
        type: 'select',
        options: ['sm', 'default', 'lg', 'xl', 'icon'],
        default: 'default'
      },
      {
        name: 'luxury',
        type: 'select',
        options: ['standard', 'premium', 'exclusive'],
        default: 'standard'
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: false
      }
    ],
    defaultProps: {
      variant: 'primary',
      size: 'default',
      luxury: 'standard',
      disabled: false,
      children: 'Aurora Button'
    },
    generateCode: (props) => `<AuroraButton
  variant="${props.variant}"
  size="${props.size}"
  luxury="${props.luxury}"${props.disabled ? '\n  disabled' : ''}
>
  ${props.children}
</AuroraButton>`
  },
  
  card: {
    name: 'AuroraCard',
    props: [
      {
        name: 'variant',
        type: 'select',
        options: ['default', 'floating', 'premium', 'product', 'interactive'],
        default: 'default'
      },
      {
        name: 'material',
        type: 'select',
        options: ['neutral', 'gold', 'platinum', 'silver', 'rose-gold', 'diamond'],
        default: 'neutral'
      },
      {
        name: 'padding',
        type: 'select',
        options: ['none', 'sm', 'default', 'lg', 'xl'],
        default: 'default'
      },
      {
        name: 'border',
        type: 'select',
        options: ['none', 'default', 'accent', 'premium'],
        default: 'default'
      }
    ],
    defaultProps: {
      variant: 'default',
      material: 'neutral',
      padding: 'default',
      border: 'default'
    },
    generateCode: (props) => `<AuroraCard
  variant="${props.variant}"
  material="${props.material}"
  padding="${props.padding}"
  border="${props.border}"
>
  <AuroraCardHeader>
    <AuroraCardTitle>Card Title</AuroraCardTitle>
  </AuroraCardHeader>
  <AuroraCardContent>
    Card content goes here
  </AuroraCardContent>
</AuroraCard>`
  },
  
  typography: {
    name: 'AuroraHero',
    props: [
      {
        name: 'level',
        type: 'select',
        options: ['hero', 'statement', 'title-xl', 'title-l', 'title-m', 'body-xl', 'body-l', 'body-m', 'small', 'micro'],
        default: 'body-m'
      },
      {
        name: 'color',
        type: 'select',
        options: ['default', 'primary', 'secondary', 'muted', 'inverse', 'accent', 'pink', 'crimson'],
        default: 'default'
      },
      {
        name: 'effect',
        type: 'select',
        options: ['none', 'gradient', 'iridescent', 'shimmer', 'glow'],
        default: 'none'
      },
      {
        name: 'weight',
        type: 'select',
        options: ['light', 'normal', 'medium', 'semibold', 'bold', 'extrabold'],
        default: 'normal'
      }
    ],
    defaultProps: {
      level: 'body-m',
      color: 'default',
      effect: 'none',
      weight: 'normal',
      children: 'Aurora Typography Sample'
    },
    generateCode: (props) => `<AuroraHero
  level="${props.level}"
  color="${props.color}"
  effect="${props.effect}"
  weight="${props.weight}"
>
  ${props.children}
</AuroraHero>`
  },
  
  gradient: {
    name: 'AuroraTextGradient',
    props: [
      {
        name: 'variant',
        type: 'select',
        options: ['primary', 'accent', 'luxury', 'iridescent'],
        default: 'primary'
      }
    ],
    defaultProps: {
      variant: 'primary',
      children: 'Gradient Text Effect'
    },
    generateCode: (props) => `<AuroraTextGradient variant="${props.variant}">
  ${props.children}
</AuroraTextGradient>`
  }
}

// =========================================
// PLAYGROUND COMPONENTS  
// =========================================

function PropEditor({ 
  propConfig, 
  value, 
  onChange 
}: { 
  propConfig: PropConfig
  value: any
  onChange: (value: any) => void 
}) {
  const handleChange = useCallback((newValue: any) => {
    onChange(newValue)
  }, [onChange])

  switch (propConfig.type) {
    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-token-md bg-white border-border focus:ring-2 focus:ring-nebula-purple focus:border-transparent"
        >
          {propConfig.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )
      
    case 'boolean':
      return (
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleChange(e.target.checked)}
            className="w-4 h-4 text-nebula-purple border-border rounded focus:ring-nebula-purple"
          />
          <span className="text-sm">{value ? 'True' : 'False'}</span>
        </label>
      )
      
    case 'range':
      return (
        <div className="space-y-2">
          <input
            type="range"
            min={propConfig.min}
            max={propConfig.max}
            step={propConfig.step}
            value={value}
            onChange={(e) => handleChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-lunar-grey rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-xs text-aurora-nav-muted text-center">{value}</div>
        </div>
      )
      
    case 'text':
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-token-md bg-white border-border focus:ring-2 focus:ring-nebula-purple focus:border-transparent"
        />
      )
      
    case 'color':
      return (
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-8 h-8 border rounded-token-sm border-border cursor-pointer"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border rounded-token-md bg-white border-border focus:ring-2 focus:ring-nebula-purple focus:border-transparent font-mono"
          />
        </div>
      )
      
    default:
      return null
  }
}

function CodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }, [code])

  return (
    <div className="relative">
      <pre className="bg-deep-space text-high-contrast p-token-lg rounded-token-md text-sm overflow-x-auto font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
      
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 px-3 py-1 text-xs bg-nebula-purple text-white rounded-token-sm hover:bg-nebula-purple/90 transition-colors"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

function ComponentPreview({ 
  component, 
  props 
}: { 
  component: string
  props: Record<string, any> 
}) {
  const renderComponent = () => {
    switch (component) {
      case 'button':
        return (
          <AuroraButton
            variant={props.variant}
            size={props.size}
            luxury={props.luxury}
            disabled={props.disabled}
          >
            {props.children}
          </AuroraButton>
        )
        
      case 'card':
        return (
          <AuroraCard
            variant={props.variant}
            material={props.material}
            padding={props.padding}
            border={props.border}
            className="w-full max-w-sm"
          >
            <AuroraCardHeader>
              <AuroraCardTitle>Card Title</AuroraCardTitle>
            </AuroraCardHeader>
            <AuroraCardContent>
              <p>Card content demonstrating the selected styling options.</p>
            </AuroraCardContent>
          </AuroraCard>
        )
        
      case 'typography':
        return (
          <AuroraHero>
            {props.children}
          </AuroraHero>
        )
        
      case 'gradient':
        return (
          <AuroraTextGradient variant={props.variant}>
            {props.children}
          </AuroraTextGradient>
        )
        
      default:
        return <div>Component not found</div>
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[200px] bg-gradient-to-br from-lunar-grey to-white rounded-token-lg border-2 border-dashed border-border p-token-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${component}-${JSON.stringify(props)}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          {renderComponent()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// =========================================
// MAIN PLAYGROUND COMPONENT
// =========================================

export function AuroraPlayground() {
  const [activeComponent, setActiveComponent] = useState<string>('button')
  const [componentProps, setComponentProps] = useState<Record<string, any>>(
    componentConfigs.button.defaultProps
  )
  const [showCode, setShowCode] = useState(true)

  const config = componentConfigs[activeComponent]

  const handleComponentChange = useCallback((newComponent: string) => {
    setActiveComponent(newComponent)
    setComponentProps(componentConfigs[newComponent].defaultProps)
  }, [])

  const handlePropChange = useCallback((propName: string, value: any) => {
    setComponentProps(prev => ({ ...prev, [propName]: value }))
  }, [])

  const generatedCode = config.generateCode(componentProps)

  return (
    <AuroraContainer size="xl" className="py-token-2xl">
      <AuroraStatement className="text-center mb-token-xl bg-gradient-to-r from-accent via-foreground to-accent bg-clip-text text-transparent">
        Interactive Component Playground
      </AuroraStatement>
      
      <AuroraBodyM className="text-center mb-token-2xl text-aurora-nav-muted max-w-3xl mx-auto">
        Modify properties in real-time and see Aurora Design System components adapt instantly. 
        Copy the generated code to use in your own projects.
      </AuroraBodyM>

      <AuroraGrid cols={1} gap="xl" className="lg:grid-cols-3">
        {/* Component Selector */}
        <AuroraCard variant="floating" padding="lg">
          <AuroraCardHeader>
            <AuroraCardTitle>Component</AuroraCardTitle>
          </AuroraCardHeader>
          <AuroraCardContent>
            <AuroraFlex direction="col" gap="sm">
              {Object.entries(componentConfigs).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleComponentChange(key)}
                  className={cn(
                    "px-4 py-3 text-left rounded-token-md transition-all duration-200",
                    activeComponent === key
                      ? "bg-nebula-purple text-white shadow-aurora-md"
                      : "bg-lunar-grey hover:bg-starlight-gray text-deep-space"
                  )}
                >
                  <div className="font-semibold">{config.name}</div>
                  <div className="text-sm opacity-80 mt-1">
                    {config.props.length} props
                  </div>
                </button>
              ))}
            </AuroraFlex>
          </AuroraCardContent>
        </AuroraCard>

        {/* Props Editor */}
        <AuroraCard variant="floating" padding="lg">
          <AuroraCardHeader>
            <AuroraCardTitle>Properties</AuroraCardTitle>
          </AuroraCardHeader>
          <AuroraCardContent>
            <div className="space-y-token-lg">
              {config.props.map((propConfig) => (
                <div key={propConfig.name}>
                  <label className="block text-sm font-medium text-deep-space mb-2">
                    {propConfig.name}
                  </label>
                  <PropEditor
                    propConfig={propConfig}
                    value={componentProps[propConfig.name]}
                    onChange={(value) => handlePropChange(propConfig.name, value)}
                  />
                </div>
              ))}
              
              {/* Text content editor for applicable components */}
              {['button', 'typography', 'gradient'].includes(activeComponent) && (
                <div>
                  <label className="block text-sm font-medium text-deep-space mb-2">
                    Content
                  </label>
                  <PropEditor
                    propConfig={{ name: 'children', type: 'text', default: '' }}
                    value={componentProps.children || ''}
                    onChange={(value) => handlePropChange('children', value)}
                  />
                </div>
              )}
            </div>
          </AuroraCardContent>
        </AuroraCard>

        {/* Preview & Code */}
        <AuroraCard variant="floating" padding="lg">
          <AuroraCardHeader>
            <AuroraFlex justify="between" align="center">
              <AuroraCardTitle>Preview</AuroraCardTitle>
              <button
                onClick={() => setShowCode(!showCode)}
                className="px-3 py-1 text-xs bg-aurora-pink text-white rounded-token-md hover:bg-aurora-crimson transition-colors"
              >
                {showCode ? 'Hide Code' : 'Show Code'}
              </button>
            </AuroraFlex>
          </AuroraCardHeader>
          <AuroraCardContent>
            <div className="space-y-token-lg">
              <ComponentPreview component={activeComponent} props={componentProps} />
              
              <AnimatePresence>
                {showCode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CodeDisplay code={generatedCode} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </AuroraCardContent>
        </AuroraCard>
      </AuroraGrid>

      {/* Usage Instructions */}
      <AuroraCard variant="premium" padding="xl" className="mt-token-2xl">
        <AuroraCardHeader>
          <AuroraCardTitle>
            <AuroraTextGradient variant="luxury">
              Usage Instructions
            </AuroraTextGradient>
          </AuroraCardTitle>
        </AuroraCardHeader>
        <AuroraCardContent>
          <AuroraGrid cols={1} gap="lg" className="md:grid-cols-2">
            <div>
              <AuroraTitleM className="mb-token-md">
                Getting Started
              </AuroraTitleM>
              <ol className="space-y-2 text-sm text-aurora-nav-muted">
                <li>1. Select a component from the list</li>
                <li>2. Adjust properties using the controls</li>
                <li>3. View real-time preview updates</li>
                <li>4. Copy generated code for your project</li>
              </ol>
            </div>
            
            <div>
              <AuroraTitleM className="mb-token-md">
                Import Statement
              </AuroraTitleM>
              <CodeDisplay 
                code={`import { ${config.name} } from '@/components/aurora'`} 
              />
            </div>
          </AuroraGrid>
        </AuroraCardContent>
      </AuroraCard>
    </AuroraContainer>
  )
}