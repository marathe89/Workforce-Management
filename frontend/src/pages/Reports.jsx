import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReportCard from '../components/ReportCard';
import ReportViewModal from '../components/ReportViewModal';
import ReportExportModal from '../components/ReportExportModal';
import ReportScheduleModal from '../components/ReportScheduleModal';
import ReportShareModal from '../components/ReportShareModal';
import NewReportModal from '../components/NewReportModal';
import useReportsStore from '../stores/reportsStore';

// Matches the Coforge Workforce Intelligence Figma "Reports" screen (node
// 8:13059, Reports nav item). Report content is still Figma mockup data
// — no report-generation backend exists — but View/Export/Schedule/Share
// are now real interactive workflows (see the four modal components),
// backed by stores/reportsStore.js so the top stat cards reflect actual
// state instead of four independently hardcoded numbers. The "+ New
// Report" button is this page's only creation entry point — treated as
// the "New Workflow" button from the request, since starting a new
// report IS the workflow it opens.
function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const q = query.trim().toLowerCase();

  const reports = useReportsStore((s) => s.reports);
  const runReport = useReportsStore((s) => s.runReport);
  const setSchedule = useReportsStore((s) => s.setSchedule);
  const clearSchedule = useReportsStore((s) => s.clearSchedule);
  const setShare = useReportsStore((s) => s.setShare);
  const clearShare = useReportsStore((s) => s.clearShare);
  const addReport = useReportsStore((s) => s.addReport);

  const [viewId, setViewId] = useState(null);
  const [exportId, setExportId] = useState(null);
  const [scheduleId, setScheduleId] = useState(null);
  const [shareId, setShareId] = useState(null);
  const [creating, setCreating] = useState(false);

  const filtered = q ? reports.filter((r) => `${r.title} ${r.category}`.toLowerCase().includes(q)) : reports;
  const clearQuery = () => setSearchParams({});

  const stats = [
    { label: 'Total Reports', value: reports.length },
    { label: 'Scheduled', value: reports.filter((r) => r.scheduled).length },
    { label: 'Last Generated', value: reports.some((r) => r.lastRun === 'Today') ? 'Today' : (reports[0]?.lastRun || '—') },
    { label: 'Shared Reports', value: reports.filter((r) => r.shared).length },
  ];

  const findReport = (id) => reports.find((r) => r.id === id);
  const viewReport = findReport(viewId);
  const exportReport = findReport(exportId);
  const scheduleReport = findReport(scheduleId);
  const shareReport = findReport(shareId);

  return (
    <div className="p-8 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '24px', lineHeight: '36px', color: 'var(--w-text-primary)' }}>
            Reports
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px', lineHeight: '19.5px', color: 'var(--w-text-label)', marginTop: '4px' }}>
            {q ? (
              <>
                Showing results for "{query}".{' '}
                <button onClick={clearQuery} style={{ color: 'var(--w-accent-blue)', fontWeight: 600 }}>
                  Clear filter ×
                </button>
              </>
            ) : (
              'Workforce analytics reports — view, export, schedule, and share.'
            )}
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          style={{
            background: 'var(--w-accent-blue)',
            borderRadius: '8px',
            padding: '9px 20px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
          }}
        >
          + New Report
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '18px 20px' }}>
            <p style={{ fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '11px', letterSpacing: '0.66px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>{s.label}</p>
            <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '28px', color: 'var(--w-text-primary)', marginTop: '8px' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {filtered.length === 0 ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'var(--w-text-label)', gridColumn: '1 / -1', textAlign: 'center', padding: '32px 0' }}>
            No matching report for "{query}".
          </p>
        ) : (
          filtered.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              onView={() => setViewId(r.id)}
              onExport={() => setExportId(r.id)}
              onSchedule={() => setScheduleId(r.id)}
              onShare={() => setShareId(r.id)}
            />
          ))
        )}
      </div>

      {viewReport && (
        <ReportViewModal
          report={viewReport}
          onClose={() => setViewId(null)}
          onRun={() => runReport(viewReport.id)}
          onOpenExport={() => { setViewId(null); setExportId(viewReport.id); }}
          onOpenSchedule={() => { setViewId(null); setScheduleId(viewReport.id); }}
          onOpenShare={() => { setViewId(null); setShareId(viewReport.id); }}
        />
      )}
      {exportReport && <ReportExportModal report={exportReport} onClose={() => setExportId(null)} />}
      {scheduleReport && (
        <ReportScheduleModal
          report={scheduleReport}
          onClose={() => setScheduleId(null)}
          onSave={(schedule) => setSchedule(scheduleReport.id, schedule)}
          onClear={() => clearSchedule(scheduleReport.id)}
        />
      )}
      {shareReport && (
        <ReportShareModal
          report={shareReport}
          onClose={() => setShareId(null)}
          onSave={(share) => setShare(shareReport.id, share)}
          onClear={() => clearShare(shareReport.id)}
        />
      )}
      {creating && <NewReportModal onClose={() => setCreating(false)} onCreate={addReport} />}
    </div>
  );
}

export default Reports;
