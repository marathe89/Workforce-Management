import React, { useState, useRef, useEffect } from 'react';
import { findBestIntent, FOLLOW_UPS } from '../data/aiAdvisorData';
import AdvisorResultCard from '../components/AdvisorResultCard';

// Matches the Coforge Workforce Intelligence Figma "AI Workforce Advisor"
// screen (node 8:12500). REPLACES the page's earlier version — a real
// backend-driven tool panel wired to four live Claude-powered endpoints
// — since this design is a free-text chat interface and no free-text
// chat endpoint exists on the backend.
//
// Rebuilt on data/aiAdvisorData.js: free text is parsed for known
// entities (business unit, skill, project, a percentage threshold, a
// timeframe) and scored against a fixed set of intents — the same
// rule-based "vibe search" convention already used by Talent Finder
// (data/talentData.js), not a live language model call. A matching
// question no longer has to be typed verbatim; loosely-worded or
// paraphrased versions still land on the right intent. Every answer
// renders as a real interactive card (AdvisorResultCard) — metrics, a
// ranked list, and a CTA into the actual page the numbers come from —
// instead of a flat sentence, plus contextual follow-up suggestions.
const SUGGESTIONS = [
  'Where do we have excess capacity?',
  'Which employees can staff Project Phoenix?',
  'Which skills will be short in Q4?',
  'How can we reduce bench by 10%?',
  'Show me resources becoming available next month.',
  'Show me employees with more than 30% available capacity.',
  'Which partially allocated employees can support Project Phoenix?',
  'How can we improve utilization without hiring?',
  'Should we hire or upskill for GenAI demand?',
];

function Chip({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left"
      style={{
        background: 'var(--w-sunken-bg)',
        border: '1px solid var(--w-card-border)',
        borderRadius: '10px',
        padding: '16px',
      }}
    >
      <span style={{ color: 'var(--w-indigo)', marginRight: '8px' }}>✦</span>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'var(--w-text-tertiary)' }}>{text}</span>
    </button>
  );
}

