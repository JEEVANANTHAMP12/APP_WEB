// @ts-nocheck
/**
 * Shared chart utilities used across dashboard charts.
 */

/**
 * Select n evenly-spaced items from an array (always includes first and last).
 */
export function selectEvenlySpacedItems(arr, n) {
  if (!arr || arr.length === 0) return [];
  if (arr.length <= n) return arr;
  const result = [];
  const step = (arr.length - 1) / (n - 1);
  for (let i = 0; i < n; i++) {
    result.push(arr[Math.round(i * step)]);
  }
  return result;
}

/**
 * Custom Recharts tooltip rendered as a styled card.
 * Compatible with recharts `content={<ChartTooltipContent />}` pattern.
 */
export const ChartTooltipContent = ({ active, payload, label, formatter, labelFormatter }) => {
  if (!active || !payload || payload.length === 0) return null;

  const displayLabel = labelFormatter ? labelFormatter(label) : label;

  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.75rem',
        padding: '10px 14px',
        boxShadow: 'var(--shadow-lg)',
        minWidth: 160,
        fontSize: 13,
      }}
    >
      {displayLabel && (
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: 11,
            fontWeight: 600,
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {displayLabel}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {payload.map((entry, idx) => {
          const value = formatter ? formatter(entry.value, entry.name) : entry.value;
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: entry.type === 'line' ? '50%' : 3,
                  background: entry.color || entry.fill || entry.stroke,
                  flexShrink: 0,
                }}
              />
              <span style={{ color: 'var(--text-secondary)', flexGrow: 1 }}>{entry.name}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, marginLeft: 8 }}>
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
