import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SkillStatCards from '../components/SkillStatCards';
import SkillGapAnalysisChart from '../components/SkillGapAnalysisChart';
import SkillGapHeatmap from '../components/SkillGapHeatmap';
import FullSkillsInventoryTable from '../components/FullSkillsInventoryTable';

// Matches the Coforge Workforce Intelligence Figma "SkillsIntelligence"
// screen (node 8:9899, Skills Intelligence nav item). Static Figma mockup
// data throughout — no backend model yet for skills supply/demand — same
// convention as Talent Finder / Projects / Capacity & Utilization /
// Demand Forecast.
//
// This page now owns the cross-widget filter state (same pattern as
// those other pages): the 5 skill stat cards, the Skill Gap Analysis bar
// chart, and the Skill Gap Heatmap can all set `skillFilter`, which — on
// top of `?q=` (set by the header's global search when it links here) —
// narrows and scrolls to the matching row in Full Skills Inventory below.
function SkillsIntelligence() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [skillFilter, setSkillFilter] = useState(null);
  const inventoryRef = useRef(null);

  useEffect(() => {
    if (query) inventoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [query]);

  const clearQuery = () => setSearchParams({});

  const selectSkill = (skill) => {
    setSkillFilter(skill);
    if (skill) inventoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="p-8 space-y-4">
      <div>
        <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '24px', lineHeight: '36px', color: 'var(--w-text-primary)' }}>
          Skills Intelligence
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px', lineHeight: '19.5px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>
          Understand current capability versus future demand across all practices.
        </p>
      </div>

      <SkillStatCards activeSkill={skillFilter} onSelect={selectSkill} />

      {/* 10-column split (not an even 50/50) so the heatmap gets enough
          room to show all 8 business units without horizontal scroll:
          Skill Gap Analysis at 4/10, Skill Gap Heatmap at 6/10. */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-start">
        <div className="lg:col-span-4">
          <SkillGapAnalysisChart activeSkill={skillFilter} onSelect={selectSkill} />
        </div>
        <div className="lg:col-span-6">
          <SkillGapHeatmap activeSkill={skillFilter} onSelect={selectSkill} />
        </div>
      </div>

      <FullSkillsInventoryTable
        ref={inventoryRef}
        query={query}
        onClearQuery={clearQuery}
        skillFilter={skillFilter}
        onClearSkillFilter={() => setSkillFilter(null)}
      />
    </div>
  );
}

export default SkillsIntelligence;
