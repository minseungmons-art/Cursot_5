document.addEventListener('DOMContentLoaded', async () => {

    // ==========================================
    // ★ 1. 수파베이스(DB) 연결 설정 (새 프로젝트) ★
    // ==========================================
    const SUPABASE_URL = 'https://owjtheguzcejqvokancb.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_k5DwsR41u2Z8jw9NmmRyqQ_OI08cm5r'; 
    
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // ==========================================
    // ★ 2. DB에서 갤러리 사진 가져오기 ★
    // ==========================================
    async function fetchGallery() {
        const galleryGrid = document.querySelector('.gallery-grid');
        
        const { data, error } = await supabase
            .from('gallery')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error(error);
            return;
        }

        if (data && data.length > 0) {
            galleryGrid.innerHTML = ''; // 싹 비우기

            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'gallery-item';
                
                const img = document.createElement('img');
                img.src = item.image_url;
                img.alt = item.alt_text;
                
                addEffectsToImage(img);

                div.appendChild(img);
                galleryGrid.appendChild(div);
            });
        }
    }

    // 갤러리 불러오기 실행
    fetchGallery();

    // ==========================================
    // ★ 3. 기타 기능들 (효과, 팝업, 스크롤 등) ★
    // ==========================================
    function addEffectsToImage(img) {
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

        img.addEventListener('click', (e) => {
            e.stopPropagation();
            const imageViewer = document.getElementById('imageViewer');
            const fullImage = document.getElementById('fullImage');
            if(imageViewer && fullImage) {
                imageViewer.classList.add('active');
                fullImage.src = img.src;
            }
        });
    }

    const scrollIndicator = document.querySelector('.scroll-indicator');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            if(scrollIndicator) scrollIndicator.style.opacity = '0'; 
        } else {
            if(scrollIndicator) scrollIndicator.style.opacity = '0.7'; 
        }
    });

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
                if (bgImages[index] && index == currentBgIndex) img.classList.add('active');
            });
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (currentId && link.getAttribute('href').includes(currentId)) link.classList.add('active');
        });
        mobileNavLinks.forEach(link => {
            link.classList.remove('active');
            if (currentId && link.getAttribute('href').includes(currentId)) link.classList.add('active');
        });
        
        document.querySelectorAll('.reveal').forEach(el => {
            const rect = el.getBoundingClientRect();
            if(rect.top < window.innerHeight * 0.9) el.classList.add('active');
        });
    });

    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    if (hamburger && mobileMenu) hamburger.addEventListener('click', () => mobileMenu.classList.add('active'));
    if (closeMenuBtn && mobileMenu) closeMenuBtn.addEventListener('click', () => mobileMenu.classList.remove('active'));
    mobileLinks.forEach(link => link.addEventListener('click', () => mobileMenu.classList.remove('active')));

    function setupModal(btns, modal, closeBtn, isContact = false) {
        if (!modal) return;
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                if (isContact) {
                    const formContainer = document.getElementById('formContainer');
                    const successMessage = document.getElementById('successMessage');
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

    const galleryBtns = document.querySelectorAll('.gallery-trigger');
    const galleryModal = document.getElementById('galleryModal');
    const closeGalleryBtn = document.getElementById('closeGalleryBtn');
    setupModal(galleryBtns, galleryModal, closeGalleryBtn);

    const contactBtns = document.querySelectorAll('.contact-trigger');
    const contactModal = document.getElementById('contactModal');
    const closeContactBtn = document.getElementById('closeContactBtn');
    setupModal(contactBtns, contactModal, closeContactBtn, true);

    // ==========================================
    // ★ 4. 문의 폼 전송 (Netlify 실제 전송용) ★
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // 기본 폼 제출 방지
            
            const formData = new FormData(contactForm);
            
            // Netlify 서버로 데이터 보내기
            fetch('/', {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString()
            })
            .then(() => {
                // 성공 시 처리
                const formContainer = document.getElementById('formContainer');
                const successMessage = document.getElementById('successMessage');
                
                if(formContainer) formContainer.style.display = 'none';
                if(successMessage) successMessage.style.display = 'block';
                
                contactForm.reset(); // 폼 초기화
            })
            .catch((error) => {
                // 에러 발생 시 (주로 로컬 호스트에서 테스트할 때 발생)
                alert('전송 실패! Netlify에 배포된 실제 인터넷 주소에서 테스트해주세요.');
                console.error('Form submission error:', error);
            });
        });
    }

    const imageViewer = document.getElementById('imageViewer');
    const closeImageBtn = document.querySelector('.close-image-btn');
    if (closeImageBtn) closeImageBtn.addEventListener('click', () => imageViewer.classList.remove('active'));
    if (imageViewer) imageViewer.addEventListener('click', (e) => {
        if (e.target === imageViewer) imageViewer.classList.remove('active');
    });

    document.querySelectorAll('.gallery-item img').forEach(img => addEffectsToImage(img));
});