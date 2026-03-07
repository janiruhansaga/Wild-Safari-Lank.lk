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
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = "Sending...";
            btn.disabled = true;

            const formData = new FormData(contactForm);
            const searchParams = new URLSearchParams();
            for (const pair of formData) {
                searchParams.append(pair[0], pair[1]);
            }

            fetch("https://script.google.com/macros/s/AKfycbxbEZPxGvzSj7lyMrTF4BledGplB29oeSdqt8dSWmGNT5PHhbJXeTYYQZ_plL8XYh09_Q/exec", {
                method: 'POST',
                body: searchParams
            })
                .then(res => res.json())
                .then(data => {
                    btn.innerText = "Sent Successfully!";
                    contactForm.reset();
                    setTimeout(() => {
                        btn.innerText = originalText;
                        btn.disabled = false;
                    }, 3000);
                })
                .catch(error => {
                    console.error("Error submitting form", error);
                    btn.innerText = "Error. Try Again.";
                    btn.disabled = false;
                });
        });
    }

    // Apps Script API Endpoint Instead of PapaParse
    const API_URL = "https://script.google.com/macros/s/AKfycbxbEZPxGvzSj7lyMrTF4BledGplB29oeSdqt8dSWmGNT5PHhbJXeTYYQZ_plL8XYh09_Q/exec";

    let WHATSAPP_NUMBER = '94770000000';

    window.bookPackage = function (packageTitle) {
        const clientName = prompt("Please enter your name for the booking:");
        if (clientName) {
            const waText = encodeURIComponent(`Hi, I'm ${clientName}. I would like to book the ${packageTitle} package.`);
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`, '_blank');
        }
    };

    function loadGoogleSheetData(action, templateFn, cacheKey) {
        const CACHE_TIME_MS = 5 * 60 * 1000; // 5 minutes cache
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(`${cacheKey}_time`);

        if (cachedData && cachedTime && (Date.now() - cachedTime < CACHE_TIME_MS)) {
            console.log(`Loading ${action} from cache`);
            templateFn(JSON.parse(cachedData));
            return;
        }

        console.log(`Fetching ${action} from API`);
        fetch(`${API_URL}?action=${action}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    localStorage.setItem(cacheKey, JSON.stringify(data.data));
                    localStorage.setItem(`${cacheKey}_time`, Date.now());
                    templateFn(data.data);
                } else {
                    console.error(`API Error for ${action}:`, data.message);
                    if (cachedData) templateFn(JSON.parse(cachedData));
                }
            })
            .catch(error => {
                console.error(`Fetch Error for ${action}:`, error);
                if (cachedData) templateFn(JSON.parse(cachedData));
            });
    }

    function renderSiteSettings(data) {
        if (!data) return;

        // Handles both direct Objects (API) and Array of Objects (Cache/PapaParse legacy)
        let settings = data;
        if (Array.isArray(data) && data.length > 0) {
            settings = data[0];
            if (data[0].Key && data[0].Value) {
                settings = {};
                data.forEach(item => {
                    if (item.Key) settings[item.Key] = item.Value;
                });
            }
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

        if (settings.about_title) {
            const el = document.getElementById('about-title');
            if (el) el.innerText = settings.about_title;
        }

        if (settings.about_desc) {
            const el = document.getElementById('about-desc');
            if (el) el.innerText = settings.about_desc;
        }

        if (settings.theme_font_heading) {
            const fontName = settings.theme_font_heading;
            document.documentElement.style.setProperty('--font-heading', `'${fontName}', serif`);
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;600;700&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        if (settings.theme_font_body) {
            const fontName = settings.theme_font_body;
            document.documentElement.style.setProperty('--font-main', `'${fontName}', sans-serif`);
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;500;600&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
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

        // --- GLOBAL MEDIA BINDINGS ---
        if (settings.favicon_url) {
            const el = document.getElementById('favicon');
            if (el) el.href = settings.favicon_url;
        }

        if (settings.logo_url) {
            const headerLogo = document.getElementById('header-logo');
            if (headerLogo) headerLogo.innerHTML = `<img src="${settings.logo_url}" alt="Site Logo" style="height: 48px; width: auto; object-fit: contain;">`;
        }

        if (settings.hero_bg_url) {
            const heroEl = document.getElementById('home');
            if (heroEl) heroEl.style.backgroundImage = `url('${settings.hero_bg_url}')`;
        }

        if (settings.about_img_url) {
            const aboutImgEl = document.getElementById('about-image');
            if (aboutImgEl) aboutImgEl.src = settings.about_img_url;
        }
        // -----------------------------
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
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-5"><h3 style="color:var(--gray-color);">New safari packages coming soon!</h3></div>';
            return;
        }

        container.innerHTML = '';
        let activeCount = 0;

        // DEBUG: Ensure the structure looks correctly fetched and keys exist
        console.log("Fetched Packages Data Array:", data);

        data.forEach((item, index) => {
            const pkgName = item.name || item.Title;
            if (!pkgName) return;

            const isActiveStr = item.is_active ? String(item.is_active).trim().toUpperCase() : null;
            const legacyStatusStr = item.Status ? String(item.Status).trim().toUpperCase() : null;

            // Check mapping logic (if explicitly false or inactive, skip this row)
            if (isActiveStr === 'FALSE' || legacyStatusStr === 'INACTIVE') return;

            activeCount++;
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

        if (activeCount === 0) {
            container.innerHTML = '<div class="col-12 text-center py-5" style="grid-column: 1 / -1;"><h3 style="color:var(--gray-color); text-align: center; width: 100%;">New safari packages coming soon!</h3></div>';
        }
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

    // Initialize data fetching via GAS API Action Names
    loadGoogleSheetData('getSettings', renderSiteSettings, 'safari_settings_cache');
    loadGoogleSheetData('getPackages', renderPackages, 'safari_packages_cache');
    loadGoogleSheetData('getGallery', renderGallery, 'safari_gallery_cache');
    loadGoogleSheetData('getTestimonials', renderTestimonials, 'safari_testimonials_cache');
});
