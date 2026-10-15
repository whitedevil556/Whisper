// =========================================================
// 1. SUPABASE AUTO-CONFIGURED KEYS
// =========================================================
const DEFAULT_SUPABASE_URL = "https://nithcddmdlzudauvcoxy.supabase.co"; 
const DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pdGhjZGRtZGx6dWRhdXZjb3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MDU2MDQsImV4cCI6MjEwMDM4MTYwNH0.KhVB5EioaSJYw1HBSweA82sI4esfD3H-itWw8uCmuU8";

let supabaseClient = null;
let realtimeChannel = null;

// User & Security State
let MY_USERNAME = localStorage.getItem('whisper_user') || '';
let ROOM_ID = localStorage.getItem('whisper_room') || '';
let SECRET_KEY = sessionStorage.getItem('whisper_key') || '';
let CALC_PIN = localStorage.getItem('whisper_calc_pin') || '1430';
let activeRoom = '';
let activeKey = '';

let burnMode = false;
let spoilerMode = false;
let snapModeUpload = false;
let currentReply = null;
let editingMsgId = null;
let selectedMsgObj = null;
let typingTimeout = null;
let partnerOnline = false;
let inactivityTimer = null;

// DOM Elements
const gameScreen = document.getElementById('game-screen');
const appContainer = document.getElementById('app-container');
const pinModal = document.getElementById('pin-modal');
const pinInput = document.getElementById('pin-input');
const setupModal = document.getElementById('setup-modal');
const chatBox = document.getElementById('chat-box');
const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const connStatus = document.getElementById('connection-status');
const roomTitle = document.getElementById('room-title');
const extraPanel = document.getElementById('extra-panel');
const panelContent = document.getElementById('panel-content');
const replyBar = document.getElementById('reply-bar');
const replyText = document.getElementById('reply-text');

// =========================================================
// 2. BRICK BREAKER ARCADE GAME ENGINE (Safe Canvas)
// =========================================================
const canvas = document.getElementById('brick-canvas');
const ctx = canvas.getContext('2d');
let score = 0;
let lives = 3;
let gamePaused = false;

const ball = { x: 180, y: 380, dx: 3.2, dy: -3.2, radius: 8 };
const paddle = { height: 12, width: 82, x: 139 };
const brickInfo = { rows: 5, cols: 6, width: 48, height: 18, padding: 8, offsetTop: 35, offsetLeft: 16 };
const brickColors = ['#ff006e', '#fb5607', '#ffbe0b', '#00f5d4', '#3a86ff'];
let bricks = [];

function initBricks() {
    bricks = [];
    for (let r = 0; r < brickInfo.rows; r++) {
        bricks[r] = [];
        for (let c = 0; c < brickInfo.cols; c++) {
            bricks[r][c] = { x: 0, y: 0, status: 1, color: brickColors[r % brickColors.length] };
        }
    }
}
initBricks();

// मोबाईल्सवर क्रॅश होऊ नये म्हणून सुरक्षित रेक्टँगल फंक्शन
function drawSafeRect(x, y, w, h, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.closePath();
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Bricks
    for (let r = 0; r < brickInfo.rows; r++) {
        for (let c = 0; c < brickInfo.cols; c++) {
            const b = bricks[r][c];
            if (b.status === 1) {
                const bx = c * (brickInfo.width + brickInfo.padding) + brickInfo.offsetLeft;
                const by = r * (brickInfo.height + brickInfo.padding) + brickInfo.offsetTop;
                b.x = bx; b.y = by;
                drawSafeRect(bx, by, brickInfo.width, brickInfo.height, b.color);
            }
        }
    }

    // Draw Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();

    // Draw Paddle
    drawSafeRect(paddle.x, canvas.height - paddle.height - 12, paddle.width, paddle.height, '#00f5d4');

    // Brick Collision
    for (let r = 0; r < brickInfo.rows; r++) {
        for (let c = 0; c < brickInfo.cols; c++) {
            const b = bricks[r][c];
            if (b.status === 1) {
                if (ball.x > b.x && ball.x < b.x + brickInfo.width && ball.y > b.y && ball.y < b.y + brickInfo.height) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score += 10;
                    document.getElementById('game-score').innerText = score;
                    if (score % (brickInfo.rows * brickInfo.cols * 10) === 0) initBricks();
                }
            }
        }
    }

    if (!gamePaused && !gameScreen.classList.contains('hidden')) {
        if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) ball.dx = -ball.dx;
        if (ball.y + ball.dy < ball.radius) ball.dy = -ball.dy;
        else if (ball.y + ball.dy > canvas.height - ball.radius - 12) {
            if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
                ball.dy = -Math.abs(ball.dy);
            } else {
                lives--;
                document.getElementById('game-lives').innerText = '❤️'.repeat(Math.max(0, lives)) || '💀';
                if (lives <= 0) {
                    score = 0; lives = 3;
                    document.getElementById('game-score').innerText = 0;
                    document.getElementById('game-lives').innerText = '❤️❤️❤️';
                    initBricks();
                }
                ball.x = canvas.width / 2; ball.y = 350; ball.dy = -3.2;
            }
        }
        ball.x += ball.dx;
        ball.y += ball.dy;
    }
    requestAnimationFrame(drawGame);
}
drawGame();

