// ============================================================
//  Abhijeet Tours & Travels — script.js
//  EmailJS Integration: service_von5gvj / template_vp647bm
// ============================================================

// --- Initialise EmailJS safely (if SDK loaded in head) ---
if (typeof emailjs !== 'undefined') {
    try {
        emailjs.init('Zt4jAYrHVAMrOCPuF');
    } catch (e) {
        console.warn('EmailJS init skipped:', e);
    }
}

// EmailJS config
const EMAILJS_SERVICE_ID  = 'service_von5gvj';
const EMAILJS_TEMPLATE_ID = 'template_vp647bm';

// ============================================================
//  Show inline success / error message inside the form
// ============================================================
function showFormMessage(form, type, text) {
    const existing = form.querySelector('.form-status-msg');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = 'form-status-msg';
    msg.style.cssText = `
        margin-top: 1rem;
        padding: 0.85rem 1.1rem;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        ${type === 'success'
            ? 'background:#d4edda; color:#155724; border:1px solid #c3e6cb;'
            : 'background:#f8d7da; color:#721c24; border:1px solid #f5c6cb;'}
    `;
    msg.innerHTML = type === 'success'
        ? `<i class="fas fa-check-circle"></i> ${text}`
        : `<i class="fas fa-exclamation-circle"></i> ${text}`;

    form.appendChild(msg);

    if (type === 'success') {
        setTimeout(() => msg.remove(), 6000);
    }
}

// ============================================================
//  Set submit button loading state
// ============================================================
function setButtonLoading(btn, loading) {
    if (loading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;
        btn.style.opacity = '0.75';
    } else {
        btn.innerHTML = btn.dataset.originalText || 'Submit';
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}

// ============================================================
//  Reusable booking form submit handler
// ============================================================
const handleFormSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    const name        = form.querySelector('input[name="name"]').value.trim();
    const mobile      = form.querySelector('input[name="mobile"]').value.trim();
    const source      = form.querySelector('input[name="source"]').value.trim();
    const destination = form.querySelector('input[name="destination"]').value.trim();
    const dateInput   = form.querySelector('input[name="date"]').value;
    const vehicle     = form.querySelector('select[name="vehicle"]')?.value || 'Not specified';
    const triptype    = form.querySelector('select[name="triptype"]')?.value || 'Not specified';
    const passengers  = form.querySelector('input[name="passengers"]')?.value || 'Not specified';

    // Validate mobile
    if (!/^(\+91|91)?[6-9]\d{9}$/.test(mobile.replace(/\s+/g, ''))) {
        showFormMessage(form, 'error', 'Please enter a valid 10-digit mobile number.');
        return;
    }

    // Validate date
    if (!dateInput) {
        showFormMessage(form, 'error', 'Please select a travel date.');
        return;
    }

    // Format date
    const date = new Date(dateInput).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const templateParams = {
        name,
        mobile,
        source,
        destination,
        date,
        vehicle,
        triptype,
        passengers
    };

    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitBtn) setButtonLoading(submitBtn, true);

    const existing = form.querySelector('.form-status-msg');
    if (existing) existing.remove();

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(() => {
            showFormMessage(form, 'success', "Booking request sent! We'll call you shortly to confirm.");
            form.reset();
            // Restore pre-filled default values
            const sourceField = form.querySelector('input[name="source"]');
            const destField   = form.querySelector('input[name="destination"]');
            if (sourceField && sourceField.defaultValue) sourceField.value = sourceField.defaultValue;
            if (destField   && destField.defaultValue)   destField.value   = destField.defaultValue;
        })
        .catch((error) => {
            console.error('EmailJS error:', error);
            showFormMessage(form, 'error', 'Something went wrong. Please call us on +91 7020460865.');
        })
        .finally(() => {
            if (submitBtn) setButtonLoading(submitBtn, false);
        });
};

