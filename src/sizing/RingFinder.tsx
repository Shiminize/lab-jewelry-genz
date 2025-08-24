'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { 
  Target,
  Calculator,
  Download,
  CheckCircle,
  AlertTriangle,
  Ruler,
  Smartphone
} from 'lucide-react'

interface RingFinderProps {
  measurements: any
  handleMeasurementChange: (field: string, value: string) => void
  convertedSizes: any
}

export function RingFinder({ measurements, handleMeasurementChange, convertedSizes }: RingFinderProps) {
  const [selectedMethod, setSelectedMethod] = useState('string')

  const methods = [
    {
      id: 'string',
      name: 'String Method',
      description: 'Wrap string around finger and measure',
      accuracy: 'High',
      difficulty: 'Easy'
    },
    {
      id: 'paper',
      name: 'Paper Strip',
      description: 'Use our printable paper ring sizer',
      accuracy: 'Very High',
      difficulty: 'Easy'
    },
    {
      id: 'existing',
      name: 'Existing Ring',
      description: 'Measure a ring that fits well',
      accuracy: 'Highest',
      difficulty: 'Very Easy'
    },
    {
      id: 'app',
      name: 'Mobile App',
      description: 'Use your phone camera to measure',
      accuracy: 'High',
      difficulty: 'Easy'
    }
  ]

  const renderStringMethod = () => (
    <div className="bg-background p-8 space-y-6">
      <div className="align-marketing">
        <Target className="w-12 h-12 mx-auto mb-4 text-accent" />
        <h3 className="text-subsection-heading mb-4">String Method</h3>
        <p className="text-body-regular text-foreground/70">
          The most accurate home measurement method using common household items.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h4 className="text-body-small font-medium text-foreground">What You&apos;ll Need:</h4>
          <ul className="space-y-3">
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span className="text-body-small">String or thin paper strip</span>
            </li>
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span className="text-body-small">Ruler or measuring tape</span>
            </li>
            <li className="flex items-center space-x-3">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span className="text-body-small">Pen or marker</span>
            </li>
          </ul>

          <div className="space-y-4">
            <h4 className="text-body-small font-medium text-foreground">Step-by-Step Instructions:</h4>
            <ol className="space-y-3">
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-foreground text-luxury-gold text-body-tiny flex items-center justify-center font-bold">1</span>
                <span className="text-body-small text-foreground/80">Wrap string around the base of your finger</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-foreground text-luxury-gold text-body-tiny flex items-center justify-center font-bold">2</span>
                <span className="text-body-small text-foreground/80">Mark where the string overlaps</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-foreground text-luxury-gold text-body-tiny flex items-center justify-center font-bold">3</span>
                <span className="text-body-small text-foreground/80">Measure the marked length in millimeters</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-foreground text-luxury-gold text-body-tiny flex items-center justify-center font-bold">4</span>
                <span className="text-body-small text-foreground/80">Enter measurement below for size conversion</span>
              </li>
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-body-small font-medium text-foreground mb-2">
              Finger Circumference (mm)
            </label>
            <input
              type="number"
              value={measurements.fingerCircumference}
              onChange={(e) => handleMeasurementChange('fingerCircumference', e.target.value)}
              className="w-full px-4 py-3 border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-colors"
              placeholder="Enter measurement in mm"
            />
          </div>

          {convertedSizes && (
            <div className="bg-muted p-6">
              <h4 className="text-body-small font-medium text-foreground mb-4">Your Ring Size:</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="align-marketing">
                  <div className="text-subsection-heading text-accent">{convertedSizes.US}</div>
                  <div className="text-caption text-foreground/70">US Size</div>
                </div>
                <div className="align-marketing">
                  <div className="text-subsection-heading text-accent">{convertedSizes.UK}</div>
                  <div className="text-caption text-foreground/70">UK Size</div>
                </div>
                <div className="align-marketing">
                  <div className="text-subsection-heading text-accent">{convertedSizes.EU}</div>
                  <div className="text-caption text-foreground/70">EU Size</div>
                </div>
                <div className="align-marketing">
                  <div className="text-subsection-heading text-accent">{convertedSizes.JP}</div>
                  <div className="text-caption text-foreground/70">JP Size</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-body-small font-medium text-blue-900 mb-1">Pro Tips:</h4>
                <ul className="text-caption text-blue-800 space-y-1">
                  <li>• Measure at room temperature</li>
                  <li>• Measure at the end of the day</li>
                  <li>• Make sure string isn&apos;t too tight or loose</li>
                  <li>• Measure dominant hand as it&apos;s usually larger</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPaperMethod = () => (
    <div className="bg-background p-8 align-marketing space-y-6">
      <Download className="w-12 h-12 mx-auto mb-4 text-accent" />
      <h3 className="text-subsection-heading mb-4">Printable Ring Sizer</h3>
      <p className="text-body-regular text-foreground/70 max-w-2xl mx-auto">
        Download and print our professional ring sizer for the most accurate home measurement.
      </p>
      <Button variant="primary" className="mx-auto">
        <Download className="w-4 h-4 mr-2" />
        Download Ring Sizer PDF
      </Button>
      <p className="text-caption text-foreground/60">
        Print at 100% scale. Do not scale to fit page.
      </p>
    </div>
  )

  const renderExistingMethod = () => (
    <div className="bg-background p-8 space-y-6">
      <div className="align-marketing">
        <Ruler className="w-12 h-12 mx-auto mb-4 text-accent" />
        <h3 className="text-subsection-heading mb-4">Existing Ring Method</h3>
        <p className="text-body-regular text-foreground/70">
          Use a ring that fits perfectly to find your size.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-body-small font-medium text-foreground mb-2">
          Inner Diameter (mm)
        </label>
        <input
          type="number"
          value={measurements.existingRingSize}
          onChange={(e) => handleMeasurementChange('existingRingSize', e.target.value)}
          className="w-full px-4 py-3 border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-colors"
          placeholder="Measure inner diameter in mm"
        />
        <p className="text-caption text-foreground/60">
          Measure the inside diameter of a ring that fits your finger perfectly.
        </p>
      </div>
    </div>
  )

  const renderAppMethod = () => (
    <div className="bg-background p-8 align-marketing space-y-6">
      <Smartphone className="w-12 h-12 mx-auto mb-4 text-accent" />
      <h3 className="text-subsection-heading mb-4">Mobile Ring Sizer</h3>
      <p className="text-body-regular text-foreground/70 max-w-2xl mx-auto">
        Use your smartphone camera with our AR-powered ring sizing tool.
      </p>
      <Button variant="secondary">
        Coming Soon - Mobile App
      </Button>
    </div>
  )

  return (
    <section className="py-12 bg-muted">
      <div className="container-luxury">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <Target className="w-12 h-12 mx-auto mb-6 text-accent" />
            <h2 className="text-section-heading mb-6">Ring Size Finder</h2>
            <p className="text-body-large text-foreground/70 max-w-3xl mx-auto text-left">
              Choose your preferred measurement method for accurate ring sizing.
            </p>
          </div>

          {/* Method Selection */}
          <div className="grid lg:grid-cols-4 gap-6 mb-12">
            {methods.map((method) => (
              <div 
                key={method.id}
                className={`bg-background p-6 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                  selectedMethod === method.id ? 'border-accent shadow-lg' : 'border-transparent'
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <h3 className="text-subsection-heading mb-3">{method.name}</h3>
                <p className="text-body-small text-foreground/70 mb-4">{method.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-caption text-foreground/60">Accuracy:</span>
                    <span className="text-caption font-medium text-accent">{method.accuracy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-caption text-foreground/60">Difficulty:</span>
                    <span className="text-caption font-medium">{method.difficulty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Method Content */}
          <div className="mb-8">
            {selectedMethod === 'string' && renderStringMethod()}
            {selectedMethod === 'paper' && renderPaperMethod()}
            {selectedMethod === 'existing' && renderExistingMethod()}
            {selectedMethod === 'app' && renderAppMethod()}
          </div>
        </div>
      </div>
    </section>
  )
}