function movePaddle(clientX) {
    const rect = canvas.getBoundingClientRect();
    const relX = (clientX - rect.left) * (canvas.width / rect.width);
    if (relX > 0 && relX < canvas.width) {
        paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, relX - paddle.width / 2));
    }
}
canvas.addEventListener('mousemove', e => movePaddle(e.clientX));
canvas.addEventListener('touchmove', e => { e.preventDefault(); movePaddle(e.touches[0].clientX); }, { passive: false });

document.getElementById('restart-game-btn').onclick = () => {
    score = 0; lives = 3;
    document.getElementById('game-score').innerText = 0;
    document.getElementById('game-lives').innerText = '❤️❤️❤️';
    initBricks();
};
document.getElementById('pause-game-btn').onclick = (e) => {
    gamePaused = !gamePaused;
    e.target.innerText = gamePaused ? '▶️ Resume' : '⏸️ Pause';
};

// =========================================================
// 3. SECRET 4-TAP UNLOCK & GAME ALERT LOGIC
// =========================================================
let secretTaps = 0;
let tapTimer = null;

document.getElementById('game-header-secret').onclick = () => {
    secretTaps++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => secretTaps = 0, 1200);
    if (secretTaps >= 4) {
        secretTaps = 0;
        gamePaused = true;
        pinInput.value = '';
        pinModal.classList.remove('hidden');
        pinInput.focus();
    }
};

document.getElementById('pin-cancel').onclick = () => {
    pinModal.classList.add('hidden');
    gamePaused = false;
};

document.getElementById('pin-submit').onclick = verifySecretPin;
pinInput.onkeypress = (e) => { if (e.key === 'Enter') verifySecretPin(); };

function verifySecretPin() {
    const code = pinInput.value.trim();
    pinModal.classList.add('hidden');

    if (code === CALC_PIN) {
        gameScreen.classList.add('hidden');
        if (!MY_USERNAME || !ROOM_ID || !SECRET_KEY) {
            setupModal.classList.remove('hidden');
        } else {
            openChatSession(ROOM_ID, SECRET_KEY, false);
        }
    } else if (code === '0000') {
        gameScreen.classList.add('hidden');
        openChatSession('study_notes_demo', 'fake_notes_key_0000', true);
    } else {
        const fakeGameAlerts = [
            "❌ Invalid Cheat Code!",
            "🔒 Stage Locked! Reach 50,000 score first to unlock.",
            "⚠️ Developer Mode Disabled by Admin.",
            "👾 No hidden arcade level found for this code."
        ];
        alert(fakeGameAlerts[Math.floor(Math.random() * fakeGameAlerts.length)]);
        gamePaused = false;
    }
}

function lockToGame() {
    appContainer.classList.add('hidden');
    setupModal.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gamePaused = false;
    document.title = "Brick Breaker Arcade";
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (gameScreen.classList.contains('hidden')) {
        inactivityTimer = setTimeout(lockToGame, 60000);
    }
}
['mousemove', 'keydown', 'touchstart', 'click'].forEach(evt => {
    document.addEventListener(evt, resetInactivityTimer, { passive: true });
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && activeKey) lockToGame();
});
document.getElementById('panic-btn').onclick = lockToGame;
document.getElementById('chat-header').ondblclick = lockToGame;

