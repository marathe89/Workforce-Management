import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// Matches the Coforge Workforce Intelligence Figma "Skill Gap Analysis"
// widget (node 8:10090, Skills Intelligence page). The chart body in Figma
// is a frozen SVG export of an already-rendered Recharts horizontal bar
// chart — rebuilt here as a real, live chart, same convention as the other
// rebuilt charts in this app. Values are the exact |gap| from the Full
// Skills Inventory table (a surplus skill's bar is shown in green using
// its positive gap, everything else uses the exact negative gap).
const DATA = [
  { skill: 'Java', gap: 120, color: 'var(--w-amber)' },
  { skill: 'AWS', gap: 270, color: 'var(--w-orange)' },
  { skill: 'GenAI', gap: 420, color: 'var(--w-red)' },
  { skill: 'Data Engineering', gap: 350, color: 'var(--w-red)' },
  { skill: 'Cybersecurity', gap: 220, color: 'var(--w-orange)' },
  { skill: 'DevOps', gap: 180, color: 'var(--w-amber)' },
  { skill: 'React', gap: 50, color: 'var(--w-green)' },
  { skill: 'SAP', gap: 80, color: 'var(--w-green)' },
  { skill: 'Azure', gap: 280, color: 'var(--w-orange)' },
  { skill: 'Salesforce', gap: 60, color: 'var(--w-green)' },
];

function SkillGapAnalysisChart({ activeSkill, onSelect }) {
  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px' }}>
      <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '14px', lineHeight: '21px', color: 'var(--w-text-primary)' }}>
        Skill Gap Analysis
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>
        Supply–demand delta by skill · click a bar to filter the inventory below
      </p>
      <div style={{ height: '340px', paddingTop: '14px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--w-card-border)" horizontal={false} />
            <XAxis type="number" domain={[0, 600]} ticks={[0, 150, 300, 450, 600]} stroke="var(--w-text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="skill" stroke="var(--w-text-secondary)" fontSize={11} tickLine={false} axisLine={false} width={100} />
            <Tooltip
              cursor={{ fill: 'var(--w-sunken-bg)' }}
              contentStyle={{ backgroundColor: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: 8, color: 'var(--w-text-primary)' }}
            />
            <Bar dataKey="gap" radius={[0, 3, 3, 0]} cursor="pointer" onClick={(d) => onSelect?.(activeSkill === d.skill ? null : d.skill)}>
              {DATA.map((d) => (
                <Cell key={d.skill} fill={d.color} fillOpacity={activeSkill && activeSkill !== d.skill ? 0.35 : 1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SkillGapAnalysisChart;
