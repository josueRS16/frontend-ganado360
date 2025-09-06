import { type ReactNode } from 'react';

interface FeedbackCardProps {
  type: 'validation' | 'confirmation' | 'info' | 'warning';
  title: string;
  children: ReactNode;
  className?: string;
  onDismiss?: () => void;
}

export function FeedbackCard({ 
  type, 
  title, 
  children, 
  className = '', 
  onDismiss 
}: FeedbackCardProps) {
  const getCardClasses = () => {
    const baseClasses = 'feedback-card mb-3';
    const typeClasses = {
      validation: 'validation',
      confirmation: 'confirmation', 
      info: 'info',
      warning: 'warning'
    };
    
    return `${baseClasses} ${typeClasses[type]} ${className}`;
  };

  const getIcon = () => {
    const icons = {
      validation: 'bi-exclamation-triangle-fill',
      confirmation: 'bi-check-circle-fill',
      info: 'bi-info-circle-fill', 
      warning: 'bi-exclamation-circle-fill'
    };
    
    return icons[type];
  };

  return (
    <div className={`card ${getCardClasses()}`} role="alert" aria-live="polite">
      <div className="card-body">
        <div className="d-flex align-items-start">
          <i className={`${getIcon()} me-2 flex-shrink-0`} aria-hidden="true"></i>
          <div className="flex-grow-1">
            <h6 className="card-title mb-2 d-flex align-items-center">
              {title}
              {onDismiss && (
                <button
                  type="button"
                  className="btn-close btn-sm ms-auto"
                  onClick={onDismiss}
                  aria-label="Cerrar mensaje"
                />
              )}
            </h6>
            <div className="mb-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componentes de conveniencia
export function ValidationCard({ title, children, className, onDismiss }: Omit<FeedbackCardProps, 'type'>) {
  return (
    <FeedbackCard 
      type="validation" 
      title={title} 
      className={className}
      onDismiss={onDismiss}
    >
      {children}
    </FeedbackCard>
  );
}

export function ConfirmationCard({ title, children, className, onDismiss }: Omit<FeedbackCardProps, 'type'>) {
  return (
    <FeedbackCard 
      type="confirmation" 
      title={title} 
      className={className}
      onDismiss={onDismiss}
    >
      {children}
    </FeedbackCard>
  );
}

export function InfoCard({ title, children, className, onDismiss }: Omit<FeedbackCardProps, 'type'>) {
  return (
    <FeedbackCard 
      type="info" 
      title={title} 
      className={className}
      onDismiss={onDismiss}
    >
      {children}
    </FeedbackCard>
  );
}

export function WarningCard({ title, children, className, onDismiss }: Omit<FeedbackCardProps, 'type'>) {
  return (
    <FeedbackCard 
      type="warning" 
      title={title} 
      className={className}
      onDismiss={onDismiss}
    >
      {children}
    </FeedbackCard>
  );
}
