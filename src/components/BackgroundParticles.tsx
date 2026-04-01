'use client';

import { useTheme } from '@/context/ThemeContext';

export function BackgroundParticles() {
  const { theme } = useTheme();

  // Only show particles in dark mode
  if (theme !== 'dark') return null;

  const particles = [
    { cx: '10%', cy: '20%', r: 80, opacity: 0.06, color: '#5080f0' },
    { cx: '80%', cy: '15%', r: 120, opacity: 0.04, color: '#6a98ff' },
    { cx: '65%', cy: '55%', r: 100, opacity: 0.05, color: '#5080f0' },
    { cx: '25%', cy: '80%', r: 140, opacity: 0.03, color: '#4060c0' },
    { cx: '50%', cy: '35%', r: 60, opacity: 0.06, color: '#7ab0ff' },
    { cx: '88%', cy: '80%', r: 90, opacity: 0.04, color: '#5080f0' },
    { cx: '40%', cy: '65%', r: 70, opacity: 0.03, color: '#4060c0' },
    { cx: '15%', cy: '50%', r: 50, opacity: 0.05, color: '#6a98ff' },
  ];

  return (
    <div className="bg-particles" aria-hidden="true">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {particles.map((p, i) => (
            <radialGradient key={`g${i}`} id={`particle-${i}`}>
              <stop offset="0%" stopColor={p.color} stopOpacity={p.opacity * 2} />
              <stop offset="50%" stopColor={p.color} stopOpacity={p.opacity} />
              <stop offset="100%" stopColor={p.color} stopOpacity={0} />
            </radialGradient>
          ))}
        </defs>
        {particles.map((p, i) => (
          <circle
            key={i}
            cx={p.cx}
            cy={p.cy}
            r={p.r}
            fill={`url(#particle-${i})`}
            className={`particle particle-${i % 3}`}
          />
        ))}
      </svg>
    </div>
  );
}
