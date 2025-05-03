/**
 * Samudra Paket ERP - Accessibility Utilities
 * Helper functions for improving application accessibility
 */

/**
 * Creates a visually hidden label for screen readers
 * @returns {Object} CSS properties for visually hidden elements
 */
export const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: '0',
};

/**
 * Add keyboard support to a component by converting Enter and Space key presses to clicks
 * @param {Function} onClick - The click handler function
 * @returns {Object} Key down event handler
 */
export function addKeyboardSupport(onClick) {
  return {
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    },
    role: 'button',
    tabIndex: 0,
  };
}

/**
 * Get ARIA attributes for tab items
 * @param {boolean} selected - Whether the tab is selected
 * @param {string} id - The ID of the tab
 * @param {string} controlsId - The ID of the element controlled by the tab
 * @returns {Object} ARIA attributes for tab
 */
export function getTabAttributes(selected, id, controlsId) {
  return {
    role: 'tab',
    'aria-selected': selected,
    'aria-controls': controlsId,
    id,
    tabIndex: selected ? 0 : -1,
  };
}

/**
 * Get ARIA attributes for tab panels
 * @param {string} id - The ID of the tab panel
 * @param {string} labelledById - The ID of the element that labels the panel
 * @returns {Object} ARIA attributes for tab panel
 */
export function getTabPanelAttributes(id, labelledById) {
  return {
    role: 'tabpanel',
    'aria-labelledby': labelledById,
    id,
    tabIndex: 0,
  };
}

/**
 * Make an element focusable programmatically but not via keyboard
 * @returns {Object} Attributes for an element that should be focusable by JS only
 */
export function makeProgrammaticallyFocusable() {
  return {
    tabIndex: '-1',
  };
}

/**
 * Create a unique ID for accessibility purposes
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export function createAccessibleId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create attributes for form fields with labels
 * @param {string} id - Field ID
 * @param {boolean} required - Whether the field is required
 * @param {string} describedBy - ID of the element that describes this field (e.g., error message)
 * @returns {Object} ARIA attributes for form field
 */
export function getFormFieldAttributes(id, required = false, describedBy = null) {
  const attrs = {
    id,
    'aria-required': required,
  };
  
  if (describedBy) {
    attrs['aria-describedby'] = describedBy;
  }
  
  return attrs;
}

/**
 * Get ARIA attributes for error messages
 * @param {string} id - ID of the error message element
 * @param {boolean} hasError - Whether there's an error
 * @returns {Object} ARIA attributes for error message
 */
export function getErrorMessageAttributes(id, hasError) {
  return {
    id,
    role: 'alert',
    'aria-live': hasError ? 'assertive' : 'off',
  };
}
