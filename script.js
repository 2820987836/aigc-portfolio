/* ==========================================
   阿百川 AIGC 作品集 — 主脚本
   机甲赛博风 + 鼠标特效 + 粒子 + 轮播 + 3D倾斜
========================================== */

(function() {
'use strict';

const isMobile = window.matchMedia('(hover: none)').matches || window.innerWidth < 768;

// ========================
// 1. 机甲加载动画
// ========================
function initLoadingScreen() {
    const screen = document.getElementById('loadingScreen');
    const bar = document.getElementById('loadingBar');
    const pct = document.getElementById('loadingPct');
    const status = document.getElementById('loadingStatus');
    const log = document.getElementById('loadingLog');
    const skip = document.getElementById('loadingSkip');
    if (!screen) return;

    let progress = 0;
    let done = false;

    const logs = [
        '> BOOT MECHA CORE...',
        '> LOAD VISUAL ASSETS...',
        '> INIT HUD INTERFACE...',
        '> CALIBRATE NEURAL NET...',
        '> SYSTEM READY.'
    ];
    let logIdx = 0;

    function addLog() {
        if (logIdx < logs.length) {
            const div = document.createElement('div');
            div.textContent = logs[logIdx];
            log.appendChild(div);
            logIdx++;
        }
    }

    const interval = setInterval(() => {
        progress += Math.random() * 8 + 3;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            status.textContent = 'SYSTEM READY';
            status.style.color = 'var(--accent-bright)';
            status.style.textShadow = '0 0 20px var(--accent)';
            setTimeout(finish, 400);
        }
        bar.style.width = progress + '%';
        pct.textContent = Math.floor(progress) + '%';

        if (progress > 20 && logIdx === 0) addLog();
        if (progress > 45 && logIdx === 1) addLog();
        if (progress > 70 && logIdx === 2) addLog();
        if (progress > 90 && logIdx === 3) addLog();
        if (progress >= 100 && logIdx === 4) addLog();
    }, 120);

    function finish() {
        if (done) return;
        done = true;
        screen.classList.add('done');
        setTimeout(() => screen.remove(), 700);
        document.body.style.overflow = '';
        // Trigger initial animations
        window.dispatchEvent(new Event('scroll'));
    }

    skip.addEventListener('click', finish);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish();
    });

    document.body.style.overflow = 'hidden';
}

// ========================
// 2. 背景粒子层 (星空 + 六边形)
// ========================
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const count = isMobile ? 20 : 80;
    const colors = ['#4a9eff', '#6db5ff', '#9c7eff', '#ffffff'];

    for (let i = 0; i < count; i++) {
        const isStar = Math.random() > 0.4;
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: isStar ? Math.random() * 1.5 + 0.3 : Math.random() * 3 + 1,
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
            opacity: Math.random() * 0.5 + 0.2,
            twinkle: Math.random() * 0.02 + 0.005,
            twinkleDir: 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            isHex: !isStar,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.01
        });
    }

    function drawHexagon(x, y, size, color, opacity) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(0);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = Math.cos(angle) * size;
            const py = Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = opacity * 0.4;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotSpeed;
            p.opacity += p.twinkle * p.twinkleDir;
            if (p.opacity > 0.7) p.twinkleDir = -1;
            if (p.opacity < 0.1) p.twinkleDir = 1;

            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            if (p.isHex) {
                drawHexagon(p.x, p.y, p.size * 2, p.color, p.opacity);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
    }
    animate();
}

