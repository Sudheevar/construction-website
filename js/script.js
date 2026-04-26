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
   STAT COUNTER ANIMATION
   ============================================= */

class StatCounter {
    constructor() {
        this.statNumbers = document.querySelectorAll('.stat-number[data-target]');
        this.duration = 2000; // Animation duration in ms
        this.hasAnimated = false;

        if (this.statNumbers.length > 0) {
            this.init();
        }
    }

    init() {
        // Create intersection observer to trigger animation when in view
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.hasAnimated = true;
                    this.animateAllCounters();
                }
            });
        }, observerOptions);

        // Observe the hero stats container
        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
            observer.observe(heroStats);
        }
    }

    animateAllCounters() {
        this.statNumbers.forEach(stat => {
            this.animateCounter(stat);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'), 10);
        const suffix = element.getAttribute('data-suffix') || '';
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / this.duration, 1);

            // Easing function for smooth deceleration
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(easeOutCubic * target);

            element.textContent = currentValue + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + suffix;
            }
        };

        requestAnimationFrame(updateCounter);
    }
}

// Initialize Stat Counter
document.addEventListener('DOMContentLoaded', () => {
    const statCounter = new StatCounter();
    console.log('Stat Counter initialized successfully!');
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

/* =============================================
   BRAND PARTNERS CAROUSEL
   Phase 4: Partners Carousel
   ============================================= */

class PartnersCarousel {
    constructor() {
        this.partnersSection = document.querySelector('.partners-section');
        this.marquee = document.querySelector('.partners-marquee');
        this.track = document.querySelector('.partners-track');
        this.logos = document.querySelectorAll('.partner-logo');

        if (this.partnersSection) {
            this.init();
        }
    }

    init() {
        // Add scroll animation trigger
        this.setupScrollAnimation();

        // Reduce motion for users who prefer it
        this.handleReducedMotion();

        console.log('Partners Carousel initialized successfully!');
    }

    setupScrollAnimation() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animation class when in view
                    this.partnersSection.classList.add('in-view');

                    // Animate section header
                    const header = this.partnersSection.querySelector('.section-header');
                    if (header) {
                        header.classList.add('animate-in');
                    }
                }
            });
        }, observerOptions);

        observer.observe(this.partnersSection);
    }

    handleReducedMotion() {
        // Respect user's reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (prefersReducedMotion.matches) {
            this.track.style.animationPlayState = 'paused';
        }

        // Listen for changes
        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                this.track.style.animationPlayState = 'paused';
            } else {
                this.track.style.animationPlayState = 'running';
            }
        });
    }
}

// ================== CHATBOT ==================

class Chatbot {
    constructor() {
        this.container = document.getElementById('chatbot');
        this.toggle = document.getElementById('chatbotToggle');
        this.window = document.getElementById('chatbotWindow');
        this.closeBtn = document.getElementById('chatbotClose');
        this.messagesContainer = document.getElementById('chatbotMessages');
        this.quickReplies = document.getElementById('quickReplies');
        this.form = document.getElementById('chatbotForm');
        this.input = document.getElementById('chatbotInput');

        if (this.container) {
            this.init();
        }
    }

    init() {
        // Toggle chat window
        this.toggle.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.closeChat());

