'use client'

import React from 'react'
import { Leaf, Droplets, Zap, Recycle, Truck, Globe, Microscope, Clock, Gem, CheckCircle, Users, Flame } from 'lucide-react'

export interface ImpactMetric {
  icon: React.ReactElement
  value: string
  label: string
  description: string
  comparison?: string
}

export interface ProcessStep {
  icon: React.ReactElement
  title: string
  description: string
}

export interface Certification {
  icon: React.ReactElement
  name: string
  description: string
  variant?: 'verified' | 'certified' | 'partner'
}

export interface ComparisonPoint {
  aspect: string
  traditional: string
  labGrown: string
  impact: 'negative' | 'positive' | 'neutral'
}

export const impactMetrics: ImpactMetric[] = [
  {
    icon: <Leaf className="w-5 h-5" />,
    value: '95%',
    label: 'Less Environmental Impact',
    description: 'Compared to traditional diamond mining',
    comparison: 'vs. mined diamonds'
  },
  {
    icon: <Droplets className="w-5 h-5" />,
    value: '0',
    label: 'Water Pollution',
    description: 'Zero contamination from mining operations',
    comparison: 'mining causes 100+ toxic spills yearly'
  },
  {
    icon: <Zap className="w-5 h-5" />,
    value: '100%',
    label: 'Renewable Energy',
    description: 'All our lab facilities powered by clean energy',
    comparison: 'traditional mining: <10% renewable'
  },
  {
    icon: <Recycle className="w-5 h-5" />,
    value: '80%',
    label: 'Recycled Metals',
    description: 'Precious metals given new life in our settings',
    comparison: '2x industry average'
  },
  {
    icon: <Truck className="w-5 h-5" />,
    value: '100%',
    label: 'Carbon Neutral Shipping',
    description: 'Offset all emissions from production to your door',
    comparison: 'industry first commitment'
  },
  {
    icon: <Globe className="w-5 h-5" />,
    value: '0.07',
    label: 'Carats per Ton of Earth',
    description: 'Lab creation vs mining displacement',
    comparison: 'mining: removes 250 tons per carat'
  }
]

export const processSteps: ProcessStep[] = [
  {
    icon: <Microscope className="w-6 h-6" />,
    title: 'Carbon Seed Placement',
    description: 'A tiny diamond seed is placed in a specialized chamber with precise carbon composition'
  },
  {
    icon: <Flame className="w-6 h-6" />,
    title: 'High Pressure & Heat',
    description: 'Conditions mirror deep Earth: 2,000°F temperature and 1.5 million PSI pressure'
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: '2-4 Week Growth',
    description: 'Carbon atoms crystallize layer by layer, forming identical atomic structure to mined diamonds'
  },
  {
    icon: <Gem className="w-6 h-6" />,
    title: 'Cut & Polish',
    description: 'Master craftsmen cut and polish each diamond to reveal its maximum brilliance and fire'
  }
]

export const certifications: Certification[] = [
  {
    icon: <Microscope className="w-6 h-6" />,
    name: 'IGI Certified',
    description: 'International Gemological Institute authentication',
    variant: 'certified'
  },
  {
    icon: <CheckCircle className="w-5 h-5" />,
    name: 'SCS Global Verified',
    description: 'Third-party sustainability certification',
    variant: 'verified'
  },
  {
    icon: <Users className="w-5 h-5" />,
    name: 'Responsible Jewelry Council',
    description: 'Industry-leading ethical standards member',
    variant: 'partner'
  },
  {
    icon: <Leaf className="w-5 h-5" />,
    name: 'Carbon Trust Certified',
    description: 'Carbon footprint measurement and reduction verified',
    variant: 'verified'
  }
]

export const comparisonData: ComparisonPoint[] = [
  {
    aspect: 'Environmental Impact',
    traditional: 'Massive land disruption, habitat destruction',
    labGrown: 'Minimal footprint, controlled environment',
    impact: 'positive'
  },
  {
    aspect: 'Water Usage',
    traditional: '126+ gallons per carat',
    labGrown: '<1 gallon per carat',
    impact: 'positive'
  },
  {
    aspect: 'Carbon Emissions',
    traditional: '125+ lbs CO₂ per carat',
    labGrown: '6 lbs CO₂ per carat (offset to zero)',
    impact: 'positive'
  },
  {
    aspect: 'Human Impact',
    traditional: 'Potential conflict sourcing, dangerous working conditions',
    labGrown: 'Safe, ethical working conditions, living wages',
    impact: 'positive'
  },
  {
    aspect: 'Quality & Beauty',
    traditional: 'Identical chemical & optical properties',
    labGrown: 'Identical chemical & optical properties',
    impact: 'neutral'
  },
  {
    aspect: 'Value & Pricing',
    traditional: 'Higher cost due to mining complexity',
    labGrown: '30-40% better value for equivalent quality',
    impact: 'positive'
  }
]


