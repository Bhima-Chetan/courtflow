'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './text-reveal.css';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  type?: 'chars' | 'words' | 'lines';
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'rotate' | 'wave' | 'glitch';
  threshold?: number;
  once?: boolean;
}

export default function TextReveal({
  text,
  className = '',
  delay = 50,
  type = 'chars',
  tag = 'p',
  animation = 'fade-up',
  threshold = 0.1,
  once = true
}: TextRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const setObservedNode = useCallback((node: HTMLElement | null) => {
    ref.current = node;
  }, []);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [threshold, once]);

  const elements = type === 'chars' 
    ? text.split('') 
    : type === 'words' 
    ? text.split(' ') 
    : text.split('\n');

  const Tag = tag;

  return (
    <Tag ref={setObservedNode} className={`text-reveal ${className}`}>
      {elements.map((element, index) => (
        <span
          key={`${element}-${index}`}
          className={`text-reveal-element ${animation} ${isVisible ? 'visible' : ''}`}
          style={{
            animationDelay: `${index * delay}ms`,
          }}
        >
          {element === ' ' || element === '' ? '\u00A0' : element}
          {type === 'words' && index < elements.length - 1 && ' '}
        </span>
      ))}
    </Tag>
  );
}
