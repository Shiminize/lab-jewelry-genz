/**
 * Individual User Address API Routes
 * Handles update and deletion of specific user addresses
 * Implements CLAUDE_RULES.md API standards
 */

import { NextRequest } from 'next/server'
import { UserAddressSchema } from '@/types/auth'
import { getUserById, updateUserAddress, deleteUserAddress } from '@/lib/user-service'
import { requireAuth } from '@/lib/auth-middleware'
import {
  createSuccessResponse,
  createErrorResponse,
  validateRequestBody,
  withErrorHandling,
  handleCORS
} from '@/lib/api-utils'

// PUT /api/user/addresses/[id] - Update specific address
async function updateAddressHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Authenticate user
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return authResult.error!
  }
  
  const { user } = authResult
  if (!user) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required', [], 401)
  }
  
  const addressId = params.id
  
  // Validate request body (make all fields optional for updates)
  const PartialAddressSchema = UserAddressSchema.partial()
  const validation = await validateRequestBody(request, PartialAddressSchema)
  if (!validation.success) {
    return validation.response
  }
  
  const updateData = validation.data
  
  try {
    // Verify user owns this address
    const currentUser = await getUserById(user.id)
    if (!currentUser) {
      return createErrorResponse('USER_NOT_FOUND', 'User not found', [], 404)
    }
    
    const addressExists = currentUser.addresses?.some(addr => addr.id === addressId)
    if (!addressExists) {
      return createErrorResponse('ADDRESS_NOT_FOUND', 'Address not found', [], 404)
    }
    
    // Update address
    const updatedUser = await updateUserAddress(user.id, addressId, updateData)
    
    if (!updatedUser) {
      return createErrorResponse('UPDATE_FAILED', 'Failed to update address', [], 400)
    }
    
    // Find the updated address
    const updatedAddress = updatedUser.addresses?.find(addr => addr.id === addressId)
    
    return createSuccessResponse({
      message: 'Address updated successfully',
      address: updatedAddress
    })
  } catch (error) {
    console.error('Update address error:', error)
    throw error
  }
}

// DELETE /api/user/addresses/[id] - Delete specific address
async function deleteAddressHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Authenticate user
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return authResult.error!
  }
  
  const { user } = authResult
  if (!user) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required', [], 401)
  }
  
  const addressId = params.id
  
  try {
    // Verify user owns this address
    const currentUser = await getUserById(user.id)
    if (!currentUser) {
      return createErrorResponse('USER_NOT_FOUND', 'User not found', [], 404)
    }
    
    const addressExists = currentUser.addresses?.some(addr => addr.id === addressId)
    if (!addressExists) {
      return createErrorResponse('ADDRESS_NOT_FOUND', 'Address not found', [], 404)
    }
    
    // Delete address
    const updatedUser = await deleteUserAddress(user.id, addressId)
    
    if (!updatedUser) {
      return createErrorResponse('DELETE_FAILED', 'Failed to delete address', [], 400)
    }
    
    return createSuccessResponse({
      message: 'Address deleted successfully',
      remainingAddresses: updatedUser.addresses?.length || 0
    })
  } catch (error) {
    console.error('Delete address error:', error)
    throw error
  }
}

// GET /api/user/addresses/[id] - Get specific address
async function getAddressHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Authenticate user
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return authResult.error!
  }
  
  const { user } = authResult
  if (!user) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required', [], 401)
  }
  
  const addressId = params.id
  
  try {
    // Get user with addresses
    const currentUser = await getUserById(user.id)
    if (!currentUser) {
      return createErrorResponse('USER_NOT_FOUND', 'User not found', [], 404)
    }
    
    // Find the specific address
    const address = currentUser.addresses?.find(addr => addr.id === addressId)
    if (!address) {
      return createErrorResponse('ADDRESS_NOT_FOUND', 'Address not found', [], 404)
    }
    
    return createSuccessResponse({
      address
    })
  } catch (error) {
    console.error('Get address error:', error)
    throw error
  }
}

// Export handlers with error handling wrapper
export const GET = withErrorHandling(getAddressHandler)
export const PUT = withErrorHandling(updateAddressHandler)
export const DELETE = withErrorHandling(deleteAddressHandler)
export const OPTIONS = handleCORS