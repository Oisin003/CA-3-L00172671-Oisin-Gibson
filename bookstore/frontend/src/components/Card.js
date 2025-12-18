//Oisin Gibson - L00172671
//Reusable Card component with dark mode support

/**
 * REFERENCES:
 * - React Children Prop: https://react.dev/reference/react/Children
 * - Component Composition: https://react.dev/learn/passing-props-to-a-component
 * - CSS Classes in React: https://react.dev/learn#adding-styles
 */

import React from 'react';
import './Card.css';

// Card component - A reusable container with rounded corners and shadow
// Usage: <Card>Your content here</Card>
// 
// Props:
//   className - Optional CSS classes to add custom styling
//   padding - Controls internal spacing: 'none', 'small', 'standard', or 'large'
//   children - The content to be displayed inside the card
export default function Card({ children, className = '', padding = 'standard' }) {
  // Combine CSS classes: base 'card' + padding size + any custom classes
  return (
    <div className={`card card-padding-${padding} ${className}`}>
      {children}
    </div>
  );
}
