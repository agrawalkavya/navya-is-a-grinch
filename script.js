// Section configuration
const sections = [
    { id: 'losing-it', prefix: 'A', name: 'your fav' },
    { id: 'explore', prefix: 'B', name: 'stars' },
    { id: 'stars', prefix: 'C', name: 'coffee' },
    { id: 'more-stars', prefix: 'D', name: 'crashing out' },
    { id: 'blue', prefix: 'E', name: 'misc.' }
];

let currentSection = 'losing-it';
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

let allImages = []; // Store all loaded images for star mode

let cart = []; // Shopping cart

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupLightbox();
    setupProfileModal();
    setupBirthdayMessage();
    setupStarMode();
    setupMerchStore();
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
        let consecutiveFailures = 0;
        const maxConsecutiveFailures = 5; // Allow up to 5 consecutive missing images before stopping
        
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
                        imageLoaded = true;
                        consecutiveFailures = 0; // Reset failure counter on success
                        resolve();
                    };
                    img.onerror = () => {
                        resolve();
                    };
                    img.src = imagePath;
                });
                
                if (imageLoaded) break;
            }
            
            if (!imageLoaded) {
                consecutiveFailures++;
                // Only stop if we've had many consecutive failures
                if (consecutiveFailures >= maxConsecutiveFailures) {
                    break;
                }
            }
            
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

// Merch Store functionality
// Merch items - images are in merch-store folder named 3.png, 4.png, 5.png, etc.
// 20 items total (3.png through 22.png)
// Descriptions will be added by user
const merchItems = [
    { id: 3, name: "designed by navya", description: "designed by navya", image: "merch-store/3.png", price: 69.69 },
    { id: 4, name: "designed for khuntia", description: "designed for khuntia", image: "merch-store/4.png", price: 69.69 },
    { id: 5, name: "designed for kavya", description: "designed for kavya", image: "merch-store/5.png", price: 69.69 },
    { id: 6, name: "conrad baby", description: "conrad baby", image: "merch-store/6.png", price: 69.69 },
    { id: 7, name: "designed for road rage", description: "designed for road rage", image: "merch-store/7.png", price: 69.69 },
    { id: 8, name: "designed for kavya", description: "designed for kavya", image: "merch-store/8.png", price: 69.69 },
    { id: 9, name: "designed for times ke bache (mostly kavya)", description: "designed for times ke bache (mostly kavya)", image: "merch-store/9.png", price: 69.69 },
    { id: 10, name: "designed for everyday use", description: "designed for everyday use", image: "merch-store/10.png", price: 69.69 },
    { id: 11, name: "designed by arima", description: "designed by arima", image: "merch-store/11.png", price: 69.69 },
    { id: 12, name: "designed for beloved creatures", description: "designed for beloved creatures", image: "merch-store/12.png", price: 69.69 },
    { id: 13, name: "designed for arima", description: "designed for arima", image: "merch-store/13.png", price: 69.69 },
    { id: 14, name: "designed by ritwij", description: "designed by ritwij", image: "merch-store/14.png", price: 69.69 },
    { id: 15, name: "designed by ritwij", description: "designed by ritwij", image: "merch-store/15.png", price: 69.69 },
    { id: 16, name: "designed by ritwij", description: "designed by ritwij", image: "merch-store/16.png", price: 69.69 },
    { id: 17, name: "designed by ritwij", description: "designed by ritwij", image: "merch-store/17.png", price: 69.69 },
    { id: 18, name: "designed by ritwij", description: "designed by ritwij", image: "merch-store/18.png", price: 69.69 }
];

