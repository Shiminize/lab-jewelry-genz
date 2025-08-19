/**
 * Referral Link Redirect and Tracking API
 * Handles referral link clicks, tracking, and redirects
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { connectToDatabase } from '@/lib/mongoose'
import { ReferralLink, ReferralClick } from '@/lib/schemas/creator.schema'

interface RouteParams {
  params: { code: string }
}

// Helper function to parse user agent
function parseUserAgent(userAgent: string) {
  const deviceInfo = {
    type: 'desktop' as 'desktop' | 'mobile' | 'tablet',
    os: '',
    browser: ''
  }

  // Detect device type
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    if (/iPad/i.test(userAgent)) {
      deviceInfo.type = 'tablet'
    } else {
      deviceInfo.type = 'mobile'
    }
  }

  // Detect OS
  if (/Windows/i.test(userAgent)) deviceInfo.os = 'Windows'
  else if (/Mac OS/i.test(userAgent)) deviceInfo.os = 'macOS'
  else if (/Linux/i.test(userAgent)) deviceInfo.os = 'Linux'
  else if (/Android/i.test(userAgent)) deviceInfo.os = 'Android'
  else if (/iOS|iPhone|iPad/i.test(userAgent)) deviceInfo.os = 'iOS'

  // Detect browser
  if (/Chrome/i.test(userAgent)) deviceInfo.browser = 'Chrome'
  else if (/Firefox/i.test(userAgent)) deviceInfo.browser = 'Firefox'
  else if (/Safari/i.test(userAgent)) deviceInfo.browser = 'Safari'
  else if (/Edge/i.test(userAgent)) deviceInfo.browser = 'Edge'
  else if (/Opera/i.test(userAgent)) deviceInfo.browser = 'Opera'

  return deviceInfo
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  
  return request.ip || '127.0.0.1'
}

// GET - Handle referral link click and redirect
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase()

    // Find referral link by code or custom alias
    const referralLink = await ReferralLink.findOne({
      $or: [
        { linkCode: params.code },
        { customAlias: params.code.toLowerCase() }
      ],
      isActive: true
    })

    if (!referralLink) {
      // Redirect to home page if link not found
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Check if link has expired
    if (referralLink.expiresAt && new Date() > referralLink.expiresAt) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Get tracking information
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer') || undefined
    const deviceInfo = parseUserAgent(userAgent)

    // Generate session ID (simple implementation)
    const sessionId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Check for duplicate clicks (same IP and user agent within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const existingClick = await ReferralClick.findOne({
      linkId: referralLink._id,
      ipAddress: clientIP,
      userAgent,
      clickedAt: { $gte: oneHourAgo }
    })

    const isUniqueClick = !existingClick

    // Track the click
    const referralClick = new ReferralClick({
      linkId: referralLink._id,
      creatorId: referralLink.creatorId,
      ipAddress: clientIP,
      userAgent,
      sessionId,
      referrer,
      deviceInfo,
      converted: false,
      clickedAt: new Date()
    })

    await referralClick.save()

    // Update link statistics
    await ReferralLink.findByIdAndUpdate(referralLink._id, {
      $inc: {
        clickCount: 1,
        ...(isUniqueClick && { uniqueClickCount: 1 })
      },
      lastClickedAt: new Date()
    })

    // Create response with redirect
    const response = NextResponse.redirect(new URL(referralLink.originalUrl))

    // Set tracking cookie for conversion attribution
    response.cookies.set('ref_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    response.cookies.set('ref_link', referralLink._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    return response

  } catch (error) {
    console.error('Referral tracking error:', error)
    // Redirect to home page on error
    return NextResponse.redirect(new URL('/', request.url))
  }
}