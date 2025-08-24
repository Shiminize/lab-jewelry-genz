'use client'

/**
 * Payout Request Component
 * Allows creators to request payouts when eligible
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  DollarSign,
  CreditCard,
  Building2,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'

interface PayoutEligibility {
  creatorId: string
  totalEarnings: number
  availableForPayout: number
  minimumPayout: number
  isEligible: boolean
  transactionIds: string[]
}

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  minAmount: number
  description: string
  fields: Array<{
    name: string
    label: string
    type: string
    placeholder: string
    required: boolean
  }>
}

export default function PayoutRequest() {
  const [eligibility, setEligibility] = useState<PayoutEligibility | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string>('paypal')
  const [payoutAmount, setPayoutAmount] = useState<string>('')
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>({})
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'paypal',
      name: 'PayPal',
      icon: <span className="text-blue-600">💳</span>,
      minAmount: 25,
      description: 'Fast and secure PayPal transfer',
      fields: [
        {
          name: 'email',
          label: 'PayPal Email',
          type: 'email',
          placeholder: 'your-email@example.com',
          required: true
        }
      ]
    },
    {
      id: 'stripe',
      name: 'Debit Card',
      icon: <CreditCard className="w-4 h-4 text-purple-600" />,
      minAmount: 10,
      description: 'Direct transfer to your debit card',
      fields: [
        {
          name: 'cardNumber',
          label: 'Card Number',
          type: 'text',
          placeholder: '**** **** **** 1234',
          required: true
        },
        {
          name: 'cardName',
          label: 'Name on Card',
          type: 'text',
          placeholder: 'John Doe',
          required: true
        }
      ]
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: <Building2 className="w-4 h-4 text-green-600" />,
      minAmount: 50,
      description: 'ACH transfer to your bank account',
      fields: [
        {
          name: 'accountNumber',
          label: 'Account Number',
          type: 'text',
          placeholder: '****1234',
          required: true
        },
        {
          name: 'routingNumber',
          label: 'Routing Number',
          type: 'text',
          placeholder: '123456789',
          required: true
        },
        {
          name: 'accountName',
          label: 'Account Holder Name',
          type: 'text',
          placeholder: 'John Doe',
          required: true
        }
      ]
    }
  ]

  useEffect(() => {
    fetchEligibility()
  }, [])

  const fetchEligibility = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/creators/payouts')
      const result = await response.json()

      if (result.success) {
        setEligibility(result.data.eligibility)
      }
    } catch (error) {
      console.error('Error fetching eligibility:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMethodChange = (methodId: string) => {
    setSelectedMethod(methodId)
    setPaymentDetails({})
  }

  const handleFieldChange = (fieldName: string, value: string) => {
    setPaymentDetails(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const handleSubmit = async () => {
    if (!eligibility) return

    const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod)
    if (!selectedPaymentMethod) return

    const amount = parseFloat(payoutAmount)
    if (isNaN(amount) || amount < selectedPaymentMethod.minAmount) {
      setError(`Minimum payout amount is $${selectedPaymentMethod.minAmount}`)
      return
    }

    if (amount > eligibility.availableForPayout) {
      setError('Payout amount exceeds available balance')
      return
    }

    // Validate required fields
    const missingFields = selectedPaymentMethod.fields
      .filter(field => field.required && !paymentDetails[field.name])
      .map(field => field.label)

    if (missingFields.length > 0) {
      setError(`Please fill in required fields: ${missingFields.join(', ')}`)
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const response = await fetch('/api/creators/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          paymentMethod: selectedMethod,
          paymentDetails: JSON.stringify(paymentDetails),
          transactionIds: eligibility.transactionIds
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Payout request submitted successfully!')
        setShowForm(false)
        setPayoutAmount('')
        setPaymentDetails({})
        fetchEligibility() // Refresh eligibility
      } else {
        setError(result.error?.message || 'Failed to submit payout request')
      }
    } catch (error) {
      console.error('Error submitting payout:', error)
      setError('Failed to submit payout request')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <LoadingSpinner text="Loading payout information..." />
        </CardContent>
      </Card>
    )
  }

  if (!eligibility) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">Unable to load payout information</div>
          <p className="text-gray-500">Please try again later</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{success}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Eligibility Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Payout Eligibility</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(eligibility.totalEarnings)}
              </div>
              <div className="text-sm text-gray-500">Total Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(eligibility.availableForPayout)}
              </div>
              <div className="text-sm text-gray-500">Available for Payout</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {formatCurrency(eligibility.minimumPayout)}
              </div>
              <div className="text-sm text-gray-500">Minimum Payout</div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Badge 
              variant={eligibility.isEligible ? 'default' : 'secondary'}
              className="text-sm"
            >
              {eligibility.isEligible ? 'Eligible for Payout' : 'Not Eligible'}
            </Badge>
          </div>

          {!eligibility.isEligible && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <div className="font-medium mb-1">Payout Requirements</div>
                  <p>You need at least {formatCurrency(eligibility.minimumPayout)} in approved commissions to request a payout.</p>
                </div>
              </div>
            </div>
          )}

          {eligibility.isEligible && !showForm && (
            <div className="text-center">
              <Button onClick={() => setShowForm(true)}>
                Request Payout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Request Form */}
      {showForm && eligibility.isEligible && (
        <Card>
          <CardHeader>
            <CardTitle>Request Payout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payout Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                  min="10"
                  max={eligibility.availableForPayout}
                  step="0.01"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum: {formatCurrency(eligibility.availableForPayout)}
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleMethodChange(method.id)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedMethod === method.id
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {method.icon}
                      <span className="font-medium">{method.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{method.description}</p>
                    <p className="text-xs text-gray-500">Min: ${method.minAmount}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            {selectedMethod && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Details
                </label>
                <div className="space-y-3">
                  {paymentMethods
                    .find(m => m.id === selectedMethod)
                    ?.fields.map((field) => (
                      <div key={field.name}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {field.label} {field.required && '*'}
                        </label>
                        <Input
                          type={field.type}
                          value={paymentDetails[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          required={field.required}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleSubmit}
                disabled={submitting || !payoutAmount || parseFloat(payoutAmount) <= 0}
                className="flex-1"
              >
                {submitting ? 'Submitting...' : 'Submit Payout Request'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setError('')
                  setPayoutAmount('')
                  setPaymentDetails({})
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}