function setupMerchStore() {
    const merchBtn = document.getElementById('merch-btn');
    const merchModal = document.getElementById('merch-modal');
    const closeBtn = merchModal.querySelector('.modal-close');
    const printBtn = document.getElementById('print-receipt-btn');
    
    // Load merch items
    loadMerchItems();
    
    merchBtn.addEventListener('click', () => {
        merchModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
    
    closeBtn.addEventListener('click', () => {
        merchModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    merchModal.addEventListener('click', (e) => {
        if (e.target === merchModal) {
            merchModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    printBtn.addEventListener('click', printReceipt);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && merchModal.style.display === 'block') {
            merchModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

function loadMerchItems() {
    const merchGrid = document.getElementById('merch-grid');
    merchGrid.innerHTML = '';
    
    merchItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'merch-card';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.description}" class="merch-card-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22250%22 height=%22200%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22250%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3E${item.description}%3C/text%3E%3C/svg%3E';">
            <div class="merch-card-content">
                <div class="merch-card-title">${item.description}</div>
                <div class="merch-card-price">$${item.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" data-id="${item.id}">Add to Cart</button>
            </div>
        `;
        
        const addBtn = card.querySelector('.add-to-cart-btn');
        addBtn.addEventListener('click', () => addToCart(item));
        
        merchGrid.appendChild(card);
    });
}

function addToCart(item) {
    cart.push(item);
    updateCartUI();
    
    // Visual feedback
    const buttons = document.querySelectorAll(`.add-to-cart-btn[data-id="${item.id}"]`);
    buttons.forEach(btn => {
        btn.textContent = 'Added!';
        btn.classList.add('added');
        setTimeout(() => {
            btn.textContent = 'Add to Cart';
            btn.classList.remove('added');
        }, 2000);
    });
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const printBtn = document.getElementById('print-receipt-btn');
    
    cartCount.textContent = cart.length;
    
    if (cart.length > 0) {
        printBtn.style.display = 'block';
    } else {
        printBtn.style.display = 'none';
    }
}

function printReceipt() {
    if (cart.length === 0) return;
    
    const receiptWindow = window.open('', '_blank');
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Navya's Merch - Receipt</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    padding: 40px;
                    max-width: 700px;
                    margin: 0 auto;
                    background: white;
                }
                .stars-decoration {
                    text-align: center;
                    color: #ffd700;
                    font-size: 20px;
                    margin: 10px 0;
                    letter-spacing: 8px;
                }
                .receipt-header {
                    text-align: center;
                    border-bottom: 3px solid #001b48;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                    position: relative;
                }
                .receipt-header::before,
                .receipt-header::after {
                    content: '⭐';
                    position: absolute;
                    top: 10px;
                    font-size: 24px;
                    color: #ffd700;
                }
                .receipt-header::before {
                    left: 20px;
                }
                .receipt-header::after {
                    right: 20px;
                }
                .receipt-header h1 {
                    color: #001b48;
                    font-size: 32px;
                    margin: 0 0 10px 0;
                }
                .receipt-header p {
                    color: #666;
                    margin: 5px 0;
                }
                .receipt-items {
                    margin: 30px 0;
                }
                .receipt-item {
                    display: flex;
                    gap: 20px;
                    padding: 20px 0;
                    border-bottom: 1px solid #e0e0e0;
                    align-items: flex-start;
                }
                .receipt-item-image {
                    width: 100px;
                    height: 125px;
                    object-fit: cover;
                    border-radius: 8px;
                    border: 2px solid #001b48;
                    flex-shrink: 0;
                }
                .receipt-item-details {
                    flex: 1;
                }
                .receipt-item-name {
                    font-weight: 600;
                    color: #333;
                    font-size: 16px;
                    margin-bottom: 5px;
                }
                .receipt-item-designer {
                    font-size: 13px;
                    color: #666;
                    font-style: italic;
                    margin-top: 4px;
                }
                .receipt-item-price {
                    color: #001b48;
                    font-weight: 600;
                    font-size: 18px;
                    margin-top: 10px;
                }
                .receipt-total {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 2px solid #001b48;
                    display: flex;
                    justify-content: space-between;
                    font-size: 20px;
                    font-weight: 700;
                    color: #001b48;
                }
                .receipt-footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e0e0e0;
                    color: #666;
                    font-size: 14px;
                    position: relative;
                }
                .receipt-footer::before,
                .receipt-footer::after {
                    content: '⭐';
                    position: absolute;
                    top: 20px;
                    font-size: 20px;
                    color: #ffd700;
                }
                .receipt-footer::before {
                    left: 50px;
                }
                .receipt-footer::after {
                    right: 50px;
                }
                @media print {
                    .receipt-item-image {
                        width: 80px;
                        height: 100px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt-content">
                <div class="stars-decoration">⭐ ⭐ ⭐</div>
                <div class="receipt-header">
                    <h1>Navya's Merch</h1>
                    <p>Receipt</p>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                    <p>Order #${Math.floor(Math.random() * 10000)}</p>
                </div>
                <div class="receipt-items">
                    ${cart.map(item => `
                        <div class="receipt-item">
                            <img src="${item.image}" alt="${item.description}" class="receipt-item-image" onerror="this.style.display='none';">
                            <div class="receipt-item-details">
                                <div class="receipt-item-name">${item.description}</div>
                                <div class="receipt-item-price">$${item.price.toFixed(2)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="receipt-total">
                    <span>Total:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
                <div class="stars-decoration">⭐ ⭐ ⭐</div>
                <div class="receipt-footer">
                    <p>Thank you for shopping at Navya's Merch!</p>
                    <p>Happy 22nd Birthday! 🎉</p>
                </div>
            </div>
        </body>
        </html>
    `);
    
    receiptWindow.document.close();
    setTimeout(() => {
        receiptWindow.print();
    }, 250);
}

