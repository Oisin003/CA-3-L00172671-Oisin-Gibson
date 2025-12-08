//Oisin Gibson - L00172671
//Reusable Card component with dark mode support

import React from 'react';
import './Card.css';

// Card component - A reusable container with rounded corners and shadow
// Usage: <Card>Your content here</Card>
// 
// Props:
//   className - Optional CSS classes to add custom styling
//   padding - Controls internal spacing: 'none', 'small', 'standard', or 'large'
export default function Card({ children, className = '', padding = 'standard' }) {
  // Combine CSS classes: base 'card' + padding size + any custom classes
  return (
    <div className={`card card-padding-${padding} ${className}`}>
      {children}
    </div>
  );
}
