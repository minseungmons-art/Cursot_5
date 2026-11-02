const supabaseUrl = 'https://korowqpkgcvldqmhwznw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvcm93cXBrZ2N2bGRxbWh3em53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NzYxNDAsImV4cCI6MjA5MTA1MjE0MH0.mzKmZpR6yhZH1e2JU0Q9ImRxeOAjXT6eF5dnXDLNIro';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('room');
    if (inviteCode) {
        document.getElementById('join-code').value = inviteCode;
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
        } else {
            alert('방 생성 중 오류가 발생했습니다.');
        }
    });

    document.getElementById('copy-btn').addEventListener('click', () => {
        const linkInput = document.getElementById('generated-link');
        linkInput.select();
        navigator.clipboard.writeText(linkInput.value).then(() => {
            alert('초대 링크가 복사되었습니다! 카톡으로 팀원들에게 공유해주세요.');
        });
    });

    document.getElementById('join-btn').addEventListener('click', async () => {
        const roomId = document.getElementById('join-code').value.trim();
        const password = document.getElementById('join-pw').value;
        const userName = document.getElementById('join-name').value.trim();

        if (!roomId || !password || !userName) {
            alert('모든 정보를 입력해주세요.');
            return;
        }

        const { data, error } = await supabaseClient.from('rooms').select('password').eq('id', roomId).single();

        if (error || !data) {
            alert('존재하지 않는 방이거나 코드가 잘못되었습니다.');
            return;
        }

        if (data.password !== password) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        sessionStorage.setItem('userName', userName);
        sessionStorage.setItem('roomId', roomId);
        window.location.href = 'schedule.html';
    });
});