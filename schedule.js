const supabaseUrl = 'https://korowqpkgcvldqmhwznw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvcm93cXBrZ2N2bGRxbWh3em53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NzYxNDAsImV4cCI6MjA5MTA1MjE0MH0.mzKmZpR6yhZH1e2JU0Q9ImRxeOAjXT6eF5dnXDLNIro';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    const userName = sessionStorage.getItem('userName');
    const roomId = sessionStorage.getItem('roomId');

    if (!userName || !roomId) {
        alert('잘못된 접근입니다. 첫 화면에서 방에 입장해주세요.');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('welcome-text').innerText = `${userName}님의 가능한 시간을 모두 선택해주세요`;

    document.getElementById('copy-link-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(roomId).then(() => alert(`방 코드(${roomId})가 복사되었습니다!`));
    });

    const days = ['월', '화', '수', '목', '금', '토', '일'];
    const startHour = 9;
    const endHour = 22;
    const dayHeadersContainer = document.getElementById('day-headers');
    const timeLabelsContainer = document.getElementById('time-labels');
    const timeGridContainer = document.getElementById('time-grid');
    
    let isDragging = false;
    let isSelecting = true;

    days.forEach(day => {
        const div = document.createElement('div');
        div.className = 'day-header';
        div.textContent = day;
        dayHeadersContainer.appendChild(div);
    });

    for (let i = startHour; i <= endHour; i++) {
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';
        timeLabel.textContent = `${i}:00`;
        timeLabelsContainer.appendChild(timeLabel);

        for (let j = 0; j < days.length; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.day = j;
            cell.dataset.time = i;
            
            cell.addEventListener('mousedown', () => {
                isDragging = true;
                isSelecting = !cell.classList.contains('selected');
                toggleSelection(cell);
            });

            cell.addEventListener('mouseenter', () => {
                if (isDragging) toggleSelection(cell);
            });

            timeGridContainer.appendChild(cell);
        }
    }

    window.addEventListener('mouseup', () => { isDragging = false; });
    timeGridContainer.addEventListener('mouseleave', () => { isDragging = false; });

    function toggleSelection(cell) {
        if (isSelecting) { cell.classList.add('selected'); } 
        else { cell.classList.remove('selected'); }
    }

    // 다른 사람 일정은 숨기고, 기존에 저장했던 '내' 시간표만 불러와서 표시
    async function loadMySchedules() {
        const { data } = await supabaseClient.from('schedules')
            .select('*')
            .eq('room_id', roomId)
            .eq('user_name', userName);

        if (data) {
            data.forEach(item => {
                const dayIndex = days.indexOf(item.day);
                const hour = item.time.split(':')[0];
                const cell = document.querySelector(`.grid-cell[data-day="${dayIndex}"][data-time="${hour}"]`);
                if (cell) cell.classList.add('selected');
            });
        }
    }
    loadMySchedules();

    document.getElementById('reset-btn').addEventListener('click', () => {
        document.querySelectorAll('.grid-cell.selected').forEach(cell => cell.classList.remove('selected'));
    });

    document.getElementById('confirm-btn').addEventListener('click', async () => {
        const cells = document.querySelectorAll('.grid-cell.selected');
        if (cells.length === 0) { alert('시간을 최소 하나 이상 선택해주세요.'); return; }

        // 중복 제출을 막기 위해 기존에 제출한 내 일정은 DB에서 한 번 삭제 후 덮어쓰기
        await supabaseClient.from('schedules').delete()
            .eq('room_id', roomId)
            .eq('user_name', userName);

        const selectedData = Array.from(cells).map(cell => ({
            room_id: roomId,
            user_name: userName,
            day: days[cell.dataset.day],
            time: `${cell.dataset.time}:00`
        }));
        
        const { error } = await supabaseClient.from('schedules').insert(selectedData);
        if (!error) {
            window.location.href = 'result.html';
        } else {
            alert('오류가 발생했습니다.');
        }
    });
});