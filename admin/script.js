const API_URL = "https://script.google.com/macros/s/AKfycbxbEZPxGvzSj7lyMrTF4BledGplB29oeSdqt8dSWmGNT5PHhbJXeTYYQZ_plL8XYh09_Q/exec";

let adminPassword = "";
let currentPackages = [];

function login() {
    const pwd = document.getElementById('admin-password').value;
    if (!pwd) return;

    Swal.fire({ title: 'Authenticating...', text: "Testing access to Google Sheets", allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

    // Test auth with a ping
    fetch(`${API_URL}?action=ping&pwd=${encodeURIComponent(pwd)}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                adminPassword = pwd;
                document.getElementById('login-view').classList.add('hidden-view');
                document.getElementById('dashboard-view').classList.remove('hidden-view');
                Swal.close();
                showTab('settings');
            } else {
                Swal.fire({ icon: 'error', title: 'Access Denied', text: 'Invalid Password. Please check Google Apps Script config.' });
            }
        })
        .catch(err => Swal.fire('Error', 'Connection failed. Is the API URL correct and deployed as ANYONE?', 'error'));
}

function logout() {
    adminPassword = "";
    document.getElementById('dashboard-view').classList.add('hidden-view');
    document.getElementById('login-view').classList.remove('hidden-view');
    document.getElementById('admin-password').value = "";
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden-view'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('bg-gray-700', 'border-l-4', 'border-blue-500'));

    document.getElementById(`tab-${tabId}`).classList.remove('hidden-view');
    document.getElementById(`nav-${tabId}`).classList.add('bg-gray-700', 'border-l-4', 'border-blue-500');

    if (tabId === 'settings') {
        document.getElementById('page-title').innerText = "Site Settings";
        loadSettings();
    } else if (tabId === 'packages') {
        document.getElementById('page-title').innerText = "Package Management";
        loadPackages();
    } else if (tabId === 'bookings') {
        document.getElementById('page-title').innerText = "Recent Inquiries";
        loadBookings();
    } else if (tabId === 'gallery') {
        document.getElementById('page-title').innerText = "Gallery Manager";
        loadGallery();
    }
}

function loadSettings() {
    Swal.fire({ title: 'Loading Settings...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
    fetch(`${API_URL}?action=getSettings&pwd=${encodeURIComponent(adminPassword)}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                const s = data.data;
                // General Settings
                document.getElementById('set-site-name').value = s.site_name || s.Title || "";
                document.getElementById('set-announcement').value = s.Announcement || "";
                document.getElementById('set-hero-title').value = s.hero_title || "";
                document.getElementById('set-hero-subtitle').value = s.hero_subtitle || "";
                document.getElementById('set-about-title').value = s.about_title || "";
                document.getElementById('set-about-desc').value = s.about_desc || "";
                document.getElementById('set-imgbb-key').value = s.imgbb_api_key || "";

                // Media Assets
                const faviconInput = document.getElementById('set-favicon');
                faviconInput.value = s.favicon_url || "";
                if (s.favicon_url) faviconInput.dispatchEvent(new Event('input'));

                const logoInput = document.getElementById('set-logo');
                logoInput.value = s.logo_url || "";
                if (s.logo_url) logoInput.dispatchEvent(new Event('input'));

                const heroBgInput = document.getElementById('set-hero-bg');
                heroBgInput.value = s.hero_bg_url || "";
                if (s.hero_bg_url) heroBgInput.dispatchEvent(new Event('input'));

                const aboutImgInput = document.getElementById('set-about-img');
                aboutImgInput.value = s.about_img_url || "";
                if (s.about_img_url) aboutImgInput.dispatchEvent(new Event('input'));

                if (s.theme_font_heading) document.getElementById('set-font-heading').value = s.theme_font_heading;
                if (s.theme_font_body) document.getElementById('set-font-body').value = s.theme_font_body;

                document.getElementById('set-whatsapp').value = s.contact_whatsapp || "";
                document.getElementById('set-footer-desc').value = s.FooterDesc || "";
                Swal.close();
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        });
}

function saveSettings(e) {
    e.preventDefault();
    const payload = {
        site_name: document.getElementById('set-site-name').value,
        Title: document.getElementById('set-site-name').value,
        Announcement: document.getElementById('set-announcement').value,
        hero_title: document.getElementById('set-hero-title').value,
        hero_subtitle: document.getElementById('set-hero-subtitle').value,
        about_title: document.getElementById('set-about-title').value,
        about_desc: document.getElementById('set-about-desc').value,
        imgbb_api_key: document.getElementById('set-imgbb-key').value,
        favicon_url: document.getElementById('set-favicon').value,
        logo_url: document.getElementById('set-logo').value,
        hero_bg_url: document.getElementById('set-hero-bg').value,
        about_img_url: document.getElementById('set-about-img').value,
        theme_font_heading: document.getElementById('set-font-heading').value,
        theme_font_body: document.getElementById('set-font-body').value,
        contact_whatsapp: document.getElementById('set-whatsapp').value,
        FooterDesc: document.getElementById('set-footer-desc').value
    };

    Swal.fire({ title: 'Saving Settings...', text: 'Updating Google Sheet', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'updateSettings', pwd: adminPassword, data: payload })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {

                // Toast notification instead of popup to be more modern
                const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
                Toast.fire({ icon: 'success', title: 'Settings saved successfully' });

            } else {
                Swal.fire('Error', data.message || 'Failed', 'error');
            }
        });
}

