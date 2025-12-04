/**
 * XSS Prevention Utilities
 * Contains functions for sanitizing user input and preventing XSS attacks
 */

// Define allowed HTML tags and attributes for safe content
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 
  'code', 'pre'
];

const ALLOWED_ATTRIBUTES = [
  'href', 'src', 'alt', 'title', 'target', 'rel'
];

/**
 * Basic HTML sanitization to prevent XSS
 * Removes potentially dangerous HTML tags and attributes
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeHtml = (input) => {
  if (!input || typeof input !== 'string') {
    return input;
  }

  // Remove dangerous tags and attributes
  return input
    // Remove script tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers (e.g., onclick, onload)
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript:, vbscript:, data: URIs
    .replace(/(javascript|vbscript|data):/gi, 'javascript:void(0);')
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove object tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    // Remove embed tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    // Remove form tags
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    // Remove link tags
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '')
    // Remove meta tags
    .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, '')
    // Remove base tags
    .replace(/<base\b[^<]*(?:(?!<\/base>)<[^<]*)*<\/base>/gi, '');
};

/**
 * Sanitize user-generated content for display
 * Removes potentially harmful code while preserving basic formatting
 * @param {string|object|array} content - Content to sanitize
 * @returns {string|object|array} - Sanitized content
 */
export const sanitizeContent = (content) => {
  if (!content) return content;

  if (typeof content === 'string') {
    // First apply HTML sanitization
    let sanitized = sanitizeHtml(content);
    
    // Additional sanitization for common XSS vectors
    sanitized = sanitized
      // Encode special characters that could be used in XSS
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/`/g, '&#x60;');
    
    return sanitized;
  } else if (typeof content === 'object') {
    if (Array.isArray(content)) {
      return content.map(item => sanitizeContent(item));
    } else {
      const sanitized = {};
      for (const [key, value] of Object.entries(content)) {
        // Sanitize the key name as well
        const sanitizedKey = key
          .replace(/[<>"'`]/g, char => 
            ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '`': '&#x60;' }[char])
          );
        sanitized[sanitizedKey] = sanitizeContent(value);
      }
      return sanitized;
    }
  }
  
  // Return primitives as-is
  return content;
};

/**
 * Sanitize user input for API requests
 * @param {any} input - Input data to sanitize
 * @returns {any} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input) return input;

  if (typeof input === 'string') {
    // Apply comprehensive sanitization
    return sanitizeHtml(input.trim());
  } else if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  } else if (typeof input === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      // Sanitize the key to prevent prototype pollution
      const sanitizedKey = key.replace(/\./g, '_').replace(/\W/g, '_'); 
      sanitized[sanitizedKey] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
};

/**
 * Sanitize message content specifically
 * @param {string} content - Message content to sanitize
 * @param {string} type - Message type ('text', 'html', etc.)
 * @returns {string} - Sanitized content
 */
export const sanitizeMessageContent = (content, type = 'text') => {
  if (!content || typeof content !== 'string') {
    return content;
  }

  if (type === 'html') {
    // For HTML content, use more permissive sanitization
    return sanitizeHtml(content);
  } else {
    // For text content, remove all HTML
    return content
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/javascript:/gi, 'javascript:void(0);') // Neutralize JavaScript URLs
      .replace(/on\w+\s*=("[^"]*"|'[^']*')/gi, '') // Remove event handlers
      .trim();
  }
};

/**
 * Sanitize URL for security
 * @param {string} url - URL to sanitize
 * @returns {string} - Sanitized URL
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return url;
  }

  try {
    // Only allow safe protocols
    if (!/^(https?:\/\/|mailto:|tel:)/.test(url)) {
      // If it's not a safe protocol, return null or a safe default
      return null;
    }

    // For HTTP/HTTPS URLs, just return as-is since it's already validated
    return url;
  } catch (error) {
    // If URL parsing fails, return null
    return null;
  }
};

/**
 * Sanitize filename to prevent path traversal
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return filename;
  }

  return filename
    // Remove path traversal sequences
    .replace(/\.\.\//g, '') // Remove ../
    .replace(/\.\.\\/g, '') // Remove ..\
    .replace(/\//g, '_') // Replace forward slashes
    .replace(/\\/g, '_') // Replace backslashes
    .replace(/\.\./g, '_') // Replace double dots
    // Remove potentially dangerous characters
    .replace(/[<>:"|?*]/g, '_') 
    .trim();
};

/**
 * Check if content appears to be malicious
 * @param {string} content - Content to check
 * @returns {boolean} - True if content appears malicious
 */
export const isPotentiallyMalicious = (content) => {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:/i,
    /expression\(/i,
    /eval\(/i,
    /alert\(/i
  ];

  return maliciousPatterns.some(pattern => pattern.test(content));
};

/**
 * Clean and sanitize form data
 * @param {Object} formData - Form data to sanitize
 * @returns {Object} - Sanitized form data
 */
export const sanitizeFormData = (formData) => {
  if (!formData || typeof formData !== 'object') {
    return formData;
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(formData)) {
    // Sanitize the key
    const sanitizedKey = key
      .replace(/<[^>]*>/g, '') // Remove HTML from keys
      .replace(/[<>"'`=]/g, '') // Remove potentially dangerous characters
      .trim();
    
    // Sanitize the value
    sanitized[sanitizedKey] = sanitizeContent(value);
  }

  return sanitized;
};

/**
 * Sanitize user profile data
 * @param {Object} profileData - User profile data to sanitize
 * @returns {Object} - Sanitized profile data
 */
export const sanitizeProfileData = (profileData) => {
  if (!profileData || typeof profileData !== 'object') {
    return profileData;
  }

  const sanitized = { ...profileData };
  
  // Sanitize specific fields that might contain user-generated content
  if (sanitized.bio) {
    sanitized.bio = sanitizeContent(sanitized.bio);
  }
  
  if (sanitized.hobbies && Array.isArray(sanitized.hobbies)) {
    sanitized.hobbies = sanitized.hobbies.map(hobby => sanitizeContent(hobby));
  }
  
  if (sanitized.skills && Array.isArray(sanitized.skills)) {
    sanitized.skills = sanitized.skills.map(skill => sanitizeContent(skill));
  }
  
  if (sanitized.peoplePreference && Array.isArray(sanitized.peoplePreference)) {
    sanitized.peoplePreference = sanitized.peoplePreference.map(pref => sanitizeContent(pref));
  }
  
  return sanitized;
};

export default {
  sanitizeHtml,
  sanitizeContent,
  sanitizeInput,
  sanitizeMessageContent,
  sanitizeUrl,
  sanitizeFilename,
  isPotentiallyMalicious,
  sanitizeFormData,
  sanitizeProfileData
};