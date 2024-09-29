import { cn } from '@/lib/utils'; // Adjust this import to match your utils location
import React from 'react';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'p',
  className = '',
  children,
}) => {
  const Component = variant as keyof JSX.IntrinsicElements;
  return (
    <Component className={cn(className, typographyStyles[variant])}>
      {children}
    </Component>
  );
};

const typographyStyles = {
  h1: 'text-4xl font-bold',
  h2: 'text-3xl font-semibold',
  h3: 'text-2xl font-medium',
  p: 'text-base',
};
