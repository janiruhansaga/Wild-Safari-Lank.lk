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

    let WHATSAPP_NUMBER = '94770000000';

    window.bookPackage = function (packageTitle) {
        const clientName = prompt("Please enter your name for the booking:");
        if (clientName) {
            const waText = encodeURIComponent(`Hi, I'm ${clientName}. I would like to book the ${packageTitle} package.`);
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`, '_blank');
        }
    };

    function loadGoogleSheetData(url, templateFn, cacheKey) {
        if (!url || url.includes('YOUR_')) return; // Fallback to static HTML if not configured

        const CACHE_TIME_MS = 5 * 60 * 1000; // 5 minutes cache
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(`${cacheKey}_time`);

        if (cachedData && cachedTime && (Date.now() - cachedTime < CACHE_TIME_MS)) {
            templateFn(JSON.parse(cachedData));
            return;
        }

        Papa.parse(url, {
            download: true,
            header: true,
            complete: function (results) {
                localStorage.setItem(cacheKey, JSON.stringify(results.data));
                localStorage.setItem(`${cacheKey}_time`, Date.now());
                templateFn(results.data);
            },
            error: function (err) {
                console.error("Error parsing CSV:", err);
                if (cachedData) templateFn(JSON.parse(cachedData));
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

        const siteName = settings.site_name || settings.Title;
        if (siteName) {
            const titleEl = document.getElementById('site-title');
            if (titleEl) titleEl.innerText = siteName;

            const headerLogoEl = document.getElementById('header-logo');
            if (headerLogoEl) headerLogoEl.innerHTML = siteName;

            const footerLogoEl = document.getElementById('footer-logo');
            if (footerLogoEl) footerLogoEl.innerHTML = siteName;
        }

        if (settings.hero_title) {
            const el = document.getElementById('hero-title');
            if (el) el.innerText = settings.hero_title;
        }

        if (settings.hero_subtitle) {
            const el = document.getElementById('hero-subtitle');
            if (el) el.innerText = settings.hero_subtitle;
        }

        if (settings.contact_whatsapp) {
            WHATSAPP_NUMBER = settings.contact_whatsapp.replace(/[^0-9]/g, '');
            const btnEl = document.getElementById('hero-whatsapp-btn');
            if (btnEl) btnEl.href = `https://wa.me/${WHATSAPP_NUMBER}`;

            const contactPhoneLinkEl = document.getElementById('contact-phone-link');
            if (contactPhoneLinkEl) {
                contactPhoneLinkEl.href = `https://wa.me/${WHATSAPP_NUMBER}`;
                contactPhoneLinkEl.innerText = settings.contact_whatsapp;
            }

            // Update floating button
            const floatBtn = document.querySelector('.floating-whatsapp');
            if (floatBtn) floatBtn.href = `https://wa.me/${WHATSAPP_NUMBER}`;
        }

        if (settings.HeaderLogo) {
            const el = document.getElementById('header-logo');
            if (el) el.innerHTML = settings.HeaderLogo;
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
        if (!data || data.length === 0) return;

        container.innerHTML = '';
        data.forEach((item, index) => {
            const pkgName = item.name || item.Title;
            if (!pkgName) return;

            const isActive = item.is_active ? String(item.is_active).toUpperCase() : null;
            const legacyStatus = item.Status ? String(item.Status).toUpperCase() : null;
            if (isActive === 'FALSE' || legacyStatus === 'INACTIVE') return;

            const delayClass = index === 0 ? '' : `delay-${index > 2 ? 2 : index}`;

            const priceUsd = item.price_usd ? `<span style="font-weight: bold; color: var(--primary-color);">USD ${item.price_usd}</span>` : '';
            const priceLkr = item.price_lkr ? ` / LKR ${item.price_lkr}` : '';
            const priceHtml = (priceUsd || priceLkr) ? `<p style="margin-bottom: 10px; font-size: 1.1rem">${priceUsd}${priceLkr}</p>` : '';

            const desc = item.description || item.Desc || '';

            let badgeHtml = '';
            if (item.Badge === 'Popular') badgeHtml = `<div class="package-badge">Popular</div>`;
            if (item.Badge === 'Ultimate') badgeHtml = `<div class="package-badge bg-accent">Ultimate</div>`;

            const imgUrl = item.ImageURL || 'assets/jeep_gallery.png';
            const timeInfo = item.Time ? `<p class="time"><i class="far fa-clock"></i> ${item.Time}</p>` : '';

            const inclusions = [];
            if (item.Duration) inclusions.push(`<li><i class="fas fa-check-circle"></i> ${item.Duration}</li>`);
            if (item.Pickup) inclusions.push(`<li><i class="fas fa-check-circle"></i> ${item.Pickup}</li>`);
            if (item.Extras) inclusions.push(`<li><i class="fas fa-check-circle"></i> ${item.Extras}</li>`);

            const includesHtml = inclusions.length > 0 ? `<ul class="includes">${inclusions.join('')}</ul>` : '';
            const safeTitle = pkgName.replace(/'/g, "\\'");

            container.innerHTML += `
                <div class="package-card fade-in-up ${delayClass}">
                    <div class="package-img">
                        <img src="${imgUrl}" alt="${pkgName}">
                        ${badgeHtml}
                    </div>
                    <div class="package-content">
                        <h3>${pkgName}</h3>
                        ${priceHtml}
                        ${timeInfo}
                        <p class="desc">${desc}</p>
                        ${includesHtml}
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
    loadGoogleSheetData(GOOGLE_SHEETS.settings, renderSiteSettings, 'safari_settings_cache');
    loadGoogleSheetData(GOOGLE_SHEETS.packages, renderPackages, 'safari_packages_cache');
    loadGoogleSheetData(GOOGLE_SHEETS.gallery, renderGallery, 'safari_gallery_cache');
    loadGoogleSheetData(GOOGLE_SHEETS.testimonials, renderTestimonials, 'safari_testimonials_cache');
});
