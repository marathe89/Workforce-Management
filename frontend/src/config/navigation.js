import {
  ChartBarSquareIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  AdjustmentsHorizontalIcon,
  PresentationChartLineIcon,
  AcademicCapIcon,
  RectangleGroupIcon,
  MapIcon,
  SparklesIcon,
  DocumentChartBarIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

// Single source of truth for the sidebar nav and the header breadcrumb.
// `built: true` routes to a real page; everything else renders <ComingSoon>
// until that section is built out (see the Coforge Workforce Intelligence
// Figma file this app is being brought in line with).
const navigation = [
  { path: '/', label: 'Overview', icon: ChartBarSquareIcon, built: true },
  { path: '/workforce', label: 'Workforce', icon: Squares2X2Icon, built: true },
  { path: '/talent-finder', label: 'Talent Finder', icon: MagnifyingGlassIcon, built: true },
  { path: '/projects', label: 'Projects', icon: ClipboardDocumentListIcon, built: true },
  { path: '/capacity-utilization', label: 'Capacity & Utilization', icon: AdjustmentsHorizontalIcon, built: true },
  { path: '/demand-forecast', label: 'Demand Forecast', icon: PresentationChartLineIcon, built: true },
  { path: '/skills-intelligence', label: 'Skills Intelligence', icon: AcademicCapIcon, built: true },
  { path: '/bench-management', label: 'Bench Management', icon: RectangleGroupIcon, built: true },
  { path: '/workforce-planning', label: 'Workforce Planning', icon: MapIcon, built: true },
  { path: '/ai-advisor', label: 'AI Workforce Advisor', icon: SparklesIcon, built: true, badge: 'AI' },
  { path: '/reports', label: 'Reports', icon: DocumentChartBarIcon, built: true },
  { path: '/data-entry', label: 'Workforce Management', icon: PlusCircleIcon, built: true },
  { path: '/administration', label: 'Administration', icon: ShieldCheckIcon, built: true },
];

export default navigation;
