document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. HERO SECTION TYPING ANIMATION (Typed.js)
       ========================================== */
    const typingElement = document.querySelector('.typing-text');
    if (typingElement) {
        new Typed('.typing-text', {
            strings: ['Rishabh Shrivastava.', 'a Full Stack Developer.', 'a Software Engineer.'],
            typeSpeed: 80,
            backSpeed: 50,
            backDelay: 1500,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    }

    /* ==========================================
       2. PROJECT CARDS SPREAD / STACK TOGGLE
       ========================================== */
    const toggleBtn = document.getElementById('toggleStackButton');
    const cardStack = document.getElementById('cardstack');

    if (toggleBtn && cardStack) {
        toggleBtn.addEventListener('click', () => {
            cardStack.classList.toggle('spread');

            if (cardStack.classList.contains('spread')) {
                toggleBtn.textContent = 'Stack Cards';
            } else {
                toggleBtn.textContent = 'Spread Cards';
            }
        });
    }

    /* ==========================================
       3. NAVIGATION ACTIVE LINK ON SCROLL
       ========================================== */
    const navLinks = document.querySelectorAll('.navbar-links a');
    const sections = document.querySelectorAll('section[id]');

    function updateActiveLink() {
        let scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 150;
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);

    /* ==========================================
       4. BOOK PAGE FLIP NAVIGATION (Education)
       ========================================== */
    const page1 = document.getElementById('book-page-1');
    const page2 = document.getElementById('book-page-2');
    const prevBtn = document.getElementById('prevBookPage');
    const nextBtn = document.getElementById('nextBookPage');
    const pageIndicator = document.getElementById('bookPageIndicator');

    if (prevBtn && nextBtn && page1 && page2) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            page1.classList.remove('active');
            page2.classList.add('active');
            prevBtn.disabled = false;
            nextBtn.disabled = true;
            if (pageIndicator) {
                pageIndicator.textContent = 'Page 2 of 2';
            }
        });

        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            page2.classList.remove('active');
            page1.classList.add('active');
            prevBtn.disabled = true;
            nextBtn.disabled = false;
            if (pageIndicator) {
                pageIndicator.textContent = 'Page 1 of 2';
            }
        });
    }

    /* ==========================================
       5. CONTACT FORM SUBMISSION TO DATABASE
       ========================================== */
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Form inputs fetch
            const nameInput = contactForm.querySelector('input[placeholder="Name"]');
            const emailInput = contactForm.querySelector('input[placeholder="email"]');
            const messageInput = contactForm.querySelector('textarea');

            const formData = {
                name: nameInput ? nameInput.value : '',
                email: emailInput ? emailInput.value : '',
                message: messageInput ? messageInput.value : ''
            };

            try {
                // Backend API Request
                const response = await fetch('http://localhost:5000/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    alert('Message sent successfully!');
                    contactForm.reset();
                } else {
                    alert('Error saving message. Please try again.');
                }
            } catch (error) {
                console.error('Submission Error:', error);
                alert('Could not connect to the server. Make sure Node.js server is running.');
            }
        });
    }

});