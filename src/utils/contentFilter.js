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

// Off-platform transaction prevention filters
// Off-platform transaction prevention filters
const OFF_PLATFORM_FILTERS = {
  // 1. Direct Contact Information
  emailDomains: [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'protonmail.com', 'icloud.com', 'aol.com'
  ],
  
  emailPhrases: [
    'email me', 'send me your email', 'drop me your email',
    'contact me at', 'reach me at', 'my email is', 'email address',
    'etransfer to my email', 'send to my email' // Canada-specific Interac phrasing
  ],
  
  phonePhrases: [
    'call me', 'text me', 'sms me', 'reach me on phone',
    'phone number', 'contact number', 'call me at', 'text me at'
  ],
  
  // 2. Payment-Related Keywords
  paymentServices: [
    'paypal', 'venmo', 'cashapp', 'zelle', 'wise', 'revolut', 
    'western union', 'moneygram', 'pay pal', 'ven moo', 'cash app',
    'zell', 'w1se', 'rev0lut',
    'etransfer', 'e-transfer', 'interac', 'interac transfer', 'interac e-transfer',
    'interac etransfer', 'interac email transfer', 'etransfer canada', 'transferwise'
  ],
  
  bankingTerms: [
    'bank transfer', 'wire transfer', 'routing number', 'account number',
    'iban', 'swift', 'bank account', 'checking account', 'savings account',
    // Canadian banks
    'td', 'rbc', 'scotiabank', 'cibc', 'bmo', 'desjardins', 'national bank',
    'credit union', 'simplii', 'tangerine'
  ],
  
  cryptoTerms: [
    'crypto', 'cryptocurrency', 'digital currency',
    'bitcoin', 'btc', 'ethereum', 'eth', 'usdt', 'tether',
    'bnb', 'doge', 'wallet address', 'seed phrase', 'metamask',
    'trustwallet', 'coinbase', 
    // More coins used in Canada
    'usdc', 'ltc', 'litecoin', 'sol', 'solana', 'xrp', 'ripple'
  ],
  
  // 3. Social Media / Messaging Apps
  socialApps: [
    'whatsapp', 'telegram', 'signal', 'discord', 'instagram', 'facebook',
    'snapchat', 'linkedin', 'twitter', 'x', 'wechat', 'line', 'kakaotalk',
    'messenger', 'ig', 'insta', 'fb', 'sc', 'wa', 'li', 'x app', 't.me'
  ],
  
  socialObfuscations: [
    'whats@pp', 'wh@tsapp', 'tel3gram', 'd1scord', 'sig nal', 'lnkd',
    'f@cebook', '1nstagram', 'tw1tter', 'sn@pchat'
  ],
  
  // 4. Generic Phrases Indicating Off-Platform Move
  offPlatformPhrases: [
    "let's take this offline", "pay me directly", "cheaper outside platform",
    "save on fees", "skip the fees", "don't pay here", "contact me outside",
    "let's connect elsewhere", "future deals outside this app", "no need to use this site",
    "i'll give you my details", "send money another way", "better deal off here",
    "cut out the middleman", "continue off the app", "work with me directly",
    "don't go through the platform", "deal outside", "pay outside", "contact outside",
    // Canada-specific
    "send an etransfer", "pay by interac", "accepting e-transfer",
    "direct deposit", "deposit to account", "cash only", "meet up and pay"
  ],
  
  // 5. Workarounds & Obfuscations
  workarounds: [
    'dot', 'd0t', 'at', '(at)', '[at]', 'underscore', 'slash',
    'g m a i l', 'y a h o o', 'w h a t s a p p', 'one two three',
    'john_doe@gmail_com', 'john at gmail dot com', '(123) 456-7890',
    '{email}', '[number]', 'email at domain', 'phone at number',
    'one two three four five six seven eight nine zero', // Spelled out phone numbers
    'whats app', 'what\'s app', 'pay pal', 'cash app', 'ven moo', // Spaced app names
    // Canada-specific workarounds
    'e t r a n s f e r', 'etr@nsfer', 'inter@c', 'e tr@n$fer'
  ]
};

