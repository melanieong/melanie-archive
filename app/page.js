"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchWordPressPosts } from '../lib/wordpress';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('projects'); // 'projects' or 'entries'
  const [currentFilter, setCurrentFilter] = useState('All'); // 'All', 'Ongoing', 'Featured', 'Archived'
  const [activeTypeFilter, setActiveTypeFilter] = useState('All');
  const [currentSort, setCurrentSort] = useState('date-desc');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Scrapbook Theme Toggle
  const [scrapbookMode, setScrapbookMode] = useState(false);

  // Manifesto Slider State
  const [manifestoOpen, setManifestoOpen] = useState(false);
  const [manifestoOpacity, setManifestoOpacity] = useState(false);

  // Lightbox Modal State
  const [activeModalPost, setActiveModalPost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpacity, setModalOpacity] = useState(false);

  // Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const wpPosts = await fetchWordPressPosts();
      setPosts(wpPosts);
      setLoading(false);

      const storedTheme = localStorage.getItem('mel_scrapbook_theme');
      if (storedTheme === 'true') {
        setScrapbookMode(true);
      }
    }
    loadData();
  }, []);

  const toggleScrapbookMode = () => {
    const nextMode = !scrapbookMode;
    setScrapbookMode(nextMode);
    localStorage.setItem('mel_scrapbook_theme', String(nextMode));
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Jan 12, 2026';
    const date = new Date(dateStr);

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  // Helper to strip HTML tags for card descriptions
  const stripHtml = (htmlStr) => {
    if (!htmlStr) return '';
    return htmlStr.replace(/<\/?[^>]+(>|$)/g, "").trim();
  };

  // Extract unique categories (types) for filtering in entries mode
  const getEntryCategories = () => {
    const cats = new Set();
    posts.forEach(p => {
      p.categories?.nodes?.forEach(c => {
        if (c.name !== 'Featured' && c.name !== 'Ongoing' && c.name !== 'Archived') {
          cats.add(c.name);
        }
      });
    });
    return Array.from(cats);
  };

  // Helper to open Lightbox Modal
  const openPostModal = (post) => {
    setActiveModalPost(post);
    setModalOpen(true);
    setTimeout(() => {
      setModalOpacity(true);
    }, 10);
  };

  // Helper to close Lightbox Modal
  const closePostModal = () => {
    setModalOpacity(false);
    setTimeout(() => {
      setModalOpen(false);
      setActiveModalPost(null);
    }, 300);
  };

  // Helper to open/close Manifesto slider
  const toggleManifesto = () => {
    if (manifestoOpen) {
      setManifestoOpacity(false);
      setTimeout(() => {
        setManifestoOpen(false);
      }, 300);
    } else {
      setManifestoOpen(true);
      setTimeout(() => {
        setManifestoOpacity(true);
      }, 10);
    }
  };

  // Group WordPress posts into Journeys (by category)
  const getJourneys = () => {
    const journeysMap = {};
    posts.forEach(post => {
      post.categories?.nodes?.forEach(cat => {
        const nameLower = cat.name.toLowerCase();
        // Exclude utility tags used for status/featuring
        if (nameLower !== 'featured' && nameLower !== 'ongoing' && nameLower !== 'archived' && nameLower !== 'standard') {
          if (!journeysMap[cat.name]) {
            journeysMap[cat.name] = {
              name: cat.name,
              slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
              posts: [],
              status: 'Ongoing',
              featuredImage: null
            };
          }
          journeysMap[cat.name].posts.push(post);

          // If the post has a status tag, associate it with the journey
          post.categories?.nodes?.forEach(statusCat => {
            const statusLower = statusCat.name.toLowerCase();
            if (statusLower === 'featured' || statusLower === 'ongoing' || statusLower === 'archived') {
              journeysMap[cat.name].status = statusCat.name;
            }
          });

          // Use the featured image of the newest post as the journey's featured image
          if (!journeysMap[cat.name].featuredImage && post.featuredImage?.node?.sourceUrl) {
            journeysMap[cat.name].featuredImage = post.featuredImage.node.sourceUrl;
          }
        }
      });
    });

    return Object.values(journeysMap);
  };

  // Filtered and Sorted Projects (Journeys)
  const getFilteredProjects = () => {
    let list = getJourneys();

    // Search filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(j => 
        j.name.toLowerCase().includes(q) || 
        j.posts.some(p => p.title.toLowerCase().includes(q) || stripHtml(p.content).toLowerCase().includes(q))
      );
    }

    // Status filter
    if (currentFilter !== 'All') {
      list = list.filter(j => {
        if (currentFilter === 'Ongoing') {
          return j.status.toLowerCase() === 'ongoing' || j.status.toLowerCase() === 'in progress';
        }
        return j.status.toLowerCase() === currentFilter.toLowerCase();
      });
    }

    return list;
  };

  // Filtered and Sorted Entries
  const getFilteredEntries = () => {
    let list = [...posts];

    // Search filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) || 
        stripHtml(p.content).toLowerCase().includes(q) ||
        (p.tags?.nodes?.some(t => t.name.toLowerCase().includes(q)))
      );
    }

    // Category Type filter
    if (activeTypeFilter !== 'All') {
      list = list.filter(p => 
        p.categories?.nodes?.some(c => c.name.toLowerCase() === activeTypeFilter.toLowerCase())
      );
    }

    // Sort entries
    list.sort((a, b) => {
      if (currentSort === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      } else if (currentSort === 'date-asc') {
        return new Date(a.date) - new Date(b.date);
      } else if (currentSort === 'title-asc') {
        return a.title.localeCompare(b.title);
      } else if (currentSort === 'title-desc') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

    return list;
  };

  const filteredProjects = getFilteredProjects();
  const filteredEntries = getFilteredEntries();

  return (
    <div className={`flex flex-col md:flex-row h-screen overflow-hidden page-fade-in font-body-md bg-canvas-warm ${scrapbookMode ? 'scrapbook-mode' : ''}`}>
      
      {/* Persistent SideNavBar Shell */}
      <aside className="w-full md:w-64 h-auto md:h-screen bg-canvas-warm border-b md:border-r border-ceramic flex flex-col py-4 px-4 md:py-space-4 md:px-space-2 flex-shrink-0 overflow-y-auto custom-scrollbar z-50">
        <div className="flex md:flex-col justify-between items-center md:items-start mb-0 md:mb-space-6 cursor-pointer w-full">
          
          {/* Logo container with signature ml-2 margin */}
          <div className="ml-2" onClick={() => { setViewMode('projects'); setSearchQuery(''); setCurrentFilter('All'); }}>
            <h1 className="font-headline-lg text-xl md:text-headline-lg tracking-tighter text-primary leading-tight">MELANIE'S ARCHIVE</h1>
            <p className="font-label-md text-xs md:text-label-md text-on-surface-variant opacity-70">Creative Archive</p>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-ceramic rounded-full active-scale flex items-center justify-center">
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
        
        {/* Sidebar Navigation Container */}
        <nav className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-grow space-y-2 md:space-y-space-1 w-full mt-4 md:mt-0 pb-4 md:pb-0`}>
          <Link href="/" className="flex items-center gap-space-3 py-space-2 rounded-lg text-primary font-bold border-r-4 border-primary pl-4 hover:bg-ceramic transition-colors active-scale">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md">Blog</span>
          </Link>
          <div className="flex items-center justify-between py-space-2 px-space-2 pl-4 rounded-lg hover:bg-ceramic transition-colors w-full text-on-surface-variant font-semibold select-none">
            <div className="flex items-center gap-space-3">
              <span 
                className={`material-symbols-outlined transition-all ${scrapbookMode ? 'text-gold' : ''}`}
                style={{ fontVariationSettings: scrapbookMode ? "'FILL' 1" : "'FILL' 0" }}
              >
                auto_stories
              </span>
              <span className="font-label-md text-label-md">Tactile Notebook</span>
            </div>
            <button 
              onClick={toggleScrapbookMode}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all focus:outline-none ml-auto border border-outline-variant/60 active-scale ${scrapbookMode ? 'bg-[#006c44]' : 'bg-[#bec9c0]/30'}`}
              aria-label="Toggle scrapbook mode"
            >
              <span 
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${scrapbookMode ? 'translate-x-4' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        </nav>

        
        {/* Bottom Actions & User Profile */}
        <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col mt-auto w-full px-2 pt-4 border-t border-ceramic md:border-none`}>
          <div className="w-full flex flex-col gap-space-2 px-space-2">
            <div className="flex items-center gap-space-2 mb-1">
              <span className="material-symbols-outlined text-outline text-2xl">account_circle</span>
              <div>
                <p className="font-label-md text-label-md leading-none">Guest Mode</p>
                <p className="text-[10px] text-on-surface-variant opacity-60">Visitor</p>
              </div>
            </div>
            <a href="http://melanie-archive-backend.local/wp-login.php" target="_blank" rel="noopener noreferrer" className="w-full text-center bg-primary text-white py-space-2 rounded-full font-label-md text-label-md hover:bg-primary-container active-scale transition-transform flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Sign In</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow h-screen overflow-y-auto custom-scrollbar py-space-2 px-space-6 md:py-space-3 md:px-space-7 max-w-[1600px] flex flex-col justify-between">
        
        <div>
          {/* Top Header Navigation */}
          <header className="flex justify-between items-center mb-space-3 mt-4 md:mt-0">
            <div>
              <span className="font-script-touch text-script-touch text-secondary italic mb-2 block scrapbook-handwriting">Curated Collection</span>
              <h2 className="font-display-lg text-display-lg text-primary-container leading-tight">Learning Journeys &amp; Archives</h2>
            </div>
            <div className="flex items-center gap-space-4">
              <div className="relative hidden lg:block">
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-ceramic border-none rounded-full py-2 px-space-4 w-64 focus:ring-2 focus:ring-primary-container font-body-md text-on-surface transition-all duration-300 focus:outline-none" 
                  placeholder="Search archive..." 
                  type="text"
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              </div>
              <button className="p-2 hover:bg-surface-container rounded-full transition-colors active-scale" onClick={() => alert('All backend messages synced successfully.')}>
                <span className="material-symbols-outlined text-primary">notifications</span>
              </button>
              <div className="flex items-center">
                <a href="http://melanie-archive-backend.local/wp-login.php" target="_blank" rel="noopener noreferrer" className="p-2 hover:opacity-80 transition-opacity cursor-pointer text-secondary flex items-center justify-center" title="Sign In">
                  <span className="material-symbols-outlined text-2xl">account_circle</span>
                </a>
              </div>
            </div>
          </header>

          {/* Dynamic Switcher & Filtering Area */}
          <div className="mb-space-5 mt-6">
            
            {/* View Mode Switcher */}
            <div className="flex items-center justify-start gap-4 mb-6 border-b border-ceramic pb-4">
              <button 
                onClick={() => setViewMode('projects')} 
                className={`px-5 py-2.5 rounded-full font-label-md transition-all duration-300 flex items-center gap-2 active-scale ${viewMode === 'projects' ? 'bg-primary text-white border border-primary shadow-sm' : 'border border-outline text-on-surface hover:bg-surface-container-high'}`}
              >
                <span className="material-symbols-outlined text-[20px]">folder</span>
                <span>Browse Projects</span>
              </button>
              <button 
                onClick={() => setViewMode('entries')} 
                className={`px-5 py-2.5 rounded-full font-label-md transition-all duration-300 flex items-center gap-2 active-scale ${viewMode === 'entries' ? 'bg-primary text-white border border-primary shadow-sm' : 'border border-outline text-on-surface hover:bg-surface-container-high'}`}
              >
                <span className="material-symbols-outlined text-[20px]">history_edu</span>
                <span>Browse All Entries</span>
              </button>
            </div>

            {/* Search and Contextual Filters Panel */}
            <div className="flex flex-col gap-6">
              {/* Search Bar (Shared mobile/desktop) */}
              <div className="relative max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-ceramic border-none rounded-full py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary-container font-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none transition-all" 
                  placeholder={viewMode === 'projects' ? 'Search projects...' : 'Search all timeline entries...'} 
                  type="text"
                />
              </div>

              {/* Projects Sub-Filters */}
              {viewMode === 'projects' && (
                <div className="flex flex-wrap gap-space-2">
                  {['All', 'Ongoing', 'Featured', 'Archived'].map(filter => (
                    <button 
                      key={filter}
                      onClick={() => setCurrentFilter(filter)} 
                      className={`filter-btn px-5 py-2 rounded-full font-label-md transition-all active-scale ${currentFilter === filter ? 'bg-primary text-white border border-primary' : 'border border-outline text-on-surface hover:bg-surface-container-high'}`}
                    >
                      {filter === 'All' ? 'All Projects' : filter}
                    </button>
                  ))}
                </div>
              )}

              {/* Entries Sub-Filters */}
              {viewMode === 'entries' && (
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-4">
                  {/* Type Chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-label-md text-outline uppercase tracking-wider mr-2 text-xs">Type:</span>
                    <button 
                      onClick={() => setActiveTypeFilter('All')} 
                      className={`px-4 py-1.5 rounded-full font-label-md text-xs transition-all active-scale ${activeTypeFilter === 'All' ? 'bg-primary text-white border border-primary' : 'border border-outline text-on-surface hover:bg-surface-container-high'}`}
                    >
                      All Types
                    </button>
                    {getEntryCategories().map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setActiveTypeFilter(cat)} 
                        className={`px-4 py-1.5 rounded-full font-label-md text-xs transition-all active-scale ${activeTypeFilter === cat ? 'bg-primary text-white border border-primary' : 'border border-outline text-on-surface hover:bg-surface-container-high'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-3">
                    <span className="font-label-md text-outline uppercase tracking-wider text-xs">Sort:</span>
                    <select 
                      value={currentSort}
                      onChange={(e) => setCurrentSort(e.target.value)}
                      className="bg-ceramic border-none rounded-full py-1.5 px-4 font-label-md text-xs focus:ring-2 focus:ring-primary-container text-on-surface pr-8 focus:outline-none cursor-pointer"
                    >
                      <option value="date-desc">Date (Newest first)</option>
                      <option value="date-asc">Date (Oldest first)</option>
                      <option value="title-asc">Title (A-Z)</option>
                      <option value="title-desc">Title (Z-A)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Grid Section */}
          {loading ? (
            <div className="py-24 text-center text-outline">
              <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block mb-4"></span>
              <p className="font-headline-md">Loading Melanie's Archive...</p>
            </div>
          ) : (
            <section className="w-full mt-10">
              {viewMode === 'projects' ? (
                // Projects Grid Layout (Brutalist card layout)
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProjects.map((p) => {
                    const statusText = p.status || 'Ongoing';
                    
                    return (
                      <div 
                        key={p.slug} 
                        className="bg-surface rounded-xl card-whisper group cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active-scale w-full text-left scrapbook-card scrapbook-photo-card aspect-square border border-ceramic p-6 flex flex-col justify-between"
                      >
                        <Link href={`/project/${p.slug}`} className="flex flex-col justify-between h-full w-full">
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <span className="bg-green-light text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                Journey
                              </span>
                              <span className="font-label-md text-xs text-outline font-semibold">
                                {statusText}
                              </span>
                            </div>
                            <h3 className="font-headline-serif text-3xl text-primary font-bold leading-tight group-hover:text-primary-container transition-colors line-clamp-3 mt-4">
                              {p.name}
                            </h3>
                          </div>
                          
                          <div className="pt-4 border-t border-ceramic flex justify-between items-center w-full">
                            <span className="font-label-md text-xs uppercase tracking-wider text-secondary font-bold">
                              {p.posts.length} {p.posts.length === 1 ? 'Entry' : 'Entries'}
                            </span>
                            <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">arrow_forward</span>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                  {filteredProjects.length === 0 && (
                    <div className="py-12 text-center text-on-surface-variant col-span-full">
                      <span className="material-symbols-outlined text-5xl mb-4 text-outline">folder_off</span>
                      <p className="font-body-lg">No projects match the active criteria.</p>
                    </div>
                  )}
                </div>
              ) : (
                // Entries Grid Layout (Waterfall notepad cards)
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                  {filteredEntries.map((m) => {
                    const iconName = 'star';
                    const dateStr = formatDate(m.date);
                    const typeVal = m.categories?.nodes?.[0]?.name || 'Note';
                    const labelVal = m.tags?.nodes?.[0]?.name || 'Milestone';
                    
                    const isNoteLayout = !m.featuredImage?.node?.sourceUrl;

                    return (
                      <article 
                        key={m.id}
                        onClick={() => openPostModal(m)}
                        className={`group cursor-pointer overflow-hidden rounded-xl text-left w-full transition-all duration-300 hover:shadow-lg press-active scrapbook-card ${
                          isNoteLayout 
                            ? 'bg-[#faf6ee] border-l-4 border-l-secondary border-t border-r border-b border-outline-variant p-6 scrapbook-notepad-card' 
                            : 'bg-surface-container-lowest border border-outline-variant hover:border-primary-container scrapbook-photo-card'
                        }`}
                      >

                        {isNoteLayout ? (
                          // Notepad card
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <span className="bg-[#faf6ee] text-[#006c47] border border-[#006c47]/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">{typeVal}</span>
                              <div className="flex items-center gap-1 text-[11px] text-outline font-semibold">
                                <span className="material-symbols-outlined text-base">{iconName}</span>
                                <span>{labelVal}</span>
                              </div>
                            </div>
                            <h3 className="font-headline-serif text-lg text-primary font-bold mb-2 group-hover:text-primary-container transition-colors leading-tight">{m.title}</h3>
                            <div 
                              className="font-body-md text-sm text-on-surface-variant leading-relaxed mb-4 line-clamp-4 wordpress-content"
                              dangerouslySetInnerHTML={{ __html: m.content }}
                            />
                            <div className="pt-3 border-t border-ceramic flex justify-between items-center text-xs text-outline">
                              <span className="font-semibold">{dateStr}</span>
                              <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </div>
                          </div>
                        ) : (
                          // Photo card
                          <div className="flex flex-col justify-between h-full">
                            <div className="aspect-video relative overflow-hidden border-b border-ceramic">
                              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={m.featuredImage?.node?.sourceUrl} alt={m.title}/>
                              <div className="absolute top-4 left-4 bg-primary-container text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{typeVal}</div>
                            </div>
                            <div className="p-5 flex-grow flex flex-col justify-between">
                              <div>
                                <span className="font-label-md text-secondary opacity-70 text-xs">{dateStr}</span>
                                <h3 className="font-headline-md text-headline-md text-on-surface mt-2 group-hover:text-primary-container transition-colors text-xl font-bold line-clamp-1">{m.title}</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">{stripHtml(m.content)}</p>
                              </div>
                              <div className="mt-6 pt-4 border-t border-ceramic flex justify-between items-center">
                                <span className="font-label-md text-gold flex items-center gap-1 text-sm font-semibold">
                                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{iconName}</span>
                                  {labelVal}
                                </span>
                                <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">arrow_forward</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                  {filteredEntries.length === 0 && (
                    <div className="py-12 text-center text-on-surface-variant col-span-full">
                      <span className="material-symbols-outlined text-5xl mb-4 text-outline">history</span>
                      <p className="font-body-lg">No entries match the active criteria.</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-space-7 pt-space-6 border-t border-ceramic flex flex-col md:flex-row justify-between items-center text-on-surface-variant gap-space-4 pb-8">
          <p className="font-label-md text-label-md">© 2026 MELANIE'S ARCHIVE. Built with Intention from Headless WordPress.</p>
          <div className="flex gap-space-4">
            <a className="font-label-md hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="font-label-md hover:text-primary transition-colors" href="#">Contact</a>
            <a className="font-label-md hover:text-primary transition-colors" href="#">Instagram</a>
          </div>
        </footer>
      </main>

      {/* Floating Frap CTA (Manifesto button) */}
      <button onClick={toggleManifesto} className="fixed bottom-space-4 right-space-4 w-14 h-14 bg-primary hover:bg-[#005e3a] text-white rounded-full flex items-center justify-center frap-shadow active-scale z-[60] transition-all hover:scale-110" title="Melanie's Manifesto">
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_drink</span>
      </button>

      {/* Manifesto Slide-Over Panel */}
      {manifestoOpen && (
        <div 
          onClick={toggleManifesto}
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${manifestoOpacity ? 'opacity-100' : 'opacity-0'}`}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-canvas-warm p-8 flex flex-col justify-between shadow-2xl border-l border-ceramic transform transition-transform duration-300 ${manifestoOpacity ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div>
              <div className="flex justify-between items-center mb-10">
                <span className="font-headline-md text-headline-md text-primary tracking-widest uppercase">MANIFESTO</span>
                <button className="p-2 hover:bg-ceramic rounded-full active-scale" onClick={toggleManifesto}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <h3 className="font-headline-serif text-3xl text-primary-container mb-6 leading-tight">The Melanie Archive Philosophy</h3>
              <div className="space-y-6 font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                <p className="italic">"Design is not just what it looks like and feels like. Design is how it works... and how it remembers."</p>
                <p>Melanie's Archive treats every project entry as a curated gallery piece, minimizing digital 'noise' to give space for physical monograph craftsmanship and creative focus.</p>
                <p>We embrace raw textures, brutalist grids, and loose typography, creating a digital workspace built with absolute intention.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Lightbox Overlay Modal */}
      {modalOpen && activeModalPost && (
        <div 
          onClick={closePostModal}
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${modalOpacity ? 'opacity-100' : 'opacity-0'}`}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`bg-canvas-warm rounded-2xl max-w-2xl w-full shadow-2xl border border-ceramic transform transition-all duration-300 overflow-y-auto max-h-[90vh] custom-scrollbar ${modalOpacity ? 'scale-100' : 'scale-95'}`}
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-primary-container text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                    {activeModalPost.categories?.nodes?.[0]?.name || 'Archive'}
                  </span>
                  <span className="text-xs font-semibold text-outline px-2.5 py-1 bg-ceramic rounded-full uppercase tracking-wider">
                    {activeModalPost.tags?.nodes?.[0]?.name || 'Milestone'}
                  </span>
                </div>
                <button className="p-2 hover:bg-ceramic rounded-full active-scale" onClick={closePostModal}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              {/* Hero Image Container */}
              {activeModalPost.featuredImage?.node?.sourceUrl && (
                <div className="w-full aspect-video overflow-hidden rounded-xl mb-6 shadow-sm border border-ceramic">
                  <img className="w-full h-full object-cover" src={activeModalPost.featuredImage.node.sourceUrl} alt={activeModalPost.title} />
                </div>
              )}
              
              <span className="font-label-md text-secondary opacity-70 block mb-2">{formatDate(activeModalPost.date)}</span>
              <h3 className="font-headline-serif text-3xl text-primary font-bold mb-4">{activeModalPost.title}</h3>
              
              <div 
                className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-6 wordpress-content"
                dangerouslySetInnerHTML={{ __html: activeModalPost.content }}
              />
              
              <div className="border-t border-ceramic pt-6 flex justify-between items-center">
                <span className="font-label-md text-gold flex items-center gap-1 text-sm font-semibold">
                  <span className="material-symbols-outlined text-[18px]">star</span>
                  {activeModalPost.tags?.nodes?.[1]?.name || 'Archived Spec'}
                </span>
                <button 
                  onClick={() => window.open('http://melanie-archive-backend.local/wp-admin/', '_blank')}
                  className="bg-ceramic hover:bg-[#dcdad5] text-primary px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 active-scale transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit in WP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
