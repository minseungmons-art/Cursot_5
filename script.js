document.addEventListener('DOMContentLoaded', () => {
    
    // ★ 0. 애플 스타일 스크롤 리빌 (새로 추가됨!) ★
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // 화면에 10% 정도 보이면 작동
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active'); // 화면에 보이면 active 클래스 추가
                observer.unobserve(entry.target); // 한 번 보이면 감시 끝 (계속 깜빡이지 않게)
            }
        });
    }, observerOptions);

    // .reveal 클래스가 붙은 모든 요소를 감시 시작
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    // --- 기존 기능들 ---

    // 1. "아래로 내려보세요" 숨김 기능
    const scrollIndicator = document.querySelector('.scroll-indicator');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            if(scrollIndicator) scrollIndicator.style.opacity = '0'; 
        } else {
            if(scrollIndicator) scrollIndicator.style.opacity = '0.7'; 
        }
    });

    // 2. 스크롤 스파이 & 배경 변경
    const sections = document.querySelectorAll('.scroll-section');
    const bgImages = document.querySelectorAll('.bg-image');
    const navLinks = document.querySelectorAll('.nav-links a');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');

    window.addEventListener('scroll', () => {
        let currentId = '';
        let currentBgIndex = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                currentId = section.getAttribute('id');
                currentBgIndex = section.getAttribute('data-bg-index');
            }
        });

        if (!currentBgIndex && scrollY < sections[1].offsetTop) {
            bgImages.forEach(img => img.classList.remove('active'));
            if(bgImages[0]) bgImages[0].classList.add('active');
        } else {
            bgImages.forEach((img, index) => {
                img.classList.remove('active');
                if (bgImages[index] && index == currentBgIndex) {
                    img.classList.add('active');
                }
            });
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (currentId && link.getAttribute('href').includes(currentId)) {
                link.classList.add('active');
            }
        });
        
        mobileNavLinks.forEach(link => {
            link.classList.remove('active');
            if (currentId && link.getAttribute('href').includes(currentId)) {
                link.classList.add('active');
            }
        });
    });

    // 3. 모바일 메뉴
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.add('active');
        });
    }
    if (closeMenuBtn && mobileMenu) {
        closeMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    }
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });

    // 4. 팝업 기능들 (갤러리, 문의)
    const galleryBtns = document.querySelectorAll('.gallery-trigger');
    const galleryModal = document.getElementById('galleryModal');
    const closeGalleryBtn = document.getElementById('closeGalleryBtn');
    const contactBtns = document.querySelectorAll('.contact-trigger');
    const contactModal = document.getElementById('contactModal');
    const closeContactBtn = document.getElementById('closeContactBtn');
    const formContainer = document.getElementById('formContainer');
    const successMessage = document.getElementById('successMessage');

    // 팝업 열기/닫기 함수
    function setupModal(btns, modal, closeBtn, isContact = false) {
        if (!modal) return;
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // 스크롤 잠금
                if (isContact) {
                    if(formContainer) formContainer.style.display = 'block';
                    if(successMessage) successMessage.style.display = 'none';
                }
            });
        });
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    setupModal(galleryBtns, galleryModal, closeGalleryBtn);
    setupModal(contactBtns, contactModal, closeContactBtn, true);

    // 5. 폼 전송
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            fetch('/', {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString()
            })
            .then(() => {
                if(formContainer) formContainer.style.display = 'none';
                if(successMessage) successMessage.style.display = 'block';
                contactForm.reset();
            })
            .catch((error) => {
                alert('전송 실패. 다시 시도해주세요.');
            });
        });
    }

    // 6. 사진 3D 틸트 효과
    const tiltImages = document.querySelectorAll('.gallery-item img');
    tiltImages.forEach(img => {
        img.addEventListener('mousemove', (e) => {
            const rect = img.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -20; 
            const rotateY = ((x - centerX) / centerX) * 20;
            img.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.1)`;
            img.style.transition = 'transform 0.1s';
        });
        img.addEventListener('mouseleave', () => {
            img.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            img.style.transition = 'transform 0.5s ease';
        });
        
        // 7. 사진 확대 보기 (틸트와 같이 있음)
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            const imageViewer = document.getElementById('imageViewer');
            const fullImage = document.getElementById('fullImage');
            if(imageViewer && fullImage) {
                imageViewer.classList.add('active');
                fullImage.src = img.src;
            }
        });
    });

    // 사진 확대 닫기
    const imageViewer = document.getElementById('imageViewer');
    const closeImageBtn = document.querySelector('.close-image-btn');
    if (closeImageBtn) {
        closeImageBtn.addEventListener('click', () => {
            imageViewer.classList.remove('active');
        });
    }
    if (imageViewer) {
        imageViewer.addEventListener('click', (e) => {
            if (e.target === imageViewer) imageViewer.classList.remove('active');
        });
    }
});