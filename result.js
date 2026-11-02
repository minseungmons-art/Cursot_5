const supabaseUrl = 'https://korowqpkgcvldqmhwznw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvcm93cXBrZ2N2bGRxbWh3em53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NzYxNDAsImV4cCI6MjA5MTA1MjE0MH0.mzKmZpR6yhZH1e2JU0Q9ImRxeOAjXT6eF5dnXDLNIro';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');

    if (!roomId) {
        alert('방 정보가 존재하지 않습니다.');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('back-btn').addEventListener('click', () => {
        window.location.href = `schedule.html?room=${roomId}`;
    });

    async function fetchAndRenderResults() {
        const { data, error } = await supabaseClient.from('schedules').select('*').eq('room_id', roomId);
        if (error) return;

        const timeMap = {};
        const allUsers = new Set();

        data.forEach(item => {
            const key = `${item.day}요일 ${item.time}`;
            if (!timeMap[key]) { timeMap[key] = new Set(); }
            timeMap[key].add(item.user_name);
            allUsers.add(item.user_name);
        });

        const sortedTimes = Object.keys(timeMap).map(key => ({
            timeText: key,
            users: Array.from(timeMap[key]),
            count: timeMap[key].size
        })).sort((a, b) => b.count - a.count);

        const container = document.getElementById('result-container');
        container.innerHTML = '';

        const totalInfo = document.createElement('div');
        totalInfo.style.marginBottom = '20px';
        totalInfo.style.color = '#fff';
        totalInfo.style.fontSize = '1.1rem';
        totalInfo.innerHTML = `현재 <strong>${allUsers.size}명</strong> 제출 완료 <span style="color:var(--text-muted); font-size:0.9rem;">(${Array.from(allUsers).join(', ')})</span>`;
        container.appendChild(totalInfo);

        if (sortedTimes.length === 0) {
            container.innerHTML += '<p style="text-align:center; color:var(--text-muted); margin-top:30px;">아직 등록된 일정이 없습니다.</p>';
            return;
        }

        sortedTimes.slice(0, 3).forEach((slot, index) => {
            const card = document.createElement('div');
            card.className = 'result-card';
            const badges = slot.users.map(u => `<span class="user-badge">${u}</span>`).join('');
            
            card.innerHTML = `
                <div style="display:flex; align-items:center; gap:20px;">
                    <div class="result-rank">${index + 1}위</div>
                    <div class="result-info">
                        <h3>${slot.timeText}</h3>
                        <p>${slot.count}명 참석 가능</p>
                    </div>
                </div>
                <div class="result-users">${badges}</div>
            `;
            container.appendChild(card);
        });
    }

    fetchAndRenderResults();

    supabaseClient
        .channel(`result_room:${roomId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules', filter: `room_id=eq.${roomId}` }, 
        () => { fetchAndRenderResults(); })
        .subscribe();
});