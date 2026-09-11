import React, { useRef, useState } from 'react';
import StatCard from '../components/StatCard';
import SupplyVsForecastChart from '../components/SupplyVsForecastChart';
import DemandDriversRow, { DRIVERS } from '../components/DemandDriversRow';
import DemandForecastByBusinessUnitTable from '../components/DemandForecastByBusinessUnitTable';

// Matches the Coforge Workforce Intelligence Figma "DemandForecast" screen
// (node 38:245, Demand Forecast nav item). Static Figma mockup data
// throughout — no backend model yet for demand forecasting — same
// convention as Talent Finder / Projects / Capacity & Utilization.
//
// This page now owns the cross-widget interaction state (same pattern as
// Capacity & Utilization): stat cards, demand drivers and the business
// unit table all read/write the same `riskFilter`/`unitFilter` here, so
// clicking one actually affects the others instead of each being a
// decorative island. All client-side/session-only — no backend query.
const STATS = [
  { key: 'next30', label: 'Next 30 Days', value: '+840 FTE', subtitle: 'Committed + pipeline demand', trend: { direction: 'up', label: '+840 FTE' } },
  { key: 'next90', label: 'Next 90 Days', value: '+2,420 FTE', subtitle: 'Forecast demand growth', trend: { direction: 'down', label: '+2,420 FTE' } },
  { key: 'shortage', label: 'Projected Shortage', value: '620 FTE', subtitle: 'Q4 2026 · Supply gap', trend: { direction: 'down', label: 'Q4 peak risk' } },
  { key: 'excess', label: 'Projected Excess', value: '310 FTE', subtitle: 'Aug–Sep · Available surplus', trend: { direction: 'up', label: 'Aug–Sep window' } },
];

function DemandForecast() {
  const [riskFilter, setRiskFilter] = useState(null);
  const [driverUnitFilter, setDriverUnitFilter] = useState(null); // { driverKey, units } | null
  const [activeStat, setActiveStat] = useState(null);
  const chartRef = useRef(null);
  const driversRef = useRef(null);
  const tableRef = useRef(null);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const clearAll = () => {
    setRiskFilter(null);
    setDriverUnitFilter(null);
    setActiveStat(null);
  };

  const handleStatClick = (key) => {
    switch (key) {
      case 'next30':
        setActiveStat(null);
        scrollTo(chartRef);
        break;
      case 'next90':
        setActiveStat(null);
        scrollTo(driversRef);
        break;
      case 'shortage':
        setRiskFilter('Critical');
        setDriverUnitFilter(null);
        setActiveStat('shortage');
        scrollTo(tableRef);
        break;
      case 'excess':
        setRiskFilter('Low');
        setDriverUnitFilter(null);
        setActiveStat('excess');
        scrollTo(tableRef);
        break;
      default:
        break;
    }
  };

  const handleDriverSelect = (driverKey, units) => {
    setActiveStat(null);
    if (!driverKey) {
      setDriverUnitFilter(null);
      return;
    }
    setDriverUnitFilter({ driverKey, units });
    setRiskFilter(null);
    scrollTo(tableRef);
  };

  return (
    <div className="p-8 space-y-4">
      <div>
        <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '24px', lineHeight: '36px', color: 'var(--w-text-primary)' }}>
          Demand Forecast
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px', lineHeight: '19.5px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>
          Anticipate workforce requirements before delivery demand materializes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {STATS.map((s) => (
          <StatCard key={s.key} {...s} minHeight="8.75rem" active={activeStat === s.key} onClick={() => handleStatClick(s.key)} />
        ))}
      </div>

      <div ref={chartRef} style={{ scrollMarginTop: '16px' }}>
        <SupplyVsForecastChart />
      </div>

      <div ref={driversRef} style={{ scrollMarginTop: '16px' }}>
        <DemandDriversRow
          activeDriver={driverUnitFilter?.driverKey ?? null}
          onSelect={(driverKey) => {
            if (!driverKey) return handleDriverSelect(null, null);
            const driver = DRIVERS.find((d) => d.key === driverKey);
            handleDriverSelect(driverKey, driver?.units ?? null);
          }}
        />
      </div>

      <DemandForecastByBusinessUnitTable
        ref={tableRef}
        unitFilter={driverUnitFilter?.units ?? null}
        riskFilter={riskFilter}
        onRiskFilterChange={(risk) => { setRiskFilter(risk); setActiveStat(null); }}
        onClearUnitFilter={() => setDriverUnitFilter(null)}
      />
    </div>
  );
}

export default DemandForecast;
