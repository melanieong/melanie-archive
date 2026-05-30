/**
 * Melanie's Archive - Local Storage Database & Auth Layer
 * Configured with Supabase Background Sync (Method B)
 */

// --- SUPABASE CONFIGURATION BLOCK ---
// Paste your project values from the Supabase Dashboard here (Settings -> API)
const SUPABASE_URL = "https://qkmdomjrqyavmkaoamny.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrbWRvbWpycXlhdm1rYW9hbW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzc2ODksImV4cCI6MjA5NDk1MzY4OX0.MNEqR8f2YTqgihCwX5bhcKakB5JxT3FtGsK4LWAR2E0"; 

// Initialize Supabase if credentials are provided
let supabaseClient = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY && typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const DEFAULT_PROJECTS = [
    {
        id: "1",
        title: "Learning to be a YouTuber",
        category: "Video / Tech",
        year: "2024",
        status: "Ongoing",
        description: "Documenting the technical and creative hurdles of high-fidelity video production and storytelling.",
        detailedContent: "A comprehensive log of the journey from zero subscribers to a sustainable creative outlet. Documenting gear setup, scripting frameworks, and the emotional roller coaster of public creation.",
        imageUrl: "https://images.unsplash.com/photo-1626379953822-baec19c3bbcd?auto=format&fit=crop&w=800&q=80",
        milestones: [
            {
                title: "Week 01: The Gear Setup",
                date: "Jan 12, 2024",
                description: "Finally unboxing the Sony A7CII and setting up the Elgato key lights. First impressions of the 'studio' space.",
                type: "Video",
                label: "Milestone: Launch",
                icon: "flag",
                isNote: false,
                imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80"
            },
            {
                title: "Week 02: Scripting & Hooks",
                date: "Jan 19, 2024",
                description: "Learning the 3-act structure for educational content. Notes on why the first 30 seconds are critical to keep viewers. Must work on emotional pacing transitions and stronger hook structures to avoid high dropoffs.",
                type: "Note",
                label: "Written Log",
                icon: "history_edu",
                isNote: true
            },
            {
                title: "Week 03: The First Edit",
                date: "Jan 26, 2024",
                description: "Fighting with Premiere Pro. A visual storyboard of how I want my B-roll to flow compared to the actual raw footage gathered.",
                type: "Sketch",
                label: "Milestone: Edit Flow",
                icon: "star",
                isNote: false,
                imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80"
            },
            {
                title: "Week 04: Voice & Persona",
                date: "Feb 02, 2024",
                description: "Finding my 'on-camera' personality. Reviewing the first 10 takes of a simple introduction. It feels rigid but gets better once I relax my shoulders and look slightly above the lens.",
                type: "Note",
                label: "Written Log",
                icon: "person",
                isNote: true
            }
        ]
    },
    {
        id: "2",
        title: "Classical Drawing Skills",
        category: "Drawing / Traditional",
        year: "2023",
        status: "Featured",
        description: "A 365-day challenge focusing on human anatomy and urban sketching using traditional media.",
        detailedContent: "A meticulous exploration of charcoal, graphite, and raw media over a consecutive 365-day tracking cycle. Focus is placed on structural anatomy, architectural forms under ambient lighting, and developing muscle memory for dynamic gestures.",
        imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80",
        milestones: [
            {
                title: "Day 01: The Canvas",
                date: "Jan 01, 2023",
                description: "Initial gesture sketches focusing on loose charcoal lines and basic spatial proportion grids.",
                type: "Sketch",
                label: "Launch",
                icon: "flag",
                isNote: false,
                imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80"
            },
            {
                title: "Day 100: Structural Anatomy Notes",
                date: "Apr 10, 2023",
                description: "Deep study of muscular intersections in hands, feet, and faces. Important to remember that hand skeletal lines follow minor ellipses. Practiced gesture holds under 30 seconds to force muscle-memory focus.",
                type: "Note",
                label: "Written Log",
                icon: "star",
                isNote: true
            }
        ]
    },
    {
        id: "3",
        title: "Identity Systems",
        category: "Design / Brand",
        year: "2024",
        status: "Featured",
        description: "Exploring how visual rhythm and color blocking define the flagship experience in digital products.",
        detailedContent: "Analyzing and defining modern branding through clean typography, modular grids, and tactile physical elements. Translating structural monographs into high-fidelity web and product layouts.",
        imageUrl: "https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?auto=format&fit=crop&w=800&q=80",
        milestones: [
            {
                title: "Phase 1: Grid Systems",
                date: "Mar 15, 2024",
                description: "Formulating strict typographic layouts using Libre Caslon and DM Sans. Alignment metrics testing.",
                type: "Design",
                label: "Foundation",
                icon: "grid_view",
                isNote: false,
                imageUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80"
            },
            {
                title: "Type Selection Philosophy",
                date: "Mar 22, 2024",
                description: "Caslon represents heritage and intent, while DM Sans aligns spacing and legibility across layouts. Combining them creates a rhythmic interplay of historical reference and modern performance.",
                type: "Note",
                label: "Written Log",
                icon: "history_edu",
                isNote: true
            }
        ]
    },
    {
        id: "4",
        title: "Retail Rituals",
        category: "Photography / Spatial",
        year: "Ongoing",
        status: "Ongoing",
        description: "A photographic essay on the sensory details of physical flagship stores and their impact on customer dwell time.",
        detailedContent: "Documenting spatial volume, lighting dynamics, and texture variations in high-end design environments. This project captures the interaction between humans and minimalist spaces.",
        imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80",
        milestones: [
            {
                title: "Location 1: The Glass House",
                date: "May 01, 2024",
                description: "Capturing early morning lighting refraction off polished concrete and glass partitions.",
                type: "Photo",
                label: "Capture",
                icon: "photo_camera",
                isNote: false,
                imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80"
            },
            {
                title: "Lighting Reflection Logs",
                date: "May 10, 2024",
                description: "Noticeable shifts in customer behavior under morning ambient light vs heavy artificial afternoon overheads. Concrete holds heat and provides a solid base sensory anchor that naturally slows stride lengths.",
                type: "Note",
                label: "Written Log",
                icon: "edit_note",
                isNote: true
            }
        ]
    },
    {
        id: "5",
        title: "Space & Volume",
        category: "Architecture / Brutalist",
        year: "2023",
        status: "Archived",
        description: "Studying the intersection of brutalist architecture and organic materials in modern workspace design.",
        detailedContent: "An extensive visual study of concrete monoliths contrasted with lush green spaces, analyzing how structural scale can evoke peace, focus, and modern design excellence.",
        imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        milestones: [
            {
                title: "Monograph 1: Raw Concrete",
                date: "Sep 12, 2023",
                description: "Detailed textures of board-formed concrete slabs juxtaposed with organic warm wood features.",
                type: "Architecture",
                label: "Completed",
                icon: "check_circle",
                isNote: false,
                imageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80"
            },
            {
                title: "Monotony and Restraint",
                date: "Sep 20, 2023",
                description: "Brutalist structures rely heavily on restraint. By limiting structural materials to pure board-formed concrete and white oak, we allow the eye to trace pure shadow casting and volumetric gaps.",
                type: "Note",
                label: "Written Log",
                icon: "inventory_2",
                isNote: true
            }
        ]
    }
];

