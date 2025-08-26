/**
 * Debug script to check available elements on homepage
 */

const puppeteer = require('puppeteer')

async function debugHomepage() {
  console.log('🔍 Debugging homepage elements...')
  
  const browser = await puppeteer.launch({ headless: false, slowMo: 100 })
  const page = await browser.newPage()
  
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' })
    console.log('✅ Homepage loaded successfully')
    
    // Wait a bit for React to render
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Find all testid elements
    const testIds = await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-testid]')
      return Array.from(elements).map(el => ({
        testid: el.getAttribute('data-testid'),
        tagName: el.tagName,
        className: el.className,
        text: el.textContent?.substring(0, 50)
      }))
    })
    
    console.log('🎯 Found test IDs:', testIds)
    
    // Find customizer-related elements
    const customizerElements = await page.evaluate(() => {
      const selectors = [
        '[class*="customizer"]',
        '[id*="customizer"]',
        '[data-testid*="customizer"]',
        'section:has([class*="3d"])',
        '.ProductCustomizer',
        '[data-testid="3d-viewer"]',
        '[data-testid="product-customizer"]'
      ]
      
      const found = []
      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector)
          if (elements.length > 0) {
            found.push({
              selector,
              count: elements.length,
              elements: Array.from(elements).map(el => ({
                tagName: el.tagName,
                className: el.className,
                id: el.id
              }))
            })
          }
        } catch (e) {
          // Skip invalid selectors
        }
      })
      
      return found
    })
    
    console.log('🎨 Found customizer-related elements:', customizerElements)
    
    // Find material buttons
    const materialButtons = await page.evaluate(() => {
      const selectors = [
        '[data-material-id]',
        '[data-testid*="material"]',
        'button:has([class*="material"])',
        'button[class*="material"]'
      ]
      
      const found = []
      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector)
          if (elements.length > 0) {
            found.push({
              selector,
              count: elements.length,
              elements: Array.from(elements).map(el => ({
                materialId: el.getAttribute('data-material-id'),
                testId: el.getAttribute('data-testid'),
                text: el.textContent?.substring(0, 30),
                className: el.className
              }))
            })
          }
        } catch (e) {
          // Skip invalid selectors
        }
      })
      
      return found
    })
    
    console.log('💎 Found material buttons:', materialButtons)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
  
  await browser.close()
}

debugHomepage().catch(console.error)