document.getElementById('peek-btn').onclick = (e) => {
    chatBox.classList.toggle('privacy-curtain');
    e.currentTarget.classList.toggle('active-mode');
};

// =========================================================
// 4. STEALTH NOTIFICATIONS & AES-256 ENCRYPTION
// =========================================================
let swRegistration = null;
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => swRegistration = reg).catch(() => {});
    });
}

document.getElementById('notify-btn').onclick = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    if (perm === 'granted') alert("🔔 High-Score Alerts Enabled!");
};

function triggerSecretNotification() {
    if (Notification.permission === 'granted' && (document.visibilityState === 'hidden' || !gameScreen.classList.contains('hidden'))) {
        const title = "Brick Breaker Arcade 🧱";
        const options = {
            body: "New daily challenge stage unlocked! Play now.",
            icon: "https://cdn-icons-png.flaticon.com/512/808/808439.png",
            tag: "arcade-alert",
            renotify: true
        };
        if (swRegistration && swRegistration.showNotification) swRegistration.showNotification(title, options);
        else new Notification(title, options);
    }
}

function encryptPayload(plainText) {
    return CryptoJS.AES.encrypt(plainText, activeKey).toString();
}

function decryptPayload(cipherText) {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, activeKey);
        return bytes.toString(CryptoJS.enc.Utf8) || null;
    } catch {
        return null;
    }
}

// =========================================================
// 5. SETUP & SUPABASE REALTIME
// =========================================================
document.getElementById('my-username').value = MY_USERNAME;
document.getElementById('room-id').value = ROOM_ID;
document.getElementById('calc-pin').value = CALC_PIN;

document.getElementById('enter-chat-btn').onclick = () => {
    const user = document.getElementById('my-username').value.trim();
    const room = document.getElementById('room-id').value.trim();
    const key = document.getElementById('secret-key').value.trim();
    const pin = document.getElementById('calc-pin').value.trim() || '1430';

    if (!user || !room || !key) return alert("Krupaya sarva mahiti bhara!");

    MY_USERNAME = user; ROOM_ID = room; SECRET_KEY = key; CALC_PIN = pin;
    localStorage.setItem('whisper_user', MY_USERNAME);
    localStorage.setItem('whisper_room', ROOM_ID);
    localStorage.setItem('whisper_calc_pin', CALC_PIN);
    sessionStorage.setItem('whisper_key', SECRET_KEY);

    setupModal.classList.add('hidden');
    openChatSession(ROOM_ID, SECRET_KEY, false);
};

document.getElementById('logout-btn').onclick = () => setupModal.classList.remove('hidden');

async function openChatSession(roomToUse, keyToUse, isFakeMode) {
    activeRoom = roomToUse;
    activeKey = keyToUse;
    appContainer.classList.remove('hidden');
    resetInactivityTimer();

    if (isFakeMode) {
        roomTitle.innerText = "Self Notes 📝";
        connStatus.innerText = "🟢 Synced";
        chatBox.innerHTML = `
            <div class="message sent"><p>Buy groceries & complete project report by Friday.</p><span class="time">10:30 AM</span></div>
            <div class="message sent"><p>Electricity bill paid - Ref #48291</p><span class="time">Yesterday</span></div>
        `;
        return;
    }

    roomTitle.innerText = `${activeRoom} 💖`;
    supabaseClient = window.supabase.createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY);
    connStatus.innerText = "Connecting...";

    const { data } = await supabaseClient
        .from('messages')
        .select('*')
        .eq('room_id', activeRoom)
        .order('created_at', { ascending: true })
        .limit(70);

    chatBox.innerHTML = '';
    if (data) {
        data.forEach(row => renderMessageOnUI(row));
        markAllReceivedAsSeen();
    }

    if (realtimeChannel) supabaseClient.removeChannel(realtimeChannel);

    realtimeChannel = supabaseClient.channel(`room:${activeRoom}`, {
        config: { broadcast: { self: false }, presence: { key: MY_USERNAME } }
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom}` }, async (payload) => {
        const newMsg = payload.new;
        renderMessageOnUI(newMsg);
        if (newMsg.sender !== MY_USERNAME) {
            triggerSecretNotification();
            const isVis = document.visibilityState === 'visible' && gameScreen.classList.contains('hidden');
            await supabaseClient.from('messages').update({ status: isVis ? 'seen' : 'delivered' }).eq('id', newMsg.id);
        }
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoom}` }, (payload) => {
        renderOrUpdateMessage(payload.new);
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        const el = document.getElementById(`msg-${payload.old.id}`);
        if (el) el.remove();
    })
    .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user !== MY_USERNAME) {
            connStatus.innerText = `✍️ ${payload.payload.user} is typing...`;
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(updatePresenceDisplay, 2000);
        }
    })
    .on('broadcast', { event: 'reaction' }, (payload) => {
        addReactionBadge(payload.payload.msgId, payload.payload.emoji);
    })
    .on('broadcast', { event: 'nuclear_wipe' }, () => {
        chatBox.innerHTML = '';
    })
    .on('presence', { event: 'sync' }, () => {
        const state = realtimeChannel.presenceState();
        const otherUsers = Object.keys(state).filter(u => u !== MY_USERNAME);
        partnerOnline = otherUsers.length > 0;
        updatePresenceDisplay();
    })
    .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
            await realtimeChannel.track({ online_at: new Date().toISOString() });
            updatePresenceDisplay();
        }
    });
}

