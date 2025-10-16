/**
 * Utility function to decode HTML entities in text
 * @param {string} text - The text to decode
 * @returns {string} - The decoded text
 */
export const decodeHTMLEntities = text => {
  if (typeof text !== 'string' || !text) return '';
  try {
    const element = document.createElement('div');
    element.innerHTML = text;
    return element.textContent || element.innerText || '';
  } catch (e) {
    console.error('Error decoding HTML entities:', e);
    return text;
  }
};

export default decodeHTMLEntities;
