import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import StatCard from '../components/StatCard';
import BenchAgingChart from '../components/BenchAgingChart';
import BenchByBusinessUnitTable from '../components/BenchByBusinessUnitTable';
import BenchEmployeesTable from '../components/BenchEmployeesTable';

// Matches the Coforge Workforce Intelligence Figma "BenchManagement"
// screen (node 8:11055, Bench Management nav item). Static Figma mockup
// data throughout — no backend model yet for bench aging/matching — same
// convention as Talent Finder / Projects / Capacity & Utilization /
// Demand Forecast / Skills Intelligence.
//
// This page owns the cross-widget filter state (same pattern as those
// other pages): the 6 stat cards, the aging chart's bars/"Prioritize"
// button, and the business-unit table's rows can all set
// `bucket`/`businessUnit`, which — on top of `?q=` (header global
// search) — narrows and scrolls to the matching rows in Bench Employees
// below. All client-side/session-only — no backend query.
const STATS = [
  { key: 'total', label: 'Total Bench', value: '1,126', subtitle: '0% allocated, unassigned' },
  { key: 'd0_15', label: '0–15 Days', value: '524', subtitle: 'Early bench — 46.5%' },
  { key: 'd16_30', label: '16–30 Days', value: '318', subtitle: 'Moderate — 28.2%' },
  { key: 'd31_60', label: '31–60 Days', value: '192', subtitle: 'Extended — 17.1%' },
  { key: 'd60', label: '60+ Days', value: '92', subtitle: 'Critical — 8.2%' },
  { key: 'cost', label: 'Est. Monthly Cost', value: '$1.8M', subtitle: 'Bench carrying cost' },
];

function BenchManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [bucket, setBucket] = useState(null);
  const [businessUnit, setBusinessUnit] = useState(null);
  const [activeStat, setActiveStat] = useState(null);
  const [sortRequest, setSortRequest] = useState(null);
  const chartRef = useRef(null);
  const employeesRef = useRef(null);

  useEffect(() => {
    if (query) employeesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [query]);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const clearQuery = () => setSearchParams({});
  const clearFilters = () => {
    setBucket(null);
    setBusinessUnit(null);
    setActiveStat(null);
  };

  const handleStatClick = (key) => {
    if (key === 'total') {
      clearQuery();
      clearFilters();
      scrollTo(employeesRef);
      return;
    }
    if (key === 'cost') {
      setActiveStat('cost');
      setSortRequest({ key: 'cost', dir: 'desc', nonce: Date.now() });
      scrollTo(chartRef);
      return;
    }
    setBucket(key);
    setBusinessUnit(null);
    setActiveStat(key);
    scrollTo(employeesRef);
  };

  const selectBucket = (key) => {
    setActiveStat(key);
    setBucket(key);
    if (key) scrollTo(employeesRef);
  };

  const selectUnit = (unit) => {
    setActiveStat(null);
    setBusinessUnit(unit);
    if (unit) scrollTo(employeesRef);
  };

  return (
    <div className="p-8 space-y-4">
      <div>
        <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '24px', lineHeight: '36px', color: 'var(--w-text-primary)' }}>
          Bench Management
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px', lineHeight: '19.5px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>
          Reduce bench duration by proactively matching available talent to demand.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {STATS.map((s) => (
          <StatCard key={s.key} {...s} minHeight="8.4rem" active={activeStat === s.key} onClick={() => handleStatClick(s.key)} />
        ))}
      </div>

      <div ref={chartRef} className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4" style={{ scrollMarginTop: '16px' }}>
        <BenchAgingChart activeBucket={bucket} onSelect={selectBucket} />
        <BenchByBusinessUnitTable activeUnit={businessUnit} onSelectUnit={selectUnit} sortRequest={sortRequest} />
      </div>

      <BenchEmployeesTable
        ref={employeesRef}
        query={query}
        onClearQuery={clearQuery}
        activeFilters={{ bucket, businessUnit }}
        onClearFilters={clearFilters}
      />
    </div>
  );
}

export default BenchManagement;
