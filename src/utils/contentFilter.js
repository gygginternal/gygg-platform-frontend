// Basic profanity list for frontend validation (lighter version)
const BASIC_PROFANITY = [
  'fuck', 'shit', 'damn', 'bitch', 'ass', 'bastard', 'crap',
  'piss', 'hell', 'whore', 'slut', 'cunt', 'cock', 'dick',
  'nigger', 'nigga', 'faggot', 'retard', 'rape', 'kill'
];

// Leetspeak substitutions
const LEETSPEAK_MAP = {
  '4': 'a', '@': 'a', '3': 'e', '1': 'i', '!': 'i',
  '0': 'o', '5': 's', '$': 's', '7': 't', '+': 't'
};

/**
 * Normalize text to catch bypass attempts
 * @param {string} text - Text to normalize
 * @returns {string} - Normalized text
 */
const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  let normalized = text.toLowerCase();
  
  // Replace leetspeak
  Object.keys(LEETSPEAK_MAP).forEach(leet => {
    const regex = new RegExp(leet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    normalized = normalized.replace(regex, LEETSPEAK_MAP[leet]);
  });
  
  // Remove repeated characters
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');
  
  // Remove special characters
  normalized = normalized.replace(/[^a-zA-Z0-9\s]/g, ' ');
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};

/**
 * Check if message contains inappropriate content
 * @param {string} message - Message to check
 * @returns {object} - Result with isClean and reason
 */
export const checkMessageContent = (message) => {
  if (!message || typeof message !== 'string') {
    return { isClean: true, reason: '' };
  }

  const normalized = normalizeText(message);
  const violations = [];

  // Check for profanity
  BASIC_PROFANITY.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalized)) {
      violations.push(word);
    }
  });

  // Check for suspicious patterns
  const suspiciousPatterns = [
    { pattern: /\b(send|give|transfer)\s+(money|cash|bitcoin)\b/i, reason: 'financial' },
    { pattern: /\b(buy|sell)\s+(drugs|weed|cocaine)\b/i, reason: 'drugs' },
    { pattern: /\b(kill|murder|suicide|rape)\b/i, reason: 'violence' },
    { pattern: /(http|www|\.com|\.net)/i, reason: 'links' }
  ];

  for (const { pattern, reason } of suspiciousPatterns) {
    if (pattern.test(normalized)) {
      violations.push(reason);
    }
  }

  const isClean = violations.length === 0;
  
  return {
    isClean,
    violations,
    reason: getWarningMessage(violations)
  };
};

/**
 * Get user-friendly warning message
 * @param {Array} violations - Array of violations
 * @returns {string} - Warning message
 */
const getWarningMessage = (violations) => {
  if (violations.length === 0) return '';
  
  if (violations.some(v => ['nigger', 'faggot', 'retard', 'rape', 'kill'].includes(v))) {
    return 'This message contains inappropriate content that violates our community guidelines.';
  }
  
  if (violations.includes('financial')) {
    return 'Please avoid discussing financial transactions in messages.';
  }
  
  if (violations.includes('drugs')) {
    return 'Discussion of illegal substances is not permitted.';
  }
  
  if (violations.includes('violence')) {
    return 'Violent or threatening content is not allowed.';
  }
  
  if (violations.includes('links')) {
    return 'Please avoid sharing links in messages for security reasons.';
  }
  
  return 'Your message contains inappropriate language. Please keep conversations professional.';
};

/**
 * Show warning to user about inappropriate content
 * @param {string} reason - Reason for warning
 */
export const showContentWarning = (reason) => {
  // Return the reason instead of showing alert - let components handle display
  return reason;
};