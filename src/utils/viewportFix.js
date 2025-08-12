// Viewport Fix Utility
// This utility helps fix viewport and overflow issues

export const fixViewportOverflow = () => {
  // Force viewport width
  const setViewportWidth = () => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    
    // Set viewport width
    html.style.width = '100vw';
    html.style.maxWidth = '100vw';
    html.style.overflowX = 'hidden';
    
    body.style.width = '100vw';
    body.style.maxWidth = '100vw';
    body.style.overflowX = 'hidden';
    body.style.margin = '0';
    body.style.padding = '0';
    
    if (root) {
      root.style.width = '100vw';
      root.style.maxWidth = '100vw';
      root.style.overflowX = 'hidden';
      root.style.margin = '0';
      root.style.padding = '0';
    }
  };
  
  // Run immediately
  setViewportWidth();
  
  // Run after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setViewportWidth);
  }
  
  // Run after window is loaded
  window.addEventListener('load', setViewportWidth);
  
  // Run on resize
  window.addEventListener('resize', setViewportWidth);
};

export const findOverflowElements = () => {
  // Debug function to find elements causing overflow
  const elements = document.querySelectorAll('*');
  const overflowElements = [];
  
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(el);
    
    // Check if element extends beyond viewport
    if (rect.right > window.innerWidth) {
      overflowElements.push({
        element: el,
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        right: rect.right,
        width: rect.width,
        computedWidth: computedStyle.width,
        maxWidth: computedStyle.maxWidth,
        overflow: computedStyle.overflow,
        overflowX: computedStyle.overflowX
      });
    }
  });
  
  console.log('Elements causing horizontal overflow:', overflowElements);
  return overflowElements;
};

export const applyEmergencyFix = () => {
  // Emergency fix for persistent overflow issues
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      width: 100vw !important;
      max-width: 100vw !important;
      overflow-x: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
    }
    
    * {
      max-width: 100% !important;
      box-sizing: border-box !important;
    }
    
    /* Allow specific elements to exceed if needed */
    html, body, #root, .full-width {
      max-width: 100vw !important;
    }
  `;
  
  document.head.appendChild(style);
  
  // Also apply via JavaScript
  fixViewportOverflow();
};

// Auto-run the fix
if (typeof window !== 'undefined') {
  fixViewportOverflow();
}