// ========================
// 3. 鼠标特效 (光标 + 拖尾 + 点击涟漪)
// ========================
function initCursorEffects() {
    if (isMobile) return;

    const cursor = document.getElementById('customCursor');
    const canvas = document.getElementById('cursorCanvas');
    if (!cursor || !canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    const trail = [];
    const ripples = [];
    const maxTrail = 20;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        trail.push({
            x: mouseX,
            y: mouseY,
            size: Math.random() * 3 + 1,
            life: 1,
            color: Math.random() > 0.5 ? '#4a9eff' : '#9c7eff'
        });
        if (trail.length > maxTrail) trail.shift();
    });

    document.addEventListener('click', e => {
        ripples.push({
            x: e.clientX,
            y: e.clientY,
            radius: 0,
            maxRadius: 60,
            life: 1
        });
    });

    // Hover detection
    document.addEventListener('mouseover', e => {
        if (e.target.closest('a, button, .video-card, .work-card, .char-card, .skill-card, .flow-step, .chip, .tool, .tab-btn, .carousel-slide, .carousel-dot, .carousel-arrow, .scroll-btn')) {
            cursor.classList.add('hover');
        }
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest('a, button, .video-card, .work-card, .char-card, .skill-card, .flow-step, .chip, .tool, .tab-btn, .carousel-slide, .carousel-dot, .carousel-arrow, .scroll-btn')) {
            cursor.classList.remove('hover');
        }
    });

    document.addEventListener('mousedown', () => cursor.classList.add('click'));
    document.addEventListener('mouseup', () => cursor.classList.remove('click'));

    function drawHex(x, y, size, color, alpha) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Smooth cursor follow
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        // Draw trail
        for (let i = trail.length - 1; i >= 0; i--) {
            const t = trail[i];
            t.life -= 0.05;
            if (t.life <= 0) {
                trail.splice(i, 1);
                continue;
            }
            drawHex(t.x, t.y, t.size * (1 + (1 - t.life) * 2), t.color, t.life * 0.6);
        }

        // Draw ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
            const r = ripples[i];
            r.radius += 3;
            r.life -= 0.03;
            if (r.life <= 0) {
                ripples.splice(i, 1);
                continue;
            }
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#4a9eff';
            ctx.globalAlpha = r.life * 0.6;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Inner ring
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius * 0.5, 0, Math.PI * 2);
            ctx.strokeStyle = '#9c7eff';
            ctx.globalAlpha = r.life * 0.3;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
    }
    animate();
}

// ========================
// 4. Hero 下方作品轮播
// ========================
function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const prev = document.getElementById('carouselPrev');
    const next = document.getElementById('carouselNext');
    const dotsWrap = document.getElementById('carouselDots');
    if (!track) return;

    const slides = track.querySelectorAll('.carousel-slide');
    let current = 0;
    let autoTimer = null;
    let isPaused = false;
    const interval = 4000;

    // Create dots
    slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
    });

    const dots = dotsWrap.querySelectorAll('.carousel-dot');

    function createVideoEl(src) {
        const video = document.createElement('video');
        video.src = src;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.autoplay = true;
        video.preload = 'metadata';
        video.setAttribute('muted', '');
        return video;
    }

    function goTo(idx) {
        // Clean up current slide
        const oldSlide = slides[current];
        const oldVideo = oldSlide.querySelector('video');
        if (oldVideo) {
            oldVideo.pause();
            oldVideo.remove();
        }
        oldSlide.classList.remove('active');

        current = (idx + slides.length) % slides.length;
        const newSlide = slides[current];
        newSlide.classList.add('active');

        // If video slide, create and play video
        const type = newSlide.dataset.type;
        const src = newSlide.dataset.src;
        if (type === 'video' && src) {
            const existingVideo = newSlide.querySelector('video');
            if (!existingVideo) {
                const video = createVideoEl(src);
                const img = newSlide.querySelector('img');
                if (img) img.style.display = 'none';
                newSlide.insertBefore(video, newSlide.firstChild);
            }
            const v = newSlide.querySelector('video');
            if (v) v.play().catch(() => {});
        }

        // Update dots
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function nextSlide() { goTo(current + 1); }
    function prevSlide() { goTo(current - 1); }

    function startAuto() {
        stopAuto();
        autoTimer = setInterval(() => {
            if (!isPaused) nextSlide();
        }, interval);
    }

    function stopAuto() {
        if (autoTimer) clearInterval(autoTimer);
    }

    prev.addEventListener('click', () => { prevSlide(); startAuto(); });
    next.addEventListener('click', () => { nextSlide(); startAuto(); });

    // Pause on hover
    track.addEventListener('mouseenter', () => { isPaused = true; });
    track.addEventListener('mouseleave', () => { isPaused = false; });

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
    track.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextSlide();
            else prevSlide();
            startAuto();
        }
    });

    // Click to open video modal or lightbox
    slides.forEach(slide => {
        slide.addEventListener('click', (e) => {
            // Avoid triggering when clicking arrows/dots
            if (e.target.closest('.carousel-arrow, .carousel-dot')) return;

            const type = slide.dataset.type;
            const src = slide.dataset.src;
            const img = slide.querySelector('img');

            if (type === 'video' && src) {
                const modalVideo = document.getElementById('modalVideo');
                const videoModal = document.getElementById('videoModal');
                if (modalVideo && videoModal) {
                    modalVideo.src = src;
                    videoModal.classList.add('show');
                    modalVideo.play().catch(() => {});
                    isPaused = true; // pause carousel auto-advance while modal is open
                }
            } else if (img && img.src) {
                const lightbox = document.getElementById('lightbox');
                const lightboxImg = document.getElementById('lightboxImg');
                if (lightbox && lightboxImg) {
                    lightboxImg.src = img.src;
                    lightbox.classList.add('show');
                    isPaused = true;
                }
            }
        });
    });

    // Resume carousel when modal/lightbox closes
    document.addEventListener('click', (e) => {
        if (e.target.closest('.modal-close, .modal-mask, .lightbox-close') ||
            e.target.id === 'lightbox') {
            isPaused = false;
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') isPaused = false;
    });

    // Initialize first slide
    goTo(0);
    startAuto();
}

