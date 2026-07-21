import React, { useEffect, useState } from 'react';

/**
 * CountdownTimer — animated circular SVG timer.
 * @param {{ value, max, size, warning, danger }}
 */
export default function CountdownTimer({ value = 0, max = 30, size = 120, warning = 10, danger = 5 }) {
  const [prevValue, setPrevValue] = useState(value);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (value !== prevValue) {
      setPrevValue(value);
      if (value <= danger) {
        setBump(true);
        setTimeout(() => setBump(false), 200);
      }
    }
  }, [value, prevValue, danger]);

  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = max > 0 ? value / max : 0;
  const strokeDashoffset = circumference * (1 - percentage);

  const isWarning = value <= warning;
  const isDanger = value <= danger;

  const color = isDanger
    ? '#ef4444'
    : isWarning
    ? '#f59e0b'
    : '#7c3aed';

  const glowColor = isDanger
    ? 'rgba(239,68,68,0.4)'
    : isWarning
    ? 'rgba(245,158,11,0.35)'
    : 'rgba(124,58,237,0.35)';

  return (
    <div
      className="countdown-wrapper"
      style={{
        width: size,
        height: size,
        transform: bump ? 'scale(1.08)' : 'scale(1)',
        transition: 'transform 0.15s ease',
        filter: `drop-shadow(0 0 12px ${glowColor})`,
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={6}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
        />
      </svg>

      {/* Number in center */}
      <div className="countdown-value" style={{ color, fontSize: size * 0.3 }}>
        {value}
      </div>

      <style>{`
        .countdown-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .countdown-value {
          position: absolute;
          font-weight: 900;
          font-variant-numeric: tabular-nums;
          line-height: 1;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: color 0.3s ease;
        }
      `}</style>
    </div>
  );
}
