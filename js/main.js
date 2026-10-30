/**
 * CampusConnect - Client-Side Interactive Engine
 * Provides fast client-side filtering, authentication mock, and interactive feedback.
 */

document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initClientFilter();
    initSaveButtons();
    initFormValidation();
    initShareButtons();
    initAuthHeader();
    initCategoryPills();
});

/**
 * Mobile Navigation Drawer Toggle & Swipe-To-Dismiss
 */
function initMobileMenu() {
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const drawer = document.getElementById('mobileNavDrawer');
    const overlay = document.getElementById('mobileDrawerOverlay');
    const closeBtn = document.getElementById('mobileDrawerClose');

    if (!drawer) return;

    function openMenu() {
        if (toggleBtn) {
            toggleBtn.classList.add('active');
            toggleBtn.setAttribute('aria-expanded', 'true');
        }
        drawer.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        if (toggleBtn) {
            toggleBtn.classList.remove('active');
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
        drawer.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    window.openMobileMenu = openMenu;
    window.closeMobileMenu = closeMenu;
    window.toggleMobileMenu = function(e) {
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();
        if (drawer.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeMenu();
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function(e) {
            e.preventDefault();
            closeMenu();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && drawer.classList.contains('active')) {
            closeMenu();
        }
    });

    // Close when clicking any nav link inside drawer
    drawer.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Swipe-to-dismiss gesture on mobile (swipe right)
    let touchStartX = 0;
    let touchStartY = 0;
    drawer.addEventListener('touchstart', function(e) {
        if (e.touches && e.touches.length > 0) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    drawer.addEventListener('touchend', function(e) {
        if (e.changedTouches && e.changedTouches.length > 0) {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            if (touchEndX - touchStartX > 45 && Math.abs(touchEndY - touchStartY) < 80) {
                closeMenu();
            }
        }
    }, { passive: true });
}

/**
 * Real-time filter & search on event cards
 */
function initClientFilter() {
    const searchInput = document.getElementById('clientSearchInput');
    const deptSelect = document.getElementById('clientDeptSelect');
    const yearSelect = document.getElementById('clientYearSelect');
    const eventCards = document.querySelectorAll('.event-card-item');

    if (!eventCards.length) return;

    function applyFilter() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const dept = deptSelect ? deptSelect.value.toLowerCase().trim() : 'all';
        const year = yearSelect ? yearSelect.value.toLowerCase().trim() : 'all';

        let visibleCount = 0;

        eventCards.forEach(card => {
            const title = card.getAttribute('data-title') || '';
            const organizer = card.getAttribute('data-organizer') || '';
            const category = card.getAttribute('data-category') || '';
            const cardDept = card.getAttribute('data-dept') || '';
            const cardYear = card.getAttribute('data-year') || '';

            const matchesSearch = !query || 
                title.includes(query) || 
                organizer.includes(query) || 
                category.includes(query);

            const matchesDept = (dept === 'all') || 
                cardDept.includes(dept) || 
                cardDept.includes('all');

            const matchesYear = (year === 'all') || 
                cardYear.includes(year) || 
                cardYear.includes('all');

            if (matchesSearch && matchesDept && matchesYear) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        const noResultsMsg = document.getElementById('noResultsMsg');
        if (noResultsMsg) {
            noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
        }

        const countBadge = document.getElementById('resultsCountBadge');
        if (countBadge) {
            countBadge.innerText = visibleCount + ' events found';
        }
    }

    window.applyDashboardFilter = applyFilter;

    if (searchInput) {
        searchInput.addEventListener('input', applyFilter);
    }
    if (deptSelect) {
        deptSelect.addEventListener('change', applyFilter);
    }
    if (yearSelect) {
        yearSelect.addEventListener('change', applyFilter);
    }

    // Auto-filter on page load if query parameter exists
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('search') && searchInput) {
        searchInput.value = urlParams.get('search');
        applyFilter();
    } else if (urlParams.has('category') && searchInput) {
        const cat = urlParams.get('category');
        if (cat && cat !== 'All') {
            searchInput.value = cat;
            applyFilter();
        }
    }
}

/**
 * Category Filter Pills Click Handler on Dashboard
 */
function initCategoryPills() {
    const pills = document.querySelectorAll('.cat-pill, .filter-category-pill');
    if (!pills.length) return;

    pills.forEach(pill => {
        pill.addEventListener('click', function(e) {
            const catName = this.textContent.trim().replace(/^All Categories|^All/, '').trim();
            const searchInput = document.getElementById('clientSearchInput');
            if (searchInput) {
                pills.forEach(p => p.classList.remove('active'));
                this.classList.add('active');
                if (this.textContent.includes('All')) {
                    searchInput.value = '';
                } else {
                    searchInput.value = catName;
                }
                if (window.applyDashboardFilter) {
                    window.applyDashboardFilter();
                }
            }
        });
    });
}

/**
 * Handle bookmark / save events in localStorage
 */
function initSaveButtons() {
    const savedList = JSON.parse(localStorage.getItem('saved_events') || '[]');

    document.querySelectorAll('.btn-save-toggle').forEach(btn => {
        const eventId = btn.getAttribute('data-event-id');
        const icon = btn.querySelector('.save-icon');
        const label = btn.querySelector('.save-label');

        if (savedList.includes(eventId)) {
            btn.classList.add('saved');
            if (icon) icon.innerHTML = '&#9829;';
            if (label) label.innerText = 'Saved';
        }

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (!eventId) return;

            let currentSaved = JSON.parse(localStorage.getItem('saved_events') || '[]');
            if (currentSaved.includes(eventId)) {
                currentSaved = currentSaved.filter(id => id !== eventId);
                btn.classList.remove('saved');
                if (icon) icon.innerHTML = '&#9825;';
                if (label) label.innerText = 'Save Event';
            } else {
                currentSaved.push(eventId);
                btn.classList.add('saved');
                if (icon) icon.innerHTML = '&#9829;';
                if (label) label.innerText = 'Saved';
            }
            localStorage.setItem('saved_events', JSON.stringify(currentSaved));
        });
    });
}

/**
 * Form Validation and Local Mock Submissions
 */
function initFormValidation() {
    const regForm = document.getElementById('studentRegisterForm');
    if (regForm) {
        regForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const pass = document.getElementById('regPassword').value;
            const confirm = document.getElementById('regConfirmPassword').value;

            if (pass !== confirm) {
                alert('Passwords do not match! Please check and try again.');
                return;
            }

            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const dept = document.getElementById('regDepartment').value;
            const year = document.getElementById('regYear').value;

            localStorage.setItem('currentUser', JSON.stringify({
                name: name,
                email: email,
                department: dept,
                year: year,
                role: 'student'
            }));

            alert('Registration Successful! Welcome to CampusConnect LTCE, ' + name + '.');
            window.location.href = 'dashboard.html';
        });
    }

    const loginForm = document.querySelector('.auth-page-wrapper form');
    if (loginForm && !regForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            let name = "Student User";
            let role = "student";
            let dept = "Computer Engineering";
            let year = "TE - 3rd Year";

            if (email.includes('admin')) {
                name = "Chief Administrator";
                role = "admin";
            } else if (email.includes('gdg')) {
                name = "Aarav Patel (GDG Pres.)";
                role = "organizer";
                dept = "Google Developer Groups";
            } else if (email.includes('aimsa')) {
                name = "Haresh Chavan (AIMSA Pres.)";
                role = "organizer";
                dept = "CSE (AI & ML)";
            } else if (email.includes('cesa')) {
                name = "Tanmay Rane (CESA Pres.)";
                role = "organizer";
                dept = "Computer Engineering";
            } else {
                name = email.split('@')[0].replace(/[._]/g, ' ');
                name = name.charAt(0).toUpperCase() + name.slice(1);
            }

            localStorage.setItem('currentUser', JSON.stringify({
                name: name,
                email: email,
                role: role,
                department: dept,
                year: year
            }));

            window.location.href = 'dashboard.html';
        });
    }
}

