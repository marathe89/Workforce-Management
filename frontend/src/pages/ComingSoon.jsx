import React from 'react';
import { useLocation } from 'react-router-dom';
import navigation from '../config/navigation';

function ComingSoon() {
  const location = useLocation();
  const current = navigation.find((item) => item.path === location.pathname);
  const Icon = current?.icon;

  return (
    <div className="p-8 h-full flex items-center justify-center">
      <div className="text-center max-w-md">
        {Icon && (
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-ink-800 border border-ink-600 flex items-center justify-center">
            <Icon className="w-7 h-7 text-brand-400" />
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-100">{current?.label || 'Coming Soon'}</h1>
        <p className="text-gray-500 mt-2">
          This section is being built out to match the latest design. Check back soon.
        </p>
      </div>
    </div>
  );
}

export default ComingSoon;
