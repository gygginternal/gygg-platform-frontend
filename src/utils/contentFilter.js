/**
 * Content Filter Utility
 * Filters NSFW and inappropriate content from user inputs
 */

// NSFW and inappropriate words list (expandable)
const NSFW_WORDS = [
  // Explicit sexual content
  'sex', 'porn', 'xxx', 'nude', 'naked', 'strip', 'escort', 'prostitute',
  'hooker', 'brothel', 'massage', 'adult', 'erotic', 'fetish', 'bdsm',
  'webcam', 'cam girl', 'cam boy', 'onlyfans', 'sugar daddy', 'sugar baby',
  
  // Profanity and offensive language
  'fuck', 'shit', 'damn', 'bitch', 'bastard', 'asshole', 'crap',
  'piss', 'cock', 'dick', 'pussy', 'tits', 'boobs',
  
  // Hate speech and discrimination
  'nazi', 'hitler', 'racist', 'nigger', 'faggot', 'retard', 'terrorist',
  
  // Violence and illegal activities
  'kill', 'murder', 'suicide', 'bomb', 'weapon', 'gun', 'knife', 'drug',
  'cocaine', 'heroin', 'weed', 'marijuana', 'meth', 'steal', 'robbery',
  
  // Gambling and inappropriate services
  'casino', 'gambling', 'bet', 'poker', 'blackjack', 'lottery',
  
  // Common variations and leetspeak
  'f*ck', 'f**k', 'sh*t', 's**t', 'p0rn', 'pr0n', 'n00ds', 'n00des',
  'f4ck', 'sh1t', 'b1tch', 'd1ck', 'p*ssy',
];

// Suspicious patterns that might indicate NSFW content
const SUSPICIOUS_PATTERNS = [
  /\b(18\+|21\+|adult only|adults only)\b/i,
  /\b(no strings attached|nsa|fwb|friends with benefits)\b/i,
  /\b(hook up|hookup|one night|casual encounter)\b/i,
  /\b(private show|private chat|cam show)\b/i,
  /\b(send pics|send photos|nude pics|naked pics)\b/i,
  /\b(meet tonight|come over|your place or mine)\b/i,
  /\b(looking for fun|dtf|down to f)\b/i,
  /\b(sugar relationship|financial support|pay for)\b/i,
  /\b(escort service|massage service|happy ending)\b/i,
  /\b(buy drugs|sell drugs|drug dealer)\b/i,
];

// Words that might be legitimate in certain contexts but need review
const CONTEXT_SENSITIVE_WORDS = [
  'massage', 'therapy', 'adult', 'mature', 'personal', 'private', 'intimate',
  'body', 'physical', 'touch', 'hands-on', 'close', 'discrete', 'confidential'
];

/**
 * Check if text contains NSFW content
 * @param {string} text - Text to check
 * @param {object} options - Filtering options
 * @returns {object} - Result object with isClean, violations, and suggestions
 */
export const checkContent = (text, options = {}) => {
  const {
    strictMode = false,
    allowContextSensitive = true,
    customWords = []
  } = options;

  if (!text || typeof text !== 'string') {
    return { isClean: true, violations: [], suggestions: [] };
  }

  const lowerText = text.toLowerCase();
  const violations = [];
  const suggestions = [];

  // Combine NSFW words with custom words
  const allNsfwWords = [...NSFW_WORDS, ...customWords];

  // Check for explicit NSFW words
  allNsfwWords.forEach(word => {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      violations.push({
        type: 'explicit',
        word: word,
        message: 'Contains inappropriate language'
      });
    }
  });

  // Check for suspicious patterns
  SUSPICIOUS_PATTERNS.forEach((pattern, index) => {
    if (pattern.test(text)) {
      violations.push({
        type: 'pattern',
        pattern: pattern.source,
        message: 'Contains suspicious content pattern'
      });
    }
  });

  // Check context-sensitive words in strict mode
  if (strictMode && !allowContextSensitive) {
    CONTEXT_SENSITIVE_WORDS.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(lowerText)) {
        violations.push({
          type: 'context-sensitive',
          word: word,
          message: 'Contains potentially inappropriate content'
        });
      }
    });
  }

  // Generate suggestions for clean alternatives
  if (violations.length > 0) {
    suggestions.push(
      'Please use professional and appropriate language.',
      'Consider rephrasing your message to be more suitable for all audiences.',
      'Focus on describing your service or need in a clear, professional manner.'
    );
  }

  return {
    isClean: violations.length === 0,
    violations,
    suggestions,
    severity: violations.length > 0 ? (violations.some(v => v.type === 'explicit') ? 'high' : 'medium') : 'none'
  };
};

/**
 * Clean text by replacing inappropriate content with asterisks
 * @param {string} text - Text to clean
 * @param {object} options - Cleaning options
 * @returns {string} - Cleaned text
 */
export const cleanText = (text, options = {}) => {
  const { replacement = '***', customWords = [] } = options;
  
  if (!text || typeof text !== 'string') {
    return text;
  }

  let cleanedText = text;
  const allNsfwWords = [...NSFW_WORDS, ...customWords];

  // Replace NSFW words with asterisks
  allNsfwWords.forEach(word => {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
    cleanedText = cleanedText.replace(regex, replacement);
  });

  return cleanedText;
};

/**
 * Get content safety score (0-100, where 100 is completely safe)
 * @param {string} text - Text to score
 * @returns {number} - Safety score
 */
export const getContentSafetyScore = (text) => {
  const result = checkContent(text);
  
  if (result.isClean) {
    return 100;
  }

  const explicitViolations = result.violations.filter(v => v.type === 'explicit').length;
  const patternViolations = result.violations.filter(v => v.type === 'pattern').length;
  const contextViolations = result.violations.filter(v => v.type === 'context-sensitive').length;

  // Calculate score based on violation types and count
  let score = 100;
  score -= explicitViolations * 30; // Heavy penalty for explicit content
  score -= patternViolations * 20;  // Medium penalty for suspicious patterns
  score -= contextViolations * 10;  // Light penalty for context-sensitive words

  return Math.max(0, score);
};

/**
 * Validate if content is appropriate for the platform
 * @param {string} text - Text to validate
 * @param {object} options - Validation options
 * @returns {object} - Validation result
 */
export const validateContent = (text, options = {}) => {
  const { minSafetyScore = 70, strictMode = false } = options;
  
  const contentCheck = checkContent(text, { strictMode });
  const safetyScore = getContentSafetyScore(text);
  
  const isValid = contentCheck.isClean && safetyScore >= minSafetyScore;
  
  return {
    isValid,
    safetyScore,
    violations: contentCheck.violations,
    suggestions: contentCheck.suggestions,
    message: isValid 
      ? 'Content is appropriate' 
      : 'Content contains inappropriate material and cannot be submitted'
  };
};

/**
 * Alias for checkContent - for backward compatibility
 * @param {string} message - Message to check
 * @param {object} options - Validation options
 * @returns {object} - Validation result with isClean and reason properties
 */
export const checkMessageContent = (message, options = {}) => {
  const result = checkContent(message, options);
  return {
    isClean: result.isClean,
    reason: result.violations.length > 0 ? result.violations[0].message : null,
    violations: result.violations,
    suggestions: result.suggestions
  };
};

/**
 * Show content warning (placeholder function)
 * @param {string} reason - Warning reason
 */
export const showContentWarning = (reason) => {
  console.warn('Content warning:', reason);
  // You can implement toast notifications or other warning mechanisms here
  // For now, just log to console
};

export default {
  checkContent,
  cleanText,
  getContentSafetyScore,
  validateContent,
  checkMessageContent,
  showContentWarning
};