/**
 * User Addresses API Routes
 * Handles user address management with authentication and validation
 * Implements CLAUDE_RULES.md API standards
 */

import { NextRequest } from 'next/server'
import { UserAddressSchema } from '@/types/auth'
import { getUserById, addUserAddress } from '@/lib/user-service'
import { requireAuth } from '@/lib/auth-middleware'
import {
  createSuccessResponse,
  createErrorResponse,
  validateRequestBody,
  withErrorHandling,
  handleCORS
} from '@/lib/api-utils'

// GET /api/user/addresses - Get user's addresses
async function getAddressesHandler(request: NextRequest) {
  // Authenticate user
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return authResult.error!
  }
  
  const { user } = authResult
  if (!user) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required', [], 401)
  }
  
  try {
    // Get user with addresses
    const fullUser = await getUserById(user.id)
    
    if (!fullUser) {
      return createErrorResponse('USER_NOT_FOUND', 'User not found', [], 404)
    }
    
    return createSuccessResponse({
      addresses: fullUser.addresses || [],
      count: fullUser.addresses?.length || 0
    })
  } catch (error) {
    console.error('Get addresses error:', error)
    throw error
  }
}

// POST /api/user/addresses - Add new address
async function addAddressHandler(request: NextRequest) {
  // Authenticate user
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return authResult.error!
  }
  
  const { user } = authResult
  if (!user) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required', [], 401)
  }
  
  // Validate request body
  const validation = await validateRequestBody(request, UserAddressSchema)
  if (!validation.success) {
    return validation.response
  }
  
  const addressData = validation.data
  
  try {
    // Add address to user
    const updatedUser = await addUserAddress(user.id, addressData)
    
    if (!updatedUser) {
      return createErrorResponse('USER_NOT_FOUND', 'User not found', [], 404)
    }
    
    // Find the newly added address
    const newAddress = updatedUser.addresses?.find(addr => 
      addr.address1 === addressData.address1 && 
      addr.city === addressData.city &&
      addr.postalCode === addressData.postalCode
    )
    
    return createSuccessResponse({
      message: 'Address added successfully',
      address: newAddress,
      totalAddresses: updatedUser.addresses?.length || 0
    }, undefined, 201)
  } catch (error) {
    console.error('Add address error:', error)
    throw error
  }
}

// Export handlers with error handling wrapper
export const GET = withErrorHandling(getAddressesHandler)
export const POST = withErrorHandling(addAddressHandler)
export const OPTIONS = handleCORS