import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  computeMoatCurves,
  computeMoatAtTime,
  DEFAULT_SCENARIOS,
  PORTCO_COMPONENTS,
} from '../lib/moat-model.js';
import { Slider, Toggle } from './Slider.jsx';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Convert a month-offset (from t=0 = May 2026) to a quarter label.
 * Examples: 0 → "Q2 2026", 5 → "Q3 2026" (Oct), 20 → "Q1 2028"
 */
function monthToQuarterLabel(monthOffset) {
  // t=0 is May 2026 → Q2 2026
  // Each quarter is 3 months
  const baseYear = 2026;
  const baseMonth = 5; // May = month 5 (1-indexed)
  const totalMonths = baseMonth + monthOffset - 1; // months since Jan year 0
  const year = baseYear + Math.floor(totalMonths / 12);
  const monthInYear = (totalMonths % 12) + 1;
  const quarter = Math.ceil(monthInYear / 3);
  return `Q${quarter} ${year}`;
}

// ============================================================================
// Custom tooltip — shows portco moat + component breakdown
// ============================================================================

function ChartTooltip({ active, payload, label, scenarios }) {
  if (!active || !payload || payload.length === 0) return null;

  const monthOffset = label;
  const quarterLabel = monthToQuarterLabel(monthOffset);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        padding: 12,
        fontSize: 13,
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        maxWidth: 320,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8, color: '#111827' }}>
        {quarterLabel} <span style={{ color: '#6b7280', fontWeight: 400 }}>(month {monthOffset})</span>
      </div>
      {payload.map((entry) => {
        const portcoKey = entry.dataKey;
        const portco = PORTCO_COMPONENTS[portcoKey];
        if (!portco) return null;
        return (
          <div key={portcoKey} style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  backgroundColor: entry.color,
                  borderRadius: 2,
                }}
              />
              <span style={{ fontWeight: 500, color: '#111827' }}>{portco.label}</span>
              <span style={{ color: '#6b7280' }}>
                moat = {entry.value.toFixed(3)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Scenario control panel
// ============================================================================

function ScenarioControl({ label, value, min, max, onChange, valueLabel, explanation, disabled = false }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
        }}
      >
        <label
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: '#111827',
            display: 'block',
          }}
        >
          {label}
        </label>
        <span
          style={{
            fontSize: 13,
            color: '#6b7280',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {valueLabel}
        </span>
      </div>
      <Slider value={value} min={min} max={max} onChange={onChange} disabled={disabled} />
      <div
        style={{
          fontSize: 12,
          color: '#6b7280',
          marginTop: 6,
          lineHeight: 1.5,
        }}
      >
        {explanation}
      </div>
    </div>
  );
}

// ============================================================================
// Main visualization
// ============================================================================

