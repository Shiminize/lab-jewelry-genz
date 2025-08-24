/**
 * Detailed debug script to find exact customizer container
 */

const puppeteer = require('puppeteer')

async function debugDetailedHomepage() {
  console.log('🔍 Detailed homepage debugging...')
  
  const browser = await puppeteer.launch({ headless: false, slowMo: 100 })
  const page = await browser.newPage()
  
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' })
    console.log('✅ Homepage loaded')
    
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Find the customizer container
    const customizerInfo = await page.evaluate(() => {
      const customizer = document.querySelector('[id*="customizer"]')
      if (customizer) {
        return {
          id: customizer.id,
          className: customizer.className,
          tagName: customizer.tagName,
          children: Array.from(customizer.children).map(child => ({
            tagName: child.tagName,
            className: child.className,
            id: child.id,
            textContent: child.textContent?.substring(0, 100)
          }))
        }
      }
      return null
    })
    
    console.log('🎨 Customizer container:', customizerInfo)
    
    // Look for material selection elements more specifically
    const materialElements = await page.evaluate(() => {
      const selectors = [
        'button:contains("Platinum")',
        'button:contains("Gold")',
        'button:contains("Rose Gold")',
        'button[class*="material"]',
        '[class*="QuickSelector"]',
        '[data-testid*="material"]',
        '.material-preview'
      ]
      
      const found = []
      
      // Check for text content
      const allButtons = document.querySelectorAll('button')
      const materialButtons = Array.from(allButtons).filter(btn => 
        btn.textContent && (
          btn.textContent.toLowerCase().includes('gold') ||
          btn.textContent.toLowerCase().includes('platinum') ||
          btn.textContent.toLowerCase().includes('material')
        )
      )
      
      if (materialButtons.length > 0) {
        found.push({
          type: 'text-based',
          count: materialButtons.length,
          buttons: materialButtons.map(btn => ({
            text: btn.textContent?.substring(0, 50),
            className: btn.className,
            id: btn.id,
            parentId: btn.parentElement?.id,
            parentClass: btn.parentElement?.className
          }))
        })
      }
      
      return found
    })
    
    console.log('💎 Material elements found:', materialElements)
    
    // Check for 3D viewer or image viewer
    const viewerInfo = await page.evaluate(() => {
      const selectors = [
        'img[alt*="3D"]',
        'img[src*="sequence"]',
        '[class*="ImageViewer"]',
        '[class*="3d"]',
        'canvas',
        '.viewer'
      ]
      
      const found = []
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector)
        if (elements.length > 0) {
          found.push({
            selector,
            count: elements.length,
            elements: Array.from(elements).map(el => ({
              tagName: el.tagName,
              src: el.src,
              alt: el.alt,
              className: el.className
            }))
          })
        }
      })
      
      return found
    })
    
    console.log('👁️ Viewer elements:', viewerInfo)
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
  
  await browser.close()
}

debugDetailedHomepage().catch(console.error)