function updatePresenceDisplay() {
    connStatus.innerText = partnerOnline ? "🟢 Online" : "⚪ Offline";
}

// =========================================================
// 6. SEND, EDIT, REPLY, SNAP, SPOILER & VOICE NOTES
// =========================================================
document.getElementById('spoiler-btn').onclick = (e) => {
    spoilerMode = !spoilerMode;
    e.currentTarget.classList.toggle('active', spoilerMode);
};

document.getElementById('burn-btn').onclick = (e) => {
    burnMode = !burnMode;
    e.currentTarget.classList.toggle('active-mode', burnMode);
};

document.getElementById('wipe-btn').onclick = async () => {
    if (!supabaseClient) return;
    if (confirm("🧹 Doghanchya phone varun ani Database madhun purna chat kayamche delete karayche ka?")) {
        await supabaseClient.from('messages').delete().eq('room_id', activeRoom);
        chatBox.innerHTML = '';
        if (realtimeChannel) realtimeChannel.send({ type: 'broadcast', event: 'nuclear_wipe', payload: {} });
    }
};

async function sendMessage(rawContent = msgInput.value, msgType = 'text', extraMeta = {}) {
    if (!rawContent || !rawContent.trim()) return;

    if (editingMsgId && msgType === 'text') {
        const metaObj = { text: rawContent, edited: true };
        const enc = encryptPayload(JSON.stringify(metaObj));
        await supabaseClient.from('messages').update({ cipher_text: enc }).eq('id', editingMsgId);
        editingMsgId = null;
        msgInput.value = '';
        cancelReply();
        return;
    }

    const metaPayload = {
        text: rawContent,
        replyTo: currentReply || null,
        isSpoiler: spoilerMode,
        isSnap: extraMeta.isSnap || false
    };

    if (msgType === 'text') {
        msgInput.value = '';
        checkRomanticKeywords(rawContent);
        spoilerMode = false;
        document.getElementById('spoiler-btn').classList.remove('active');
    }
    cancelReply();
    extraPanel.classList.add('hidden');

    const encryptedCipher = encryptPayload(JSON.stringify(metaPayload));
    if (!supabaseClient) return;

    const { data } = await supabaseClient.from('messages').insert([{
        room_id: activeRoom,
        sender: MY_USERNAME,
        cipher_text: encryptedCipher,
        msg_type: msgType,
        status: 'sent'
    }]).select();

    if (burnMode && data && data[0]) {
        setTimeout(() => supabaseClient.from('messages').delete().eq('id', data[0].id), 30000);
    }
}

