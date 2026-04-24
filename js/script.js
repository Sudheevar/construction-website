/* =============================================
   CONSTRUCTION COMPANY WEBSITE - JAVASCRIPT
   Phase 1: Services Slider
   ============================================= */

class ServicesSlider {
    constructor() {
        // Elements
        this.slider = document.querySelector('.slider');
        this.slides = document.querySelectorAll('.slide');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.querySelector('.slider-arrow.prev');
        this.nextBtn = document.querySelector('.slider-arrow.next');
        this.currentCounter = document.querySelector('.slide-counter .current');

        // State
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.isAnimating = false;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000; // 5 seconds

        // Touch/Drag state
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.dragThreshold = 50;

        // Parallax state
        this.parallaxEnabled = window.innerWidth > 768;

        // Initialize
        this.init();
    }

    init() {
        this.bindEvents();
        this.startAutoPlay();
        this.updateCounter();

        // Initial animation for first slide content
        this.animateSlideContent(0);
    }

    bindEvents() {
        // Arrow navigation
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        // Dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });

        // Touch events for mobile swipe
        this.slider.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.slider.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
        this.slider.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // Mouse drag events for desktop
        this.slider.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.slider.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.slider.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.slider.addEventListener('mouseleave', (e) => this.handleMouseUp(e));

        // Pause auto-play on hover
        this.slider.addEventListener('mouseenter', () => this.pauseAutoPlay());
        this.slider.addEventListener('mouseleave', () => this.startAutoPlay());

        // Pause when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoPlay();
            } else {
                this.startAutoPlay();
            }
        });

        // Parallax effect on mouse move (desktop only)
        if (this.parallaxEnabled) {
            this.slides.forEach(slide => {
                slide.addEventListener('mousemove', (e) => this.handleParallax(e, slide));
                slide.addEventListener('mouseleave', (e) => this.resetParallax(slide));
            });
        }

        // Update parallax on resize
        window.addEventListener('resize', debounce(() => {
            this.parallaxEnabled = window.innerWidth > 768;
        }, 250));
    }

    // ================== SLIDE NAVIGATION ==================

    nextSlide() {
        if (this.isAnimating) return;
        const nextIndex = (this.currentIndex + 1) % this.totalSlides;
        this.goToSlide(nextIndex, 'next');
    }

    prevSlide() {
        if (this.isAnimating) return;
        const prevIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(prevIndex, 'prev');
    }

    goToSlide(index, direction = null) {
        if (this.isAnimating || index === this.currentIndex) return;

        this.isAnimating = true;

        // Determine direction if not provided
        if (!direction) {
            direction = index > this.currentIndex ? 'next' : 'prev';
        }

        const currentSlide = this.slides[this.currentIndex];
        const nextSlide = this.slides[index];

        // Remove all animation classes first
        this.slides.forEach(slide => {
            slide.classList.remove('active', 'prev', 'entering-right', 'entering-left', 'exiting-left', 'exiting-right');
        });

        // Apply exit animation to current slide
        if (direction === 'next') {
            currentSlide.classList.add('exiting-left');
            nextSlide.classList.add('entering-right');
        } else {
            currentSlide.classList.add('exiting-right');
            nextSlide.classList.add('entering-left');
        }

        // Update dots
        this.dots[this.currentIndex].classList.remove('active');
        this.dots[index].classList.add('active');

        // Update current index
        this.currentIndex = index;
        this.updateCounter();

        // After animation completes
        setTimeout(() => {
            this.slides.forEach(slide => {
                slide.classList.remove('entering-right', 'entering-left', 'exiting-left', 'exiting-right');
            });
            nextSlide.classList.add('active');
            this.animateSlideContent(index);
            this.isAnimating = false;
        }, 600);
    }

    // ================== SLIDE CONTENT ANIMATION ==================

    animateSlideContent(index) {
        const slide = this.slides[index];
        const icon = slide.querySelector('.slide-icon');
        const title = slide.querySelector('.slide-title');
        const description = slide.querySelector('.slide-description');
        const features = slide.querySelectorAll('.slide-features span');

        // Reset animations
        icon.style.animation = 'none';
        description.style.animation = 'none';

        // Trigger reflow
        void icon.offsetWidth;
        void description.offsetWidth;

        // Apply animations
        icon.style.animation = 'bounceIn 0.6s ease forwards';
        description.style.animation = 'fadeInUp 0.6s ease 0.2s forwards';

        // Animate features with stagger
        features.forEach((feature, i) => {
            feature.style.opacity = '0';
            feature.style.transform = 'translateY(20px)';
            setTimeout(() => {
                feature.style.transition = 'all 0.4s ease';
                feature.style.opacity = '1';
                feature.style.transform = 'translateY(0)';
            }, 400 + (i * 100));
        });
    }

    // ================== AUTO PLAY ==================

    startAutoPlay() {
        this.pauseAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    // ================== TOUCH HANDLING ==================

    handleTouchStart(e) {
        this.startX = e.touches[0].clientX;
        this.isDragging = true;
        this.pauseAutoPlay();
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;
        this.currentX = e.touches[0].clientX;
    }

    handleTouchEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;

        const diff = this.startX - this.currentX;

        if (Math.abs(diff) > this.dragThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }

        this.startAutoPlay();
    }

    // ================== MOUSE DRAG HANDLING ==================

    handleMouseDown(e) {
        this.startX = e.clientX;
        this.isDragging = true;
        this.slider.classList.add('dragging');
        this.pauseAutoPlay();
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        this.currentX = e.clientX;
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.slider.classList.remove('dragging');

        const diff = this.startX - this.currentX;

        if (Math.abs(diff) > this.dragThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }

        this.startAutoPlay();
    }

    // ================== COUNTER UPDATE ==================

    updateCounter() {
        const currentNum = (this.currentIndex + 1).toString().padStart(2, '0');

        // Animate counter change
        this.currentCounter.style.transform = 'translateY(-10px)';
        this.currentCounter.style.opacity = '0';

        setTimeout(() => {
            this.currentCounter.textContent = currentNum;
            this.currentCounter.style.transform = 'translateY(0)';
            this.currentCounter.style.opacity = '1';
        }, 150);
    }

    // ================== PARALLAX EFFECT ==================

    handleParallax(e, slide) {
        if (!this.parallaxEnabled || this.isDragging) return;

        const slideImage = slide.querySelector('.slide-image');
        if (!slideImage) return;

        const rect = slide.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate percentage position
        const xPercent = (x / rect.width - 0.5) * 2; // -1 to 1
        const yPercent = (y / rect.height - 0.5) * 2; // -1 to 1

        // Apply subtle parallax movement (max 15px)
        const moveX = xPercent * -15;
        const moveY = yPercent * -8;

        slideImage.style.transform = `translateX(${moveX}px) translateY(${moveY}px) scale(1.02)`;
    }

    resetParallax(slide) {
        const slideImage = slide.querySelector('.slide-image');
        if (!slideImage) return;

        // Reset to default position smoothly
        slideImage.style.transform = 'translateX(0) translateY(0) scale(1)';
    }
}

// ================== INTERSECTION OBSERVER FOR SCROLL ANIMATIONS ==================

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for scroll animation
document.querySelectorAll('.section-header').forEach(el => observer.observe(el));

// ================== INITIALIZE ==================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize slider
    const slider = new ServicesSlider();

    // Add smooth transition for counter
    const counter = document.querySelector('.slide-counter .current');
    if (counter) {
        counter.style.transition = 'all 0.15s ease';
    }

    console.log('Services Slider initialized successfully!');
});

// ================== UTILITY FUNCTIONS ==================

// Debounce function for resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize
window.addEventListener('resize', debounce(() => {
    // Recalculate slider dimensions if needed
}, 250));