// ============================================================
//  DOM Ready
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- Navbar ---
    const navbarToggle = document.getElementById('navbar-toggle');
    const navbarLinks  = document.getElementById('navbar-links');

    if (navbarToggle && navbarLinks) {
        navbarToggle.addEventListener('click', () => {
            navbarLinks.classList.toggle('active');
            navbarToggle.classList.toggle('active');
        });
    }

    if (navbarLinks) {
        navbarLinks.addEventListener('click', (event) => {
            if (event.target.tagName === 'A') {
                if (navbarLinks.classList.contains('active')) {
                    navbarLinks.classList.remove('active');
                    navbarToggle.classList.remove('active');
                }
            }
        });
    }

    // --- Ticker ---
    const destinations = [
        { name: 'Solapur',    image: 'images/ajanta.jpg'     },
        { name: 'Akkalkot',   image: 'images/akkalkot.jpg'   },
        { name: 'Tuljapur',   image: 'images/tuljapur.jpg'   },
        { name: 'Pandharpur', image: 'images/pandharpur.jpg' },
        { name: 'Pune',       image: 'images/pune.jpg'       },
        { name: 'Mumbai',     image: 'images/mumbai.jpg'     },
        { name: 'Nashik',     image: 'images/nashik.jpg'     },
        { name: 'Kolhapur',   image: 'images/kolhapur.jpg'   },
        { name: 'Ahmednagar', image: 'images/ahmednagar.jpg' },
        { name: 'Shirdi',     image: 'images/shirdi.jpg'     },
        { name: 'Thane',      image: 'images/thane.jpg'      }
    ];

    const tickerWrapper = document.getElementById('ticker-wrapper');
    if (tickerWrapper) {
        const tickerItems = [...destinations, ...destinations];
        tickerItems.forEach(dest => {
            const item = document.createElement('div');
            item.className = 'ticker-item';
            item.style.backgroundImage = `url(${dest.image})`;
            const name = document.createElement('span');
            name.textContent = dest.name;
            item.appendChild(name);
            tickerWrapper.appendChild(item);
        });
    }

    // --- Min date on all date inputs ---
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.min = new Date().toISOString().split('T')[0];
    });

    // --- Attach form handlers ---
    const heroBookingForm    = document.getElementById('hero-booking-form');
    const contactBookingForm = document.getElementById('contact-booking-form');

    if (heroBookingForm)    heroBookingForm.addEventListener('submit', handleFormSubmit);
    if (contactBookingForm) contactBookingForm.addEventListener('submit', handleFormSubmit);

    // --- Force Urbania Vehicle Gallery Slider ---
    initUrbaniaSlider();

});

// ============================================================
//  Force Urbania Vehicle Slider (Dynamic image loader)
// ============================================================
const URBANIA_GALLERY_IMAGES = [
    'IMG_4647.JPG.jpeg',
    'IMG_4649.JPG.jpeg',
    'IMG_4650.JPG.jpeg',
    'IMG_4652.JPG.jpeg',
    'IMG_4653.JPG.jpeg',
    'IMG_4685.JPG.jpeg',
    'IMG_4687.JPG.jpeg',
    'IMG_4688.JPG.jpeg',
    'IMG_4689.JPG.jpeg',
    'IMG_4691.JPG.jpeg',
    'IMG_4692.JPG.jpeg',
    'IMG_4693.JPG.jpeg',
    'IMG_4694.JPG.jpeg',
    'IMG_4695.JPG.jpeg',
    'IMG_4697.JPG.jpeg',
    'IMG_4698.JPG.jpeg',
    'IMG_4699.JPG.jpeg',
    'IMG_4700.JPG.jpeg',
    'IMG_4701.JPG.jpeg',
    'IMG_4703.JPG.jpeg'
];