function loadPackages() {
    Swal.fire({ title: 'Loading Packages...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
    fetch(`${API_URL}?action=getPackages&pwd=${encodeURIComponent(adminPassword)}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                currentPackages = data.data;
                const tbody = document.getElementById('packages-table-body');
                tbody.innerHTML = '';
                currentPackages.forEach((pkg, index) => {
                    if (!pkg.Title && !pkg.name) return; // Ignore completely blank rows

                    const statusClass = (pkg.Status === 'INACTIVE' || String(pkg.is_active).toUpperCase() === 'FALSE') ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200';
                    const statusText = (pkg.Status === 'INACTIVE' || String(pkg.is_active).toUpperCase() === 'FALSE') ? 'Inactive' : 'Active';
                    const price = pkg.price_usd ? `<span class="text-blue-600 font-bold">$${pkg.price_usd}</span>` : '<span class="text-gray-400 font-medium">N/A</span>';
                    const duration = pkg.Duration || '<span class="text-gray-400">Not set</span>';

                    tbody.innerHTML += `
                        <tr class="hover:bg-gray-50 transition duration-150">
                            <td class="px-5 py-4 border-b border-gray-100 bg-white text-sm">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0 w-12 h-12 shadow-sm">
                                        <img class="w-full h-full rounded-lg object-cover" src="${pkg.ImageURL || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='}" alt="" />
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-gray-900 whitespace-no-wrap font-bold text-base">${pkg.Title || pkg.name}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-5 py-4 border-b border-gray-100 bg-white text-sm">
                                <p class="text-gray-800 whitespace-no-wrap mb-1">${price} ${pkg.price_lkr ? `<span class="text-gray-400">/ Rs ${pkg.price_lkr}</span>` : ''}</p>
                                <p class="text-xs text-gray-500"><i class="far fa-clock mr-1"></i>${duration}</p>
                            </td>
                            <td class="px-5 py-4 border-b border-gray-100 bg-white text-sm">
                                <span class="px-3 py-1 font-semibold text-xs border leading-tight ${statusClass} rounded-full tracking-wide uppercase">
                                    ${statusText}
                                </span>
                            </td>
                            <td class="px-5 py-4 border-b border-gray-100 bg-white text-sm">
                                <button onclick="openPackageModal(${index})" class="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-900 border border-indigo-200 px-3 py-1.5 rounded-md font-medium transition duration-200">
                                    <i class="fas fa-edit mr-1"></i> Edit
                                </button>
                            </td>
                        </tr>
                    `;
                });
                Swal.close();
            }
        });
}

function openPackageModal(index) {
    const pkg = currentPackages[index];
    document.getElementById('pkg-id').value = index;
    document.getElementById('pkg-title').value = pkg.Title || pkg.name || "";
    document.getElementById('pkg-image').value = pkg.ImageURL || "";
    document.getElementById('pkg-price-usd').value = pkg.price_usd || "";
    document.getElementById('pkg-price-lkr').value = pkg.price_lkr || "";
    document.getElementById('pkg-time').value = pkg.Time || "";
    document.getElementById('pkg-duration').value = pkg.Duration || "";
    document.getElementById('pkg-desc').value = pkg.Desc || pkg.description || "";

    // Status is backward/forward compatible
    const isActive = (pkg.Status === 'INACTIVE' || String(pkg.is_active).toUpperCase() === 'FALSE') ? 'INACTIVE' : 'ACTIVE';
    document.getElementById('pkg-status').value = isActive;

    document.getElementById('package-modal').classList.remove('hidden-view');
}

function closeModal() {
    document.getElementById('package-modal').classList.add('hidden-view');
}

function savePackage(e) {
    e.preventDefault();
    const index = parseInt(document.getElementById('pkg-id').value);

    // We update the item properties sending everything needed
    const payload = {
        index: index, // Row index offset
        Title: document.getElementById('pkg-title').value,
        name: document.getElementById('pkg-title').value, // In case user sheet uses 'name' headers
        ImageURL: document.getElementById('pkg-image').value,
        price_usd: document.getElementById('pkg-price-usd').value,
        price_lkr: document.getElementById('pkg-price-lkr').value,
        Time: document.getElementById('pkg-time').value,
        Duration: document.getElementById('pkg-duration').value,
        Desc: document.getElementById('pkg-desc').value,
        description: document.getElementById('pkg-desc').value,
        Status: document.getElementById('pkg-status').value, // Used by legacy
        is_active: document.getElementById('pkg-status').value === "ACTIVE" ? 'TRUE' : 'FALSE' // Used by newer specs
    };

    Swal.fire({ title: 'Saving...', text: 'Pushing to Google Sheets', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'updatePackage', pwd: adminPassword, data: payload })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
                Toast.fire({ icon: 'success', title: 'Package updated' });

                closeModal();
                loadPackages(); // Refresh listing
            } else {
                Swal.fire('Error', data.message || 'Failed', 'error');
            }
        });
}

function loadBookings() {
    Swal.fire({ title: 'Loading...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
    fetch(`${API_URL}?action=getBookings&pwd=${encodeURIComponent(adminPassword)}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                const tbody = document.getElementById('bookings-table-body');
                tbody.innerHTML = '';

                // Keep only valid entries and Reverse to show latest first
                data.data.filter(b => b.Timestamp || b['Customer Name']).reverse().forEach((b, index) => {
                    const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                    tbody.innerHTML += `
                        <tr class="${rowBg}">
                            <td class="px-5 py-4 border-b border-gray-100 text-sm">
                                <p class="text-gray-800 whitespace-no-wrap"><i class="far fa-calendar-alt mr-2 text-gray-400"></i>${new Date(b.Timestamp).toLocaleString()}</p>
                            </td>
                            <td class="px-5 py-4 border-b border-gray-100 text-sm">
                                <p class="text-gray-900 whitespace-no-wrap font-bold">${b['Customer Name'] || b.Name || 'N/A'}</p>
                                <p class="text-blue-600 text-xs mt-1 hover:underline cursor-pointer"><i class="fas fa-envelope mr-1 text-gray-400"></i>${b['Email/Phone'] || b.Email || ''}</p>
                            </td>
                            <td class="px-5 py-4 border-b border-gray-100 text-sm">
                                <span class="px-2 py-1 bg-green-100 text-green-800 border border-green-200 rounded text-xs font-bold leading-tight shadow-sm">${b['Selected Package'] || 'N/A'}</span>
                            </td>
                            <td class="px-5 py-4 border-b border-gray-100 text-sm">
                                <p class="text-gray-700 whitespace-normal text-xs leading-relaxed max-w-xs break-words" title="${b.Message || ''}">${b.Message || ''}</p>
                            </td>
                        </tr>
                    `;
                });
                Swal.close();
            } else {
                Swal.fire('Error', data.message || 'Failed to fetch Bookings sheet.', 'error');
            }
        });
}

