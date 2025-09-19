import { ReactNode } from "react";

/**
 * Shared utilities for component patterns and common UI operations
 */

export const componentUtils = {
  /**
   * Creates a compound component pattern helper
   */
  createCompoundComponent: <T extends Record<string, unknown>>(components: T) => {
    return components;
  },

  /**
   * Handles keyboard navigation for lists/dropdowns
   */
  handleKeyboardNavigation: (
    event: React.KeyboardEvent,
    options: {
      onEnter?: () => void;
      onEscape?: () => void;
      onArrowUp?: () => void;
      onArrowDown?: () => void;
      preventDefault?: boolean;
    }
  ) => {
    const { onEnter, onEscape, onArrowUp, onArrowDown, preventDefault = true } = options;

    switch (event.key) {
      case 'Enter':
        if (preventDefault) event.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
        if (preventDefault) event.preventDefault();
        onEscape?.();
        break;
      case 'ArrowUp':
        if (preventDefault) event.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        if (preventDefault) event.preventDefault();
        onArrowDown?.();
        break;
    }
  },

  /**
   * Creates a render prop wrapper for common patterns
   */
  withRenderProps: <T extends Record<string, unknown>>(
    data: T,
    children: (props: T) => ReactNode
  ): ReactNode => {
    return children(data);
  },

  /**
   * Safely renders children with error boundary pattern
   */
  safeRender: (
    children: ReactNode,
    fallback?: ReactNode
  ): ReactNode => {
    try {
      return children;
    } catch (error) {
      console.error('Component render error:', error);
      return fallback || null;
    }
  }
};

/**
 * Common dropdown/modal positioning utilities
 */
export const positionUtils = {
  /**
   * Calculates optimal dropdown position to stay within viewport
   */
  calculateDropdownPosition: (
    triggerElement: HTMLElement,
    dropdownElement: HTMLElement,
    options: {
      preferredPosition?: 'top' | 'bottom' | 'auto';
      offset?: number;
    } = {}
  ) => {
    const { preferredPosition = 'auto', offset = 4 } = options;
    const triggerRect = triggerElement.getBoundingClientRect();
    const dropdownRect = dropdownElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    let position: 'top' | 'bottom';

    if (preferredPosition === 'auto') {
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      position = spaceBelow >= dropdownRect.height || spaceBelow >= spaceAbove ? 'bottom' : 'top';
    } else {
      position = preferredPosition;
    }

    const top = position === 'bottom'
      ? triggerRect.bottom + offset
      : triggerRect.top - dropdownRect.height - offset;

    return {
      position,
      top,
      left: triggerRect.left,
      maxWidth: `${window.innerWidth - triggerRect.left - 16}px`
    };
  }
};

/**
 * Event handling utilities for consistent patterns
 */
export const eventUtils = {
  /**
   * Prevents event bubbling and default behavior
   */
  stopEvent: (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  },

  /**
   * Debounced event handler creator
   */
  createDebouncedHandler: <T extends Event>(
    handler: (event: T) => void,
    delay: number = 300
  ) => {
    let timeout: NodeJS.Timeout;
    return (event: T) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => handler(event), delay);
    };
  },

  /**
   * Creates a click outside detector
   */
  useClickOutside: (
    ref: React.RefObject<HTMLElement>,
    handler: () => void
  ) => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    return { handleClickOutside };
  }
};