// Regex patterns for detecting off-platform communication
const OFF_PLATFORM_REGEX = {
  // Phone numbers: +?d{7,15}
  phoneNumbers: /\+?\d{7,15}/g,
  
  // Emails: [A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}
  emails: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
  
  // URLs: (http(s)?://|www\.)\S+
  urls: /(http(s)?:\/\/|www\.)\S+/gi,
  
  // Crypto wallets
  ethWallet: /0x[a-fA-F0-9]{40}/g,
  btcWallet: /(?:bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}/g,
  
  // Social media handles: @[A-Za-z0-9_]{2,20}
  socialHandles: /@[A-Za-z0-9_]{2,20}/g,
  
  // Common obfuscation patterns
  spacedLetters: /\b[a-z]\s+[a-z]\s+[a-z]\s+[a-z]\s+[a-z]\b/gi,
  dotAtPattern: /\b[a-z]+\s+(?:dot|d0t)\s+[a-z]+\s+(?:at|@)\s+[a-z]+\b/gi,
  bracketPattern: /\([^)]*@[^)]*\)/gi,
  spelledOutNumbers: /\b(?:one|two|three|four|five|six|seven|eight|nine|zero)\s+(?:one|two|three|four|five|six|seven|eight|nine|zero)\s+(?:one|two|three|four|five|six|seven|eight|nine|zero)\s+(?:one|two|three|four|five|six|seven|eight|nine|zero)\s+(?:one|two|three|four|five|six|seven|eight|nine|zero)\s+(?:one|two|three|four|five|six|seven|eight|nine|zero)\s+(?:one|two|three|four|five|six|seven|eight|nine|zero)\s+(?:one|two|three|four|five|six|seven|eight|nine|zero)\s+(?:one|two|three|four|five|six|seven|eight|nine|zero)\s+(?:one|two|three|four|five|six|seven|eight|nine|zero)\b/gi,
  spacedAppNames: /\b(?:whats?\s+app|pay\s+pal|cash\s+app|ven\s+moo|tele\s+gram|dis\s+cord)\b/gi
};

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
 * Check for off-platform transaction attempts
 * @param {string} text - The text to check
 * @returns {object} - Result object with violations and categories
 */
