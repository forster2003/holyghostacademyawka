/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Search, Image, Play, Calendar, Eye, Compass, Film } from 'lucide-react';
import { GalleryItem, VideoItem } from '../types';

interface GalleryViewProps {
  gallery: GalleryItem[];
  videos: VideoItem[];
}

export default function GalleryView({ gallery, videos }: GalleryViewProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Video Player Modal State
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  const categories = [
    'All',
    'School Activities',
    'Sports',
    'Academics',
    'Graduation',
    'Cultural Events',
    'Projects'
  ];

  // Photo Filters & Searches
  const filteredPhotos = gallery.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Photo Pagination calculations
  const totalPhotoPages = Math.ceil(filteredPhotos.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPhotos = filteredPhotos.slice(indexOfFirstItem, indexOfLastItem);

  // Video Filters & Searches
  const filteredVideos = videos.filter((vid) => {
    return vid.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           vid.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Helper to extract YouTube video ID or return embed url
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        const videoId = urlParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (e) {
      console.error(e);
    }
    // Return placeholder embed or search string
    return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="font-sans text-gray-700">
      
      {/* Page Header */}
      <section className="bg-brand-oxblood text-white py-6 md:py-8 text-center border-b-4 border-brand-green relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-1">
          <span className="text-brand-yellow font-bold text-[10px] uppercase tracking-widest flex items-center justify-center space-x-1">
            <Compass className="w-3.5 h-3.5 mr-1" />
            <span>PORTAL REPOSITORY</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight uppercase">Campus Life &amp; Media Gallery</h1>
          <p className="text-[11px] sm:text-xs text-gray-200 max-w-xl mx-auto font-light leading-relaxed">
            Visual highlights of academic competitions, sporting events, and continuous campus development at HGASS.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-10 bg-white border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Gallery Type Selector Tabs & Search bar */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8 pb-4 border-b border-slate-200/60">
            <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 inline-flex space-x-1.5">
              <button
                onClick={() => { setActiveTab('photos'); setSearchQuery(''); }}
                className={`px-4 py-2 rounded-md text-xs font-bold font-heading uppercase tracking-wider transition cursor-pointer flex items-center space-x-1 ${
                  activeTab === 'photos'
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'text-slate-500 hover:text-brand-green'
                }`}
              >
                <Image className="w-3.5 h-3.5" />
                <span>Photos ({gallery.length})</span>
              </button>
              <button
                onClick={() => { setActiveTab('videos'); setSearchQuery(''); }}
                className={`px-4 py-2 rounded-md text-xs font-bold font-heading uppercase tracking-wider transition cursor-pointer flex items-center space-x-1 ${
                  activeTab === 'videos'
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'text-slate-500 hover:text-brand-green'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Videos ({videos.length})</span>
              </button>
            </div>

            {/* Search Input bar */}
            <div className="relative w-full lg:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder={activeTab === 'photos' ? "Search photos..." : "Search videos..."}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-green/35 focus:outline-hidden text-xs"
              />
            </div>
          </div>

          {/* VIEW: PHOTOS */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-1.5 justify-center lg:justify-start">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider border transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-brand-oxblood text-brand-yellow border-brand-oxblood shadow-xs'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-brand-green hover:text-brand-green'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Photo Cards Grid */}
              {currentPhotos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentPhotos.map((photo, index) => {
                    // Calculate real index in filtered list for lightbox references
                    const realIndex = indexOfFirstItem + index;
                    return (
                      <div 
                        key={photo.id} 
                        className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-xs flex flex-col group relative"
                      >
                        <div className="h-48 overflow-hidden relative">
                          <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Eye hover effect */}
                          <div 
                            onClick={() => setLightboxIndex(realIndex)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 cursor-pointer"
                          >
                            <span className="p-2.5 bg-white text-brand-green rounded-full shadow transform translate-y-3 group-hover:translate-y-0 transition duration-200">
                              <Eye className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                        
                        {/* Detail text */}
                        <div className="p-3.5 space-y-1.5 flex flex-col justify-between grow">
                          <div className="space-y-1">
                            <span className="inline-block text-[8px] font-bold tracking-widest text-brand-oxblood uppercase bg-brand-oxblood/5 px-2 py-0.5 rounded border border-brand-oxblood/10">
                              {photo.category}
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-gray-800 font-heading leading-tight uppercase">
                              {photo.title}
                            </h4>
                          </div>
                          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-mono">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {photo.uploadDate}
                            </span>
                            <button
                              onClick={() => setLightboxIndex(realIndex)}
                              className="text-brand-green hover:underline cursor-pointer font-bold"
                            >
                              Expand &raquo;
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                  <p className="text-gray-400 text-sm">No photos found in this category.</p>
                  <button 
                    onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                    className="text-xs font-bold text-brand-green hover:underline uppercase"
                  >
                    Reset filters
                  </button>
                </div>
              )}

              {/* Photo Pagination controls */}
              {filteredPhotos.length > itemsPerPage && (
                <div className="flex justify-center items-center space-x-1 pt-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-[10px] font-bold"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPhotoPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-7 h-7 border rounded text-[10px] font-bold transition cursor-pointer ${
                        currentPage === i + 1
                          ? 'bg-brand-green text-white border-brand-green'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPhotoPages}
                    className="px-2.5 py-1.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-[10px] font-bold"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW: VIDEOS */}
          {activeTab === 'videos' && (
            <div>
              {filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredVideos.map((vid) => (
                    <div 
                      key={vid.id} 
                      className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200 shadow-xs hover:shadow transition duration-200"
                    >
                      {/* Video Player Embed Box */}
                      <div className="aspect-video bg-black relative">
                        <iframe
                          title={vid.title}
                          src={getEmbedUrl(vid.url)}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      
                      {/* Video Text details */}
                      <div className="p-4 space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                          <span className="flex items-center uppercase font-bold">
                            <Film className="w-3 h-3 mr-1 text-brand-green" />
                            Virtual Portal Video
                          </span>
                          <span>Uploaded: {vid.uploadDate}</span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900 font-heading uppercase leading-tight">
                          {vid.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          {vid.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                  <p className="text-gray-400 text-sm">No school videos found matching search.</p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-bold text-brand-green hover:underline uppercase"
                  >
                    Clear search query
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* --- Lightbox Modal --- */}
      {lightboxIndex !== null && lightboxIndex >= 0 && lightboxIndex < filteredPhotos.length && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 animate-fade-in">
          
          {/* Lightbox Header */}
          <div className="flex justify-between items-center text-white shrink-0 py-2 border-b border-white/10 max-w-7xl mx-auto w-full">
            <div>
              <p className="text-[10px] text-brand-yellow font-bold uppercase tracking-wider">{filteredPhotos[lightboxIndex].category}</p>
              <h4 className="font-bold text-sm sm:text-base font-heading text-white">{filteredPhotos[lightboxIndex].title}</h4>
            </div>
            <button
              onClick={() => setLightboxIndex(null)}
              className="text-white hover:text-red-500 p-2 text-xl font-bold cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          {/* Lightbox Central Display */}
          <div className="grow flex items-center justify-center relative my-4 max-w-7xl mx-auto w-full">
            <button
              disabled={lightboxIndex === 0}
              onClick={() => setLightboxIndex(lightboxIndex - 1)}
              className="absolute left-2 bg-white/15 hover:bg-white/20 text-white p-3 rounded-full cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed transition"
            >
              ◀
            </button>

            <img
              src={filteredPhotos[lightboxIndex].imageUrl}
              alt={filteredPhotos[lightboxIndex].title}
              className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/5"
            />

            <button
              disabled={lightboxIndex === filteredPhotos.length - 1}
              onClick={() => setLightboxIndex(lightboxIndex + 1)}
              className="absolute right-2 bg-white/15 hover:bg-white/20 text-white p-3 rounded-full cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed transition"
            >
              ▶
            </button>
          </div>

          {/* Lightbox Footer stats */}
          <div className="text-center text-gray-400 text-xs py-2 border-t border-white/10 max-w-7xl mx-auto w-full shrink-0">
            Image {lightboxIndex + 1} of {filteredPhotos.length}  |  Uploaded: {filteredPhotos[lightboxIndex].uploadDate}
          </div>

        </div>
      )}

    </div>
  );
}
