document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        if (navLinks.classList.contains('active')) {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.backgroundColor = 'rgba(45, 76, 59, 0.95)';
            navLinks.style.padding = '20px 0';
        } else {
            navLinks.style.display = 'none';
        }
    });

    // Reset styles on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'row';
            navLinks.style.position = 'static';
            navLinks.style.backgroundColor = 'transparent';
            navLinks.style.padding = '0';
            navLinks.classList.remove('active');
        } else {
            if (!navLinks.classList.contains('active')) {
                navLinks.style.display = 'none';
            }
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Adjust scroll position for fixed navbar
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                    navLinks.style.display = 'none';
                }
            }
        });
    });

    // Form Submission Handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            // No custom preventDefault here so it can submit to Formspree,
            // but we can add loading states or validation here if needed.
        });
    }

    // Dynamic Google Sheets Integration
    // Replace these URLs with your Google Sheets "Publish to web" CSV URLs
    const GOOGLE_SHEETS = {
        settings: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZXM35_jHJ-3_F6M8m0z0E2l2SkcnLyrUUzrQCXaceAYyLCVD1f8m12yPoC_qK553mo-WDBWGW4J4R/pub?gid=0&single=true&output=csv', // Substitute gid for Site Settings tab
        packages: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZXM35_jHJ-3_F6M8m0z0E2l2SkcnLyrUUzrQCXaceAYyLCVD1f8m12yPoC_qK553mo-WDBWGW4J4R/pub?gid=0&single=true&output=csv',
        gallery: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZXM35_jHJ-3_F6M8m0z0E2l2SkcnLyrUUzrQCXaceAYyLCVD1f8m12yPoC_qK553mo-WDBWGW4J4R/pub?gid=0&single=true&output=csv',
        testimonials: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZXM35_jHJ-3_F6M8m0z0E2l2SkcnLyrUUzrQCXaceAYyLCVD1f8m12yPoC_qK553mo-WDBWGW4J4R/pub?gid=0&single=true&output=csv'
    };

    const WHATSAPP_NUMBER = '94770000000';

    window.bookPackage = function (packageTitle) {
        const clientName = prompt("Please enter your name for the booking:");
        if (clientName) {
            const waText = encodeURIComponent(`Hi, I'm ${clientName}. I would like to book the ${packageTitle} package.`);
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`, '_blank');
        }
    };

    function loadGoogleSheetData(url, templateFn) {
        if (!url || url.includes('YOUR_')) return; // Fallback to static HTML if not configured

        Papa.parse(url, {
            download: true,
            header: true,
            complete: function (results) {
                templateFn(results.data);
            },
            error: function (err) {
                console.error("Error parsing CSV:", err);
            }
        });
    }

    function renderSiteSettings(data) {
        if (!data || data.length === 0) return;

        // Supports both single-row-columns and Key-Value row formats
        let settings = data[0];
        if (data[0].Key && data[0].Value) {
            settings = {};
            data.forEach(item => {
                if (item.Key) settings[item.Key] = item.Value;
            });
        }

        if (settings.Title) {
            const el = document.getElementById('site-title');
            if (el) el.innerText = settings.Title;
        }
        if (settings.HeaderLogo) {
            const el = document.getElementById('header-logo');
            if (el) el.innerHTML = settings.HeaderLogo;
        }
        if (settings.FooterLogo) {
            const el = document.getElementById('footer-logo');
            if (el) el.innerHTML = settings.FooterLogo;
        }
        if (settings.FooterDesc) {
            const el = document.getElementById('footer-desc');
            if (el) el.innerText = settings.FooterDesc;
        }
        if (settings.Copyright) {
            const el = document.getElementById('footer-copyright');
            if (el) el.innerHTML = settings.Copyright;
        }
        if (settings.Announcement && settings.Announcement.trim() !== '') {
            const el = document.getElementById('announcement-banner');
            if (el) {
                el.innerText = settings.Announcement;
                el.style.display = 'block';
            }
        }
    }

    function renderPackages(data) {
        const container = document.getElementById('dynamic-packages');
        if (!data || data.length === 0 || !data[0].Title) return;

        container.innerHTML = '';
        data.forEach((item, index) => {
            if (!item.Title) return;
            if (item.Status && item.Status.toUpperCase() === 'INACTIVE') return; // Skip inactive packages

            const delayClass = index === 0 ? '' : `delay-${index > 2 ? 2 : index}`;
            let badgeHtml = '';
            if (item.Badge === 'Popular') badgeHtml = `<div class="package-badge">Popular</div>`;
            if (item.Badge === 'Ultimate') badgeHtml = `<div class="package-badge bg-accent">Ultimate</div>`;

            const safeTitle = item.Title.replace(/'/g, "\\'");

            container.innerHTML += `
                <div class="package-card fade-in-up ${delayClass}">
                    <div class="package-img">
                        <img src="${item.ImageURL}" alt="${item.Title}">
                        ${badgeHtml}
                    </div>
                    <div class="package-content">
                        <h3>${item.Title}</h3>
                        <p class="time"><i class="far fa-clock"></i> ${item.Time}</p>
                        <p class="desc">${item.Desc}</p>
                        <ul class="includes">
                            <li><i class="fas fa-check-circle"></i> ${item.Duration}</li>
                            <li><i class="fas fa-check-circle"></i> ${item.Pickup}</li>
                            <li><i class="fas fa-check-circle"></i> ${item.Extras}</li>
                        </ul>
                        <button onclick="window.bookPackage('${safeTitle}')" class="btn-primary-small w-100 text-center" style="border: none;">Book Now</button>
                    </div>
                </div>
            `;
        });
    }

    function renderGallery(data) {
        const container = document.getElementById('dynamic-gallery');
        if (!data || data.length === 0 || !data[0].ImageURL) return;

        container.innerHTML = '';
        data.forEach((item, index) => {
            if (!item.ImageURL) return;
            const delayClass = index === 0 ? '' : `delay-${index > 2 ? 2 : index}`;
            const largeClass = item.IsLarge && item.IsLarge.toUpperCase() === 'TRUE' ? 'gallery-large' : '';

            container.innerHTML += `
                <div class="gallery-item ${largeClass} fade-in-up ${delayClass}">
                    <img src="${item.ImageURL}" alt="${item.AltText || 'Safari Image'}">
                </div>
            `;
        });
    }

    function renderTestimonials(data) {
        const container = document.getElementById('dynamic-testimonials');
        if (!data || data.length === 0 || !data[0].Name) return;

        container.innerHTML = '';
        const approvedReviews = data.filter(item => item.Approved && item.Approved.toUpperCase() === 'TRUE');

        approvedReviews.forEach((item, index) => {
            if (!item.Name) return;
            const delayClass = index === 0 ? '' : `delay-${index > 2 ? 2 : index}`;
            const rating = parseInt(item.Rating) || 5;
            let starsHtml = '';
            for (let i = 0; i < 5; i++) {
                if (i < rating) starsHtml += '<i class="fas fa-star"></i>';
                else starsHtml += '<i class="far fa-star"></i>';
            }

            const avatarHtml = item.ImageURL
                ? `<img src="${item.ImageURL}" alt="${item.Name}" class="avatar">`
                : `<div class="avatar-placeholder">${item.Name.charAt(0)}</div>`;

            container.innerHTML += `
                <div class="testimonial-card fade-in-up ${delayClass}">
                    <div class="stars">${starsHtml}</div>
                    <p class="review">"${item.Review}"</p>
                    <div class="customer">
                        ${avatarHtml}
                        <div>
                            <h4>${item.Name}</h4>
                            <span>${item.Country}</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // Initialize data fetching
    loadGoogleSheetData(GOOGLE_SHEETS.settings, renderSiteSettings);
    loadGoogleSheetData(GOOGLE_SHEETS.packages, renderPackages);
    loadGoogleSheetData(GOOGLE_SHEETS.gallery, renderGallery);
    loadGoogleSheetData(GOOGLE_SHEETS.testimonials, renderTestimonials);
});
