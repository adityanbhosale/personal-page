import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { PALETTE } from '../lib/palette.js';

/**
 * Slider — Radix-based slider with custom inline styling.
 *
 * Props:
 *   value: number — current value
 *   min, max: number — bounds
 *   step: number — step size (default 1)
 *   onChange: (number) => void — called with new value
 *   disabled: boolean
 */
export function Slider({ value, min, max, step = 1, onChange, disabled = false }) {
  return (
    <SliderPrimitive.Root
      className="moat-slider-root"
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onChange(v[0])}
      disabled={disabled}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        userSelect: 'none',
        touchAction: 'none',
        width: '100%',
        height: 20,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <SliderPrimitive.Track
        style={{
          backgroundColor: PALETTE.rule,
          position: 'relative',
          flexGrow: 1,
          borderRadius: 9999,
          height: 4,
        }}
      >
        <SliderPrimitive.Range
          style={{
            position: 'absolute',
            backgroundColor: PALETTE.accent,
            borderRadius: 9999,
            height: '100%',
          }}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        style={{
          display: 'block',
          width: 16,
          height: 16,
          backgroundColor: PALETTE.ink,
          border: `2px solid ${PALETTE.accent}`,
          borderRadius: '50%',
          boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
          cursor: disabled ? 'not-allowed' : 'grab',
          outline: 'none',
        }}
        aria-label="value"
      />
    </SliderPrimitive.Root>
  );
}

/**
 * Switch / Toggle — minimal native styling.
 */
export function Toggle({ checked, onChange, label }) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        fontSize: 14,
        color: PALETTE.inkMuted,
      }}
    >
      <span
        style={{
          position: 'relative',
          display: 'inline-block',
          width: 36,
          height: 20,
          backgroundColor: checked ? PALETTE.accent : PALETTE.rule,
          borderRadius: 9999,
          transition: 'background-color 150ms',
        }}
        onClick={() => onChange(!checked)}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 18 : 2,
            width: 16,
            height: 16,
            backgroundColor: PALETTE.ink,
            borderRadius: '50%',
            boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
            transition: 'left 150ms',
          }}
        />
      </span>
      {label}
    </label>
  );
}
