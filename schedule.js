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

    document.getElementById('welcome-text').innerText = `${userName}님의 일정을 입력해주세요 (방 코드: ${roomId})`;

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
            cell.dataset.users = "";
            
            cell.addEventListener('mousedown', () => {
                isDragging = true;
                if (!cell.classList.contains('selected')) {
                    isSelecting = !cell.classList.contains('new-selection');
                    toggleSelection(cell);
                }
            });

            cell.addEventListener('mouseenter', () => {
                if (isDragging && !cell.classList.contains('selected')) {
                    toggleSelection(cell);
                }
            });

            timeGridContainer.appendChild(cell);
        }
    }

    window.addEventListener('mouseup', () => { isDragging = false; });
    timeGridContainer.addEventListener('mouseleave', () => { isDragging = false; });

    function toggleSelection(cell) {
        if (isSelecting) { cell.classList.add('new-selection'); } 
        else { cell.classList.remove('new-selection'); }
    }

    function markCellWithUser(dayStr, timeStr, user) {
        const dayIndex = days.indexOf(dayStr);
        const hour = timeStr.split(':')[0];
        const cell = document.querySelector(`.grid-cell[data-day="${dayIndex}"][data-time="${hour}"]`);
        
        if (cell) {
            cell.classList.add('selected');
            cell.classList.remove('new-selection');
            let usersList = cell.dataset.users ? cell.dataset.users.split(',') : [];
            if (!usersList.includes(user)) {
                usersList.push(user);
                cell.dataset.users = usersList.join(',');
                cell.title = `선택자: ${usersList.join(', ')}`;
            }
        }
    }

    async function loadExistingSchedules() {
        const { data } = await supabaseClient.from('schedules').select('*').eq('room_id', roomId);
        if (data) { data.forEach(item => markCellWithUser(item.day, item.time, item.user_name)); }
    }
    loadExistingSchedules();

    supabaseClient
        .channel(`room:${roomId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'schedules', filter: `room_id=eq.${roomId}` }, 
        payload => { markCellWithUser(payload.new.day, payload.new.time, payload.new.user_name); })
        .subscribe();

    document.getElementById('reset-btn').addEventListener('click', () => {
        document.querySelectorAll('.grid-cell.new-selection').forEach(cell => cell.classList.remove('new-selection'));
    });

    document.getElementById('confirm-btn').addEventListener('click', async () => {
        const newCells = document.querySelectorAll('.grid-cell.new-selection');
        if (newCells.length === 0) { alert('시간을 선택해주세요.'); return; }

        const selectedData = Array.from(newCells).map(cell => ({
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