/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  ArrowRight, Award, BookOpen, Calendar, 
  ChevronLeft, ChevronRight, GraduationCap, 
  Heart, ShieldAlert, Sparkles, Trophy, Users,
  CreditCard, Landmark, Copy, Check, ShieldCheck, FileText
} from 'lucide-react';
import { NewsItem, SchoolProject, SchoolMilestoneStats, HeroSlide } from '../types';
import { DEFAULT_HERO_SLIDES } from '../defaultData';

interface HomeViewProps {
  news: NewsItem[];
  projects: SchoolProject[];
  setCurrentPage: (page: string) => void;
  milestoneStats?: SchoolMilestoneStats;
  heroSlides?: HeroSlide[];
}

export default function HomeView({ news, projects, setCurrentPage, milestoneStats, heroSlides }: HomeViewProps) {
  const [copiedAcc, setCopiedAcc] = useState(false);

  const handleCopyAcc = () => {
    navigator.clipboard.writeText('1027146728');
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };
  
  // Dynamic Hero Image Slider State
  const slides = (heroSlides && heroSlides.length > 0) ? heroSlides : DEFAULT_HERO_SLIDES;
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-play slider
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const currentSlideIndex = activeSlide >= slides.length ? 0 : activeSlide;

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  // Truncate function for news description
  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  // Active News Modal State
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // Stats Counters (Simple & dynamic display)
  const statsList = [
    { label: 'Enrolled Students', value: milestoneStats?.enrolledStudents || '450+', icon: Users, color: 'text-brand-green bg-brand-green/10' },
    { label: 'Professional Educators', value: milestoneStats?.professionalEducators || '38', icon: GraduationCap, color: 'text-brand-oxblood bg-brand-oxblood/10' },
    { label: 'Exemplary Graduates', value: milestoneStats?.exemplaryGraduates || '1,200+', icon: Trophy, color: 'text-brand-yellow bg-brand-yellow/10' },
    { label: 'State & National Awards', value: milestoneStats?.stateAndNationalAwards || '15', icon: Award, color: 'text-brand-green bg-brand-green/10' }
  ];

  const coreStrengths = [
    {
      title: 'Academic Excellence',
      desc: 'Rigorous intellectual programs crafted to stimulate analytical skills and prepare students for WAEC, NECO, and international examinations with excellent ratings.',
      icon: BookOpen,
      color: 'border-l-4 border-brand-green'
    },
    {
      title: 'Moral Discipline & Integrity',
      desc: 'We place character at the heart of learning. Respect, self-regulation, and high standards of accountability form the core of daily academy activities.',
      icon: ShieldAlert,
      color: 'border-l-4 border-brand-oxblood'
    },
    {
      title: 'Modern Classrooms & Labs',
      desc: 'Upgraded learning facilities including dynamic science spaces, computer centers, and high-speed internet designed for modern visual instruction.',
      icon: Sparkles,
      color: 'border-l-4 border-brand-yellow'
    },
    {
      title: 'Faith-Based Development',
      desc: 'Nurturing spiritual pathways alongside intellect. Guided Christian liturgies, mentorship, and communal charity form responsible citizens.',
      icon: Heart,
      color: 'border-l-4 border-brand-green'
    }
  ];

  const testimonials = [
    {
      quote: "My two children entered Holy Ghost Academy with curious minds and are graduating as confident, scientifically-driven youngsters. The academic discipline and focus on faith-based morals is unparalleled in Awka.",
      author: "Chief Engr. Emeka Azikiwe, KSM",
      role: "Parent of JSS 3 and SS 2 Students"
    },
    {
      quote: "Holy Ghost Academy set the foundation for my aerospace engineering scholarship. The rigorous practical lab sessions in chemistry and physics built my analytical resilience.",
      author: "Dr. Ogochukwu Nnaji",
      role: "Class of 2018 Alumni, UK Researcher"
    },
    {
      quote: "Our teachers don’t just teach textbooks—they teach life. Having access to high-speed digital library research systems has helped me lead my science championship project.",
      author: "Chinedu Okafor",
      role: "Current Senior Prefect & Science Captain"
    }
  ];

  return (
    <div className="font-sans text-gray-700 bg-gray-50/50">
      
      {/* 1. HERO SLIDER SECTION */}
      <section className="relative h-[380px] md:h-[440px] bg-slate-900 overflow-hidden border-b border-slate-200">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Dark tint overlay */}
            <div className="absolute inset-0 bg-black/65 mix-blend-multiply z-10" />
            
            {/* Background image */}
            <img
              src={slide.imageUrl}
              alt={`${slide.title} - Holy Ghost Academy Secondary School, Awka`}
              width={1200}
              height={440}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transform scale-102 transition-transform duration-10000"
            />
            
            {/* Slide Content */}
            <div className="absolute inset-0 flex items-center z-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl space-y-3.5">
                  {slide.badge && (
                    <span className="inline-block text-[10px] font-bold tracking-widest text-brand-yellow bg-brand-oxblood px-2.5 py-1 rounded-sm uppercase border border-brand-yellow/20 shadow-xs">
                      ★ {slide.badge}
                    </span>
                  )}
                  {index === currentSlideIndex ? (
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading text-white tracking-tight leading-none uppercase">
                      {slide.title}
                    </h1>
                  ) : (
                    <span className="text-2xl sm:text-3xl md:text-4xl font-black font-heading text-white tracking-tight leading-none uppercase block">
                      {slide.title}
                    </span>
                  )}
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl font-normal">
                    {slide.subtitle}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 pt-2">
                    <a
                      href="https://wa.me/2349054145339?text=Hello%20Holy%20Ghost%20Academy%2C%20I%20would%20like%20to%20inquire%20about%20student%20enrollment%20and%20admissions."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-brand-green hover:bg-brand-green-dark text-white px-4 py-2.5 rounded text-xs font-bold tracking-wider uppercase transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer border border-brand-green"
                    >
                      <span>Enroll Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setCurrentPage('gallery')}
                      className="bg-transparent hover:bg-white/10 text-white border border-white px-4 py-2 rounded text-xs font-bold tracking-wider uppercase transition-all cursor-pointer"
                    >
                      View Gallery
                    </button>
                    <button
                      onClick={() => setCurrentPage('results')}
                      className="bg-brand-oxblood hover:bg-brand-oxblood-dark text-brand-yellow px-4 py-2.5 rounded text-xs font-bold tracking-wider uppercase transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer border border-brand-yellow/30"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Student Results Portal</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Controls (Arrows) */}
        {slides.length > 1 && (
          <>
            <button
              onClick={handlePrevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-brand-green text-white p-2.5 rounded-full transition cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-brand-green text-white p-2.5 rounded-full transition cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center space-x-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer ${
                    idx === currentSlideIndex ? 'bg-brand-yellow scale-125' : 'bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* 2. SCHOOL MOTTO & EMBLEM BADGE */}
      <section className="bg-brand-green text-white py-4 shadow-md border-b-4 border-brand-yellow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0 text-center md:text-left">
          <div>
            <h3 className="text-lg font-bold font-heading text-brand-yellow uppercase tracking-tight leading-none">HOLY GHOST ACADEMY SECONDARY SCHOOL</h3>
            <p className="text-[10px] text-green-100 font-sans tracking-wide mt-1">Approved by the Anambra State Ministry of Education & Pentecostal Church Education Commission</p>
          </div>
          <div className="bg-brand-oxblood px-4 py-2 rounded border border-brand-yellow/30 text-xs font-bold tracking-wider uppercase font-heading text-brand-yellow flex items-center space-x-2 shadow-inner">
            <span className="text-white">MOTTO:</span>
            <span>MORAL AND ACADEMICS (MALU CHUKWU, MALU AKWUKO)</span>
          </div>
        </div>
      </section>

      {/* 2B. FOUNDER'S TRIBUTE SECTION */}
      <section className="py-12 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden border-b-4 border-brand-yellow">
        {/* Decorative background highlights */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-oxblood/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Founder Portrait with Archdiocesan Gold Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative max-w-sm w-full group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-yellow via-brand-oxblood to-brand-yellow rounded-2xl blur-xs opacity-75 group-hover:opacity-100 transition duration-500" />
                <div className="relative bg-slate-900 p-2.5 rounded-2xl border-2 border-brand-yellow/60 shadow-2xl overflow-hidden">
                  <div className="relative overflow-hidden rounded-xl bg-slate-800">
                    <img
                      src="https://i.ibb.co/DPkn77Md/hg16.jpg"
                      alt="Late Archbishop Dr. Ephraim Ndife JP2 - Founder of Holy Ghost Academy Group of Schools"
                      className="w-full h-[380px] sm:h-[420px] object-cover object-top rounded-xl transform group-hover:scale-102 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-85" />
                    
                    {/* Badge Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-4 text-center">
                      <span className="inline-block bg-brand-oxblood text-brand-yellow text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-brand-yellow/40 shadow-sm mb-1.5">
                        EPISCOPAL PATRIARCH & FOUNDING FATHER
                      </span>
                      <h4 className="text-base sm:text-lg font-black font-heading text-white tracking-tight">
                        Late Archbishop Dr. Ephraim Ndife JP2
                      </h4>
                      <p className="text-[11px] text-amber-200/95 font-medium mt-0.5">
                        Founder, Holy Ghost Academy Group of Schools
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Founder Biography & Spiritual Legacy */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="h-0.5 w-8 bg-brand-yellow" />
                  <span className="text-xs font-black text-brand-yellow uppercase tracking-widest">
                    OUR ESTEEMED FOUNDING PATRIARCH
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading text-white tracking-tight leading-tight">
                  Late Archbishop Dr. Ephraim Ndife JP2
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-green-300 uppercase tracking-wider">
                  Founder, Holy Ghost Academy Group of Schools
                </p>
              </div>

              <div className="space-y-3.5 text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                <p>
                  Holy Ghost Academy Group of Schools was birthed through the divine calling, apostolic vision, and sacrificial dedication of our revered spiritual father, <strong>Late Archbishop Dr. Ephraim Ndife JP2</strong>. 
                </p>
                <p>
                  With an unwavering conviction that sound Christian character must anchor academic brilliance, Archbishop Ndife laid the solid foundation of this citadel upon the solemn mandate: <strong className="text-brand-yellow">"Moral and Academics (MALU CHUKWU, MALU AKWUKO)"</strong>. His life's mission was dedicated to ensuring youth across Anambra State and Nigeria receive first-class, competitive, science-rich education without compromising spiritual righteousness.
                </p>
                <p>
                  Today, his monumental legacy continues to flourish and bear eternal fruit. Through the disciplined structures, state-of-the-art facilities, and prayerful ethos he established, Holy Ghost Academy remains an enduring pillar of moral uprightness and intellectual triumph.
                </p>
              </div>

              {/* Core Pillars established by the Founder */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                  <span className="block text-brand-yellow font-heading font-black text-sm">MALU CHUKWU</span>
                  <span className="text-[10px] text-slate-300">Know God • Reverence • Faith</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                  <span className="block text-brand-yellow font-heading font-black text-sm">MALU AKWUKO</span>
                  <span className="text-[10px] text-slate-300">Intellectual Rigor • Mastery</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                  <span className="block text-brand-yellow font-heading font-black text-sm">EXCELLENCE</span>
                  <span className="text-[10px] text-slate-300">Lifelong Discipline & Service</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. PRINCIPAL'S WELCOME MESSAGE */}
      <section className="py-10 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Principal Photo Column */}
            <div className="lg:col-span-5 relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-brand-oxblood to-brand-green rounded-xl blur-[1px] opacity-20 group-hover:opacity-30 transition duration-350" />
              <div className="relative bg-white p-1.5 rounded-xl shadow-md overflow-hidden border border-slate-200">
                <img
                  src="https://i.ibb.co/pj9SBTbc/cccg.jpg"
                  alt="School Manager - Engr. ThankGod Ndibe"
                  className="w-full h-[320px] object-cover rounded-lg"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4 text-white">
                  <h4 className="text-sm font-bold font-heading text-brand-yellow leading-tight">Engr. ThankGod Ndibe B.Engr., M.Engr.</h4>
                  <p className="text-[10px] text-slate-200 font-medium">Manager</p>
                </div>
              </div>
            </div>

            {/* Welcome Text Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-brand-oxblood uppercase tracking-widest block">MANAGER’S DESK</span>
                <h2 className="text-xl sm:text-2xl font-black font-heading text-brand-green uppercase tracking-tight leading-tight">
                  Welcome to Holy Ghost Academy
                </h2>
              </div>
              
              <div className="space-y-3.5 text-slate-600 text-xs sm:text-sm leading-relaxed font-sans">
                <p>
                  It is with immense joy and academic pride that I welcome you to the official web portal of <strong>Holy Ghost Academy Secondary School, Kamali Homes, Ngozika Housing Estate, Awka</strong>. Located in the serene, highly secure environment of Ngozika Housing Estate, Awka, our school stands as a beacon of academic excellence, faith-based grooming, and moral integrity.
                </p>
                <p>
                  Under the spiritual and structural guidance of the Pentecostal Church of Awka, we are deeply committed to providing holistic secondary education. We combine the absolute best of global science and technology curriculums with rigorous character coaching and spiritual disciplines. We believe that true education does not merely load the brain with scientific formulas, but models the heart to act with moral excellence, integrity, and social conscience.
                </p>
                <p>
                  With our ultra-modern digital library, fully stocked science laboratories, and an exemplary faculty, our students consistently achieve top scores in WAEC and NECO. I invite you to explore our portal, discover our academic programs, inspect our ongoing development projects, and partner with us as we mold the innovators and standard-bearers of tomorrow.
                </p>
              </div>

              {/* Principal Signature */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400">Yours in Academic & Spiritual Service,</p>
                  <p className="text-xs font-bold text-brand-green font-heading mt-0.5">Engr. ThankGod Ndibe B.Engr., M.Engr.</p>
                  <p className="text-[10px] text-brand-oxblood font-bold uppercase tracking-wider">Manager</p>
                </div>
                <div className="font-heading italic text-brand-oxblood text-lg sm:text-xl tracking-wider opacity-60">
                  Engr. ThankGod Ndibe
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. KEY STATISTICS SECTION */}
      <section className="py-8 bg-brand-oxblood text-white border-y border-brand-yellow/30 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-center">
            {statsList.map((stat, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3.5 space-y-1 group hover:bg-white/10 transition-colors duration-200">
                <div className="mx-auto w-9 h-9 rounded-full flex items-center justify-center bg-white/10 text-brand-yellow border border-white/15">
                  <stat.icon className="w-5 h-5 text-brand-yellow" />
                </div>
                <h4 className="text-2xl sm:text-3xl font-black font-heading text-brand-yellow tracking-tight">{stat.value}</h4>
                <p className="text-[10px] text-slate-300 uppercase font-bold tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US SECTION */}
      <section className="py-10 bg-slate-50/50 border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-1.5">
            <span className="text-[10px] font-extrabold text-brand-green uppercase tracking-widest block">THE ACADEMY DIFFERENCE</span>
            <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-900 uppercase tracking-tight">
              Why Choose Holy Ghost Academy?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Our structures, curriculum, and values are masterfully crafted to provide the absolute highest tier of moral and scientific secondary school development in Nigeria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {coreStrengths.map((strength, index) => (
              <div 
                key={index} 
                className={`bg-white p-4.5 rounded-lg shadow-xs border border-slate-200 transition-all duration-200 hover:shadow-md ${strength.color}`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className="p-2 rounded bg-slate-50 border border-slate-100 shadow-xs text-brand-green shrink-0">
                    <strength.icon className="w-5 h-5 text-brand-green" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 font-heading uppercase tracking-tight">
                      {strength.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      {strength.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. LATEST NEWS & ANNOUNCEMENTS */}
      <section className="py-10 bg-white border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-brand-oxblood uppercase tracking-widest block">BULLETIN BOARD</span>
              <h2 className="text-xl sm:text-2xl font-black font-heading text-brand-green uppercase tracking-tight">
                Latest News & Announcements
              </h2>
            </div>
            <button
              onClick={() => setCurrentPage('contact')}
              className="text-xs font-bold text-brand-oxblood hover:text-brand-green hover:underline cursor-pointer flex items-center space-x-1"
            >
              <span>Stay Updated</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* News Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.slice(0, 3).map((item) => (
              <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-xs border border-slate-200 flex flex-col justify-between hover:shadow-md transition duration-200">
                <div>
                  {item.imageUrl && (
                    <div className="h-40 overflow-hidden relative border-b border-slate-100">
                      <img
                        src={item.imageUrl}
                        alt={`${item.title} - HGASS School News`}
                        width={400}
                        height={160}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover hover:scale-103 transition duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 text-[9px] font-bold text-white bg-brand-green px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                        {item.category}
                      </span>
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center text-[10px] text-slate-400 space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{item.date}</span>
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 font-heading uppercase leading-snug hover:text-brand-green transition">
                      {item.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-sans">
                      {truncateText(item.content, 110)}
                    </p>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <button
                    onClick={() => setSelectedNews(item)}
                    className="text-[10px] font-bold text-brand-oxblood hover:text-brand-green uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FEATURED ONGOING PROJECTS */}
      <section className="py-10 bg-slate-50/50 border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-brand-green uppercase tracking-widest block">DEVELOPMENT TRACKER</span>
              <h2 className="text-xl sm:text-2xl font-black font-heading text-brand-oxblood uppercase tracking-tight">
                Featured Ongoing Projects
              </h2>
            </div>
            <button
              onClick={() => setCurrentPage('projects')}
              className="text-xs font-bold text-brand-green hover:text-brand-oxblood hover:underline cursor-pointer flex items-center space-x-1"
            >
              <span>View All Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.slice(0, 2).map((proj) => (
              <div key={proj.id} className="bg-white rounded-lg p-4 border border-slate-200 flex flex-col sm:flex-row gap-4 hover:shadow shadow-xs transition duration-200">
                <div className="sm:w-2/5 shrink-0 h-32 sm:h-full rounded overflow-hidden border border-slate-100">
                  <img
                    src={proj.imageUrl}
                    alt={proj.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2 w-full flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 font-heading uppercase tracking-tight leading-snug">
                      {proj.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-sans">
                      {truncateText(proj.description, 80)}
                    </p>
                  </div>
                  
                  {/* Progress bar info */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-[10px] font-sans">
                      <span className="text-brand-oxblood font-bold uppercase">Progress: {proj.percentageCompletion}%</span>
                      <span className="text-slate-400 font-semibold">Budget: {proj.budget}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                      <div 
                        className="h-full bg-brand-green transition-all duration-500" 
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

      {/* 7.4. STUDENT ACADEMIC PORTAL SHOWCASE */}
      <section className="py-12 bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 text-white border-t-4 border-brand-yellow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-green/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-oxblood/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="max-w-3xl mx-auto text-center space-y-2 mb-10">
            <span className="text-[10px] font-black text-brand-yellow uppercase tracking-widest inline-flex items-center gap-1.5 bg-brand-oxblood/80 px-3 py-1 rounded-full border border-brand-yellow/30">
              <GraduationCap className="w-3.5 h-3.5 text-brand-yellow" />
              <span>OFFICIAL STUDENT ACADEMIC PORTAL</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-heading text-white uppercase tracking-tight">
              Access Termly & Annual Results Differently
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-2xl mx-auto">
              Our students and parents can independently verify continuous assessments for each academic term, or retrieve the official full-year sessional cumulative transcript with Diocesan promotion verdicts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* Card 1: Termly Report Cards */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs flex flex-col justify-between space-y-4 hover:border-brand-green transition group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center border border-brand-green/40 group-hover:scale-105 transition">
                  <FileText className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-widest block">
                    Continuous Assessments (CA)
                  </span>
                  <h4 className="text-lg font-bold font-heading text-white uppercase tracking-tight mt-0.5">
                    Termly Report Sheets
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Inspect breakdown scores for 1st Term, 2nd Term, or 3rd Term: CA 1 (20pts), CA 2 (20pts), Terminal Exam (60pts), subject teacher remarks, and terminal class rank.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage('results')}
                className="w-full py-2.5 bg-brand-green hover:bg-brand-green-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs flex items-center justify-center gap-2 border border-brand-green"
              >
                <span>Check Termly Report Card</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2: Annual Cumulative Transcripts */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs flex flex-col justify-between space-y-4 hover:border-brand-yellow transition group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-brand-oxblood/30 text-brand-yellow flex items-center justify-center border border-brand-yellow/40 group-hover:scale-105 transition">
                  <Award className="w-6 h-6 text-brand-yellow" />
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-amber-400 uppercase tracking-widest block">
                    Full Session Sessional Progression
                  </span>
                  <h4 className="text-lg font-bold font-heading text-white uppercase tracking-tight mt-0.5">
                    Annual Cumulative Transcripts
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Evaluate complete 3-term performance matrices side-by-side, full-year cumulative averages, annual GPA (/5.00), and official Diocesan Promotion decisions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage('results')}
                className="w-full py-2.5 bg-brand-oxblood hover:bg-brand-oxblood-dark text-brand-yellow rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs flex items-center justify-center gap-2 border border-brand-yellow/30"
              >
                <span>Check Annual Transcript</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 7.5. OFFICIAL UBA PAYMENT PORTAL CARD & QUICK LINK */}
      <section className="py-10 bg-gradient-to-br from-red-950 via-slate-900 to-red-900 text-white border-y-4 border-brand-yellow relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none p-4">
          <Landmark className="w-64 h-64 text-white" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center space-x-2 bg-brand-yellow/20 text-brand-yellow px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-brand-yellow/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Designated Church Banking Channel</span>
              </div>
              <h3 className="text-xl sm:text-3xl font-black font-heading text-white uppercase tracking-tight">
                School Fees & Direct Bank Payment
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed max-w-xl">
                Remit terminal tuition, entrance application forms, and project donations directly to the official <strong>Holy Ghost Academy</strong> corporate bank account at United Bank for Africa (UBA).
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage('payment')}
                  className="bg-brand-green hover:bg-brand-green-dark text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-sm inline-flex items-center space-x-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Open Payment Portal & E-Receipt</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage('payment')}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  View Approved Fee Schedule
                </button>
              </div>
            </div>

            {/* Quick Bank Card Visual on Home */}
            <div className="lg:col-span-5 bg-black/40 backdrop-blur-sm p-5 rounded-xl border border-red-500/40 shadow-lg space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                <span className="text-red-300 font-bold uppercase text-[10px] tracking-wider">United Bank for Africa (UBA)</span>
                <span className="bg-brand-yellow/20 text-brand-yellow text-[9px] font-bold px-2 py-0.5 rounded uppercase">Official Account</span>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Account Number</span>
                <div className="flex items-center justify-between bg-black/50 p-2.5 rounded-lg border border-white/10">
                  <span className="text-xl sm:text-2xl font-mono font-black text-brand-yellow tracking-widest select-all">
                    1027146728
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAcc}
                    className="bg-brand-yellow hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedAcc ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-800" />
                        <span className="text-green-950 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-xs space-y-1 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Account Name:</span>
                  <span className="text-white font-bold uppercase">Holy Ghost Academy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">USSD Dial Code:</span>
                  <span className="font-mono font-bold text-red-300">*919*4*1027146728*Amount#</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS SECTION */}
      <section className="py-10 bg-brand-oxblood text-white border-b-4 border-brand-yellow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-1.5">
            <span className="text-[10px] font-extrabold text-brand-yellow uppercase tracking-widest block">COMMUNITY STORIES</span>
            <h3 className="text-xl sm:text-2xl font-black font-heading text-white uppercase tracking-tight">
              What Parents & Alumni Say
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-xs p-4.5 rounded-lg border border-white/10 flex flex-col justify-between space-y-3">
                <p className="italic text-slate-200 text-xs leading-relaxed font-sans font-light">
                  "{t.quote}"
                </p>
                <div>
                  <h4 className="font-bold text-brand-yellow text-xs font-heading uppercase tracking-wide">{t.author}</h4>
                  <p className="text-[9px] text-green-200 font-sans font-bold tracking-wider uppercase mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- News Detail Modal --- */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
          <div className="bg-white rounded-xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100">
            {selectedNews.imageUrl && (
              <div className="h-56 relative shrink-0">
                <img
                  src={selectedNews.imageUrl}
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-brand-oxblood text-white p-2 rounded-full cursor-pointer transition"
                >
                  ✕
                </button>
                <span className="absolute bottom-4 left-4 text-xs font-bold text-white bg-brand-green px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {selectedNews.category}
                </span>
              </div>
            )}
            <div className="p-6 space-y-4 overflow-y-auto">
              {!selectedNews.imageUrl && (
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-white bg-brand-green px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {selectedNews.category}
                  </span>
                  <button
                    onClick={() => setSelectedNews(null)}
                    className="text-gray-400 hover:text-brand-oxblood font-bold text-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="space-y-1.5">
                <div className="flex items-center text-xs text-gray-400 space-x-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{selectedNews.date}</span>
                </div>
                <h3 className="text-xl font-bold font-heading text-brand-green uppercase tracking-tight leading-snug">
                  {selectedNews.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-sans">
                {selectedNews.content}
              </p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedNews(null)}
                className="bg-brand-oxblood hover:bg-brand-oxblood-dark text-white px-5 py-2 rounded-md text-xs font-semibold tracking-wider uppercase transition cursor-pointer"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