class MelanieDB {
    constructor() {
        this.supabase = supabaseClient;

        let existing = localStorage.getItem("mel_projects");
        if (!existing || existing === "[]" || existing === "null") {
            localStorage.setItem("mel_projects", JSON.stringify(DEFAULT_PROJECTS));
        }

        // Trigger background sync if Supabase is initialized
        if (this.supabase) {
            this.syncFromSupabase();
        }
    }

    async syncFromSupabase() {
        if (!this.supabase) return;
        try {
            const { data, error } = await this.supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: true });
            
            if (error) throw error;

            if (data) {
                if (data.length === 0) {
                    console.log("Supabase projects table is empty. Seeding default projects to Supabase...");
                    const seedData = JSON.parse(localStorage.getItem("mel_projects")) || DEFAULT_PROJECTS;
                    const projectsToSeed = seedData.length > 0 ? seedData : DEFAULT_PROJECTS;
                    
                    for (const p of projectsToSeed) {
                        try {
                            await this.supabase.from('projects').insert({
                                id: p.id,
                                title: p.title,
                                category: p.category,
                                year: p.year,
                                status: p.status,
                                description: p.description,
                                detailedContent: p.detailedContent,
                                imageUrl: p.imageUrl,
                                milestones: p.milestones
                            });
                        } catch (err) {
                            console.error(`Failed to seed project ${p.title}:`, err);
                        }
                    }
                } else {
                    // Update the local cache with the remote projects
                    localStorage.setItem("mel_projects", JSON.stringify(data));
                }
                
                // Smoothly re-render UI views dynamically
                if (typeof renderProjects === 'function') renderProjects();
                if (typeof loadProjectDetails === 'function') loadProjectDetails();
                if (typeof renderTable === 'function') renderTable();
                if (typeof loadDashboardStats === 'function') loadDashboardStats();
            }
        } catch(e) {
            console.error("Supabase sync failed (using local fallback cache):", e);
        }
    }

    // Dynamic entry categories management
    getCategories() {
        let cats = localStorage.getItem("mel_categories");
        if (!cats || cats === "null") {
            cats = JSON.stringify(['Note']); // Default to Note only
            localStorage.setItem("mel_categories", cats);
        }
        try {
            const parsed = JSON.parse(cats);
            if (Array.isArray(parsed)) {
                const clean = parsed.filter(c => c && typeof c === 'string' && c.trim() !== '');
                return clean.length > 0 ? clean : ['Note'];
            }
            return ['Note'];
        } catch (e) {
            return ['Note'];
        }
    }

    addCategory(name) {
        const cats = this.getCategories();
        const clean = name.trim();
        if (clean && !cats.includes(clean)) {
            cats.push(clean);
            localStorage.setItem("mel_categories", JSON.stringify(cats));
            return true;
        }
        return false;
    }

    deleteCategory(name) {
        let cats = this.getCategories();
        if (name !== 'Note') {
            cats = cats.filter(c => c !== name);
            localStorage.setItem("mel_categories", JSON.stringify(cats));
            return true;
        }
        return false;
    }

    // Projects CRUD
    getProjects() {
        let val = localStorage.getItem("mel_projects");
        if (!val || val === "null") return [];
        try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    getProjectById(id) {
        const projects = this.getProjects();
        return projects.find(p => p.id === id);
    }

    async addProject(projectData) {
        const projects = this.getProjects();
        const newProject = {
            id: Date.now().toString(),
            milestones: [],
            ...projectData
        };
        projects.push(newProject);
        localStorage.setItem("mel_projects", JSON.stringify(projects));

        // Sync to Supabase in the background
        if (this.supabase) {
            try {
                const { error } = await this.supabase
                    .from('projects')
                    .insert({
                        id: newProject.id,
                        title: newProject.title,
                        category: newProject.category,
                        year: newProject.year,
                        status: newProject.status,
                        description: newProject.description,
                        detailedContent: newProject.detailedContent,
                        imageUrl: newProject.imageUrl,
                        milestones: newProject.milestones
                    });
                if (error) console.error("Supabase insert failed:", error);
            } catch (e) {
                console.error("Supabase insert exception:", e);
            }
        }

        return newProject;
    }

    async updateProject(id, updatedData) {
        const projects = this.getProjects();
        const index = projects.findIndex(p => p.id === id);
        if (index !== -1) {
            projects[index] = { ...projects[index], ...updatedData };
            localStorage.setItem("mel_projects", JSON.stringify(projects));

            // Sync to Supabase in the background
            if (this.supabase) {
                const cleanData = { ...updatedData };
                delete cleanData.created_at; // strip timestamps

                try {
                    const { error } = await this.supabase
                        .from('projects')
                        .update(cleanData)
                        .eq('id', id);
                    if (error) console.error("Supabase update failed:", error);
                } catch (e) {
                    console.error("Supabase update exception:", e);
                }
            }

            return projects[index];
        }
        return null;
    }

    async deleteProject(id) {
        let projects = this.getProjects();
        projects = projects.filter(p => p.id !== id);
        localStorage.setItem("mel_projects", JSON.stringify(projects));

        // Sync to Supabase in the background
        if (this.supabase) {
            try {
                const { error } = await this.supabase
                    .from('projects')
                    .delete()
                    .eq('id', id);
                if (error) console.error("Supabase delete failed:", error);
            } catch (e) {
                console.error("Supabase delete exception:", e);
            }
        }

        return true;
    }

    // Dynamic Auth system
    login(email, password) {
        // Sample credentials matching standard prototype defaults
        if (email.toLowerCase() === "mxtong28@gmail.com" && password === "melanie'spassword") {
            localStorage.setItem("mel_auth", "true");
            localStorage.setItem("mel_user", JSON.stringify({ name: "Melanie O.", email: email }));
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem("mel_auth");
        localStorage.removeItem("mel_user");
    }

    isAuthenticated() {
        return localStorage.getItem("mel_auth") === "true";
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem("mel_user")) || { name: "Guest" };
    }
}

// Global Instantiation
const db = new MelanieDB();
window.db = db;
