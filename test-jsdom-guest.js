const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const dbPath = path.join(__dirname, 'db.js');
const dbContent = fs.readFileSync(dbPath, 'utf8');

// Extract DEFAULT_PROJECTS from db.js
const startIdx = dbContent.indexOf('const DEFAULT_PROJECTS = [');
const endIdx = dbContent.indexOf('];', startIdx) + 2;
const defaultProjectsStr = dbContent.substring(startIdx + 6, endIdx);
let DEFAULT_PROJECTS = [];
eval('DEFAULT_PROJECTS = ' + defaultProjectsStr);

const htmlPath = path.join(__dirname, 'project-detail.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log("Simulating Guest Mode loading of project-detail.html?id=1...");

const dom = new JSDOM(html, {
    url: 'http://localhost:8080/project-detail.html?id=1',
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window) {
        // Seed localStorage before scripts run
        window.localStorage.setItem('mel_projects', JSON.stringify(DEFAULT_PROJECTS));
        window.localStorage.removeItem('mel_auth'); // Simulate Logged Out / Guest Mode
        window.localStorage.removeItem('mel_user');
    }
});

const { window } = dom;

// Log any unhandled errors during script execution
window.addEventListener('error', (event) => {
    console.error("PAGE RUNTIME ERROR:", event.error || event.message);
});

// Trigger DOMContentLoaded manually
const event = new window.Event('DOMContentLoaded');
window.document.dispatchEvent(event);

console.log("\n--- VERIFICATION OUTPUT ---");
const sidebarNav = window.document.getElementById('sidebar-nav');
const userProfileSec = window.document.getElementById('user-profile-sec');
const headerProfileSec = window.document.getElementById('header-profile-sec');
const milestonesGrid = window.document.getElementById('milestones-grid');

console.log("Sidebar Nav HTML:");
console.log(sidebarNav ? sidebarNav.innerHTML.trim() : "NOT FOUND");

console.log("\nUser Profile Sec HTML:");
console.log(userProfileSec ? userProfileSec.innerHTML.trim() : "NOT FOUND");

console.log("\nHeader Profile Sec HTML:");
console.log(headerProfileSec ? headerProfileSec.innerHTML.trim() : "NOT FOUND");

console.log("\nMilestones Grid children count:", milestonesGrid ? milestonesGrid.children.length : "NOT FOUND");
console.log("--- END VERIFICATION ---\n");

console.log("Completed simulation.");

