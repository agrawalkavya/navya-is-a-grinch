// Section configuration
const sections = [
    { id: 'losing-it', prefix: 'A', name: 'losing it' },
    { id: 'explore', prefix: 'B', name: 'explore' },
    { id: 'stars', prefix: 'C', name: 'STARS' },
    { id: 'more-stars', prefix: 'D', name: 'more stars' },
    { id: 'blue', prefix: 'E', name: 'blue' }
];

let currentSection = 'losing-it';
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

let allImages = []; // Store all loaded images for star mode

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupLightbox();
    setupProfileModal();
    setupBirthdayMessage();
    setupStarMode();
    loadImages();
});

// Setup navigation buttons
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            switchSection(section);
            
            // Update active state
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Switch between sections
function switchSection(sectionId) {
    currentSection = sectionId;
    const items = document.querySelectorAll('.masonry-item');
    
    items.forEach(item => {
        if (item.dataset.section === sectionId) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
    
    // Update section titles visibility
    updateSectionTitles();
    
    // If star mode is active, recreate stars with new section
    if (document.body.classList.contains('star-mode')) {
        createStars();
    }
}

// Load images from the images folder
async function loadImages() {
    const container = document.getElementById('masonry-container');
    
    for (const section of sections) {
        // Add section title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'section-title';
        titleDiv.textContent = section.name;
        titleDiv.dataset.section = section.id;
        titleDiv.style.display = section.id === 'losing-it' ? 'block' : 'none';
        container.appendChild(titleDiv);
        
        // Try to load images for this section
        let imageNum = 1;
        let imagesFound = false;
        
        while (imageNum <= 100) { // Try up to 100 images per section
            const imageName = `${section.prefix}${imageNum}`;
            let imageLoaded = false;
            
            // Try different extensions
            for (const ext of imageExtensions) {
                const imagePath = `images/${imageName}.${ext}`;
                const img = new Image();
                
                await new Promise((resolve) => {
                    img.onload = () => {
                        createImageItem(imagePath, imageName, section.id, container);
                        imagesFound = true;
                        imageLoaded = true;
                        resolve();
                    };
                    img.onerror = () => {
                        resolve();
                    };
                    img.src = imagePath;
                });
                
                if (imageLoaded) break;
            }
            
            if (!imageLoaded) break; // No more images for this section
            imageNum++;
        }
    }
    
    // Initially show only the first section
    switchSection('losing-it');
}

// Create an image item in the masonry layout
function createImageItem(imagePath, imageName, sectionId, container) {
    const item = document.createElement('div');
    item.className = 'masonry-item';
    item.dataset.section = sectionId;
    
    if (sectionId !== 'losing-it') {
        item.classList.add('hidden');
    }
    
    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = imageName;
    img.loading = 'lazy';
    
    // Make image clickable
    item.addEventListener('click', () => {
        openLightbox(imagePath);
    });
    
    item.appendChild(img);
    container.appendChild(item);
    
    // Store image data for star mode
    allImages.push({
        path: imagePath,
        name: imageName,
        section: sectionId
    });
    
    // Wait for image to load to get actual dimensions for better layout
    img.onload = () => {
        // Image loaded, masonry will handle layout naturally
    };
}

// Update section titles visibility
function updateSectionTitles() {
    const titles = document.querySelectorAll('.section-title');
    titles.forEach(title => {
        if (title.dataset.section === currentSection) {
            title.style.display = 'block';
        } else {
            title.style.display = 'none';
        }
    });
}

// Lightbox functionality
function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const downloadBtn = document.getElementById('lightbox-download');
    
    closeBtn.addEventListener('click', closeLightbox);
    downloadBtn.addEventListener('click', downloadImage);
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-image-container')) {
            closeLightbox();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.style.display === 'block') {
            closeLightbox();
        }
    });
}

function downloadImage() {
    const lightboxImg = document.getElementById('lightbox-img');
    const imagePath = lightboxImg.src;
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = imagePath;
    link.download = imagePath.split('/').pop() || 'image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function openLightbox(imagePath) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = imagePath;
    lightbox.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Store current image path for download
    lightboxImg.dataset.downloadPath = imagePath;
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Profile modal functionality
function setupProfileModal() {
    const profileIcon = document.getElementById('profile-icon');
    const modal = document.getElementById('profile-modal');
    const closeBtn = document.querySelector('.modal-close');
    
    profileIcon.addEventListener('click', () => {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Birthday message functionality
function setupBirthdayMessage() {
    const helpBtn = document.getElementById('help-btn');
    const birthdayMessage = document.getElementById('birthday-message');
    const closeBtn = document.querySelector('.birthday-close');
    
    helpBtn.addEventListener('click', () => {
        const isOpen = birthdayMessage.style.display === 'block';
        if (!isOpen) {
            birthdayMessage.style.display = 'block';
            helpBtn.classList.add('active');
        } else {
            birthdayMessage.style.display = 'none';
            helpBtn.classList.remove('active');
        }
    });
    
    closeBtn.addEventListener('click', () => {
        birthdayMessage.style.display = 'none';
        helpBtn.classList.remove('active');
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && birthdayMessage.style.display === 'block') {
            birthdayMessage.style.display = 'none';
            helpBtn.classList.remove('active');
        }
    });
}

// Star mode functionality
function setupStarMode() {
    const starToggle = document.getElementById('star-mode-toggle');
    const starContainer = document.getElementById('star-mode-container');
    
    starToggle.addEventListener('click', () => {
        const isActive = document.body.classList.toggle('star-mode');
        starToggle.classList.toggle('active', isActive);
        
        if (isActive) {
            createStars();
        } else {
            clearStars();
        }
    });
    
    // Recreate stars on window resize if star mode is active
    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (document.body.classList.contains('star-mode')) {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                createStars();
            }, 250);
        }
    });
}

function createStars() {
    const starContainer = document.getElementById('star-mode-container');
    starContainer.innerHTML = '';
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Filter images by current section
    const currentSectionImages = allImages.filter(img => img.section === currentSection);
    
    // Create stars from current section images
    currentSectionImages.forEach((imageData, index) => {
        const star = document.createElement('div');
        star.className = 'star-item';
        
        const img = document.createElement('img');
        img.src = imageData.path;
        img.alt = imageData.name;
        
        // Random position (avoid edges)
        const margin = 100;
        const randomX = margin + Math.random() * (viewportWidth - margin * 2 - 200);
        const randomY = margin + Math.random() * (viewportHeight - margin * 2 - 200);
        
        star.style.left = `${randomX}px`;
        star.style.top = `${randomY}px`;
        
        // Random animation delay and duration for variety
        const delay = Math.random() * 3;
        const duration = 12 + Math.random() * 8; // 12-20 seconds for smoother continuous movement
        star.style.animationDelay = `${delay}s`;
        star.style.animationDuration = `${duration}s`;
        
        // Random size variation
        const size = 100 + Math.random() * 100; // 100-200px
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Make clickable
        star.addEventListener('click', () => {
            openLightbox(imageData.path);
        });
        
        star.appendChild(img);
        starContainer.appendChild(star);
    });
}

function clearStars() {
    const starContainer = document.getElementById('star-mode-container');
    starContainer.innerHTML = '';
}