const checkOffPlatformAttempts = (text) => {
  if (!text || typeof text !== 'string') {
    return { violations: [], categories: [] };
  }

  const lowerText = text.toLowerCase();
  const violations = [];
  const categories = [];

  // Check email domains
  OFF_PLATFORM_FILTERS.emailDomains.forEach(domain => {
    const regex = new RegExp(`@${domain.replace(/\./g, '\\.')}`, 'gi');
    if (regex.test(text)) {
      violations.push(`email_domain_${domain}`);
      if (!categories.includes('direct_contact')) categories.push('direct_contact');
    }
  });

  // Check email phrases
  OFF_PLATFORM_FILTERS.emailPhrases.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(lowerText)) {
      violations.push(`email_phrase_${phrase}`);
      if (!categories.includes('direct_contact')) categories.push('direct_contact');
    }
  });

  // Check phone phrases
  OFF_PLATFORM_FILTERS.phonePhrases.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(lowerText)) {
      violations.push(`phone_phrase_${phrase}`);
      if (!categories.includes('direct_contact')) categories.push('direct_contact');
    }
  });

  // Check payment services
  OFF_PLATFORM_FILTERS.paymentServices.forEach(service => {
    const regex = new RegExp(`\\b${service.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(lowerText)) {
      violations.push(`payment_service_${service}`);
      if (!categories.includes('payment')) categories.push('payment');
    }
  });

  // Check banking terms
  OFF_PLATFORM_FILTERS.bankingTerms.forEach(term => {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(lowerText)) {
      violations.push(`banking_term_${term}`);
      if (!categories.includes('payment')) categories.push('payment');
    }
  });

  // Check crypto terms
  OFF_PLATFORM_FILTERS.cryptoTerms.forEach(term => {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(lowerText)) {
      violations.push(`crypto_term_${term}`);
      if (!categories.includes('payment')) categories.push('payment');
    }
  });

  // Check social media apps
  OFF_PLATFORM_FILTERS.socialApps.forEach(app => {
    const regex = new RegExp(`\\b${app.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(lowerText)) {
      violations.push(`social_app_${app}`);
      if (!categories.includes('social_media')) categories.push('social_media');
    }
  });

  // Check social obfuscations
  OFF_PLATFORM_FILTERS.socialObfuscations.forEach(obfuscation => {
    const regex = new RegExp(`\\b${obfuscation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(lowerText)) {
      violations.push(`social_obfuscation_${obfuscation}`);
      if (!categories.includes('social_media')) categories.push('social_media');
    }
  });

  // Check off-platform phrases
  OFF_PLATFORM_FILTERS.offPlatformPhrases.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(lowerText)) {
      violations.push(`off_platform_phrase_${phrase}`);
      if (!categories.includes('off_platform')) categories.push('off_platform');
    }
  });

  // Check workarounds
  OFF_PLATFORM_FILTERS.workarounds.forEach(workaround => {
    const regex = new RegExp(`\\b${workaround.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(lowerText)) {
      violations.push(`workaround_${workaround}`);
      if (!categories.includes('obfuscation')) categories.push('obfuscation');
    }
  });

  // Check regex patterns
  const regexMatches = {};
  
  // Phone numbers
  const phoneMatches = text.match(OFF_PLATFORM_REGEX.phoneNumbers);
  if (phoneMatches) {
    regexMatches.phoneNumbers = phoneMatches;
    violations.push('phone_number_detected');
    if (!categories.includes('direct_contact')) categories.push('direct_contact');
  }

  // Emails
  const emailMatches = text.match(OFF_PLATFORM_REGEX.emails);
  if (emailMatches) {
    regexMatches.emails = emailMatches;
    violations.push('email_address_detected');
    if (!categories.includes('direct_contact')) categories.push('direct_contact');
  }

  // URLs
  const urlMatches = text.match(OFF_PLATFORM_REGEX.urls);
  if (urlMatches) {
    regexMatches.urls = urlMatches;
    violations.push('url_detected');
    if (!categories.includes('external_links')) categories.push('external_links');
  }

  // Crypto wallets
  const ethMatches = text.match(OFF_PLATFORM_REGEX.ethWallet);
  if (ethMatches) {
    regexMatches.ethWallets = ethMatches;
    violations.push('crypto_wallet_eth');
    if (!categories.includes('payment')) categories.push('payment');
  }

  const btcMatches = text.match(OFF_PLATFORM_REGEX.btcWallet);
  if (btcMatches) {
    regexMatches.btcWallets = btcMatches;
    violations.push('crypto_wallet_btc');
    if (!categories.includes('payment')) categories.push('payment');
  }

  // Social handles
  const socialMatches = text.match(OFF_PLATFORM_REGEX.socialHandles);
  if (socialMatches) {
    regexMatches.socialHandles = socialMatches;
    violations.push('social_handle_detected');
    if (!categories.includes('social_media')) categories.push('social_media');
  }

  // Check additional obfuscation patterns
  const spelledOutMatches = text.match(OFF_PLATFORM_REGEX.spelledOutNumbers);
  if (spelledOutMatches) {
    regexMatches.spelledOutNumbers = spelledOutMatches;
    violations.push('spelled_out_phone_detected');
    if (!categories.includes('direct_contact')) categories.push('direct_contact');
  }

  const spacedAppMatches = text.match(OFF_PLATFORM_REGEX.spacedAppNames);
  if (spacedAppMatches) {
    regexMatches.spacedAppNames = spacedAppMatches;
    violations.push('spaced_app_name_detected');
    if (!categories.includes('social_media')) categories.push('social_media');
  }

  return { violations, categories, regexMatches };
};

/**
 * Get user-friendly message for off-platform violations
 * @param {string} violation - The violation type
 * @returns {string} - User-friendly error message
 */
const getOffPlatformViolationMessage = (violation) => {
  if (violation.includes('direct_contact') || violation.includes('email') || violation.includes('phone')) {
    return 'Sharing personal contact information is not allowed. Please keep all communication within the platform.';
  }
  
  if (violation.includes('payment') || violation.includes('crypto') || violation.includes('banking')) {
    return 'Discussing external payment methods or cryptocurrency is not allowed. Please use the platform\'s secure payment system.';
  }
  
  if (violation.includes('social_media') || violation.includes('social_handle')) {
    return 'Sharing social media handles or suggesting communication outside the platform is not allowed.';
  }
  
  if (violation.includes('off_platform') || violation.includes('url')) {
    return 'Attempting to move transactions outside the platform is not allowed. Please keep all business within the platform.';
  }
  
  return 'This message appears to be attempting to move communication or payment outside the platform, which is not allowed.';
};

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

  // Check for off-platform transaction attempts first (highest priority)
  const offPlatformResult = checkOffPlatformAttempts(text);
  if (offPlatformResult.violations.length > 0) {
    offPlatformResult.violations.forEach(violation => {
      violations.push({
        type: 'off_platform',
        violation: violation,
        message: getOffPlatformViolationMessage(violation)
      });
    });
  }

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
    if (violations.some(v => v.type === 'off_platform')) {
      suggestions.push(
        'Please keep all communication and payments within the platform.',
        'Do not share personal contact information or suggest external payment methods.',
        'Use the platform\'s secure messaging and payment systems for all transactions.'
      );
    } else {
      suggestions.push(
        'Please use professional and appropriate language.',
        'Consider rephrasing your message to be more suitable for all audiences.',
        'Focus on describing your service or need in a clear, professional manner.'
      );
    }
  }

  return {
    isClean: violations.length === 0,
    violations,
    suggestions,
    severity: violations.length > 0 ? (violations.some(v => v.type === 'off_platform' || v.type === 'explicit') ? 'high' : 'medium') : 'none'
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