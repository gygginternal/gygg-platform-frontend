// src/components/TaskerOnboarding/TaskSelector.js
import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react'; // Keep if lucide-react is installed
import styles from './TaskSelector.module.css'; // Create this CSS module
import PropTypes from 'prop-types';

const tasks = [
  // These are general categories
  'Household Services',
  'Personal assistant',
  'Pet care',
  'Technology and digital assistance',
  'Event Support',
  'Moving and organization',
  'Creative and costume Tasks',
  'General Errands',
  'Other',
];

// This component is for selecting ONE main category.
// If you need to select MULTIPLE skills, we need a different component or modify this one.
// The ProfileSetup2.js you provided implies selecting multiple specific tasks.
// This TaskSelector as-is will select ONE category.
// Let's assume it's for selecting a primary service category for now.
function TaskSelector({
  label = 'What tasks can you help with?',
  selectedCategory,
  onCategoryChange,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = task => {
    onCategoryChange(task); // Call parent's handler with the selected category
    setIsOpen(false);
  };

  const clearSelection = e => {
    e.stopPropagation(); // Prevent dropdown from opening
    onCategoryChange(''); // Clear in parent state
  };

  return (
    <div className={styles.container}>
      {' '}
      {/* Use .container from your CSS */}
      <label className={styles.label}>{label}</label>{' '}
      {/* Use .label from your CSS */}
      <div className={styles.relativeContainer}>
        {' '}
        {/* Helper for dropdown positioning */}
        <div
          className={styles.select} /* Use .select from your CSS */
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen);
          }}
          role="button"
          tabIndex={0}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className={styles.selected}>
            {' '}
            {/* Use .selected from your CSS */}
            <span>{selectedCategory || 'Select a primary category'}</span>{' '}
            {/* Placeholder if nothing selected */}
            <div className={styles.iconsContainer}>
              {' '}
              {/* Helper for icons */}
              {selectedCategory && (
                <button
                  type="button" // Prevent form submission
                  onClick={clearSelection}
                  className={
                    styles.clearButton
                  } /* Add style for .clearButton */
                  aria-label="Clear selection"
                >
                  <X size={16} />
                </button>
              )}
              <ChevronDown size={20} />
            </div>
          </div>
        </div>
        {isOpen && (
          <div className={styles.dropdown}>
            {' '}
            {/* Use .dropdown from your CSS */}
            {tasks.map(task => (
              <div
                key={task}
                role="option"
                tabIndex={0}
                aria-selected={selectedCategory === task}
                onClick={() => handleSelect(task)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') handleSelect(task);
                }}
                className={styles.option}
                aria-label={`Select ${task}`}
              >
                {task}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

TaskSelector.propTypes = {
  label: PropTypes.string,
  selectedCategory: PropTypes.string,
  onCategoryChange: PropTypes.func.isRequired,
};

// If you want to be able to export it as named:
// export { TaskSelector };
export default TaskSelector; // Default export is usually simpler
