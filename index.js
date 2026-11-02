const supabaseUrl = 'https://korowqpkgcvldqmhwznw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvcm93cXBrZ2N2bGRxbWh3em53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NzYxNDAsImV4cCI6MjA5MTA1MjE0MH0.mzKmZpR6yhZH1e2JU0Q9ImRxeOAjXT6eF5dnXDLNIro';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('room');

    // 기기에 저장된 방 기록 배열 불러오기
    let roomHistory = JSON.parse(localStorage.getItem('teamSync_rooms')) || [];

    // URL 접속 시 이미 참여한 기기(방)면 바로 일정 화면으로 넘김 (중복 이름 방지)
    if (inviteCode) {
        const existingRoom = roomHistory.find(r => r.id === inviteCode);
        if (existingRoom) {
            window.location.href = `schedule.html?room=${inviteCode}`;
            return;
        }
        document.getElementById('join-code').value = inviteCode;
    }

    // 화면 하단 최근 기록 렌더링
    if (roomHistory.length > 0) {
        document.getElementById('history-panel').style.display = 'block';
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        roomHistory.forEach(room => {
            historyList.innerHTML += `
                <div class="history-card">
                    <div class="hist-info">
                        <h3>방 ID: ${room.id}</h3>
                        <p>내 이름: ${room.name} | 최근 접속: ${room.date}</p>
                    </div>
                    <div class="hist-actions">
                        <button onclick="window.location.href='schedule.html?room=${room.id}'" class="btn-secondary">내 시간표</button>
                        <button onclick="window.location.href='result.html?room=${room.id}'" class="btn-primary">결과 보기</button>
                    </div>
                </div>
            `;
        });
    }

    // 배열에 기록 저장 함수 (최신순 갱신)
    function saveToHistory(roomId, userName) {
        const today = new Date();
        const dateStr = `${today.getMonth() + 1}/${today.getDate()} ${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;
        
        // 기존에 있는 동일 방 기록 삭제
        roomHistory = roomHistory.filter(r => r.id !== roomId);
        
        // 새 기록 맨 앞에 추가
        roomHistory.unshift({ id: roomId, name: userName, date: dateStr });
        localStorage.setItem('teamSync_rooms', JSON.stringify(roomHistory));
    }

    document.getElementById('create-btn').addEventListener('click', async () => {
        const password = document.getElementById('create-pw').value;
        if (!password) { alert('비밀번호를 입력해주세요.'); return; }

        const roomId = Math.random().toString(36).substring(2, 10); 
        const { error } = await supabaseClient.from('rooms').insert([{ id: roomId, password: password }]);
        
        if (!error) {
            const inviteLink = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
            document.getElementById('generated-link').value = inviteLink;
            document.getElementById('invite-info').style.display = 'flex';
            document.getElementById('join-code').value = roomId;
            document.getElementById('join-pw').value = password;
        } else { alert('방 생성 중 오류가 발생했습니다.'); }
    });

    document.getElementById('copy-btn').addEventListener('click', () => {
        const linkInput = document.getElementById('generated-link');
        linkInput.select();
        navigator.clipboard.writeText(linkInput.value).then(() => alert('초대 링크 복사 완료!'));
    });

    document.getElementById('join-btn').addEventListener('click', async () => {
        const roomId = document.getElementById('join-code').value.trim();
        const password = document.getElementById('join-pw').value;
        const userName = document.getElementById('join-name').value.trim();

        if (!roomId || !password || !userName) { alert('모든 정보를 입력해주세요.'); return; }

        const { data, error } = await supabaseClient.from('rooms').select('password').eq('id', roomId).single();
        if (error || !data) { alert('방이 없거나 코드가 틀렸습니다.'); return; }
        if (data.password !== password) { alert('비밀번호가 다릅니다.'); return; }

        saveToHistory(roomId, userName);
        window.location.href = `schedule.html?room=${roomId}`;
    });
});