function renderMessageOnUI(msgObj) {
    if (document.getElementById(`msg-${msgObj.id}`)) return;
    const rawDecrypted = decryptPayload(msgObj.cipher_text);
    if (!rawDecrypted) return;

    let parsed = { text: rawDecrypted };
    try {
        const obj = JSON.parse(rawDecrypted);
        if (obj && typeof obj.text === 'string') parsed = obj;
    } catch {}

    const isMe = msgObj.sender === MY_USERNAME;
    if (!isMe && msgObj.msg_type === 'text') checkRomanticKeywords(parsed.text);

    const msgDiv = document.createElement('div');
    msgDiv.id = `msg-${msgObj.id}`;
    msgDiv.className = `message ${isMe ? 'sent' : 'received'}`;

    populateBubbleHTML(msgDiv, msgObj, parsed, isMe);

    msgDiv.onclick = (e) => {
        if (e.target.closest('.snap-open-btn') || e.target.closest('audio')) return;
        const sp = msgDiv.querySelector('.spoiler-text');
        if (sp && !sp.classList.contains('revealed')) {
            sp.classList.add('revealed');
            return;
        }
        openMessageMenu(msgObj, parsed, isMe);
    };

    msgDiv.ondblclick = (e) => {
        e.stopPropagation();
        addReactionBadge(msgObj.id, '❤️');
        createHeartMagic();
        if (realtimeChannel) realtimeChannel.send({ type: 'broadcast', event: 'reaction', payload: { msgId: msgObj.id, emoji: '❤️' } });
    };

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function renderOrUpdateMessage(msgObj) {
    const existing = document.getElementById(`msg-${msgObj.id}`);
    if (!existing) return;
    const rawDecrypted = decryptPayload(msgObj.cipher_text);
    if (!rawDecrypted) return;
    let parsed = { text: rawDecrypted };
    try { parsed = JSON.parse(rawDecrypted); } catch {}
    populateBubbleHTML(existing, msgObj, parsed, msgObj.sender === MY_USERNAME);
}

function populateBubbleHTML(msgDiv, msgObj, parsed, isMe) {
    const time = new Date(msgObj.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const quotedHTML = parsed.replyTo ? `<div class="quoted-box">${escapeHTML(parsed.replyTo)}</div>` : '';
    const editedTag = parsed.edited ? `<small style="opacity:0.7;">(edited)</small> ` : '';

    let contentHTML = '';
    if (msgObj.msg_type === 'image') {
        if (parsed.isSnap) {
            contentHTML = `<button class="snap-open-btn" onclick="openSnapPhoto('${msgObj.id}')">🔥 Tap to View 1-Time Snap</button>`;
            msgDiv.dataset.snapSrc = parsed.text;
        } else {
            contentHTML = `<img src="${parsed.text}" class="chat-img" alt="Photo">`;
        }
    } else if (msgObj.msg_type === 'audio') {
        contentHTML = `<audio controls src="${parsed.text}" class="chat-audio"></audio>`;
    } else if (msgObj.msg_type === 'sticker') {
        msgDiv.style.background = 'transparent'; msgDiv.style.border = 'none'; msgDiv.style.boxShadow = 'none';
        contentHTML = `<div class="romantic-sticker-badge">${escapeHTML(parsed.text)}</div>`;
    } else {
        const textClass = parsed.isSpoiler ? 'spoiler-text' : '';
        contentHTML = `${quotedHTML}<p class="${textClass}">${escapeHTML(parsed.text)}</p>`;
    }

    const tickHTML = isMe ? `<span id="tick-${msgObj.id}" class="ticks ${msgObj.status === 'seen' ? 'tick-pink' : 'tick-gray'}">${msgObj.status === 'sent' ? '✓' : '✓✓'}</span>` : '';
    const senderHTML = !isMe ? `<span class="sender-label">${escapeHTML(msgObj.sender)}</span>` : '';

    msgDiv.innerHTML = `${senderHTML}${contentHTML}<span class="time">${editedTag}${time} ${tickHTML}</span>`;
}

let activeSnapMsgId = null;
window.openSnapPhoto = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (!el || !el.dataset.snapSrc) return;
    activeSnapMsgId = msgId;
    document.getElementById('snap-img').src = el.dataset.snapSrc;
    document.getElementById('snap-modal').classList.remove('hidden');
};

document.getElementById('close-snap-btn').onclick = async () => {
    document.getElementById('snap-modal').classList.add('hidden');
    document.getElementById('snap-img').src = '';
    if (activeSnapMsgId && supabaseClient) {
        await supabaseClient.from('messages').delete().eq('id', activeSnapMsgId);
        const el = document.getElementById(`msg-${activeSnapMsgId}`);
        if (el) el.remove();
        activeSnapMsgId = null;
    }
};

const msgMenuModal = document.getElementById('msg-menu-modal');
function openMessageMenu(msgObj, parsed, isMe) {
    selectedMsgObj = { msgObj, parsed, isMe };
    document.getElementById('menu-edit').style.display = (isMe && msgObj.msg_type === 'text') ? 'block' : 'none';
    msgMenuModal.classList.remove('hidden');
}

document.getElementById('menu-cancel').onclick = () => msgMenuModal.classList.add('hidden');

document.getElementById('menu-reply').onclick = () => {
    msgMenuModal.classList.add('hidden');
    if (!selectedMsgObj) return;
    currentReply = `${selectedMsgObj.msgObj.sender}: ${selectedMsgObj.parsed.text.slice(0, 40)}`;
    replyText.innerText = `↩️ Replying to ${currentReply}`;
    replyBar.classList.remove('hidden');
    msgInput.focus();
};

document.getElementById('menu-edit').onclick = () => {
    msgMenuModal.classList.add('hidden');
    if (!selectedMsgObj) return;
    editingMsgId = selectedMsgObj.msgObj.id;
    msgInput.value = selectedMsgObj.parsed.text;
    replyText.innerText = `✏️ Editing message...`;
    replyBar.classList.remove('hidden');
    msgInput.focus();
};

document.getElementById('menu-copy').onclick = () => {
    msgMenuModal.classList.add('hidden');
    if (selectedMsgObj && selectedMsgObj.parsed.text) {
        navigator.clipboard.writeText(selectedMsgObj.parsed.text);
    }
};

document.getElementById('menu-delete').onclick = async () => {
    msgMenuModal.classList.add('hidden');
    if (!selectedMsgObj || !supabaseClient) return;
    await supabaseClient.from('messages').delete().eq('id', selectedMsgObj.msgObj.id);
    const el = document.getElementById(`msg-${selectedMsgObj.msgObj.id}`);
    if (el) el.remove();
};

function cancelReply() {
    currentReply = null;
    editingMsgId = null;
    replyBar.classList.add('hidden');
}
document.getElementById('cancel-reply').onclick = cancelReply;

function addReactionBadge(msgId, emoji) {
    const msgEl = document.getElementById(`msg-${msgId}`);
    if (!msgEl) return;
    let badge = msgEl.querySelector('.reaction-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'reaction-badge';
        msgEl.appendChild(badge);
    }
    badge.innerText = emoji;
}

async function markAllReceivedAsSeen() {
    if (!supabaseClient || !activeRoom) return;
    await supabaseClient.from('messages').update({ status: 'seen' }).eq('room_id', activeRoom).neq('sender', MY_USERNAME).neq('status', 'seen');
}

// =========================================================
// 7. AUTO IMAGE COMPRESSION & VOICE NOTE RECORDER
// =========================================================
document.getElementById('add-file').onclick = () => { snapModeUpload = false; document.getElementById('file-input').click(); };
document.getElementById('snap-btn').onclick = () => { snapModeUpload = true; document.getElementById('file-input').click(); };

document.getElementById('file-input').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
            const c = document.createElement('canvas');
            const maxW = 700;
            const scale = img.width > maxW ? maxW / img.width : 1;
            c.width = img.width * scale;
            c.height = img.height * scale;
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            const compressedBase64 = c.toDataURL('image/jpeg', 0.65);
            sendMessage(compressedBase64, 'image', { isSnap: snapModeUpload });
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
};

