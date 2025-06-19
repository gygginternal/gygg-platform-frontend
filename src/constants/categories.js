export const CATEGORY_ENUM = [
  'Household Services',
  'Personal Assistant',
  'Pet Care',
  'Technology and Digital Assistance',
  'Event Support',
  'Moving and Organization',
  'Creative and Costume Tasks',
  'General Errands',
  'Other',
];

// Helper function to get a formatted category name for display
export const formatCategoryName = category => {
  return category.replace(/([A-Z])/g, ' $1').trim();
};

// Helper function to get a category icon (you can expand this based on your needs)
export const getCategoryIcon = category => {
  const iconMap = {
    'Household Services': 'home',
    'Personal Assistant': 'person',
    'Pet Care': 'pets',
    'Technology and Digital Assistance': 'computer',
    'Event Support': 'event',
    'Moving and Organization': 'move_to_inbox',
    'Creative and Costume Tasks': 'brush',
    'General Errands': 'local_shipping',
    Other: 'more_horiz',
  };
  return iconMap[category] || 'category';
};
