import React from 'react';
import PropTypes from 'prop-types';

/**
 * Button - Primary button component
 * Follows the design system with variants and sizes
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  fullWidth = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  // Base styles
  const baseStyles =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Variant styles
  const variantStyles = {
    primary: 'bg-primary hover:bg-primary/90 text-white focus:ring-primary/50',
    secondary: 'bg-secondary hover:bg-secondary/90 text-white focus:ring-secondary/50',
    accent: 'bg-accent hover:bg-accent/90 text-white focus:ring-accent/50',
    outline:
      'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 focus:ring-primary/50',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-primary/50',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/50',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
  };

  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';

  // Disabled styles
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${disabledStyles} ${className}`;

  return (
    <button type={type} className={buttonStyles} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'accent', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export { Button };
