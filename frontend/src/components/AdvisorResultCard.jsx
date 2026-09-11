import React from 'react';
import { useNavigate } from 'react-router-dom';

// Renders one AI Workforce Advisor answer as a real, interactive card —
// metrics grid and/or a ranked list, plus a CTA that navigates straight
// to the page the numbers came from — instead of a flat sentence of
// text. Clicking the card itself (not just the CTA) also navigates,
// consistent with the "clickable card" convention used everywhere else
// in this app (Overview's stat cards, etc).
function AdvisorResultCard({ card }) {
  const navigate = useNavigate();
  const clickable = Boolean(card.cta);

  return (
    <div
      onClick={clickable ? () => navigate(card.cta.to) : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => (e.key === 'Enter' || e.key === ' ') && navigate(card.cta.to) : undefined}
      className={clickable ? 'w-clickable-card' : undefined}
      style={{
        background: 'var(--w-sunken-bg)',
        border: '1px solid var(--w-card-border)',
        borderRadius: '12px',
        padding: '16px 18px',
        maxWidth: '520px',
        cursor: clickable ? 'pointer' : 'default',
      }}
    >
      <div className="flex items-center gap-2">
        <span style={{ fontSize: '16px' }}>{card.icon}</span>
        <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--w-text-primary)' }}>{card.title}</p>
      </div>
      {card.subtitle && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)', marginTop: '6px' }}>{card.subtitle}</p>
      )}

      {card.metrics && card.metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-2" style={{ marginTop: '12px' }}>
          {card.metrics.map((m) => (
            <div key={m.label} style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '8px', padding: '10px 12px' }}>
              <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '17px', color: m.color || 'var(--w-text-primary)' }}>{m.value}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)', marginTop: '2px' }}>{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {card.list && card.list.length > 0 && (
        <div className="flex flex-col gap-1.5" style={{ marginTop: '12px' }}>
          {card.list.map((row) => (
            <div key={row.label} className="flex items-center justify-between" style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '7px', padding: '7px 12px' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-text-primary)' }}>{row.label}</span>
              <span className="flex items-center gap-2">
                <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--w-accent-blue)' }}>{row.value}</span>
                {row.extra && <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--w-text-label)' }}>{row.extra}</span>}
              </span>
            </div>
          ))}
          {card.list.length === 0 && (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-label)' }}>No results match that filter.</p>
          )}
        </div>
      )}

      {card.cta && (
        <p style={{ marginTop: '12px', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '12px', color: 'var(--w-accent-blue)' }}>
          {card.cta.label}
        </p>
      )}
    </div>
  );
}

export default AdvisorResultCard;
