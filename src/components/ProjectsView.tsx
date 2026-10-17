/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Calendar, Layers, Activity, Landmark } from 'lucide-react';
import { SchoolProject } from '../types';

interface ProjectsViewProps {
  projects: SchoolProject[];
}

export default function ProjectsView({ projects }: ProjectsViewProps) {
  return (
    <div className="font-sans text-gray-700">
      
      {/* Page Header */}
      <section className="bg-brand-oxblood text-white py-6 md:py-8 text-center border-b-4 border-brand-green relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-1">
          <span className="text-brand-yellow font-bold text-[10px] uppercase tracking-widest flex items-center justify-center space-x-1">
            <Layers className="w-3.5 h-3.5 mr-1" />
            <span>CAMPUS IMPROVEMENTS</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight uppercase">Ongoing School Projects &amp; Campus Facilities</h1>
          <p className="text-[11px] sm:text-xs text-gray-200 max-w-xl mx-auto font-light leading-relaxed">
            Track our progress as we continuously expand, modernize, and reinforce our structural and scientific facilities in Awka.
          </p>
        </div>
      </section>

      {/* Projects Grid Section */}
      <section className="py-10 bg-white border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-1">
            <h2 className="text-xl sm:text-2xl font-black font-heading text-brand-green uppercase tracking-tight">Active Infrastructure Tracker</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              We operate an open, accountable, and transparent development schedule. Each project represents a direct investment into the future safety and practical development of our students.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div 
                key={proj.id} 
                className="bg-slate-50 rounded-lg overflow-hidden shadow-xs border border-slate-200 flex flex-col md:flex-row hover:shadow-md hover:border-brand-green/35 transition duration-200"
              >
                
                {/* Project Image Panel */}
                <div className="md:w-5/12 h-44 md:h-auto overflow-hidden relative shrink-0">
                  <img
                    src={proj.imageUrl}
                    alt={`${proj.title} - Holy Ghost Academy Campus Infrastructure Project`}
                    width={400}
                    height={250}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none md:hidden" />
                  <span className="absolute top-3 left-3 text-[9px] font-bold text-white bg-brand-green px-2.5 py-1 rounded uppercase tracking-wider shadow-sm">
                    {proj.percentageCompletion === 100 ? 'Commissioned' : 'Construction'}
                  </span>
                </div>

                {/* Project Details Panel */}
                <div className="p-4 md:w-7/12 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900 font-heading uppercase tracking-tight leading-tight">
                      {proj.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                      {proj.description}
                    </p>
                  </div>

                  {/* Dates and budget list */}
                  <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-[10px] border-y border-slate-200 py-2.5 font-sans">
                    <div className="flex items-center space-x-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-brand-green shrink-0" />
                      <div>
                        <p className="text-[8px] text-slate-400 uppercase leading-none font-bold">Start Date</p>
                        <p className="font-bold text-slate-700 mt-0.5">{proj.startDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-brand-oxblood shrink-0" />
                      <div>
                        <p className="text-[8px] text-slate-400 uppercase leading-none font-bold">Expected End</p>
                        <p className="font-bold text-slate-700 mt-0.5">{proj.expectedCompletionDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-500 col-span-2">
                      <Landmark className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
                      <div>
                        <p className="text-[8px] text-slate-400 uppercase leading-none font-bold">Estimated Budget</p>
                        <p className="font-bold text-brand-green mt-0.5">{proj.budget}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Progress Indicator */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-brand-oxblood font-bold uppercase flex items-center">
                        <Activity className="w-3 h-3 mr-1 text-brand-green animate-pulse" />
                        Completion: {proj.percentageCompletion}%
                      </span>
                      <span className="text-slate-400 italic font-medium font-sans">
                        {proj.percentageCompletion === 100 ? 'Completed' : 'On Track'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300/30">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 bg-brand-green"
                        style={{ width: `${proj.percentageCompletion}%` }}
                      />
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