export default function MoatVisualization() {
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);

  // Compute curves whenever scenarios change
  const { flat: curveData } = useMemo(
    () => computeMoatCurves(scenarios, 36),
    [scenarios]
  );

  const update = (key, partial) =>
    setScenarios((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...partial },
    }));

  const reset = () => setScenarios(DEFAULT_SCENARIOS);

  return (
    <div
      style={{
        fontFamily:
          "'EB Garamond', Georgia, serif",
        color: '#111827',
        maxWidth: 1000,
        margin: '0 auto',
        padding: '24px 0',
      }}
    >
      {/* Chart */}
      <div style={{ marginBottom: 32 }}>
        <ResponsiveContainer width="100%" height={420}>
        <LineChart data={curveData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              label={{
                value: 'Months from May 2026',
                position: 'insideBottom',
                offset: -15,
                style: { fontSize: 13, fill: '#374151' },
              }}
              ticks={[0, 6, 12, 18, 24, 30, 36]}
              tickFormatter={(m) => `${m}`}
            />
            <YAxis
              domain={[0, 1]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(v) => v.toFixed(2)}
              label={{
                value: 'Normalized moat strength',
                angle: -90,
                position: 'insideLeft',
                offset: 15,
                style: { fontSize: 13, fill: '#374151', textAnchor: 'middle' },
              }}
            />
            <Tooltip content={<ChartTooltip scenarios={scenarios} />} />
            <Legend
              wrapperStyle={{ fontSize: 13, paddingTop: 24 }}
              iconType="rect"
              verticalAlign="bottom"
            />
            {['kueski', 'tpaga', 'yassir', 'vammo'].map((key) => {
              const portco = PORTCO_COMPONENTS[key];
              return <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={portco.label}
                stroke={portco.color}
                strokeWidth={2.25}
                dot={false}
                activeDot={{ r: 4 }}
              />;
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Scenario controls */}
      <div
        style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: 24,
          marginTop: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 20,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#111827' }}>
            Scenarios
          </h3>
          <button
            onClick={reset}
            style={{
              fontSize: 13,
              color: '#6b7280',
              background: 'none',
              border: '1px solid #e5e7eb',
              padding: '4px 10px',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Reset to defaults
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Mexico open finance */}
          <ScenarioControl
            label="Mexico open finance secondary regulation"
            value={scenarios.mexicoOpenFinance.catalystMonth}
            min={scenarios.mexicoOpenFinance.minMonth}
            max={scenarios.mexicoOpenFinance.maxMonth}
            valueLabel={monthToQuarterLabel(scenarios.mexicoOpenFinance.catalystMonth)}
            onChange={(v) => update('mexicoOpenFinance', { catalystMonth: v })}
            explanation="Affects Kueski's alternative-data underwriting component. Later rollout = stronger moat."
          />

          {/* Brazil open finance */}
          <ScenarioControl
            label="Brazil Open Finance Phase 5 expansion"
            value={scenarios.brazilOpenFinance.catalystMonth}
            min={scenarios.brazilOpenFinance.minMonth}
            max={scenarios.brazilOpenFinance.maxMonth}
            valueLabel={monthToQuarterLabel(scenarios.brazilOpenFinance.catalystMonth)}
            onChange={(v) => update('brazilOpenFinance', { catalystMonth: v })}
            explanation="Affects Vammo's platform-partnership data component (gig-platform transaction history)."
          />

          {/* Mexican incumbent — toggle + slider */}
          <div>
            <div style={{ marginBottom: 12 }}>
              <Toggle
                checked={scenarios.mexicanIncumbentLaunch.enabled}
                onChange={(v) => update('mexicanIncumbentLaunch', { enabled: v })}
                label="Major Mexican incumbent launches alt-data BNPL"
              />
            </div>
            <ScenarioControl
              label="...launch date"
              value={scenarios.mexicanIncumbentLaunch.catalystMonth}
              min={scenarios.mexicanIncumbentLaunch.minMonth}
              max={scenarios.mexicanIncumbentLaunch.maxMonth}
              valueLabel={monthToQuarterLabel(scenarios.mexicanIncumbentLaunch.catalystMonth)}
              onChange={(v) => update('mexicanIncumbentLaunch', { catalystMonth: v })}
              explanation="Affects Kueski's merchant integration + alt-data components simultaneously. Most powerful scenario."
              disabled={!scenarios.mexicanIncumbentLaunch.enabled}
            />
          </div>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px dashed #e5e7eb' }}>
          <ScenarioControl
            label="Colombia open finance secondary regulation completion"
            value={scenarios.colombiaOpenFinance.catalystMonth}
            min={scenarios.colombiaOpenFinance.minMonth}
            max={scenarios.colombiaOpenFinance.maxMonth}
            valueLabel={monthToQuarterLabel(scenarios.colombiaOpenFinance.catalystMonth)}
            onChange={(v) => update('colombiaOpenFinance', { catalystMonth: v })}
            explanation="Affects Tpaga's bill-pay + PSE integration component. Colombia's framework is mid-implementation; earlier completion = faster commoditization of Tpaga's PSE depth."
          />
        </div>

          {/* Algeria framework — counterintuitive */}
          <ScenarioControl
            label="Algeria fintech licensing framework completion"
            value={scenarios.algeriaFramework.catalystMonth}
            min={scenarios.algeriaFramework.minMonth}
            max={scenarios.algeriaFramework.maxMonth}
            valueLabel={monthToQuarterLabel(scenarios.algeriaFramework.catalystMonth)}
            onChange={(v) => update('algeriaFramework', { catalystMonth: v })}
            explanation="Counterintuitive: earlier completion REDUCES Yassir's moat (regulatory ambiguity has been a barrier to competition)."
          />
        </div>
      </div>

      {/* Component breakdown at current point */}
      <div
        style={{
          borderTop: '1px solid #e5e7eb',
          marginTop: 32,
          paddingTop: 24,
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px', color: '#111827' }}>
          Component breakdown at month 24
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {Object.keys(PORTCO_COMPONENTS).map((key) => {
            const result = computeMoatAtTime(key, scenarios, 24);
            const portco = PORTCO_COMPONENTS[key];
            return (
              <div key={key}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      backgroundColor: portco.color,
                      borderRadius: 2,
                    }}
                  />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{portco.label}</span>
                  <span style={{ fontSize: 13, color: '#6b7280', fontVariantNumeric: 'tabular-nums' }}>
                    moat = {result.moat.toFixed(3)}
                  </span>
                </div>
                <table style={{ width: '100%', fontSize: 12, color: '#374151' }}>
                  <tbody>
                    {Object.entries(result.components).map(([name, comp]) => (
                      <tr key={name}>
                        <td style={{ padding: '2px 0', color: '#6b7280' }}>
                          {comp.displayName}
                          {comp.type === 'growth' && (
                            <span style={{ marginLeft: 4, fontSize: 10, color: '#16a34a' }}>(↑)</span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: '2px 0',
                            textAlign: 'right',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {comp.contribution.toFixed(3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
