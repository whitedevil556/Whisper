// =========================================================
// 1. SUPABASE KEYS (Auto-Configured for Pro DB)
// =========================================================
const DEFAULT_SUPABASE_URL = "https://nithcddmdlzudauvcoxy.supabase.co"; 
const DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pdGhjZGRtZGx6dWRhdXZjb3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MDU2MDQsImV4cCI6MjEwMDM4MTYwNH0.KhVB5EioaSJYw1HBSweA82sI4esfD3H-itWw8uCmuU8";

let supabaseClient = null;
let realtimeChannel = null;

let MY_USERNAME = localStorage.getItem('whisper_user') || '';
let ROOM_ID = localStorage.getItem('whisper_room') || '';
let SECRET_KEY = sessionStorage.getItem('whisper_key') || '';
let burnMode = false;
let currentReply = null;

// =========================================================
// 2. GAME CAMOUFLAGE LOGIC (Tic Tac Toe Unlock)
// =========================================================
const gameScreen = document.getElementById('game-screen');
const appContainer = document.getElementById('app-container');
const setupModal = document.getElementById('setup-modal');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;

document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => {
        const index = cell.getAttribute('data-index');
        if (board[index] !== '' || !gameActive) return;
        board[index] = currentPlayer;
        cell.innerText = currentPlayer;
        cell.style.color = currentPlayer === 'X' ? '#e94560' : '#0f3460';
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        document.getElementById('game-status').innerText = `Player ${currentPlayer}'s Turn`;
    });
});

window.resetGame = () => {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    document.querySelectorAll('.cell').forEach(cell => cell.innerText = '');
    document.getElementById('game-status').innerText = `Player X's Turn`;
};

// 🔒 SECRET UNLOCK LOGIC: Tap "Tic Tac Toe" Title 4 Times Fast!
let unlockClicks = 0;
let unlockTimer;
document.getElementById('game-title').addEventListener('click', () => {
    unlockClicks++;
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(() => unlockClicks = 0, 1200);
    
    if (unlockClicks >= 4) {
        unlockClicks = 0;
        gameScreen.classList.add('hidden');
        if (!SECRET_KEY || !MY_USERNAME || !ROOM_ID) {
            setupModal.classList.remove('hidden');
        } else {
            appContainer.classList.remove('hidden');
            connectToSupabase(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY);
        }
    }
});

// Auto-Lock to Game
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && SECRET_KEY) {
        appContainer.classList.add('hidden');
        gameScreen.classList.remove('hidden');
    }
});
document.getElementById('panic-btn').onclick = () => {
    appContainer.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    resetGame();
};

// =========================================================
// 3. ENCRYPTION & INITIALIZATION
// =========================================================
function encryptPayload(plainText) { return CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString(); }
function decryptPayload(cipherText) {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8) || "🔒 [Encrypted Data]";
    } catch { return "🔒 [Encrypted Data]"; }
}

document.getElementById('my-username').value = MY_USERNAME;
document.getElementById('room-id').value = ROOM_ID;

document.getElementById('enter-chat-btn').onclick = () => {
    MY_USERNAME = document.getElementById('my-username').value.trim();
    ROOM_ID = document.getElementById('room-id').value.trim();
    SECRET_KEY = document.getElementById('secret-key').value.trim();
    if (!MY_USERNAME || !ROOM_ID || !SECRET_KEY) return alert("Fill all details!");
    
    localStorage.setItem('whisper_user', MY_USERNAME);
    localStorage.setItem('whisper_room', ROOM_ID);
    sessionStorage.setItem('whisper_key', SECRET_KEY);
    
    setupModal.classList.add('hidden');
    appContainer.classList.remove('hidden');
    document.getElementById('room-title').innerText = `${ROOM_ID} 💖`;
    connectToSupabase(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY);
};

// =========================================================
// 4. SUPABASE REALTIME & DELETE FOR EVERYONE LOGIC
// =========================================================
const chatBox = document.getElementById('chat-box');