let mediaRecorder = null;
let audioChunks = [];
const micBtn = document.getElementById('mic-btn');

micBtn.onclick = async () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        micBtn.classList.remove('recording');
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.onload = () => sendMessage(reader.result, 'audio');
            reader.readAsDataURL(blob);
            stream.getTracks().forEach(t => t.stop());
        };
        mediaRecorder.start();
        micBtn.classList.add('recording');
    } catch {
        alert("Mic permission allow kara!");
    }
};

// =========================================================
// 8. FULL WHATSAPP EMOJIS, STICKERS & DIRECT DISPLAY
// =========================================================
let recentEmojis = JSON.parse(localStorage.getItem('whisper_recent_emojis')) || ['❤️','😍','😘','🥺','🔥','✨','🫂','💋'];
let recentStickers = JSON.parse(localStorage.getItem('whisper_recent_stickers')) || [];

const emojiSets = {
    faces: ['😀','😃','😄','😁','😆','😅','😂','🤣','🥲','☺️','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🫣','🤭','🫢','🫡','🤫','🫠','🤥','😶','🫥','😐','🫤','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😮‍💨','😵','😵‍💫','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','😈','👿','👻','💀','👽','🤖','😺','😸','😹','😻','😼','😽'],
    love: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💘','💝','💟','💌','🫂','💋','🫦','💑','👩‍❤️‍👨','💏','🌹','🥀','🌷','🌺','🌸','💍','💎','🧸','🍫','🥂','🍷','🌙','✨','🔥'],
    nature: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐴','🦄','🐝','🦋','🐞','🐢','🐍','🐙','🐬','🐳','🦈','🐅','🐆','🐘','🦒','🦘','🐕','🐈','🕊️','🐇','🐿️','🐾','🌵','🎄','🌲','🌳','🌴','🌱','🌿','🍀','🍃','🌺','🌸','🌼','🌻','🌞','🌝','🌙','🌎','🪐','💫','⭐️','🌟','✨','⚡️','🔥','🌈','☀️','❄️','🌊'],
    food: ['🍏','🍎','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🥑','🍔','🍟','🍕','🥪','🌮','🌯','🥗','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🍤','🍙','🍚','🍧','🍨','🍦','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','☕','🍵','🥤','🧋','🍺','🍻','🥂','🍷','🍸','🍹'],
    activities: ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🏸','🏏','⛳','🥊','🥋','⛸️','🎿','🏋️','🤸','🏊','🚴','🏆','🥇','🎖️','🎪','🎭','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🎻','🎲','♟️','🎯','🎳','🎮','🧩'],
    recent: recentEmojis
};

