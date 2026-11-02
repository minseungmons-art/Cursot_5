const supabaseUrl = 'https://korowqpkgcvldqmhwznw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvcm93cXBrZ2N2bGRxbWh3em53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NzYxNDAsImV4cCI6MjA5MTA1MjE0MH0.mzKmZpR6yhZH1e2JU0Q9ImRxeOAjXT6eF5dnXDLNIro';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// [내 시간표] 클릭 시 비밀번호와 이름을 다시 확인하여 세션을 복구하는 함수
window.openScheduleWithPassword = async function(roomId, defaultName) {
    const password = prompt("방 비밀번호를 입력하세요:");
    if (!password) return;

    const { data, error } = await supabaseClient.from('rooms').select('password').eq('id', roomId).single();
    
    if (error || !data) {
        alert('방 정보를 찾을 수 없습니다.');
        return;
    }

    if (data.password !== password) {
        alert('비밀번호가 일치하지 않습니다!');
        return;
    }

    // 기록에 저장되어 있던 이름을 기본값으로 띄워주어 편리하게 입장
    const userName = prompt("사용할 이름을 입력해주세요:", defaultName || "");
    if (!userName || !userName.trim()) {
        alert('이름을 입력해야 합니다.');
        return;
    }

    // 세션 스토리지에 방별 이름 정보 안전하게 저장
    sessionStorage.setItem(`room_${roomId}`, JSON.stringify({ userName: userName.trim() }));

    // 일정 화면으로 이동
    window.location.href = `schedule.html?room=${roomId}`;
};

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('room');

    if (inviteCode) {
        document.getElementById('join-code').value = inviteCode;
    }

    // 최근 참여한 방 기록 렌더링
    let globalHistory = JSON.parse(localStorage.getItem('pxo_global_history')) || [];
    if (globalHistory.length > 0) {
        const historyPanel = document.getElementById('history-panel');
        const historyList = document.getElementById('history-list');
        if (historyPanel && historyList) {
            historyPanel.style.display = 'block';
            historyList.innerHTML = '';
            globalHistory.forEach(h => {
                historyList.innerHTML += `
                    <div class="history-card">
                        <div class="hist-info">
                            <h3>방 ID: ${h.id}</h3>
                            <p>내 이름: ${h.name} | 최근 접속: ${h.date}</p>
                        </div>
                        <div class="hist-actions">
                            <button onclick="openScheduleWithPassword('${h.id}', '${h.name}')" class="btn-secondary">내 시간표</button>
                            <button onclick="window.location.href='result.html?room=${h.id}'" class="btn-primary">결과 보기</button>
                        </div>
                    </div>
                `;
            });
        }
    }

    document.getElementById('create-btn').addEventListener('click', async () => {
        const password = document.getElementById('create-pw').value;
        if (!password) { alert('방 비밀번호를 입력해주세요.'); return; }

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
        if (error || !data) { alert('존재하지 않는 방이거나 코드가 잘못되었습니다.'); return; }
        if (data.password !== password) { alert('비밀번호가 일치하지 않습니다.'); return; }

        sessionStorage.setItem(`room_${roomId}`, JSON.stringify({ userName: userName }));

        const today = new Date();
        const dateStr = `${today.getMonth() + 1}/${today.getDate()} ${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')}`;
        globalHistory = globalHistory.filter(h => h.id !== roomId);
        globalHistory.unshift({ id: roomId, name: userName, date: dateStr });
        localStorage.setItem('pxo_global_history', JSON.stringify(globalHistory));

        window.location.href = `schedule.html?room=${roomId}`;
    });
});