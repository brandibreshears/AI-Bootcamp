import React from 'react';

interface IconProps {
  className?: string;
}

export function GridIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="2" y="2" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="11" y="2" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="2" y="11" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="11" y="11" width="7" height="7" rx="1" fill="currentColor" />
    </svg>
  );
}

export function PeopleIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="7.5" cy="6" r="3" fill="currentColor" />
      <path d="M1 17c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6H1z" fill="currentColor" />
      <circle cx="14" cy="5.5" r="2.5" fill="currentColor" opacity="0.7" />
      <path d="M14 12c1.5 0 5 .9 5 4h-4.5c-.3-1.6-1.1-3-2.8-4 .7-.02 1.5 0 2.3 0z" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function DocumentIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M5 2h7l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z" fill="currentColor" />
      <path d="M12 2v4h4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="7" y1="10" x2="13" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="13" x2="11" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M10 17s-7-4.35-7-9a4 4 0 018-1.14A4 4 0 0117 8c0 4.65-7 9-7 9z" fill="currentColor" />
    </svg>
  );
}

export function HospitalIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="3" y="5" width="14" height="13" rx="1" fill="currentColor" />
      <path d="M7 2h6v3H7z" fill="currentColor" />
      <rect x="9" y="9" width="2" height="5" fill="white" />
      <rect x="7" y="11" width="6" height="2" fill="white" />
    </svg>
  );
}

export function GearIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="10" cy="10" r="2.5" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M10 1a1 1 0 00-1 1v1.07A7.002 7.002 0 003.07 9H2a1 1 0 000 2h1.07A7.002 7.002 0 009 16.93V18a1 1 0 002 0v-1.07A7.002 7.002 0 0016.93 11H18a1 1 0 000-2h-1.07A7.002 7.002 0 0011 3.07V2a1 1 0 00-1-1zm0 4a5 5 0 100 10A5 5 0 0010 5z" fill="currentColor" />
    </svg>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" fill="currentColor" />
      <path d="M10 18a2 2 0 002-2H8a2 2 0 002 2z" fill="currentColor" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="2" />
      <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M4 10l4.5 4.5L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WarningIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M8.574 2.5a1.6 1.6 0 012.852 0l6.574 11.5A1.6 1.6 0 0116.574 16H3.426a1.6 1.6 0 01-1.426-2L8.574 2.5z" fill="currentColor" />
      <path d="M10 7.5v4M10 13.5v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function InfoIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="10" cy="10" r="8" fill="currentColor" />
      <path d="M10 9v5M10 7v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