/**
 * Dynamic Navbar User Chip and Logout Handler
 */
function initAuthHeader() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;

    try {
        const user = JSON.parse(userStr);
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const loginLink = headerActions.querySelector('a[href="login.html"]');
            const regLink = headerActions.querySelector('a[href="register.html"]');
            if (loginLink) loginLink.style.display = 'none';
            if (regLink) {
                regLink.outerHTML = `
                    <div class="user-logged-chip" style="display:inline-flex; align-items:center; gap:8px;">
                        <span style="color:#facc15; font-size:0.85rem; font-weight:700;">${user.name}</span>
                        <a href="my-registrations.html" class="btn-clean-ghost" style="padding:4px 10px; font-size:0.75rem;">My Passes</a>
                        <button type="button" onclick="localStorage.removeItem('currentUser'); window.location.reload();" class="btn-clean-ghost" style="padding:4px 8px; font-size:0.75rem; border:none; cursor:pointer;" title="Sign Out">Logout</button>
                    </div>
                `;
            }
        }

        // Also update mobile drawer footer
        const mobileAuth = document.querySelector('.mobile-auth-stack');
        if (mobileAuth) {
            mobileAuth.innerHTML = `
                <div style="text-align:center; padding:8px 0; color:#fff;">
                    <strong>${user.name}</strong> (${user.role.toUpperCase()})
                </div>
                <a href="my-registrations.html" class="btn btn-clean-primary" style="width:100%; text-align:center;">My Registered Passes</a>
                <button type="button" onclick="localStorage.removeItem('currentUser'); window.location.reload();" class="btn btn-clean-ghost" style="width:100%; text-align:center; margin-top:6px; cursor:pointer;">Log Out</button>
            `;
        }
    } catch(e) {}
}

