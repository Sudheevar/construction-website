/* =============================================
   CONSTRUCTION COMPANY WEBSITE - JAVASCRIPT
   ============================================= */

/* =============================================
   HEADER FUNCTIONALITY
   ============================================= */

class Header {
    constructor() {
        this.header = document.getElementById('header');
        this.nav = document.getElementById('nav');
        this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section[id]');

        this.scrollThreshold = 50;
        this.isMenuOpen = false;

        if (this.header) {
            this.init();
        }
    }

    init() {
        this.bindEvents();
        this.handleScroll(); // Check initial scroll position
    }

    bindEvents() {
        // Scroll event for header background
        window.addEventListener('scroll', () => this.handleScroll());

        // Mobile menu toggle
        if (this.mobileMenuToggle) {
            this.mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close mobile menu when clicking a nav link
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isMenuOpen) {
                    this.closeMobileMenu();
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.nav.contains(e.target) && !this.mobileMenuToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Update active nav link on scroll
        window.addEventListener('scroll', () => this.updateActiveNavLink());
    }

    handleScroll() {
        if (window.scrollY > this.scrollThreshold) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }
    }

    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;

        if (this.isMenuOpen) {
            this.openMobileMenu();
        } else {
            this.closeMobileMenu();
        }
    }

    openMobileMenu() {
        this.isMenuOpen = true;
        this.nav.classList.add('active');
        this.mobileMenuToggle.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    }

    closeMobileMenu() {
        this.isMenuOpen = false;
        this.nav.classList.remove('active');
        this.mobileMenuToggle.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    updateActiveNavLink() {
        const scrollY = window.scrollY;

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

// Initialize Header
document.addEventListener('DOMContentLoaded', () => {
    const header = new Header();
    console.log('Header initialized successfully!');
});

/* =============================================
   SERVICES SLIDER
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

/* =============================================
   FOOTER FUNCTIONALITY
   Phase 5: Footer + Contact Section
   ============================================= */

// ================== ENQUIRY FORM HANDLER ==================

class EnquiryForm {
    constructor() {
        this.form = document.getElementById('enquiryForm');
        this.formSuccess = document.getElementById('formSuccess');

        // Form fields
        this.nameInput = document.getElementById('formName');
        this.emailInput = document.getElementById('formEmail');
        this.phoneInput = document.getElementById('formPhone');
        this.messageInput = document.getElementById('formMessage');

        // Error elements
        this.nameError = document.getElementById('nameError');
        this.emailError = document.getElementById('emailError');
        this.phoneError = document.getElementById('phoneError');
        this.messageError = document.getElementById('messageError');

        if (this.form) {
            this.init();
        }
    }

    init() {
        // Form submit handler
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time validation on blur
        this.nameInput.addEventListener('blur', () => this.validateName());
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.phoneInput.addEventListener('blur', () => this.validatePhone());
        this.messageInput.addEventListener('blur', () => this.validateMessage());

        // Clear error on input
        this.nameInput.addEventListener('input', () => this.clearError(this.nameInput, this.nameError));
        this.emailInput.addEventListener('input', () => this.clearError(this.emailInput, this.emailError));
        this.phoneInput.addEventListener('input', () => this.clearError(this.phoneInput, this.phoneError));
        this.messageInput.addEventListener('input', () => this.clearError(this.messageInput, this.messageError));
    }

    // Validate name (required, min 2 characters)
    validateName() {
        const value = this.nameInput.value.trim();
        if (!value) {
            this.showError(this.nameInput, this.nameError, 'Please enter your name');
            return false;
        }
        if (value.length < 2) {
            this.showError(this.nameInput, this.nameError, 'Name must be at least 2 characters');
            return false;
        }
        this.clearError(this.nameInput, this.nameError);
        return true;
    }

    // Validate email (required, valid format)
    validateEmail() {
        const value = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!value) {
            this.showError(this.emailInput, this.emailError, 'Please enter your email');
            return false;
        }
        if (!emailRegex.test(value)) {
            this.showError(this.emailInput, this.emailError, 'Please enter a valid email address');
            return false;
        }
        this.clearError(this.emailInput, this.emailError);
        return true;
    }

    // Validate phone (optional, but if provided must be valid)
    validatePhone() {
        const value = this.phoneInput.value.trim();
        // Phone is optional
        if (!value) {
            this.clearError(this.phoneInput, this.phoneError);
            return true;
        }
        // Indian phone number pattern (10 digits, optionally with +91)
        const phoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            this.showError(this.phoneInput, this.phoneError, 'Please enter a valid phone number');
            return false;
        }
        this.clearError(this.phoneInput, this.phoneError);
        return true;
    }

    // Validate message (required, min 10 characters)
    validateMessage() {
        const value = this.messageInput.value.trim();
        if (!value) {
            this.showError(this.messageInput, this.messageError, 'Please enter your message');
            return false;
        }
        if (value.length < 10) {
            this.showError(this.messageInput, this.messageError, 'Message must be at least 10 characters');
            return false;
        }
        this.clearError(this.messageInput, this.messageError);
        return true;
    }

    // Show error
    showError(input, errorElement, message) {
        input.parentElement.classList.add('error');
        errorElement.textContent = message;
    }

    // Clear error
    clearError(input, errorElement) {
        input.parentElement.classList.remove('error');
        errorElement.textContent = '';
    }

    // Handle form submission
    handleSubmit(e) {
        e.preventDefault();

        // Validate all fields
        const isNameValid = this.validateName();
        const isEmailValid = this.validateEmail();
        const isPhoneValid = this.validatePhone();
        const isMessageValid = this.validateMessage();

        if (isNameValid && isEmailValid && isPhoneValid && isMessageValid) {
            // Form is valid - show success message
            this.showSuccess();
        }
    }

    // Show success message and reset form
    showSuccess() {
        // Hide form fields temporarily
        const formGroups = this.form.querySelectorAll('.form-group');
        const submitBtn = this.form.querySelector('.form-submit');

        formGroups.forEach(group => group.style.display = 'none');
        submitBtn.style.display = 'none';

        // Show success message
        this.formSuccess.classList.add('show');

        // Reset form after 3 seconds
        setTimeout(() => {
            this.form.reset();
            formGroups.forEach(group => group.style.display = 'block');
            submitBtn.style.display = 'inline-flex';
            this.formSuccess.classList.remove('show');
        }, 4000);
    }
}

// ================== FOOTER SCROLL ANIMATIONS ==================

class FooterAnimations {
    constructor() {
        this.footerColumns = document.querySelectorAll('.footer-column');
        this.footerSection = document.querySelector('.footer-section');

        if (this.footerSection) {
            this.init();
        }
    }

    init() {
        // Create intersection observer for footer columns
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animate-in class to trigger CSS animation
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe each footer column
        this.footerColumns.forEach(column => {
            observer.observe(column);
        });
    }
}

// ================== INITIALIZE FOOTER ==================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize enquiry form
    const enquiryForm = new EnquiryForm();

    // Initialize footer animations
    const footerAnimations = new FooterAnimations();

    console.log('Footer initialized successfully!');
});
