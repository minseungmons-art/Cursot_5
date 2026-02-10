document.addEventListener('DOMContentLoaded', async () => {

    // ==========================================
    // ★ 1. 수파베이스(DB) 연결 설정 ★
    // (아까 복사한 URL과 Key를 여기에 붙여넣으세요!)
    // ==========================================
    const SUPABASE_URL = 'https://kzaorastkrnzxpsvmjny.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_FvDC0R-MmTUm4xwp4zyU6g__SRBKZpU';
    
    // DB 연결 시작!
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


    // ==========================================
    // ★ 2. DB에서 갤러리 사진 가져오기 ★
    // ==========================================
    async function fetchGallery() {
        const galleryGrid = document.querySelector('.gallery-grid');
        
        // 1) DB의 'gallery' 테이블에서 데이터 다 가져와!
        const { data, error } = await supabase
            .from('gallery')
            .select('*')
            .order('id', { ascending: true }); // 등록순 정렬

        if (error) {
            console.error('데이터 가져오기 실패:', error);
            // 에러 나면 기존 HTML 사진들이라도 보여주게 둠 (비상용)
            return;
        }

        // 2) 데이터가 있으면, 기존 HTML 사진 싹 지우고 DB 사진으로 채우기
        if (data && data.length > 0) {
            galleryGrid.innerHTML = ''; // 싹 비우기

            data.forEach(item => {
                // 사진 틀 만들기
                const div = document.createElement('div');
                div.className = 'gallery-item';
                
                // 이미지 태그 만들기
                const img = document.createElement('img');
                img.src = item.image_url; // DB에 적은 파일명
                img.alt = item.alt_text;  // DB에 적은 설명
                
                // 효과 넣기 (틸트 + 확대)
                addEffectsToImage(img);

                // 조립하기
                div.appendChild(img);
                galleryGrid.appendChild(div);
            });
        }
    }

    // 갤러리 불러오기 실행!
    fetchGallery();


    // ==========================================
    // ★ 3. 이미지 효과 함수 (따로 뺌) ★
    // ==========================================
    function addEffectsToImage(img) {
        // 3D 틸트 효과
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

        // 클릭 시 확대 보기
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

    // --- (아래는 기존 코드들: 스크롤, 메뉴, 팝업 등) ---
    
    // 0. "아래로 내려보세요" 숨김
    const scrollIndicator = document.querySelector('.scroll-indicator');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            if(scrollIndicator) scrollIndicator.style.opacity = '0'; 
        } else {
            if(scrollIndicator) scrollIndicator.style.opacity = '0.7'; 
        }
    });

    // 1. 스크롤 스파이 & 배경
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
        
        // 스크롤 리빌 (Scroll Reveal) 감지
        document.querySelectorAll('.reveal').forEach(el => {
            const rect = el.getBoundingClientRect();
            if(rect.top < window.innerHeight * 0.9) el.classList.add('active');
        });
    });

    // 2. 모바일 메뉴
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    if (hamburger && mobileMenu) hamburger.addEventListener('click', () => mobileMenu.classList.add('active'));
    if (closeMenuBtn && mobileMenu) closeMenuBtn.addEventListener('click', () => mobileMenu.classList.remove('active'));
    mobileLinks.forEach(link => link.addEventListener('click', () => mobileMenu.classList.remove('active')));

    // 3. 팝업 (갤러리/문의)
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

    // 4. 문의 폼 전송
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
                document.getElementById('formContainer').style.display = 'none';
                document.getElementById('successMessage').style.display = 'block';
                contactForm.reset();
            })
            .catch(() => alert('전송 실패. 다시 시도해주세요.'));
        });
    }

    // 5. 사진 확대 닫기 버튼
    const imageViewer = document.getElementById('imageViewer');
    const closeImageBtn = document.querySelector('.close-image-btn');
    if (closeImageBtn) closeImageBtn.addEventListener('click', () => imageViewer.classList.remove('active'));
    if (imageViewer) imageViewer.addEventListener('click', (e) => {
        if (e.target === imageViewer) imageViewer.classList.remove('active');
    });

    // 초기 로딩 시 HTML에 있는 이미지에도 효과 적용 (혹시 DB 안 될 때 대비)
    document.querySelectorAll('.gallery-item img').forEach(img => addEffectsToImage(img));
});