import React from 'react';
import clsx from 'clsx';

function KPICard({ title, value, subtitle, trend, icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    red: 'text-red-400',
    purple: 'text-violet-400',
  };

  return (
    <div className="rounded-lg border border-ink-600 bg-ink-800 p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={clsx('text-3xl font-bold mt-2', colorClasses[color])}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && <span className="text-4xl">{icon}</span>}
      </div>
      {trend && (
        <div className={clsx('mt-4 text-xs font-medium', trend > 0 ? 'text-emerald-400' : 'text-red-400')}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
  );
}

export default KPICard;
