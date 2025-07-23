/**
 * Accessibility utilities and helpers
 */

/**
 * Focus management utilities
 */
export const focusUtils = {
  /**
   * Set focus to an element with error handling
   * @param {HTMLElement|string} element - Element or selector
   */
  setFocus: (element) => {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el && typeof el.focus === 'function') {
      el.focus();
    }
  },

  /**
   * Focus the first focusable element in a container
   * @param {HTMLElement} container - Container element
   */
  focusFirst: (container) => {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  },

  /**
   * Trap focus within a container (for modals)
   * @param {HTMLElement} container - Container element
   * @returns {Function} Cleanup function
   */
  trapFocus: (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },
};

/**
 * ARIA utilities
 */
export const ariaUtils = {
  /**
   * Generate unique ID for ARIA relationships
   * @param {string} prefix - ID prefix
   * @returns {string} Unique ID
   */
  generateId: (prefix = 'aria') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - Priority level ('polite' or 'assertive')
   */
  announce: (message, priority = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },

  /**
   * Set ARIA expanded state
   * @param {HTMLElement} element - Element to update
   * @param {boolean} expanded - Expanded state
   */
  setExpanded: (element, expanded) => {
    element.setAttribute('aria-expanded', expanded.toString());
  },

  /**
   * Set ARIA selected state
   * @param {HTMLElement} element - Element to update
   * @param {boolean} selected - Selected state
   */
  setSelected: (element, selected) => {
    element.setAttribute('aria-selected', selected.toString());
  },
};

/**
 * Keyboard navigation utilities
 */
export const keyboardUtils = {
  /**
   * Handle arrow key navigation in a list
   * @param {KeyboardEvent} event - Keyboard event
   * @param {HTMLElement[]} items - List items
   * @param {number} currentIndex - Current focused index
   * @returns {number} New focused index
   */
  handleArrowNavigation: (event, items, currentIndex) => {
    let newIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowDown':
        newIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = items.length - 1;
        break;
      default:
        return currentIndex;
    }
    
    event.preventDefault();
    items[newIndex]?.focus();
    return newIndex;
  },

  /**
   * Handle escape key to close modals/dropdowns
   * @param {KeyboardEvent} event - Keyboard event
   * @param {Function} closeHandler - Function to call on escape
   */
  handleEscape: (event, closeHandler) => {
    if (event.key === 'Escape') {
      closeHandler();
    }
  },
};

/**
 * Color contrast utilities
 */
export const contrastUtils = {
  /**
   * Calculate relative luminance of a color
   * @param {string} color - Hex color code
   * @returns {number} Relative luminance
   */
  getLuminance: (color) => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   * @param {string} color1 - First color (hex)
   * @param {string} color2 - Second color (hex)
   * @returns {number} Contrast ratio
   */
  getContrastRatio: (color1, color2) => {
    const lum1 = contrastUtils.getLuminance(color1);
    const lum2 = contrastUtils.getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if color combination meets WCAG standards
   * @param {string} foreground - Foreground color (hex)
   * @param {string} background - Background color (hex)
   * @param {string} level - WCAG level ('AA' or 'AAA')
   * @returns {boolean} True if meets standards
   */
  meetsWCAG: (foreground, background, level = 'AA') => {
    const ratio = contrastUtils.getContrastRatio(foreground, background);
    return level === 'AAA' ? ratio >= 7 : ratio >= 4.5;
  },
};

/**
 * Screen reader utilities
 */
export const screenReaderUtils = {
  /**
   * Create screen reader only text
   * @param {string} text - Text for screen readers
   * @returns {HTMLElement} Hidden element with text
   */
  createSROnlyText: (text) => {
    const element = document.createElement('span');
    element.className = 'sr-only';
    element.textContent = text;
    return element;
  },

  /**
   * Add screen reader description to an element
   * @param {HTMLElement} element - Target element
   * @param {string} description - Description text
   */
  addDescription: (element, description) => {
    const id = ariaUtils.generateId('desc');
    const descElement = screenReaderUtils.createSROnlyText(description);
    descElement.id = id;
    
    element.parentNode.insertBefore(descElement, element.nextSibling);
    element.setAttribute('aria-describedby', id);
  },
};

/**
 * Form accessibility utilities
 */
export const formA11yUtils = {
  /**
   * Associate label with form control
   * @param {HTMLElement} label - Label element
   * @param {HTMLElement} control - Form control element
   */
  associateLabel: (label, control) => {
    const id = control.id || ariaUtils.generateId('control');
    control.id = id;
    label.setAttribute('for', id);
  },

  /**
   * Add error message to form control
   * @param {HTMLElement} control - Form control element
   * @param {string} errorMessage - Error message
   */
  addErrorMessage: (control, errorMessage) => {
    const errorId = ariaUtils.generateId('error');
    const errorElement = document.createElement('div');
    errorElement.id = errorId;
    errorElement.className = 'text-error-600 text-sm mt-1';
    errorElement.textContent = errorMessage;
    
    control.parentNode.appendChild(errorElement);
    control.setAttribute('aria-describedby', errorId);
    control.setAttribute('aria-invalid', 'true');
  },

  /**
   * Remove error message from form control
   * @param {HTMLElement} control - Form control element
   */
  removeErrorMessage: (control) => {
    const errorId = control.getAttribute('aria-describedby');
    if (errorId) {
      const errorElement = document.getElementById(errorId);
      if (errorElement) {
        errorElement.remove();
      }
    }
    
    control.removeAttribute('aria-describedby');
    control.removeAttribute('aria-invalid');
  },
};

// CSS class for screen reader only content
export const srOnlyClass = 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';

export default {
  focusUtils,
  ariaUtils,
  keyboardUtils,
  contrastUtils,
  screenReaderUtils,
  formA11yUtils,
  srOnlyClass,
};