// ========================
// 5. 3D 卡片倾斜
// ========================
function init3DTilt() {
    if (isMobile) {
        // Mobile: gyroscope tilt
        initGyroTilt();
        return;
    }

    const cards = document.querySelectorAll('.video-card, .work-card, .char-card, .skill-card');
    cards.forEach(card => {
        card.classList.add('tilt-card');
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rotX = ((y - cy) / cy) * -8;
            const rotY = ((x - cx) / cx) * 8;
            card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

function initGyroTilt() {
    const cards = document.querySelectorAll('.video-card, .work-card, .char-card, .skill-card');
    cards.forEach(card => card.classList.add('tilt-card'));

    let beta = 0, gamma = 0;
    window.addEventListener('deviceorientation', e => {
        beta = e.beta || 0;
        gamma = e.gamma || 0;
        cards.forEach(card => {
            const rotX = Math.max(-8, Math.min(8, (beta - 45) / 5));
            const rotY = Math.max(-8, Math.min(8, gamma / 5));
            card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        });
    });
}

// ========================
// 6. 增强滚动动画
// ========================
function initScrollReveal() {
    const sections = document.querySelectorAll('.section');

    sections.forEach(sec => {
        sec.classList.add('reveal-section');
        const scanLine = document.createElement('div');
        scanLine.className = 'section-scan-line';
        sec.appendChild(scanLine);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                const scanLine = entry.target.querySelector('.section-scan-line');
                if (scanLine) {
                    scanLine.classList.add('scanning');
                    setTimeout(() => scanLine.classList.remove('scanning'), 1000);
                }
            }
        });
    }, { threshold: 0.08 });

    sections.forEach(sec => observer.observe(sec));

    // Stagger child elements
    const staggerEls = document.querySelectorAll('.intro-card, .skill-card, .flow-step, .video-card, .work-card, .char-card, .anime-block, .carousel-section');
    staggerEls.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ${(i % 6) * 0.08}s ease, transform 0.6s ${(i % 6) * 0.08}s ease`;
    });

    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    staggerEls.forEach(el => staggerObserver.observe(el));
}

// ========================
// 7. 原有功能（导航/视频/灯箱/Tab/轮播按钮）
// ========================
function initOriginal() {
    // 导航滚动
    const navbar = document.getElementById('navbar');
    const backTop = document.getElementById('backTop');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
        if (window.scrollY > 600) backTop.classList.add('show');
        else backTop.classList.remove('show');
    });

    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    navToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
    navLinks.forEach(link => link.addEventListener('click', () => navMenu.classList.remove('open')));

    // 导航 active
    const sections = document.querySelectorAll('section[id]');
    const observerNav = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
                });
            }
        });
    }, { threshold: 0.4, rootMargin: '-80px 0px -50% 0px' });
    sections.forEach(sec => observerNav.observe(sec));

    // 数字滚动
    const statNums = document.querySelectorAll('.stat-num[data-target]');
    const observerStats = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                let current = 0;
                const step = Math.max(1, Math.floor(target / 30));
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) { current = target; clearInterval(timer); }
                    el.textContent = current + '+';
                }, 30);
                observerStats.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    statNums.forEach(el => observerStats.observe(el));

    // Tab 切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    const worksPanels = document.querySelectorAll('.works-panel');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            worksPanels.forEach(p => p.classList.remove('active'));
            document.getElementById(`panel-${target}`).classList.add('active');
        });
    });

    // 横向轮播滚动按钮
    document.querySelectorAll('.scroll-carousel').forEach(carousel => {
        const track = carousel.querySelector('.scroll-track');
        const prev = carousel.querySelector('.scroll-prev');
        const next = carousel.querySelector('.scroll-next');
        if (!track) return;

        function updateBtns() {
            const maxScroll = track.scrollWidth - track.clientWidth - 2;
            prev.classList.toggle('disabled', track.scrollLeft <= 2);
            next.classList.toggle('disabled', track.scrollLeft >= maxScroll);
        }
        const scrollAmount = () => Math.floor(track.clientWidth * 0.8);
        prev.addEventListener('click', () => track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
        next.addEventListener('click', () => track.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));
        track.addEventListener('scroll', updateBtns);
        updateBtns();
    });

    // 视频弹窗
    const videoModal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const modalClose = document.getElementById('modalClose');
    const videoCovers = document.querySelectorAll('.video-cover');

    videoCovers.forEach(cover => {
        cover.addEventListener('click', () => {
            const src = cover.dataset.src;
            if (src) {
                modalVideo.src = src;
                videoModal.classList.add('show');
                modalVideo.play().catch(() => {});
            }
        });
    });

    function closeVideoModal() {
        videoModal.classList.remove('show');
        modalVideo.pause();
        modalVideo.src = '';
    }
    modalClose.addEventListener('click', closeVideoModal);
    videoModal.querySelector('.modal-mask').addEventListener('click', closeVideoModal);

    // 图片灯箱 — 滚轮缩放 + 拖拽平移
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxViewport = document.getElementById('lightboxViewport');
    const lbZoomIn = document.getElementById('lbZoomIn');
    const lbZoomOut = document.getElementById('lbZoomOut');
    const lbReset = document.getElementById('lbReset');
    const workCards = document.querySelectorAll('[data-lightbox]');

    let lbScale = 1;
    let lbMinScale = 0.5;
    let lbMaxScale = 20;
    let lbX = 0;
    let lbY = 0;
    let isDragging = false;
    let dragMoved = false;
    const dragThreshold = 5;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartLbX = 0;
    let dragStartLbY = 0;

    function updateLightboxTransform() {
        lightboxImg.style.transform = `translate(${lbX}px, ${lbY}px) scale(${lbScale})`;
    }

    function resetLightboxView() {
        lbScale = 1;
        lbX = 0;
        lbY = 0;
        updateLightboxTransform();
    }

    function openLightbox(src) {
        lightboxImg.src = src;
        lightbox.classList.add('show');
        resetLightboxView();
    }

    function closeLightbox() {
        lightbox.classList.remove('show');
        lightboxImg.src = '';
    }

    workCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const src = card.getAttribute('href');
            if (src) openLightbox(src);
        });
    });

    // 滚轮缩放
    if (lightboxViewport) {
        lightboxViewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.25 : 0.25;
            const newScale = Math.max(lbMinScale, Math.min(lbMaxScale, lbScale + delta));
            if (newScale === lbScale) return;
            // 以鼠标位置为中心缩放
            const rect = lightboxViewport.getBoundingClientRect();
            const cx = e.clientX - rect.left - rect.width / 2;
            const cy = e.clientY - rect.top - rect.height / 2;
            const ratio = newScale / lbScale;
            lbX = cx - (cx - lbX) * ratio;
            lbY = cy - (cy - lbY) * ratio;
            lbScale = newScale;
            updateLightboxTransform();
        }, { passive: false });
    }

    // 拖拽平移
    if (lightboxViewport) {
        lightboxViewport.addEventListener('mousedown', (e) => {
            if (e.target.closest('.lb-control')) return;
            e.preventDefault();
            isDragging = true;
            dragMoved = false;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            dragStartLbX = lbX;
            dragStartLbY = lbY;
            lightboxViewport.classList.add('dragging');
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            if (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold) {
                dragMoved = true;
            }
            lbX = dragStartLbX + dx;
            lbY = dragStartLbY + dy;
            updateLightboxTransform();
        });
        document.addEventListener('mouseup', () => {
            isDragging = false;
            if (lightboxViewport) lightboxViewport.classList.remove('dragging');
        });
    }

    // 缩放按钮
    if (lbZoomIn) {
        lbZoomIn.addEventListener('click', () => {
            lbScale = Math.min(lbMaxScale, lbScale + 0.5);
            updateLightboxTransform();
        });
    }
    if (lbZoomOut) {
        lbZoomOut.addEventListener('click', () => {
            lbScale = Math.max(lbMinScale, lbScale - 0.5);
            updateLightboxTransform();
        });
    }
    if (lbReset) {
        lbReset.addEventListener('click', resetLightboxView);
    }

    // 关闭
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (dragMoved) return;
            if (e.target === lightbox || e.target === lightboxViewport) closeLightbox();
        });
    }

    // ESC
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeVideoModal(); closeLightbox(); }
    });
}

// ========================
// 初始化
// ========================
document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initParticles();
    initCursorEffects();
    initCarousel();
    init3DTilt();
    initScrollReveal();
    initOriginal();
});

})();
