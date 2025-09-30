import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detectar modo oscuro
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    // Observar cambios en el tema
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-bs-theme']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav 
      aria-label="breadcrumb" 
      className={`breadcrumb-nav ${className}`}
      style={{ 
        '--bs-breadcrumb-divider': '"›"',
        '--bs-breadcrumb-item-padding-x': '0.5rem'
      } as React.CSSProperties}
    >
      <ol 
        className="breadcrumb mb-0"
        style={{
          backgroundColor: 'transparent',
          padding: '0.75rem 0',
          marginBottom: '1rem'
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isActive = item.active || isLast;

          return (
            <li 
              key={index}
              className={`breadcrumb-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.path && !isActive ? (
                <Link 
                  to={item.path}
                  className="breadcrumb-link"
                  style={{
                    color: isDarkMode ? 'var(--color-sage-gray)' : 'var(--color-slate)',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-tint1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isDarkMode ? 'var(--color-sage-gray)' : 'var(--color-slate)';
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <span 
                  className="breadcrumb-text"
                  style={{
                    color: isActive 
                      ? (isDarkMode ? 'var(--color-gold)' : 'var(--color-base-green)')
                      : (isDarkMode ? 'var(--color-sage-gray)' : 'var(--color-slate)'),
                    fontWeight: isActive ? '600' : '400'
                  }}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