        // Handle form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Handle quick replies
        this.quickReplies.querySelectorAll('.quick-reply').forEach(btn => {
            btn.addEventListener('click', () => this.handleQuickReply(btn));
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.container.classList.contains('active')) {
                this.closeChat();
            }
        });

        console.log('Chatbot initialized successfully!');
    }

    toggleChat() {
        this.container.classList.toggle('active');
        if (this.container.classList.contains('active')) {
            this.input.focus();
        }
    }

    closeChat() {
        this.container.classList.remove('active');
    }

    handleSubmit(e) {
        e.preventDefault();
        const message = this.input.value.trim();
        if (message) {
            this.addUserMessage(message);
            this.input.value = '';
            this.processMessage(message);
        }
    }

    handleQuickReply(btn) {
        const message = btn.dataset.message;
        this.addUserMessage(message);
        this.processMessage(message);

        // Hide quick replies after first use
        this.quickReplies.style.display = 'none';
    }

    addUserMessage(text) {
        const time = this.getCurrentTime();
        const messageHtml = `
            <div class="chat-message user">
                <div class="message-content">
                    <p>${this.escapeHtml(text)}</p>
                </div>
                <span class="message-time">${time}</span>
            </div>
        `;
        this.messagesContainer.insertAdjacentHTML('beforeend', messageHtml);
        this.scrollToBottom();
    }

    addBotMessage(text) {
        const time = this.getCurrentTime();
        const messageHtml = `
            <div class="chat-message bot">
                <div class="message-content">
                    <p>${text}</p>
                </div>
                <span class="message-time">${time}</span>
            </div>
        `;
        this.messagesContainer.insertAdjacentHTML('beforeend', messageHtml);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingHtml = `
            <div class="chat-message bot typing-message">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.messagesContainer.insertAdjacentHTML('beforeend', typingHtml);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typing = this.messagesContainer.querySelector('.typing-message');
        if (typing) {
            typing.remove();
        }
    }

    processMessage(message) {
        // Show typing indicator
        this.showTypingIndicator();

        // Simulate response delay
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.getResponse(message);
            this.addBotMessage(response);
        }, 1000 + Math.random() * 1000);
    }

    getResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Response mapping
        if (lowerMessage.includes('new home') || lowerMessage.includes('build')) {
            return "That's wonderful! We specialize in building dream homes. Our services include architectural design, structural planning, and end-to-end construction. Would you like to schedule a free consultation with our experts? You can call us at <strong>+91 99490 86276</strong> or fill out the enquiry form below.";
        }

        if (lowerMessage.includes('renovation') || lowerMessage.includes('remodel')) {
            return "We offer comprehensive renovation services including interior redesign, structural modifications, and modern upgrades. Our team can transform your existing space into something beautiful. Would you like to discuss your renovation project?";
        }

        if (lowerMessage.includes('package') || lowerMessage.includes('pricing') || lowerMessage.includes('cost')) {
            return "We offer flexible packages tailored to your needs and budget. Our packages include Basic, Standard, and Premium options with transparent pricing. For a detailed quote, please share your requirements or call us at <strong>+91 99490 86276</strong>.";
        }

        if (lowerMessage.includes('quote') || lowerMessage.includes('estimate')) {
            return "I'd be happy to help you get a free quote! Please fill out the enquiry form in the Contact section below, or call us directly at <strong>+91 99490 86276</strong>. Our team will get back to you within 24 hours with a detailed estimate.";
        }

        if (lowerMessage.includes('interior') || lowerMessage.includes('design')) {
            return "Our interior design services cover everything from space planning to furniture selection, false ceilings, modular kitchens, and complete home styling. We create spaces that reflect your personality. Would you like to see our portfolio?";
        }

        if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('call')) {
            return "You can reach us at:<br><strong>Phone:</strong> +91 99490 86276<br><strong>Email:</strong> sohamendeavours202@gmail.com<br><strong>Hours:</strong> Mon-Sat, 9 AM - 7 PM<br>Or fill out the enquiry form below!";
        }

        if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
            return "We're located at:<br><strong>No.8, 18th Cross, Dasarahalli, Bhuvaneshwari Nagar, Hebbal, Kempapura, Bengaluru Urban, Karnataka - 560024</strong><br>Feel free to visit us during business hours!";
        }

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "Hello! Welcome to JR Constructions. How can I assist you today? Feel free to ask about our construction services, packages, or request a free quote!";
        }

        if (lowerMessage.includes('thank')) {
            return "You're welcome! If you have any more questions, feel free to ask. We're here to help you build your dream space!";
        }

        // Default response
        return "Thank you for your message! For detailed assistance, please call us at <strong>+91 99490 86276</strong> or fill out the enquiry form below. Our team will get back to you shortly.";
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/* =============================================
   WHY CHOOSE US SECTION ANIMATIONS
   ============================================= */

class WhyUsAnimations {
    constructor() {
        this.section = document.querySelector('.why-us-section');
        this.cards = document.querySelectorAll('.why-us-card');

        if (this.section) {
            this.init();
        }
    }

    init() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        // Observer for the section header
        const headerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        const sectionHeader = this.section.querySelector('.section-header');
        if (sectionHeader) {
            headerObserver.observe(sectionHeader);
        }

        // Observer for individual cards
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { ...observerOptions, threshold: 0.2 });

        this.cards.forEach(card => {
            cardObserver.observe(card);
        });

        console.log('Why Us Animations initialized successfully!');
    }
}

/* =============================================
   PROCESS SECTION ANIMATIONS
   ============================================= */

class ProcessAnimations {
    constructor() {
        this.section = document.querySelector('.process-section');
        this.steps = document.querySelectorAll('.process-step');

        if (this.section) {
            this.init();
        }
    }

    init() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        // Observer for the section header
        const headerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        const sectionHeader = this.section.querySelector('.section-header');
        if (sectionHeader) {
            headerObserver.observe(sectionHeader);
        }

        // Observer for process steps with sequential animation
        const stepObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { ...observerOptions, threshold: 0.2 });

        this.steps.forEach(step => {
            stepObserver.observe(step);
        });

        console.log('Process Animations initialized successfully!');
    }
}

/* =============================================
   CONSTRUCTION-THEMED ANIMATIONS
   ============================================= */

// ================== BLUEPRINT GRID ANIMATION (PROCESS SECTION) ==================

class BlueprintAnimation {
    constructor() {
        this.blueprintGrid = document.querySelector('.blueprint-grid');
        this.processSection = document.querySelector('.process-section');

        if (this.blueprintGrid && this.processSection) {
            this.init();
        }
    }

    init() {
        // Create intersection observer to trigger animation on scroll
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animate-in class to trigger CSS animations
                    this.blueprintGrid.classList.add('animate-in');
                }
            });
        }, observerOptions);

        observer.observe(this.processSection);
        console.log('Blueprint Animation initialized successfully!');
    }
}

// ================== INITIALIZE FOOTER ==================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize enquiry form
    const enquiryForm = new EnquiryForm();

    // Initialize footer animations
    const footerAnimations = new FooterAnimations();

    // Initialize partners carousel
    const partnersCarousel = new PartnersCarousel();

    // Initialize chatbot
    const chatbot = new Chatbot();

    // Initialize Why Us animations
    const whyUsAnimations = new WhyUsAnimations();

    // Initialize Process animations
    const processAnimations = new ProcessAnimations();

    // Initialize Construction-Themed Animations
    const blueprintAnimation = new BlueprintAnimation();

    console.log('Footer initialized successfully!');
    console.log('Construction-themed animations initialized!');
});
