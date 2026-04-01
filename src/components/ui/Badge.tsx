'use client';

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function Badge({
  label,
  color = 'text-gray-700',
  bgColor = 'bg-gray-100',
  borderColor = 'border-gray-200',
  className = '',
  size = 'sm',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-lg border font-semibold tracking-tight
        ${color} ${bgColor} ${borderColor}
        ${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}
        ${className}
      `}
    >
      {label}
    </span>
  );
}
