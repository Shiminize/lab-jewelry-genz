const puppeteer = require('puppeteer');

async function debugPurpleColors() {
  console.log('🕵️ Debugging Purple Colors in DOM');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🌐 Navigating to customizer page...');
    await page.goto('http://localhost:3001/customizer', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Find all elements with purple/accent colors and get their details
    const purpleElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const foundElements = [];
      
      for (let el of elements) {
        const style = getComputedStyle(el);
        const classList = Array.from(el.classList);
        
        // Check for purple/violet colors in various properties
        const checkColor = (color, property) => {
          if (!color || color === 'rgba(0, 0, 0, 0)' || color === 'transparent') return false;
          return color.includes('rgb(139, 69, 19)') || // accent color
                 color.includes('purple') || 
                 color.includes('violet') ||
                 color.includes('107, 70, 193') || // nebula-purple
                 color.includes('rgb(107, 70, 193)'); 
        };
        
        const hasPurpleAccent = checkColor(style.borderColor, 'border') || 
                               checkColor(style.backgroundColor, 'background') || 
                               checkColor(style.color, 'text');
        
        // Also check for accent classes in classList
        const hasAccentClass = classList.some(cls => 
          cls.includes('accent') || cls.includes('purple') || cls.includes('violet')
        );
        
        if (hasPurpleAccent || hasAccentClass) {
          foundElements.push({
            tag: el.tagName.toLowerCase(),
            classes: classList,
            textContent: (el.textContent || '').slice(0, 50),
            styles: {
              color: style.color,
              backgroundColor: style.backgroundColor,
              borderColor: style.borderColor
            }
          });
        }
      }
      
      return foundElements.slice(0, 20); // Limit to first 20 for analysis
    });
    
    console.log(`📊 Found ${purpleElements.length} elements with purple/accent styling:`);
    console.log('');
    
    purpleElements.forEach((el, index) => {
      console.log(`${index + 1}. <${el.tag}>`);
      console.log(`   Classes: ${el.classes.join(' ')}`);
      console.log(`   Text: "${el.textContent}"`);
      console.log(`   Color: ${el.styles.color}`);
      console.log(`   Background: ${el.styles.backgroundColor}`);
      console.log(`   Border: ${el.styles.borderColor}`);
      console.log('');
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run debug
debugPurpleColors()
  .then(success => {
    if (success) {
      console.log('🎉 Purple color debug completed');
      process.exit(0);
    } else {
      console.log('❌ Purple color debug failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Debug script error:', error);
    process.exit(1);
  });