async function connectToSupabase(url, key) {
    supabaseClient = window.supabase.createClient(url, key);
    document.getElementById('connection-status').innerText = "Connecting...";

    const { data } = await supabaseClient.from('messages').select('*').eq('room_id', ROOM_ID).order('created_at', { ascending: true }).limit(60);
    if (data) {
        chatBox.innerHTML = `<div class="security-banner">💖 3D Encrypted Vault • Long-press message to Delete for Everyone</div>`;
        data.forEach(row => renderMessageOnUI(row));
        supabaseClient.from('messages').update({ status: 'seen' }).eq('room_id', ROOM_ID).neq('sender', MY_USERNAME).neq('status', 'seen');
    }

    if (realtimeChannel) supabaseClient.removeChannel(realtimeChannel);
    realtimeChannel = supabaseClient.channel(`room:${ROOM_ID}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${ROOM_ID}` }, payload => renderMessageOnUI(payload.new))
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `room_id=eq.${ROOM_ID}` }, payload => updateTickOnUI(payload.new.id, payload.new.status))
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, payload => {
            const el = document.getElementById(`msg-${payload.old.id}`);
            if (el) el.remove(); // Real-time Delete from screen
        })
        .subscribe(status => { if (status === 'SUBSCRIBED') document.getElementById('connection-status').innerText = "🟢 End-to-End Encrypted"; });
}

async function sendMessage(rawContent = document.getElementById('msg-input').value, msgType = 'text') {
    if (!rawContent.trim()) return;
    if (msgType === 'text') { document.getElementById('msg-input').value = ''; }
    
    const encryptedCipher = encryptPayload(rawContent);
    const { data } = await supabaseClient.from('messages').insert([{
        room_id: ROOM_ID, sender: MY_USERNAME, cipher_text: encryptedCipher, msg_type: msgType, status: 'sent'
    }]).select();

    if (burnMode && data && data[0]) {
        setTimeout(() => supabaseClient.from('messages').delete().eq('id', data[0].id), 30000);
    }
}

function renderMessageOnUI(msgObj) {
    if (document.getElementById(`msg-${msgObj.id}`)) return;
    const isMe = msgObj.sender === MY_USERNAME;
    const displayText = decryptPayload(msgObj.cipher_text);
    
    const msgDiv = document.createElement('div');
    msgDiv.id = `msg-${msgObj.id}`;
    msgDiv.className = `message ${isMe ? 'sent' : 'received'}`;
    
    let contentHTML = msgObj.msg_type === 'image' ? `<img src="${displayText}" style="max-width:100%; border-radius:10px;">` : `<p>${displayText}</p>`;
    const tickHTML = isMe ? `<span id="tick-${msgObj.id}" class="ticks">${msgObj.status === 'seen' ? '<span class="tick-pink">✓✓</span>' : '✓'}</span>` : '';
    
    msgDiv.innerHTML = `${!isMe ? `<span class="sender-label">${msgObj.sender}</span>` : ''}${contentHTML}<span class="time">${new Date(msgObj.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ${tickHTML}</span>`;

    // 🗑️ DELETE FOR EVERYONE LOGIC (Long Press)
    let pressTimer;
    const startPress = () => {
        if (!isMe) return; // Only allow deleting own messages
        pressTimer = setTimeout(async () => {
            if (confirm("हा मेसेज सर्वांसाठी Delete करायचा आहे का? (Delete for Everyone)")) {
                await supabaseClient.from('messages').delete().eq('id', msgObj.id);
            }
        }, 800); // 800ms Hold
    };
    const cancelPress = () => clearTimeout(pressTimer);
    
    msgDiv.addEventListener('mousedown', startPress);
    msgDiv.addEventListener('mouseup', cancelPress);
    msgDiv.addEventListener('mouseleave', cancelPress);
    msgDiv.addEventListener('touchstart', startPress);
    msgDiv.addEventListener('touchend', cancelPress);

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function updateTickOnUI(msgId, status) {
    const tickEl = document.getElementById(`tick-${msgId}`);
    if (tickEl) tickEl.innerHTML = status === 'seen' ? '<span class="tick-pink">✓✓</span>' : '✓✓';
}

document.getElementById('send-btn').onclick = () => sendMessage();
document.getElementById('msg-input').onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
document.getElementById('burn-btn').onclick = (e) => {
    burnMode = !burnMode;
    e.target.style.background = burnMode ? '#ff0a54' : '#2a0825';
    alert(burnMode ? "🔥 Burn Mode ON: Messages delete in 30s!" : "Burn Mode OFF");
};

// 5. Basic Emoji Logic
const emojis = ['❤️','😍','😂','🥺','🔥','✨','🫂','💋','🧸','🥂','🍷'];
document.getElementById('panel-content').innerHTML = emojis.map(e => `<span class="emoji-item" onclick="document.getElementById('msg-input').value += '${e}'">${e}</span>`).join('');
document.getElementById('toggle-emoji').onclick = () => document.getElementById('extra-panel').classList.toggle('hidden');
