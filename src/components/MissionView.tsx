/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Flame, Star, Target, Compass, Sparkles, Award } from 'lucide-react';

export default function MissionView() {
  const animatedCoreValues = [
    {
      title: 'Intellectual Rigor',
      desc: 'Developing critical analytical capacity, data appreciation, and a deeply-ingrained culture of curiosity and logical problem solving.',
      icon: Sparkles,
      color: 'bg-green-50 text-brand-green hover:bg-brand-green hover:text-white',
      border: 'border-brand-green/30'
    },
    {
      title: 'Moral Uprightness',
      desc: 'Setting the highest standards of behavioral accountability, zero-tolerance for exam fraud, and respect for societal laws.',
      icon: Target,
      color: 'bg-rose-50 text-brand-oxblood hover:bg-brand-oxblood hover:text-white',
      border: 'border-brand-oxblood/30'
    },
    {
      title: 'Spiritual Grounding',
      desc: 'Daily Christian praise & worship, scripture reflections, spiritual warfare prayers, and coaching sessions aligned with Pentecostal church tenets.',
      icon: Flame,
      color: 'bg-amber-50 text-brand-yellow hover:bg-brand-yellow hover:text-gray-900',
      border: 'border-brand-yellow/30'
    },
    {
      title: 'Social Excellence',
      desc: 'Developing outstanding team coordination, emotional intelligence, leadership charisma, and generous civic responsibility.',
      icon: Star,
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-700 hover:text-white',
      border: 'border-blue-300'
    }
  ];

  return (
    <div className="font-sans text-gray-700">
      
      {/* Page Header */}
      <section className="bg-brand-green text-white py-6 md:py-8 text-center border-b-4 border-brand-oxblood relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-1">
          <span className="text-brand-yellow font-bold text-[10px] tracking-widest flex items-center justify-center space-x-1 uppercase">
            <Compass className="w-3.5 h-3.5 mr-1" />
            <span>OUR NORTH STAR</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight uppercase">Mission, Vision &amp; Core Values</h1>
          <p className="text-[11px] sm:text-xs text-gray-100 max-w-xl mx-auto font-light leading-relaxed">
            The values, visions, and missions that define our daily syllabus, character rubrics, and structural investments.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-10 bg-white border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            
            {/* Vision Card */}
            <div className="bg-slate-50 rounded-xl p-5 md:p-6 border border-slate-200 flex flex-col justify-between shadow-xs relative overflow-hidden group hover:shadow transition duration-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-green/5 rounded-bl-full pointer-events-none" />
              <div className="space-y-4">
                <div className="w-10 h-10 bg-brand-green/10 text-brand-green rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-brand-green" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-black font-heading text-brand-green uppercase tracking-tight">Our Vision</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    To become a leading world-class secondary educational institution recognized across Africa for spectacular academic excellence, digital-scientific innovation, and unshakeable character formation.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-200 text-[10px] text-slate-400 font-bold tracking-wider uppercase font-sans">
                ★ Holy Ghost Academy Awka
              </div>
            </div>

            {/* Mission Card */}
            <div className="bg-slate-50 rounded-xl p-5 md:p-6 border border-slate-200 flex flex-col justify-between shadow-xs relative overflow-hidden group hover:shadow transition duration-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-oxblood/5 rounded-bl-full pointer-events-none" />
              <div className="space-y-4">
                <div className="w-10 h-10 bg-brand-oxblood/10 text-brand-oxblood rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-brand-oxblood" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-black font-heading text-brand-oxblood uppercase tracking-tight">Our Mission</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    To provide premium quality secondary education that masterfully develops intellectual curiosity, moral uprightness, spiritual faith, and social excellence, preparing students to lead in global communities.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-200 text-[10px] text-slate-400 font-bold tracking-wider uppercase font-sans">
                ★ Holy Ghost Academy Awka
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Prominently Displayed School Motto */}
      <section className="py-10 bg-brand-oxblood text-white border-b-4 border-brand-green text-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(#2E7D32_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-green text-brand-yellow mb-1 shadow border border-brand-yellow/30">
            <Award className="w-5 h-5 text-brand-yellow" />
          </div>
          <p className="text-brand-yellow font-bold text-[10px] tracking-widest uppercase">OUR FOUNDATIONAL MOTTO</p>
          <h3 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight uppercase leading-none">
            Character, Faith & Excellence
          </h3>
          <p className="text-[11px] text-gray-300 max-w-xl mx-auto font-light leading-relaxed">
            This is the baseline commitment that binds all teachers, parents, administrators, and students in our daily pursuit of greatness.
          </p>
        </div>
      </section>

      {/* Animated Core Values Card Grid */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-1.5">
            <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest block">HOW WE GROW</span>
            <h3 className="text-xl sm:text-2xl font-black font-heading text-gray-900 uppercase tracking-tight">Our Development Quadrant</h3>
            <p className="text-xs text-gray-500 font-sans leading-relaxed">
              We focus on building a well-rounded graduate through structured physical, mental, and spiritual developmental benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {animatedCoreValues.map((val, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-lg border ${val.border} flex flex-col justify-between h-56 shadow-xs transition-all duration-200 hover:shadow-md cursor-default ${val.color}`}
              >
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white shadow-xs">
                    <val.icon className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm font-heading uppercase tracking-tight">
                    {val.title}
                  </h4>
                  <p className="text-[11px] leading-relaxed opacity-90 font-light font-sans">
                    {val.desc}
                  </p>
                </div>
                <div className="text-[9px] font-bold tracking-widest uppercase text-right opacity-60">
                  Quadrant {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