function initUrbaniaSlider() {
    const sliderContainer = document.getElementById('urbania-slider');
    if (!sliderContainer) return;
    if (sliderContainer.dataset.initialized === 'true') return;
    sliderContainer.dataset.initialized = 'true';

    const track = document.getElementById('slider-track');
    const dotsContainer = document.getElementById('slider-dots');
    const counter = document.getElementById('slider-counter');
    const prevBtn = document.getElementById('slider-prev-btn');
    const nextBtn = document.getElementById('slider-next-btn');
    const viewport = document.getElementById('slider-viewport');

    if (!track) return;

    // Detect path relative to current page location (works for file://, local server, and production)
    const normPath = window.location.pathname.toLowerCase().replace(/\\/g, '/');
    const isSubfolder = normPath.includes('/urbania/') || 
                        normPath.includes('/tempo-traveller/') || 
                        normPath.includes('/routes/') ||
                        Boolean(document.querySelector('script[src^="../"]')) ||
                        Boolean(document.querySelector('link[href^="../"]'));
    const basePath = isSubfolder ? '../images/Urbania/' : 'images/Urbania/';

    // Render all images with their natural 3:4 ratio
    track.innerHTML = URBANIA_GALLERY_IMAGES.map((filename, idx) => `
        <div class="slider-slide">
            <img src="${basePath}${filename}" alt="Force Urbania Vehicle Photo ${idx + 1}" loading="${idx < 2 ? 'eager' : 'lazy'}" decoding="async">
        </div>
    `).join('');

    // Ensure progress bar exists in controls
    let progressBar = sliderContainer.querySelector('.slider-progress-bar');
    if (!progressBar) {
        const controls = sliderContainer.querySelector('.slider-controls');
        if (controls) {
            const trackEl = document.createElement('div');
            trackEl.className = 'slider-progress-track';
            trackEl.innerHTML = '<div class="slider-progress-bar"></div>';
            if (counter && counter.nextSibling) {
                controls.insertBefore(trackEl, counter.nextSibling);
            } else {
                controls.appendChild(trackEl);
            }
            progressBar = trackEl.querySelector('.slider-progress-bar');
        }
    }

    // Generate dots
    if (dotsContainer) {
        dotsContainer.innerHTML = URBANIA_GALLERY_IMAGES.map((_, idx) => `
            <button class="slider-dot${idx === 0 ? ' active' : ''}" data-slide="${idx}" aria-label="Go to slide ${idx + 1}"></button>
        `).join('');
    }

    const totalSlides = URBANIA_GALLERY_IMAGES.length;
    let currentSlide = 0;
    let autoSlideTimer = null;

    function updateSlider(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        currentSlide = index;

        track.style.transform = `translateX(-${currentSlide * 100}%)`;

        if (counter) {
            const currentNum = String(currentSlide + 1).padStart(2, '0');
            const totalNum = String(totalSlides).padStart(2, '0');
            counter.textContent = `${currentNum} / ${totalNum}`;
        }

        if (progressBar) {
            const pct = ((currentSlide + 1) / totalSlides) * 100;
            progressBar.style.width = `${pct}%`;
        }

        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.slider-dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            updateSlider(currentSlide - 1);
            resetAutoSlide();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            updateSlider(currentSlide + 1);
            resetAutoSlide();
        });
    }

    if (dotsContainer) {
        dotsContainer.addEventListener('click', (e) => {
            const dot = e.target.closest('.slider-dot');
            if (dot && dot.dataset.slide !== undefined) {
                updateSlider(parseInt(dot.dataset.slide, 10));
                resetAutoSlide();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            updateSlider(currentSlide - 1);
            resetAutoSlide();
        } else if (e.key === 'ArrowRight') {
            updateSlider(currentSlide + 1);
            resetAutoSlide();
        }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    if (viewport) {
        viewport.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        viewport.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50) {
                updateSlider(currentSlide + 1);
                resetAutoSlide();
            } else if (touchEndX > touchStartX + 50) {
                updateSlider(currentSlide - 1);
                resetAutoSlide();
            }
        }, { passive: true });

        viewport.addEventListener('mouseenter', () => {
            if (autoSlideTimer) clearInterval(autoSlideTimer);
        });
        viewport.addEventListener('mouseleave', () => {
            startAutoSlide();
        });
    }

    function startAutoSlide() {
        if (autoSlideTimer) clearInterval(autoSlideTimer);
        autoSlideTimer = setInterval(() => {
            updateSlider(currentSlide + 1);
        }, 5000);
    }

    function resetAutoSlide() {
        if (autoSlideTimer) clearInterval(autoSlideTimer);
        startAutoSlide();
    }

    updateSlider(0);
    startAutoSlide();
}

// Expose globally for fail-safe initialization from page scripts
window.URBANIA_GALLERY_IMAGES = URBANIA_GALLERY_IMAGES;
window.initUrbaniaSlider = initUrbaniaSlider;

// Auto-run if DOM is already ready, or listen for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUrbaniaSlider);
} else {
    initUrbaniaSlider();
}