// ----------------------------------------------------
// IMGBB UPLOAD UTILITY
// ----------------------------------------------------
function executeImgBBUpload(file, onSuccess) {
    let apiKey = document.getElementById('set-imgbb-key').value;

    if (!apiKey) {
        Swal.fire('Configure ImgBB', 'Please enter your free ImgBB API Key in "Site Settings" first. Get one at api.imgbb.com', 'warning');
        return;
    }

    Swal.fire({ title: 'Uploading...', text: 'Uploading image to Cloud...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    const formData = new FormData();
    formData.append("image", file);

    fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Swal.close();
                onSuccess(data.data.url);
            } else {
                Swal.fire('Upload Failed', data.error ? data.error.message : 'Unknown ImgBB Error', 'error');
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire('Upload Failed', 'Network error while contacting ImgBB API.', 'error');
        });
}

function uploadToImgBB(fileInput, targetUrlId, previewId) {
    const file = fileInput.files[0];
    if (!file) return;
    fileInput.value = ""; // Reset input so same file can trigger again

    executeImgBBUpload(file, (url) => {
        document.getElementById(targetUrlId).value = url;
        if (previewId) document.getElementById(previewId).src = url;

        const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        Toast.fire({ icon: 'success', title: 'Image Uploaded!' });
    });
}

