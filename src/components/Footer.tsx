/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GraduationCap, Phone, Mail, MapPin, Award, BookOpen, Sun, Moon, Share2, Globe } from 'lucide-react';
import { SchoolSocialHandles } from '../types';

interface FooterProps {
  setCurrentPage: (page: string) => void;
  headerLogo?: string;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
  socialHandles?: SchoolSocialHandles;
}

export default function Footer({ setCurrentPage, headerLogo, theme = 'light', toggleTheme, socialHandles }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 font-sans border-t-4 border-brand-green">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: School Identity */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-white text-white border-2 border-brand-yellow overflow-hidden shrink-0 shadow-sm">
                <img
                  src={headerLogo || "https://i.ibb.co/HTP5dHHD/Whats-App-Image-2026-06-30-at-10-02-49-AM.jpg"}
                  alt="Holy Ghost Academy Secondary School Official Crest"
                  width={44}
                  height={44}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "https://i.ibb.co/HTP5dHHD/Whats-App-Image-2026-06-30-at-10-02-49-AM.jpg";
                  }}
                />
              </div>
              <div>
                <span className="text-white font-bold text-lg font-heading tracking-tight block">HOLY GHOST ACADEMY</span>
                <p className="text-brand-yellow text-xs uppercase font-semibold">Awka, Nigeria</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              An elite, faith-based educational institution dedicated to cultivating academic excellence, moral discipline, character formation, and innovative thinking in future leaders.
            </p>
            <div className="flex space-x-4 pt-2">
              <span className="flex items-center text-xs text-brand-yellow bg-brand-green/20 px-2.5 py-1 rounded-full border border-brand-green/30 font-semibold uppercase">
                <Award className="w-3.5 h-3.5 mr-1" /> Faith-Based
              </span>
              <span className="flex items-center text-xs text-brand-yellow bg-brand-oxblood/20 px-2.5 py-1 rounded-full border border-brand-oxblood/30 font-semibold uppercase">
                <BookOpen className="w-3.5 h-3.5 mr-1" /> Top-Tier
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base font-heading mb-4 pb-2 border-b border-gray-800">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Home Portal', id: 'home', href: '/' },
                { label: 'About History & Values', id: 'about', href: '/?page=about' },
                { label: 'Mission & Vision', id: 'mission', href: '/?page=mission' },
                { label: 'Academic Syllabus', id: 'subjects', href: '/?page=subjects' },
                { label: 'Academic Calendar', id: 'calendar', href: '/?page=calendar' },
                { label: 'Ongoing School Projects', id: 'projects', href: '/?page=projects' },
                { label: 'School Gallery', id: 'gallery', href: '/?page=gallery' },
                { label: 'Student Results Portal', id: 'results', href: '/?page=results' },
                { label: 'School Fees & Payment', id: 'payment', href: '/?page=payment' },
                { label: 'Contact Administration', id: 'contact', href: '/?page=contact' },
              ].map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(link.id);
                    }}
                    className="hover:text-brand-green hover:underline text-left transition duration-150 cursor-pointer text-gray-400 block"
                  >
                    &raquo; {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Academic & Machine-Readable SEO Files */}
          <div>
            <h3 className="text-white font-semibold text-base font-heading mb-4 pb-2 border-b border-gray-800">
              Academic Paths
            </h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div>
                <p className="text-white font-medium text-xs uppercase tracking-wider text-brand-yellow">Junior Secondary (JSS 1 - JSS 3)</p>
                <p className="text-xs text-gray-400 mt-1">Mathematics, English, Civic Ed, Basic Science, Agricultural Science, Computer Science, and CCA.</p>
              </div>
              <div>
                <p className="text-white font-medium text-xs uppercase tracking-wider text-brand-yellow">Senior Secondary (SS 1 - SS 3)</p>
                <p className="text-xs text-gray-400 mt-1">Physics, Chemistry, Biology, Economics, Government, Literature, Computer Science, and Geography.</p>
              </div>
              <div className="pt-2 border-t border-gray-800 space-y-1">
                <p className="text-[11px] font-bold text-brand-yellow uppercase tracking-wider">Search Engine & AI Feeds:</p>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-green-400 underline">sitemap.xml</a>
                  <span>•</span>
                  <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-green-400 underline">robots.txt</a>
                  <span>•</span>
                  <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-green-400 underline">llms.txt (AI Agents)</a>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Contact details */}
          <div>
            <h4 className="text-white font-semibold text-base font-heading mb-4 pb-2 border-b border-gray-800">
              Get in Touch
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                <span className="text-gray-400 text-xs leading-relaxed">
                  Holy Ghost Academy Secondary School,<br />
                  Kamali Homes, Ngozika Housing Estate,<br />
                  Awka, Anambra State, Nigeria.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-4.5 h-4.5 text-brand-green shrink-0 mt-0.5" />
                <div className="text-gray-400 text-xs space-y-1">
                  <div>
                    <a href="https://wa.me/2349054145339?text=Hello%20Holy%20Ghost%20Academy%2C%20I%20would%20like%20to%20inquire%20about%20student%20enrollment." target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition">
                      +234 (0) 905 414 5339 (WhatsApp)
                    </a>
                  </div>
                  <div>
                    <a href="https://wa.me/2347068986865?text=Hello%20Holy%20Ghost%20Academy%2C%20I%20would%20like%20to%20inquire%20about%20student%20enrollment." target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition">
                      +234 (0) 706 898 6865 (WhatsApp)
                    </a>
                  </div>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4.5 h-4.5 text-brand-green shrink-0" />
                <a href="mailto:holyghostacademy@gmail.com" className="text-gray-400 text-xs hover:text-white transition">
                  holyghostacademy@gmail.com
                </a>
              </li>
            </ul>
            <div className="pt-3">
              <a
                href="https://wa.me/2349054145339?text=Hello%20Holy%20Ghost%20Academy%2C%20I%20would%20like%20to%20enroll%20a%20student%20for%20admissions."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 bg-brand-green hover:bg-brand-green-dark text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-sm transition border border-brand-green cursor-pointer"
              >
                <span>Enroll Now (WhatsApp Desk)</span>
              </a>
            </div>

            {/* School Social Media Handles */}
            {socialHandles && (
              <div className="pt-3 border-t border-gray-800/80 space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-brand-yellow tracking-wider flex items-center gap-1">
                  <Share2 className="w-3 h-3 text-brand-yellow" />
                  <span>Connect With Us:</span>
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {socialHandles.facebook && (
                    <a
                      href={socialHandles.facebook.startsWith('http') ? socialHandles.facebook : `https://${socialHandles.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-blue-900/40 hover:bg-blue-800 text-blue-300 hover:text-white rounded text-[10px] font-bold transition border border-blue-700/40"
                      title="Follow us on Facebook"
                    >
                      Facebook
                    </a>
                  )}
                  {socialHandles.instagram && (
                    <a
                      href={socialHandles.instagram.startsWith('http') ? socialHandles.instagram : `https://${socialHandles.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-pink-900/40 hover:bg-pink-800 text-pink-300 hover:text-white rounded text-[10px] font-bold transition border border-pink-700/40"
                      title="Follow us on Instagram"
                    >
                      Instagram
                    </a>
                  )}
                  {socialHandles.twitter && (
                    <a
                      href={socialHandles.twitter.startsWith('http') ? socialHandles.twitter : `https://${socialHandles.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-bold transition border border-slate-700"
                      title="Follow us on X / Twitter"
                    >
                      X (Twitter)
                    </a>
                  )}
                  {socialHandles.youtube && (
                    <a
                      href={socialHandles.youtube.startsWith('http') ? socialHandles.youtube : `https://${socialHandles.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-red-900/40 hover:bg-red-800 text-red-300 hover:text-white rounded text-[10px] font-bold transition border border-red-700/40"
                      title="Subscribe to our YouTube channel"
                    >
                      YouTube
                    </a>
                  )}
                  {socialHandles.tiktok && (
                    <a
                      href={socialHandles.tiktok.startsWith('http') ? socialHandles.tiktok : `https://${socialHandles.tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-purple-900/40 hover:bg-purple-800 text-purple-300 hover:text-white rounded text-[10px] font-bold transition border border-purple-700/40"
                      title="Follow us on TikTok"
                    >
                      TikTok
                    </a>
                  )}
                  {socialHandles.whatsapp && (
                    <a
                      href={socialHandles.whatsapp.startsWith('http') ? socialHandles.whatsapp : `https://wa.me/${socialHandles.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-emerald-900/40 hover:bg-emerald-800 text-emerald-300 hover:text-white rounded text-[10px] font-bold transition border border-emerald-700/40"
                      title="Message us on WhatsApp"
                    >
                      WhatsApp
                    </a>
                  )}
                  {socialHandles.website && (
                    <a
                      href={socialHandles.website.startsWith('http') ? socialHandles.website : `https://${socialHandles.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-brand-yellow hover:text-white rounded text-[10px] font-bold transition border border-slate-700"
                      title="School Official Website"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Bottom Legal Credit Banner */}
      <div className="bg-gray-950 text-[10px] text-gray-500 py-3 text-center border-t border-gray-800/60 font-sans font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p>&copy; {currentYear} Holy Ghost Academy Secondary School, Kamali Homes, Ngozika Housing Estate, Awka. Approved by Ministry of Education.</p>
          <div className="flex items-center space-x-3.5">
            <span className="text-brand-yellow/90 font-bold uppercase tracking-wider">Motto: Moral and Academics (MALU CHUKWU, MALU AKWUKO)</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-bold uppercase text-[9px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              School Server Online
            </span>
            {toggleTheme && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/60 transition cursor-pointer text-[9.5px] uppercase font-bold"
                  title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-3 h-3 text-brand-yellow" />
                  ) : (
                    <Moon className="w-3 h-3 text-gray-300" />
                  )}
                  <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
