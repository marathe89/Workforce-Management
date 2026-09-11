import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TalentSearchBar from '../components/TalentSearchBar';
import TalentFilterRow from '../components/TalentFilterRow';
import TalentResultsTable from '../components/TalentResultsTable';

// Matches the Coforge Workforce Intelligence Figma "TalentFinder" screen
// exactly (nodes 6:10057 title, 6:10066 search, 6:10097 filters, 6:10146
// results table). Replaces the page's earlier, simpler version — a real
// backend-driven employee list with a click-to-expand detail panel — since
// this design's content (skills tags, allocation/available split, AI
// match-score) has no equivalent backend model to stay wired to. Static
// mockup data throughout, like the rest of this app's Figma-matched pages.
//
// The shared FilterBar (Practice/Geography/Allocation/Grade, same
// component as Overview's) was tried here on an earlier request, then
// removed on request — this page's own Figma-specific TalentFilterRow
// (Skills/Experience/Grades/Geographies/Date) is the only filter row now.
//
// Search reads its initial term from the `?q=` URL param (set by the
// header's global search when it links here) and stays live-editable
// from the search bar itself afterward — see data/talentData.js for the
// "vibe search" scoring/parsing behind it.
function TalentFinder() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  return (
    <div className="p-8 space-y-4">
      <div>
        <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '24px', lineHeight: '36px', color: 'var(--w-text-primary)' }}>
          Talent Finder
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px', lineHeight: '19.5px', color: 'var(--w-text-label)', marginTop: '4px' }}>
          Find the right talent based on skills, availability and delivery context.
        </p>
      </div>

      <TalentSearchBar value={query} onChange={setQuery} />
      <TalentFilterRow />
      <TalentResultsTable query={query} />
    </div>
  );
}

export default TalentFinder;