const romanticStickers = [
    "💖 I Love You So Much!", "🥺 Miss You Khup Sara...", "🫂 Tight Wala Hug!", "💋 Muahhhh! Kiss For You",
    "🌹 Only Yours Forever", "🌙 Good Night Jaan ✨", "☀️ Good Morning Love ❤️", "😘 Jevlas Ka Shona?",
    "💍 Marry Me Soon!", "🔥 Looking Hot Ha!", "🧸💞", "👩‍❤️‍💋‍👨💖", "😡 Kalti Maar", "😂 LOL", "🤦‍♂️ Deva!", 
    "🎂 Happy Birthday!", "🎉 Congratulations!", "💯 Ek Number", "🍻 Cheers Bhava", "🙏 Sorry Shona",
    "🥺 Please Maaf Kar Na", "😍 Tu Khup Sundar Ahes", "🥰 Mazi Jaan", "😎 Swag", "😤 Tuza Rag",
    "💔 Heartbroken", "👀 Kay Chalay?", "🏃‍♂️ Yetoy 5 Min", "👋 Bye Cya"
];

// Tabs setup
const tabsContainer = document.querySelector('.tabs');
if (tabsContainer) {
    tabsContainer.innerHTML = `
        <button id="tab-faces" class="active" title="Faces">😀</button>
        <button id="tab-love" title="Love">❤️</button>
        <button id="tab-nature" title="Nature">🐻</button>
        <button id="tab-food" title="Food">🍔</button>
        <button id="tab-activities" title="Activities">⚽</button>
        <button id="tab-recent" title="Recent">🕒</button>
        <button id="tab-sticker" title="Stickers">💌</button>
    `;
}

function saveRecentEmoji(emj) {
    recentEmojis = [emj, ...recentEmojis.filter(e => e !== emj)].slice(0, 36);
    localStorage.setItem('whisper_recent_emojis', JSON.stringify(recentEmojis));
    emojiSets.recent = recentEmojis;
}

function saveRecentSticker(stk) {
    recentStickers = [stk, ...recentStickers.filter(s => s !== stk)].slice(0, 10);
    localStorage.setItem('whisper_recent_stickers', JSON.stringify(recentStickers));
}

