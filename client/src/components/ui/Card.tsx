// components/ui/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  gradient = false,
  title,
  action
}) => {
  const baseClasses = 'bg-white rounded-xl shadow-lg';
  const hoverClasses = hover ? 'hover:shadow-2xl hover:-translate-y-1 transition-all duration-300' : '';
  const gradientClasses = gradient ? 'bg-gradient-to-br from-white to-purple-50' : '';
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {action}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};