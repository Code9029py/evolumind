import { Sparkles } from 'lucide-react';

/**
 * Responsive loading spinner component aligned with EvoluMind brand identity.
 *
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Spinner size variant
 * @param {string} [props.message] - Primary informative loading message
 * @param {string} [props.submessage] - Secondary contextual text
 * @param {string} [props.minHeight] - Custom minimum height for container
 * @param {boolean} [props.inline=false] - Compact inline layout for buttons/bars
 * @param {boolean} [props.withIcon=false] - Display center brand icon
 * @param {string} [props.className] - Additional CSS classes
 */
export default function LoadingSpinner({
  size = 'md',
  message,
  submessage,
  minHeight,
  inline = false,
  withIcon = false,
  className = '',
}) {
  if (inline) {
    return (
      <span
        className={`spinner-inline-wrap spinner-${size} ${className}`}
        role="status"
        aria-live="polite"
      >
        <span className="spinner-circle-ring" aria-hidden="true" />
        {message && <span className="spinner-inline-text">{message}</span>}
      </span>
    );
  }

  return (
    <div
      className={`loading-spinner-container spinner-size-${size} ${className}`}
      style={minHeight ? { minHeight } : undefined}
      role="status"
      aria-live="polite"
    >
      <div className="loading-spinner-visual">
        <div className="spinner-circle-ring" aria-hidden="true" />
        {withIcon && (
          <div className="spinner-center-icon" aria-hidden="true">
            <Sparkles size={size === 'lg' ? 24 : size === 'sm' ? 14 : 18} />
          </div>
        )}
      </div>

      {(message || submessage) && (
        <div className="loading-spinner-content">
          {message && <h4 className="loading-spinner-message">{message}</h4>}
          {submessage && <p className="loading-spinner-submessage">{submessage}</p>}
        </div>
      )}
    </div>
  );
}