function EntityPills({ entities }) {
  const pills = [
    entities.businessUnit && { key: 'bu', label: entities.businessUnit },
    entities.skill && { key: 'skill', label: entities.skill },
    entities.project && { key: 'project', label: entities.project },
    entities.percentageThreshold != null && { key: 'pct', label: `>${entities.percentageThreshold}%` },
    entities.timeframeDays != null && { key: 'time', label: `within ${entities.timeframeDays}d` },
  ].filter(Boolean);
  if (pills.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5" style={{ marginTop: '6px' }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)' }}>Understood:</span>
      {pills.map((p) => (
        <span key={p.key} style={{ background: 'color-mix(in srgb, var(--w-accent-blue) 13%, transparent)', border: '1px solid color-mix(in srgb, var(--w-accent-blue) 25%, transparent)', borderRadius: '20px', padding: '2px 9px', fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-accent-blue)' }}>
          {p.label}
        </span>
      ))}
    </div>
  );
}

function ChatTurn({ turn, onFollowUp }) {
  if (turn.role === 'user') {
    return (
      <div className="flex" style={{ justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: '70%', background: 'linear-gradient(178deg, var(--w-indigo) 0%, var(--w-accent-blue) 100%)', borderRadius: '12px', padding: '12px 16px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '21px' }}>
          {turn.text}
        </div>
      </div>
    );
  }
  const followUps = FOLLOW_UPS[turn.intentId] || [];
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-start gap-2">
        <span style={{ fontSize: '10px', color: 'var(--w-indigo)', border: '1px solid color-mix(in srgb, var(--w-indigo) 35%, transparent)', borderRadius: '10px', padding: '2px 8px', fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>
          {turn.intentId === 'fallback' ? 'unmatched' : 'matched'}
        </span>
      </div>
      <AdvisorResultCard card={turn.card} />
      <EntityPills entities={turn.entities} />
      {followUps.length > 0 && (
        <div className="flex flex-wrap gap-2" style={{ marginTop: '4px' }}>
          {followUps.map((f) => (
            <button
              key={f}
              onClick={() => onFollowUp(f)}
              style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '20px', padding: '5px 12px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)', whiteSpace: 'nowrap' }}
            >
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AIWorkforceAdvisor() {
  const [turns, setTurns] = useState([]);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  const send = (text) => {
    const question = text.trim();
    if (!question) return;
    const { intent, entities, card } = findBestIntent(question);
    setTurns((prev) => [...prev, { role: 'user', text: question }, { role: 'assistant', intentId: intent.id, entities, card }]);
    setDraft('');
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="flex flex-wrap items-center justify-between gap-3" style={{ padding: '2rem 2rem 0' }}>
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center shrink-0"
            style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundImage: 'linear-gradient(135deg, var(--w-indigo) 0%, var(--w-accent-blue) 100%)' }}
          >
            <span style={{ fontSize: '20px', color: '#FFFFFF' }}>✦</span>
          </div>
          <div>
            <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '24px', color: 'var(--w-text-primary)' }}>AI Workforce Advisor</h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-tertiary)', marginTop: '2px' }}>
              Ask in your own words — capacity, staffing, skills, utilization, bench, or a named business unit, skill or project.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span style={{ background: 'color-mix(in srgb, var(--w-green) 13%, transparent)', border: '1px solid color-mix(in srgb, var(--w-green) 25%, transparent)', borderRadius: '6px', padding: '6px 12px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: 'var(--w-green)', whiteSpace: 'nowrap' }}>
            ● Rule-based query matching
          </span>
          <span style={{ background: 'color-mix(in srgb, var(--w-accent-blue) 13%, transparent)', border: '1px solid color-mix(in srgb, var(--w-accent-blue) 25%, transparent)', borderRadius: '6px', padding: '6px 12px', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: 'var(--w-accent-blue)', whiteSpace: 'nowrap' }}>
            48,620 employees indexed
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '2rem' }}>
        {turns.length === 0 ? (
          <div className="flex flex-col items-center" style={{ paddingTop: '4rem' }}>
            <span style={{ fontSize: '28px', color: 'var(--w-text-primary)' }}>✦</span>
            <h2 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--w-text-primary)', marginTop: '16px' }}>
              How can I help with workforce planning today?
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'var(--w-text-secondary)', marginTop: '8px', maxWidth: '520px', textAlign: 'center' }}>
              Ask about capacity, skills, staffing gaps, utilization, bench, or name a specific business unit, skill or project — you don't need the exact wording below.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ maxWidth: '800px', width: '100%', marginTop: '32px' }}>
              {SUGGESTIONS.map((s) => (
                <Chip key={s} text={s} onClick={() => send(s)} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {turns.map((t, i) => (
              <ChatTurn key={i} turn={t} onFollowUp={send} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div style={{ padding: '0 2rem 2rem' }}>
        <div
          className="flex items-center gap-3"
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            background: 'var(--w-sunken-bg)',
            border: '1px solid var(--w-card-border)',
            borderRadius: '10px',
            padding: '10px 14px',
          }}
        >
          <span style={{ color: 'var(--w-indigo)' }}>✦</span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(draft)}
            placeholder="Ask in your own words — e.g. “Where is Insurance sitting on spare capacity?”"
            className="flex-1 bg-transparent outline-none"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'var(--w-text-primary)' }}
          />
          <button
            onClick={() => send(draft)}
            disabled={!draft.trim()}
            style={{
              background: draft.trim() ? 'linear-gradient(178deg, var(--w-indigo) 0%, var(--w-accent-blue) 100%)' : 'var(--w-card-border)',
              borderRadius: '7px',
              padding: '9px 18px',
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 700,
              fontSize: '13px',
              color: draft.trim() ? '#FFFFFF' : 'var(--w-text-label)',
              whiteSpace: 'nowrap',
            }}
          >
            Send
          </button>
        </div>
        <p style={{ maxWidth: '900px', margin: '6px auto 0', fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)' }}>
          Matches your question to a fixed set of workforce intents by keyword and entity overlap — no live language model is called.
        </p>
      </div>
    </div>
  );
}

export default AIWorkforceAdvisor;