function renderEmojiCategory(cat) {
    panelContent.classList.remove('sticker-grid');
    const list = emojiSets[cat] && emojiSets[cat].length > 0 ? emojiSets[cat] : emojiSets.faces;
    panelContent.innerHTML = list.map(e => `<span class="emoji-item">${e}</span>`).join('');
}

function renderStickers() {
    panelContent.classList.add('sticker-grid');
    let html = '';
    if (recentStickers.length > 0) {
        html += `<div style="grid-column:1/-1; color:#ff85a2; font-size:12px; font-weight:bold; width:100%;">🕒 Recently Used</div>`;
        html += recentStickers.map(s => `<div class="romantic-sticker-badge sticker-item">${escapeHTML(s)}</div>`).join('');
        html += `<div style="grid-column:1/-1; color:#ff85a2; font-size:12px; font-weight:bold; width:100%; margin-top:8px;">💌 All Stickers</div>`;
    }
    html += romanticStickers.map(s => `<div class="romantic-sticker-badge sticker-item">${escapeHTML(s)}</div>`).join('');
    panelContent.innerHTML = html;
}

// Event Delegation (इमोजी क्लिक फास्ट आणि १००% काम करण्यासाठी)
panelContent.onclick = (e) => {
    const item = e.target.closest('.emoji-item');
    const sticker = e.target.closest('.sticker-item');
    if (item) {
        const char = item.textContent.trim();
        msgInput.value += char;
        msgInput.focus();
        saveRecentEmoji(char);
    } else if (sticker) {
        const text = sticker.textContent.trim();
        sendMessage(text, 'sticker');
        saveRecentSticker(text);
    }
};

function setActiveTab(btnId) {
    ['tab-faces', 'tab-love', 'tab-nature', 'tab-food', 'tab-activities', 'tab-recent', 'tab-sticker'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.toggle('active', id === btnId);
    });
}

// इमोजी बटन दाबताच थेट 'Faces' (स्मायलीज) उघडतील
document.getElementById('toggle-emoji').onclick = () => {
    extraPanel.classList.toggle('hidden');
    if (!extraPanel.classList.contains('hidden')) {
        setActiveTab('tab-faces');
        renderEmojiCategory('faces');
    }
};

document.getElementById('tab-faces').onclick = () => { setActiveTab('tab-faces'); renderEmojiCategory('faces'); };
document.getElementById('tab-love').onclick = () => { setActiveTab('tab-love'); renderEmojiCategory('love'); };
document.getElementById('tab-nature').onclick = () => { setActiveTab('tab-nature'); renderEmojiCategory('nature'); };
document.getElementById('tab-food').onclick = () => { setActiveTab('tab-food'); renderEmojiCategory('food'); };
document.getElementById('tab-activities').onclick = () => { setActiveTab('tab-activities'); renderEmojiCategory('activities'); };
document.getElementById('tab-recent').onclick = () => { setActiveTab('tab-recent'); renderEmojiCategory('recent'); };
document.getElementById('tab-sticker').onclick = () => { setActiveTab('tab-sticker'); renderStickers(); };

msgInput.oninput = () => {
    if (realtimeChannel) realtimeChannel.send({ type: 'broadcast', event: 'typing', payload: { user: MY_USERNAME } });
};

sendBtn.onclick = () => sendMessage();
msgInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

function checkRomanticKeywords(text) {
    const lower = text.toLowerCase();
    if (lower.includes('love') || lower.includes('miss') || lower.includes('❤️') || lower.includes('kiss') || lower.includes('jaan') || lower.includes('shona')) {
        createHeartMagic();
    }
}

function createHeartMagic() {
    const container = document.getElementById('hearts-container');
    for (let i = 0; i < 18; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'heart';
            heart.innerText = ['❤️', '💖', '💕', '💘', '💋', '✨'][Math.floor(Math.random() * 6)];
            heart.style.left = Math.random() * 92 + '%';
            heart.style.fontSize = (Math.random() * 18 + 20) + 'px';
            container.appendChild(heart);
            setTimeout(() => heart.remove(), 3200);
        }, i * 85);
    }
}

function escapeHTML(str) {
    return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag]));
}