// ----------------------------------------------------
// GALLERY MANAGER ALGORITHMS
// ----------------------------------------------------
function loadGallery() {
    Swal.fire({ title: 'Loading Gallery...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
    fetch(`${API_URL}?action=getGallery&pwd=${encodeURIComponent(adminPassword)}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                const container = document.getElementById('gallery-grid');
                container.innerHTML = '';

                data.data.forEach((item, index) => {
                    if (!item.ImageURL) return;
                    container.innerHTML += `
                        <div class="relative group rounded-lg overflow-hidden shadow-sm border h-48">
                            <img src="${item.ImageURL}" alt="Gallery Image" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                                <button onclick="deleteGalleryItem(${index})" class="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transform hover:scale-105 transition">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });
                Swal.close();
            } else {
                Swal.fire('Error', data.message || 'Failed to load gallery', 'error');
            }
        });
}

function uploadToGallery(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;
    fileInput.value = "";

    executeImgBBUpload(file, (url) => {
        // Send to Google Sheets
        Swal.fire({ title: 'Saving...', text: 'Adding to Database', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'addGalleryImage', pwd: adminPassword, data: { ImageURL: url, IsLarge: "FALSE" } })
        })
            .then(r => r.json())
            .then(d => {
                if (d.status === 'success') {
                    const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
                    Toast.fire({ icon: 'success', title: 'Added to Gallery' });
                    loadGallery();
                } else {
                    Swal.fire('Error', d.message || 'Failed saving to Database', 'error');
                }
            });
    });
}

function deleteGalleryItem(index) {
    Swal.fire({
        title: 'Delete Image?',
        text: "This removes the image from the website entirely.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: 'Deleting...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'deleteGalleryImage', pwd: adminPassword, data: { index: index } })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
                        Toast.fire({ icon: 'success', title: 'Deleted from Database' });
                        loadGallery();
                    } else {
                        Swal.fire('Error', data.message || 'Deletion Failed', 'error');
                    }
                });
        }
    });
}
