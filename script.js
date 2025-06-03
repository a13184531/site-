document.addEventListener('DOMContentLoaded', () => {

    // 1. Responsive Hamburger Menu
    const navToggle = document.getElementById('nav-toggle-button');
    const mainNav = document.getElementById('main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // Close mobile nav when a link is clicked
    const navLinksForMenuClose = mainNav.querySelectorAll('.nav-link');
    navLinksForMenuClose.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });


    // 2. Client-Side Form Validation
    const contactForm = document.getElementById('contact-form');
    const formSuccessMessage = document.getElementById('form-success-message');

    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            let isValid = true;

            // Clear previous messages
            contactForm.querySelectorAll('.error-message').forEach(el => el.textContent = '');
            if (formSuccessMessage) formSuccessMessage.style.display = 'none';

            // Name validation
            const nameField = document.getElementById('name');
            if (!nameField.value.trim()) {
                isValid = false;
                nameField.nextElementSibling.textContent = 'Name is required.';
            }

            // Email validation
            const emailField = document.getElementById('email');
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailField.value.trim()) {
                isValid = false;
                emailField.nextElementSibling.textContent = 'Email is required.';
            } else if (!emailPattern.test(emailField.value.trim())) {
                isValid = false;
                emailField.nextElementSibling.textContent = 'Please enter a valid email address.';
            }

            // Message validation
            const messageField = document.getElementById('message');
            if (!messageField.value.trim()) {
                isValid = false;
                messageField.nextElementSibling.textContent = 'Message is required.';
            }

            if (isValid) {
                if (formSuccessMessage) {
                    formSuccessMessage.textContent = 'Thank you! Your message has been sent successfully.';
                    formSuccessMessage.style.display = 'block';
                }
                contactForm.reset(); // Clear the form
            }
        });
    }

    // 3. Testimonial Slider
    const slider = document.querySelector('.testimonial-slider');
    const testimonials = document.querySelectorAll('.testimonial-slider .testimonial');
    const prevButton = document.getElementById('testimonial-prev');
    const nextButton = document.getElementById('testimonial-next');
    let currentTestimonialIndex = 0;

    function updateSliderPosition() {
        if (slider) {
            slider.style.transform = `translateX(-${currentTestimonialIndex * 100}%)`;
        }
    }

    if (slider && testimonials.length > 0) {
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
                updateSliderPosition();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
                updateSliderPosition();
            });
        }
        updateSliderPosition(); // Initial position
    }


    // 4. Smooth Scrolling
    const internalLinks = document.querySelectorAll('.nav-link[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 5. On-Scroll Animations
    const revealSections = document.querySelectorAll('.reveal-on-scroll');

    const revealObserverOptions = {
        root: null, // relative to document viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of item visible
    };

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    };

    if (typeof IntersectionObserver === 'function') {
        const revealObserver = new IntersectionObserver(revealCallback, revealObserverOptions);
        revealSections.forEach(section => {
            revealObserver.observe(section);
        });
    } else {
        // Fallback for older browsers: reveal all sections immediately or use a scroll event listener
        console.warn('IntersectionObserver not supported. Scroll animations might not work as expected.');
        revealSections.forEach(section => {
            section.classList.add('is-visible'); // Or implement a scroll listener
        });
    }

});
