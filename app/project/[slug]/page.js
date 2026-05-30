"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchWordPressPostBySlug, fetchWordPressPosts } from '../../../lib/wordpress';

export default function ProjectDetailPage({ params }) {
  const { slug } = params;
  const [post, setPost] = useState(null);
  const [relatedMilestones, setRelatedMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('gallery'); // 'gallery', 'grid', 'list'
  const [activeTypeFilter, setActiveTypeFilter] = useState('All');
  const [currentSort, setCurrentSort] = useState('date-desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lightbox Modal State
  const [activeModalPost, setActiveModalPost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpacity, setModalOpacity] = useState(false);

  useEffect(() => {
    async function loadData() {
      const mainPost = await fetchWordPressPostBySlug(slug);
      setPost(mainPost);

      // Fetch all posts, mapping categories to simulate a timeline of milestones
      const allPosts = await fetchWordPressPosts();
      // Related milestones are simulated by other posts sharing some category/tag tags
      const currentCategory = mainPost?.categories?.nodes?.[0]?.name || '';
      const related = allPosts.filter(p => 
        p.id !== mainPost?.id && 
        p.categories?.nodes?.some(c => c.name === currentCategory)
      );
      setRelatedMilestones(related.length > 0 ? related : allPosts.slice(0, 3));
      
      setLoading(false);
    }
    loadData();
  }, [slug]);

  // Date formatting helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Ongoing';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const stripHtml = (htmlStr) => {
    if (!htmlStr) return '';
    return htmlStr.replace(/<\/?[^>]+(>|$)/g, "").trim();
  };

  // Extract milestones categories (types)
  const getMilestoneCategories = () => {
    const cats = new Set();
    relatedMilestones.forEach(m => {
      m.categories?.nodes?.forEach(c => {
        cats.add(c.name);
      });
    });
    return Array.from(cats);
  };

  // Helper to open Lightbox Modal
  const openPostModal = (mPost) => {
    setActiveModalPost(mPost);
    setModalOpen(true);
    setTimeout(() => {
      setActiveModalPost(mPost);
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

  // Filtered and Sorted Milestones
  const getFilteredMilestones = () => {
    let list = [...relatedMilestones];

    // Search filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => 
        m.title.toLowerCase().includes(q) || 
        stripHtml(m.content).toLowerCase().includes(q)
      );
    }

    // Type filter
    if (activeTypeFilter !== 'All') {
      list = list.filter(m => 
        m.categories?.nodes?.some(c => c.name.toLowerCase() === activeTypeFilter.toLowerCase())
      );
    }

    // Sorting
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

  const filteredMilestones = getFilteredMilestones();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas-warm text-primary font-headline-md">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block mr-3"></span>
        Loading Monograph Details...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-canvas-warm gap-4 text-center">
        <span className="material-symbols-outlined text-5xl text-outline">error</span>
        <h2 className="font-headline-lg text-primary">Monograph Not Found</h2>
        <Link href="/" className="bg-primary text-white px-6 py-2.5 rounded-full font-label-md hover:bg-primary-container active-scale transition-all">
          Return Overview
        </Link>
      </div>
    );
  }

  const featuredImgUrl = post.featuredImage?.node?.sourceUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden page-fade-in font-body-md bg-canvas-warm">
      
      {/* Persistent SideNavBar Shell */}
      <aside className="w-full md:w-64 h-auto md:h-screen bg-canvas-warm border-b md:border-r border-ceramic flex flex-col py-4 px-4 md:py-space-4 md:px-space-2 flex-shrink-0 overflow-y-auto custom-scrollbar z-50">
        <div className="flex md:flex-col justify-between items-center md:items-start mb-0 md:mb-space-6 cursor-pointer w-full">
          
          {/* Logo container with signature ml-2 margin */}
          <div className="ml-2">
            <Link href="/">
              <h1 className="font-headline-lg text-xl md:text-headline-lg tracking-tighter text-primary leading-tight">MELANIE'S ARCHIVE</h1>
              <p className="font-label-md text-xs md:text-label-md text-on-surface-variant opacity-70">Creative Archive</p>
            </Link>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-ceramic rounded-full active-scale flex items-center justify-center">
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
        
        {/* Sidebar Navigation Container */}
        <nav className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-grow space-y-2 md:space-y-space-1 w-full mt-4 md:mt-0 pb-4 md:pb-0`}>
          <Link href="/" className="flex items-center gap-space-3 py-space-2 rounded-lg text-on-surface-variant pl-4 hover:bg-ceramic transition-colors active-scale">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md">Overview</span>
          </Link>
          <a href="#" onClick={(e) => { e.preventDefault(); alert("Admin Mode is secured via WordPress Dashboard."); }} className="flex items-center gap-space-3 py-space-2 rounded-lg text-primary font-bold border-r-4 border-primary pl-4 hover:bg-ceramic transition-colors active-scale">
            <span className="material-symbols-outlined">folder_open</span>
            <span className="font-label-md text-label-md">Projects</span>
          </a>
          <a href="http://melanie-archive-backend.local/wp-admin/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-space-3 py-space-2 rounded-lg text-on-surface-variant pl-4 hover:bg-ceramic transition-colors active-scale">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">WP Admin</span>
          </a>
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
      <main className="flex-grow h-screen overflow-y-auto custom-scrollbar py-space-2 px-space-6 md:py-space-3 md:px-space-7 max-w-[1600px] flex flex-col">
        
        {/* Top Header Navigation */}
        <header className="flex justify-between items-center mb-space-3 w-full flex-shrink-0 mt-4 md:mt-0">
          <div>
            <span className="font-script-touch text-script-touch text-secondary italic mb-2 block">Curated Collection</span>
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
            <button className="p-2 hover:bg-surface-container rounded-full transition-colors active-scale" onClick={() => alert('No new notifications.')}>
              <span className="material-symbols-outlined text-primary">notifications</span>
            </button>
            <div className="flex items-center">
              <a href="http://melanie-archive-backend.local/wp-login.php" target="_blank" rel="noopener noreferrer" className="p-2 hover:opacity-80 transition-opacity cursor-pointer text-secondary flex items-center justify-center" title="Sign In">
                <span className="material-symbols-outlined text-2xl">account_circle</span>
              </a>
            </div>
          </div>
        </header>

        {/* Inner Content Area */}
        <div className="flex-grow">
          <section className="py-12">
            <div className="max-w-6xl mx-auto">
              
              {/* Breadcrumbs and Header */}
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 text-left">
                <div>
                  <nav className="flex gap-2 text-label-md text-outline mb-2">
                    <Link className="hover:text-primary" href="/">Projects</Link>
                    <span>/</span>
                    <span className="text-secondary">{post.categories?.nodes?.[0]?.name || 'Project Details'}</span>
                  </nav>
                  <h2 className="font-headline-lg text-headline-lg text-primary-container mb-4">{post.title}</h2>
                  <div 
                    className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>
                
                <div className="flex gap-3">
                  <div className="bg-green-light px-4 py-2 rounded-lg flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-label-md">{filteredMilestones.length} Milestones</span>
                  </div>
                  <div className="bg-ceramic px-4 py-2 rounded-lg flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                    <span className="font-label-md">{formatDate(post.date)}</span>
                  </div>
                </div>
              </div>

              {/* Hero Project Image Banner */}
              <div className="w-full h-96 overflow-hidden rounded-xl mb-12 shadow-sm border border-ceramic">
                <img className="w-full h-full object-cover" src={featuredImgUrl} alt={post.title}/>
              </div>

              {/* Filter Timeline Bar */}
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex flex-col lg:flex-row lg:items-center justify-between gap-space-4 relative shadow-sm text-left">
                
                {/* Type Chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-label-md text-outline uppercase tracking-wider mr-2 text-xs">Type:</span>
                  <button 
                    onClick={() => setActiveTypeFilter('All')} 
                    className={`px-4 py-1.5 rounded-full font-label-md text-xs transition-all active-scale ${activeTypeFilter === 'All' ? 'bg-primary text-white border border-primary' : 'border border-outline text-on-surface hover:bg-surface-container-high'}`}
                  >
                    All Types
                  </button>
                  {getMilestoneCategories().map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveTypeFilter(cat)} 
                      className={`px-4 py-1.5 rounded-full font-label-md text-xs transition-all active-scale ${activeTypeFilter === cat ? 'bg-primary text-white border border-primary' : 'border border-outline text-on-surface hover:bg-surface-container-high'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Sort & View Controls */}
                <div className="flex flex-wrap items-center gap-4">
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

                  <div className="h-6 w-[1px] bg-ceramic hidden lg:block"></div>

                  {/* View Modes */}
                  <div className="flex items-center gap-3">
                    <span className="font-body-md text-on-surface-variant text-xs font-semibold">View:</span>
                    <button 
                      onClick={() => setViewMode('gallery')} 
                      className={`p-2 rounded-lg transition-all active-scale ${viewMode === 'gallery' ? 'text-primary bg-green-light' : 'text-outline hover:bg-ceramic hover:text-primary'}`} 
                      title="Gallery View"
                    >
                      <span className="material-symbols-outlined text-[20px]">dashboard</span>
                    </button>
                    <button 
                      onClick={() => setViewMode('grid')} 
                      className={`p-2 rounded-lg transition-all active-scale ${viewMode === 'grid' ? 'text-primary bg-green-light' : 'text-outline hover:bg-ceramic hover:text-primary'}`} 
                      title="Grid View"
                    >
                      <span className="material-symbols-outlined text-[20px]">grid_view</span>
                    </button>
                    <button 
                      onClick={() => setViewMode('list')} 
                      className={`p-2 rounded-lg transition-all active-scale ${viewMode === 'list' ? 'text-primary bg-green-light' : 'text-outline hover:bg-ceramic hover:text-primary'}`} 
                      title="List View"
                    >
                      <span className="material-symbols-outlined text-[20px]">view_list</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Post Milestones Grid */}
              <div className={`mt-16 text-left ${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
                  : viewMode === 'list' 
                    ? 'flex flex-col gap-6 max-w-4xl mx-auto' 
                    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start'
              }`}>
                
                {filteredMilestones.map((m) => {
                  const iconName = 'star';
                  const dateStr = formatDate(m.date);
                  const typeVal = m.categories?.nodes?.[0]?.name || 'Note';
                  const labelVal = m.tags?.nodes?.[0]?.name || 'Milestone';
                  
                  const isNoteLayout = !m.featuredImage?.node?.sourceUrl;

                  if (viewMode === 'list') {
                    return (
                      <div 
                        key={m.id}
                        onClick={() => openPostModal(m)}
                        className="bg-surface-container-lowest border border-outline-variant hover:border-primary-container p-5 rounded-xl cursor-pointer hover:shadow-md transition-all active-scale flex items-center justify-between gap-4 w-full"
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <span className="material-symbols-outlined text-secondary text-2xl flex-shrink-0">history_edu</span>
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-on-surface truncate text-base leading-tight">{m.title}</h4>
                            <p className="text-xs text-outline font-semibold mt-0.5">{dateStr} &bull; {typeVal} &bull; {labelVal}</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-outline">chevron_right</span>
                      </div>
                    );
                  }

                  return (
                    <article 
                      key={m.id}
                      onClick={() => openPostModal(m)}
                      className={`group cursor-pointer overflow-hidden rounded-xl text-left w-full transition-all duration-300 hover:shadow-lg press-active ${
                        isNoteLayout 
                          ? 'bg-[#faf6ee] border-l-4 border-l-secondary border-t border-r border-b border-outline-variant p-6' 
                          : 'bg-surface-container-lowest border border-outline-variant hover:border-primary-container'
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
                            className="font-body-md text-sm text-on-surface-variant leading-relaxed mb-4 line-clamp-4"
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

                {filteredMilestones.length === 0 && (
                  <div className="py-12 text-center text-on-surface-variant col-span-full">
                    <span className="material-symbols-outlined text-5xl mb-4 text-outline">history</span>
                    <p className="font-body-lg">No entries match the active criteria.</p>
                  </div>
                )}
              </div>

            </div>
          </section>
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
                className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-6 whitespace-pre-wrap"
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
