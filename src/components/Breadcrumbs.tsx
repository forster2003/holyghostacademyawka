/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  items: { label: string; page?: string; active?: boolean }[];
  onNavigate: (page: string) => void;
}

export default function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 text-xs text-slate-500 font-sans no-print">
      <ol className="flex items-center flex-wrap gap-1.5">
        <li className="inline-flex items-center">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-brand-green transition"
            title="Return to Holy Ghost Academy Homepage"
          >
            <Home className="w-3.5 h-3.5 text-brand-green" />
            <span>Home</span>
          </a>
        </li>

        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <li aria-hidden="true" className="text-slate-400">
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li>
              {item.active || !item.page ? (
                <span className="font-bold text-brand-oxblood uppercase tracking-wide text-[11px]" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <a
                  href={`/?page=${item.page}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.page) onNavigate(item.page);
                  }}
                  className="font-medium text-slate-600 hover:text-brand-green transition"
                >
                  {item.label}
                </a>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
