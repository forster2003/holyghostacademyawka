/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BookOpen, Award, CheckCircle, Sparkles, GraduationCap } from 'lucide-react';
import { SchoolSubject } from '../types';

interface SubjectsViewProps {
  subjects?: SchoolSubject[];
}

export default function SubjectsView({ subjects }: SubjectsViewProps) {
  const [activeTab, setActiveTab] = useState<'jss' | 'sss'>('jss');

  const defaultJssSubjects = [
    { name: 'Mathematics', desc: 'Foundational algebra, geometry, statistics, and numeric theory to stimulate analytical precision.' },
    { name: 'English Language', desc: 'Grammar mechanics, comprehension, creative writing, essay layout, and verbal vocabulary.' },
    { name: 'CRS (Christian Religious Studies)', desc: 'Spiritual ethics, Biblical history, moral accountability, and communal faith development.' },
    { name: 'Civic Education', desc: 'Understanding Nigerian constitutional rights, democratic procedures, and civic duties.' },
    { name: 'Agricultural Science', desc: 'Basic crop science, livestock management, soil protection, and farming economics.' },
    { name: 'PHE (Physical & Health Ed)', desc: 'Human anatomy basics, physical fitness, hygiene protocols, and individual/team athletics.' },
    { name: 'CCA (Cultural & Creative Arts)', desc: 'Visual arts, traditional design, local folklore drama, music composition, and Igbo cultural art.' },
    { name: 'Basic Technology', desc: 'Introduction to simple electrical engineering, woodworking tools, technical drafting, and mechanics.' },
    { name: 'Basic Science', desc: 'Comprehensive introduction to physical, chemical, and biological forces and scientific methods.' },
    { name: 'Business Studies', desc: 'Foundations of book-keeping, office systems, typing parameters, retail economics, and savings.' },
    { name: 'Computer Science', desc: 'Introductory hardware architecture, typing systems, internet searches, and basic logic loops.' }
  ];

  const defaultSssSubjects = [
    { name: 'Mathematics', desc: 'Advanced trigonometry, calculus elements, logarithmic graphs, matrices, and probability indices.' },
    { name: 'Physics', desc: 'Mechanics, wave properties, electrostatics, optic projections, and diagnostic laboratory experiments.' },
    { name: 'Chemistry', desc: 'Atomic structures, gas behaviors, chemical bonding, volumetric analysis, and qualitative lab diagnostics.' },
    { name: 'Biology', desc: 'Plant and animal cell anatomy, genetic structures, ecosystem functions, and practical specimen dissection.' },
    { name: 'Agricultural Science', desc: 'Advanced agrarian mechanisms, soil diagnostics, poultry structures, and farm administration.' },
    { name: 'Computer Science', desc: 'Introductory web code, structural database queries, Python scripting elements, and network security.' },
    { name: 'Literature in English', desc: 'Rigorous inspection of classic African and international drama, poetry compositions, and novels.' },
    { name: 'Government', desc: 'Comparative international politics, pre-colonial West African systems, and Nigerian political history.' },
    { name: 'CRS (Christian Religious Studies)', desc: 'Ethical leadership, prophetic history, epistles inspection, and applying Biblical values to careers.' },
    { name: 'History', desc: 'Deep dive into Nigerian origins, ethnic kingdoms, colonial transitions, and post-independence history.' },
    { name: 'Civic Education', desc: 'Advanced human rights protocols, national values, civic duties, and combating societal ills.' },
    { name: 'Economics', desc: 'Micro and macroeconomics, price systems, labor markets, development indices, and fiscal policies.' },
    { name: 'Commerce', desc: 'Trade practices, banking structures, modern advertising modules, transport methods, and insurance principles.' }
  ];

  // Derive dynamic list if subjects exist in store
  const jssSubjects = (subjects && subjects.length > 0)
    ? subjects
        .filter((s) => s.level === 'Junior Secondary (JSS)' || s.level === 'All Levels' || (s as any).category === 'Junior Secondary (JSS)' || (s as any).category === 'General')
        .map((s) => ({ 
          name: s.name, 
          desc: s.desc || (s as any).description || `${s.name} curriculum adhering to National Educational Research and Development Council (NERDC) syllabus.` 
        }))
    : defaultJssSubjects;

  const sssSubjects = (subjects && subjects.length > 0)
    ? subjects
        .filter((s) => s.level === 'Senior Secondary (SSS)' || s.level === 'All Levels' || (s as any).category === 'Senior Secondary (SSS)' || (s as any).category === 'General')
        .map((s) => ({ 
          name: s.name, 
          desc: s.desc || (s as any).description || `${s.name} WAEC, NECO, and JAMB certified syllabus and practicals.` 
        }))
    : defaultSssSubjects;

  return (
    <div className="font-sans text-gray-700">
      
      {/* Page Header */}
      <section className="bg-brand-oxblood text-white py-6 md:py-8 text-center border-b-4 border-brand-green relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-1">
          <span className="text-brand-yellow font-bold text-[10px] uppercase tracking-widest flex items-center justify-center space-x-1">
            <GraduationCap className="w-3.5 h-3.5 mr-1" />
            <span>ACADEMIC CURRICULUM</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight uppercase">Academic Curriculum &amp; Subjects Offered</h1>
          <p className="text-[11px] sm:text-xs text-gray-200 max-w-xl mx-auto font-light leading-relaxed">
            Approved by the Nigerian Educational Research and Development Council (NERDC) and tailored for global WAEC success.
          </p>
        </div>
      </section>

      {/* Syllabus View Section */}
      <section className="py-10 bg-white border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Description */}
          <div className="text-center max-w-xl mx-auto mb-6 space-y-1">
            <h2 className="text-xl sm:text-2xl font-black font-heading text-brand-green uppercase tracking-tight">Structured For Continuous Growth</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Choose between our Junior Secondary core syllabus or Senior Secondary specialist academic pathways spanning Science, Arts, and Commerce.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 inline-flex space-x-1">
              <button
                onClick={() => setActiveTab('jss')}
                className={`px-4 py-2 rounded-md text-xs font-bold font-heading uppercase tracking-wider transition cursor-pointer ${
                  activeTab === 'jss'
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'text-slate-500 hover:text-brand-green'
                }`}
              >
                Junior Secondary (JSS 1 - JSS 3)
              </button>
              <button
                onClick={() => setActiveTab('sss')}
                className={`px-4 py-2 rounded-md text-xs font-bold font-heading uppercase tracking-wider transition cursor-pointer ${
                  activeTab === 'sss'
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'text-slate-500 hover:text-brand-green'
                }`}
              >
                Senior Secondary (SS 1 - SS 3)
              </button>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(activeTab === 'jss' ? jssSubjects : sssSubjects).map((subj, index) => (
              <div 
                key={index} 
                className="bg-slate-50 rounded-lg p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-brand-green/35 transition duration-200"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 rounded bg-white shadow-xs text-brand-green border border-slate-200">
                      <BookOpen className="w-4 h-4 text-brand-green" />
                    </span>
                    <span className="text-[8px] font-bold tracking-widest text-brand-oxblood uppercase bg-brand-oxblood/5 px-2 py-0.5 rounded border border-brand-oxblood/10">
                      {activeTab === 'jss' ? 'Junior Secondary' : 'Senior Specialist'}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900 font-heading uppercase tracking-tight">
                    {subj.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    {subj.desc}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center text-[10px] text-brand-green font-bold uppercase tracking-wider">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span>WAEC/NECO Standard</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Special Features Summary banner */}
      <section className="py-8 bg-brand-oxblood text-white border-b-4 border-brand-green font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-2.5">
            <div className="p-2.5 bg-white/10 rounded text-brand-yellow shrink-0">
              <Award className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-bold font-heading text-xs sm:text-sm text-brand-yellow uppercase">WAEC Prep Camps</h4>
              <p className="text-[11px] text-gray-300 leading-relaxed mt-0.5">Intensive weekend and holiday practical bootcamps focusing on past exam questions and diagnostic marking criteria.</p>
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <div className="p-2.5 bg-white/10 rounded text-brand-yellow shrink-0">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-bold font-heading text-xs sm:text-sm text-brand-yellow uppercase">Interactive Practical Focus</h4>
              <p className="text-[11px] text-gray-300 leading-relaxed mt-0.5">Science and technology courses dedicate over 60% of class hours to laboratory execution and project engineering.</p>
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <div className="p-2.5 bg-white/10 rounded text-brand-yellow shrink-0">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-bold font-heading text-xs sm:text-sm text-brand-yellow uppercase">Experienced Subject Masters</h4>
              <p className="text-[11px] text-gray-300 leading-relaxed mt-0.5">All senior courses are steered by certified teachers who possess deep experience as state WAEC/NECO examiners.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