/**
 * WhatsApp and Direct Share
 */
function initShareButtons() {
    const shareBtn = document.getElementById('btnShareWhatsApp');
    if (shareBtn) {
        shareBtn.addEventListener('click', function () {
            const title = this.getAttribute('data-title') || '';
            const date = this.getAttribute('data-date') || '';
            const venue = this.getAttribute('data-venue') || '';
            const benefits = this.getAttribute('data-benefits') || '';
            const attendance = this.getAttribute('data-attendance') || '';
            const url = window.location.href;

            let extraInfo = '';
            if (attendance) {
                extraInfo += `🎓 *Attendance Policy:* ${attendance}\n`;
            }
            if (benefits) {
                extraInfo += `🎁 *Perks & Rewards:* ${benefits}\n`;
            }

            const text = encodeURIComponent(
                `📢 *${title}*\n\n` +
                `🗓 Date: ${date}\n` +
                `📍 Venue: ${venue}\n` +
                (extraInfo ? `${extraInfo}\n` : '\n') +
                `👉 View complete details & register officially on CampusConnect:\n${url}`
            );

            window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
        });
    }

    const copyBtn = document.getElementById('btnCopyLink');
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            navigator.clipboard.writeText(window.location.href).then(() => {
                const originalText = copyBtn.innerText;
                copyBtn.innerText = 'Copied to Clipboard!';
                setTimeout(() => {
                    copyBtn.innerText = originalText;
                }, 2000);
            });
        });
    }
}

/**
 * Filter events by selected campus club or organizing body
 */
function filterByClub(clubName) {
    const searchInput = document.getElementById('clientSearchInput');
    if (searchInput) {
        searchInput.value = clubName;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        window.location.href = 'dashboard.html?search=' + encodeURIComponent(clubName);
    }
}
