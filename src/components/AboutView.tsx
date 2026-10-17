/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Heart, Users, Award, BookOpen, Flame, Compass, Mail, Phone, GraduationCap, Briefcase } from 'lucide-react';
import { StaffMember, StaffCategory, DEFAULT_ABOUT_US_IMAGE, DEFAULT_ABOUT_US_BADGE } from '../types';
import { INITIAL_STAFF } from '../defaultData';

interface AboutViewProps {
  staff?: StaffMember[];
  aboutImage?: string;
  aboutBadge?: string;
}

export default function AboutView({ 
  staff = INITIAL_STAFF,
  aboutImage = DEFAULT_ABOUT_US_IMAGE,
  aboutBadge = DEFAULT_ABOUT_US_BADGE
}: AboutViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | StaffCategory>('All');

  const coreValues = [
    {
      title: 'Excellence',
      desc: 'We strive for exceptional performance in academics, science exploration, and cultural endeavors, setting records of stellar accomplishments.',
      icon: Award,
      bg: 'bg-green-50 text-brand-green border border-green-100'
    },
    {
      title: 'Integrity',
      desc: 'Absolute adherence to truth, moral ethics, and spiritual alignment under our Pentecostal church faith parameters.',
      icon: ShieldCheck,
      bg: 'bg-rose-50 text-brand-oxblood border border-rose-100'
    },
    {
      title: 'Discipline',
      desc: 'Forming positive habits of self-regulation, time management, respect for authority, and social cooperation.',
      icon: Flame,
      bg: 'bg-amber-50 text-brand-yellow border border-amber-100'
    },
    {
      title: 'Service',
      desc: 'Giving back to the local Awka community, supporting parish drives, and developing generous, empathetic hearts.',
      icon: Heart,
      bg: 'bg-blue-50 text-blue-700 border border-blue-100'
    },
    {
      title: 'Leadership',
      desc: 'Instilling accountability, vision, and collaborative drive to lead peers with courage and emotional intelligence.',
      icon: Users,
      bg: 'bg-indigo-50 text-indigo-700 border border-indigo-100'
    }
  ];

  const activeStaffList = staff.length > 0 ? staff : INITIAL_STAFF;
  const filteredStaff = selectedCategory === 'All'
    ? activeStaffList
    : activeStaffList.filter(s => s.category === selectedCategory);

  const boardCount = activeStaffList.filter(s => s.category === 'Administrative Board').length;
  const academicCount = activeStaffList.filter(s => s.category === 'Academic Staff').length;
  const nonAcademicCount = activeStaffList.filter(s => s.category === 'Non-Academic Staff').length;

  return (
    <div className="font-sans text-gray-700">
      
      {/* Page Header */}
      <section className="bg-brand-oxblood text-white py-6 md:py-8 text-center border-b-4 border-brand-green relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-1">
          <span className="text-brand-yellow font-bold text-[10px] uppercase tracking-widest flex items-center justify-center space-x-1">
            <Compass className="w-3.5 h-3.5 animate-spin-slow mr-1" />
            <span>WHO WE ARE</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight uppercase">About Holy Ghost Academy, Awka</h1>
          <p className="text-[11px] sm:text-xs text-gray-200 max-w-xl mx-auto font-light leading-relaxed">
            Discover our history, educational philosophy, core values, and meet our administrative stewards.
          </p>
        </div>
      </section>

      {/* History & Philosophy */}
      <section className="py-10 bg-white border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* History Text */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest block">OUR ESTABLISHMENT</span>
                <h2 className="text-xl sm:text-2xl font-black font-heading text-gray-900 uppercase tracking-tight leading-tight">
                  A Heritage of Holy Ghost Faith & Academic Power
                </h2>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
                <p>
                  Founded under the auspices of the Pentecostal Church of Awka, <strong>Holy Ghost Academy Secondary School (HGASS)</strong> was established to bridge the critical gap between ultra-modern scientific literacy and sound ethical character formation. The school is located inside the prestigious and secure Kamali Homes, Ngozika Housing Estate in Awka, providing an safe, quiet, and beautiful learning ecosystem away from municipal noise.
                </p>
                <p>
                  From inception, the Academy has committed to a zero-tolerance policy against exam malpractice, behavioral indiscipline, and lazy educational shortcuts. Through rigorous recruitment, we selected standard-setting subject masters who combine textbook teachings with digital lab experiments, guiding our students to record-setting 100% pass rates in WAEC, NECO, and JAMB.
                </p>
                <p>
                  Over the decade, we have expanded our structures to include a comprehensive digital library center, standard security CCTV feeds, state-of-the-art biological and physical diagnostic science laboratories, and high-quality sporting tracks, growing to become an internationally-recognized elite secondary institution.
                </p>
              </div>

              {/* Educational Philosophy */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-xs sm:text-sm text-brand-oxblood font-heading uppercase tracking-tight flex items-center">
                  <BookOpen className="w-4.5 h-4.5 text-brand-oxblood mr-1.5 shrink-0" /> Our Educational Philosophy
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed font-sans">
                  "We believe that a complete secondary education is a triangle involving intellectual curiosity, practical hand-skill execution, and deep spiritual discipline. To teach a student to think without teaching them to pray and serve is to build a ship with a powerful engine but no compass."
                </p>
              </div>
            </div>

            {/* Side Image */}
            <div className="lg:col-span-5">
              <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200 p-1.5 bg-white">
                <img
                  src={aboutImage || DEFAULT_ABOUT_US_IMAGE}
                  alt="Holy Ghost Academy Secondary School Campus Building, Ngozika Housing Estate Awka"
                  width={600}
                  height={300}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-[300px] object-cover rounded-lg"
                />
                {aboutBadge && (
                  <div className="absolute top-4 left-4 bg-brand-green text-brand-yellow text-[10px] font-bold font-heading px-2.5 py-1 rounded uppercase tracking-wider shadow-md">
                    {aboutBadge}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-10 bg-slate-50 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-1.5">
            <span className="text-[10px] font-bold text-brand-oxblood uppercase tracking-widest block">GUIDING LIGHT</span>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-gray-900 uppercase tracking-tight">Our Core Values</h2>
            <p className="text-xs text-gray-500 font-sans leading-relaxed">
              These five foundational pilings support every school policy, exam schedule, dormitory routine, and classroom interaction at HGASS.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {coreValues.map((val, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg shadow-xs border border-slate-200 flex flex-col justify-between text-center hover:shadow-md transition duration-200">
                <div className="space-y-3">
                  <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center ${val.bg}`}>
                    <val.icon className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 font-heading uppercase tracking-tight">
                    {val.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    {val.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Administrative Board & Staff Registry Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest block">ACADEMY STEWARDS & FACULTY</span>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-gray-900 uppercase tracking-tight">Administrative Board & Staff</h2>
            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              Meet our visionary leaders, certified subject teachers, and administrative stewards dedicated to academic excellence, discipline, and moral development.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {[
              { id: 'All', label: 'All Stewards & Staff', count: activeStaffList.length },
              { id: 'Administrative Board', label: 'Administrative Board', count: boardCount },
              { id: 'Academic Staff', label: 'Academic & Teaching Staff', count: academicCount },
              { id: 'Non-Academic Staff', label: 'Non-Academic & Support Staff', count: nonAcademicCount }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition duration-150 cursor-pointer flex items-center space-x-1.5 ${
                  selectedCategory === tab.id
                    ? 'bg-brand-green text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  selectedCategory === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Staff Grid */}
          {filteredStaff.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 p-6 max-w-md mx-auto">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700 uppercase font-heading">No staff found</h4>
              <p className="text-xs text-slate-500 mt-1">There are no members listed under this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredStaff.map((member) => {
                const isBoard = member.category === 'Administrative Board';
                const isAcademic = member.category === 'Academic Staff';
                
                return (
                  <div 
                    key={member.id} 
                    className="bg-slate-50 rounded-lg overflow-hidden shadow-xs border border-slate-200 hover:shadow-md transition duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-48 overflow-hidden relative bg-slate-200">
                        <img
                          src={member.image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className={`absolute top-2.5 left-2.5 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-xs ${
                          isBoard 
                            ? 'bg-brand-oxblood text-brand-yellow border border-brand-yellow/30' 
                            : isAcademic 
                              ? 'bg-brand-green text-white' 
                              : 'bg-slate-800 text-slate-100'
                        }`}>
                          {member.category}
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-gray-900 font-heading leading-tight uppercase">
                            {member.name}
                          </h4>
                          <p className="text-[10px] text-brand-green font-bold uppercase mt-0.5">
                            {member.role}
                          </p>
                        </div>
                        {member.qualifications && (
                          <p className="text-[9px] text-slate-500 italic font-mono leading-tight">
                            {member.qualifications}
                          </p>
                        )}
                        <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-200/60 font-normal font-sans">
                          {member.desc}
                        </p>
                      </div>
                    </div>

                    {(member.email || member.phone) && (
                      <div className="p-3 bg-white border-t border-slate-200/60 flex flex-col space-y-1 text-[10px] text-slate-500">
                        {member.email && (
                          <div className="flex items-center space-x-1.5 truncate">
                            <Mail className="w-3 h-3 text-brand-green shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center space-x-1.5">
                            <Phone className="w-3 h-3 text-brand-oxblood shrink-0" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
