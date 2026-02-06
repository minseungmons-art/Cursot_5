document.addEventListener('DOMContentLoaded', () => {
    
    // 1. 스크롤 배경 변경 기능
    const sections = document.querySelectorAll('.scroll-section');
    const bgImages = document.querySelectorAll('.bg-image');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('data-bg-index');
            }
        });
        if (!current && scrollY < sections[1].offsetTop) {
            bgImages.forEach(img => img.classList.remove('active'));
            if(bgImages[0]) bgImages[0].classList.add('active');
            return;
        }
        bgImages.forEach((img, index) => {
            img.classList.remove('active');
            if (bgImages[index] && index == current) {
                img.classList.add('active');
            }
        });
    });

    // 2. 모바일 메뉴 열기/닫기
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

    // 3. 갤러리 팝업 기능
    const galleryBtns = document.querySelectorAll('.gallery-trigger');
    const galleryModal = document.getElementById('galleryModal');
    const closeGalleryBtn = document.getElementById('closeGalleryBtn');

    if (galleryModal) {
        galleryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                galleryModal.classList.add('active');
            });
        });

        if (closeGalleryBtn) {
            closeGalleryBtn.addEventListener('click', () => {
                galleryModal.classList.remove('active');
            });
        }
        galleryModal.addEventListener('click', (e) => {
            if (e.target === galleryModal) {
                galleryModal.classList.remove('active');
            }
        });
    }

    // 4. 문의 팝업 기능
    const contactBtns = document.querySelectorAll('.contact-trigger');
    const contactModal = document.getElementById('contactModal');
    const closeContactBtn = document.getElementById('closeContactBtn');
    const formContainer = document.getElementById('formContainer');
    const successMessage = document.getElementById('successMessage');

    if (contactModal) {
        contactBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                contactModal.classList.add('active');
                if(formContainer) formContainer.style.display = 'block';
                if(successMessage) successMessage.style.display = 'none';
            });
        });

        if (closeContactBtn) {
            closeContactBtn.addEventListener('click', () => {
                contactModal.classList.remove('active');
            });
        }
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                contactModal.classList.remove('active');
            }
        });
    }

    // 5. 폼 전송 기능
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

    // 6. 사진 확대 보기 기능
    const galleryImages = document.querySelectorAll('.gallery-item img');
    const imageViewer = document.getElementById('imageViewer');
    const fullImage = document.getElementById('fullImage');
    const closeImageBtn = document.querySelector('.close-image-btn');

    galleryImages.forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation(); // 부모 팝업 닫힘 방지
            imageViewer.classList.add('active');
            fullImage.src = img.src;
        });
    });

    if (closeImageBtn) {
        closeImageBtn.addEventListener('click', () => {
            imageViewer.classList.remove('active');
        });
    }
    if (imageViewer) {
        imageViewer.addEventListener('click', (e) => {
            if (e.target === imageViewer) {
                imageViewer.classList.remove('active');
            }
        });
    }
});