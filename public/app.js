// =========================================================
// 1. SUPABASE KEYS (Auto-Configured)
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
let typingTimeout = null;

// =========================================================
// 2. WHATSAPP STYLE EMOJIS, STICKERS & HISTORY (RECENT)
// =========================================================
let recentEmojis = JSON.parse(localStorage.getItem('whisper_recent_emojis')) || ['❤️','😊','👍','😂','🥺'];
let recentStickers = JSON.parse(localStorage.getItem('whisper_recent_stickers')) || [];

const emojiSets = {
    recent: recentEmojis,
    faces: ['😀','😃','😄','😁','😆','😅','😂','🤣','🥲','☺️','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🫣','🤭','🫢','🫡','🤫','🫠','🤥','😶','🫥','😐','🫤','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😮‍💨','😵','😵‍💫','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','😈','👿','👹','👺','🤡','💩','👻','💀','☠️','👽','👾','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾'],
    love: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💘','💝','💟','💌','🫂','💋','🫦'],
    nature: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🦗','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🦭','🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🪶','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿️','🦔','🐾','🐉','🐲','🌵','🎄','🌲','🌳','🌴','🪵','🌱','🌿','☘️','🍀','🎍','🪴','🎋','🍃','🍂','🍁','🍄','🐚','🪨','🌾','💐','🌷','🌹','🥀','🪷','🌺','🌸','🌼','🌻','🌞','🌝','🌛','🌜','🌚','🌕','🌖','🌗','🌘','🌑','🌒','🌓','🌔','🌙','🌎','🌍','🌏','🪐','💫','⭐️','🌟','✨','⚡️','☄️','💥','🔥','🌪️','🌈','☀️','🌤️','⛅️','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄️','🌬️','💨','💧','💦','☔️','☂️','🌊','🌫️'],
    food: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','🫖','☕','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🧊','🥄','🍴','🍽️','🥣','🥡','🥢','🧂'],
    activities: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','⛹️','🤺','🤾','🏌️','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🪗','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🎰','🧩']
};

const romanticStickers = [
    "💖 I Love You So Much!", "🥺 Miss You Khup Sara...", "🫂 Tight Wala Hug!", "💋 Muahhhh! Kiss For You",
    "🌹 Only Yours Forever", "🌙 Good Night Jaan ✨", "☀️ Good Morning Love ❤️", "😘 Jevlas Ka Shona?",
    "💍 Marry Me Soon!", "🔥 Looking Hot Ha!", "🧸💞", "👩‍❤️‍💋‍👨💖", "😡 Kalti Maar", "😂 LOL", "🤦‍♂️ Deva!", 
    "🎂 Happy Birthday!", "🎉 Congratulations!", "💯 Ek Number", "🍻 Cheers Bhava", "🙏 Sorry Shona",
    "🥺 Please Maaf Kar Na", "😍 Tu Khup Sundar Ahes", "🥰 Mazi Jaan", "😎 Swag", "😤 Tuza Rag",
    "💔 Heartbroken", "👀 Kay Chalay?", "🏃‍♂️ Yetoy 5 Min", "👋 Bye Cya"
];

// =========================================================
// 3. GAME CAMOUFLAGE LOGIC (Tic Tac Toe Unlock)
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
// 4. ENCRYPTION & INITIALIZATION
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
// 5. SUPABASE REALTIME & DELETE FOR EVERYONE
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
        .on('broadcast', { event: 'typing' }, (payload) => {
            if (payload.payload.user !== MY_USERNAME) {
                document.getElementById('connection-status').innerText = `✨ ${payload.payload.user} is typing...`;
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => document.getElementById('connection-status').innerText = "🟢 Connected", 2000);
            }
        })
        .subscribe(status => { if (status === 'SUBSCRIBED') document.getElementById('connection-status').innerText = "🟢 Connected"; });
}

async function sendMessage(rawContent = document.getElementById('msg-input').value, msgType = 'text') {
    if (!rawContent.trim()) return;
    
    let payloadToEncrypt = rawContent;
    if (currentReply && msgType === 'text') {
        payloadToEncrypt = JSON.stringify({ replyTo: currentReply, text: rawContent });
        cancelReply();
    }

    if (msgType === 'text') { 
        document.getElementById('msg-input').value = ''; 
        checkRomanticKeywords(rawContent);
    }
    
    const encryptedCipher = encryptPayload(payloadToEncrypt);
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
    const decryptedRaw = decryptPayload(msgObj.cipher_text);
    
    let displayText = decryptedRaw;
    let quotedHTML = '';

    try {
        const parsed = JSON.parse(decryptedRaw);
        if (parsed && parsed.replyTo && parsed.text) {
            quotedHTML = `<div class="quoted-box" style="background:rgba(0,0,0,0.2); border-left:3px solid #ff85a2; padding:5px; border-radius:5px; font-size:12px; margin-bottom:5px;">${escapeHTML(parsed.replyTo)}</div>`;
            displayText = parsed.text;
        }
    } catch {}

    const msgDiv = document.createElement('div');
    msgDiv.id = `msg-${msgObj.id}`;
    msgDiv.className = `message ${isMe ? 'sent' : 'received'}`;
    
    let contentHTML = '';
    if (msgObj.msg_type === 'image') {
        contentHTML = `<img src="${displayText}" style="max-width:100%; border-radius:10px;">`;
    } else if (msgObj.msg_type === 'sticker') {
        msgDiv.style.background = 'transparent'; msgDiv.style.border = 'none'; msgDiv.style.boxShadow = 'none';
        contentHTML = `<div style="padding:10px 15px; background:linear-gradient(135deg, #ff0a54, #7209b7); border-radius:20px; color:white; font-weight:bold; border:2px solid #ffb3c6;">${escapeHTML(displayText)}</div>`;
    } else {
        contentHTML = `${quotedHTML}<p>${escapeHTML(displayText)}</p>`;
    }

    const tickHTML = isMe ? `<span id="tick-${msgObj.id}" class="ticks">${msgObj.status === 'seen' ? '<span class="tick-pink">✓✓</span>' : (msgObj.status === 'delivered' ? '✓✓' : '✓')}</span>` : '';
    
    msgDiv.innerHTML = `${!isMe ? `<span class="sender-label">${msgObj.sender}</span>` : ''}${contentHTML}<span class="time">${new Date(msgObj.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ${tickHTML}</span>`;

    // 🗑️ DELETE FOR EVERYONE (Long Press)
    let pressTimer;
    const startPress = () => {
        if (!isMe) return;
        pressTimer = setTimeout(async () => {
            if (confirm("हा मेसेज सर्वांसाठी Delete करायचा आहे का? (Delete for Everyone)")) {
                await supabaseClient.from('messages').delete().eq('id', msgObj.id);
            }
        }, 800);
    };
    const cancelPress = () => clearTimeout(pressTimer);
    
    msgDiv.addEventListener('mousedown', startPress);
    msgDiv.addEventListener('mouseup', cancelPress);
    msgDiv.addEventListener('mouseleave', cancelPress);
    msgDiv.addEventListener('touchstart', startPress);
    msgDiv.addEventListener('touchend', cancelPress);

    // Reply on Single Click
    msgDiv.onclick = (e) => {
        if (msgObj.msg_type === 'text') {
            currentReply = `${msgObj.sender}: ${displayText.slice(0, 45)}`;
            document.getElementById('reply-text').innerText = `Replying to ${currentReply}`;
            document.getElementById('reply-bar').classList.remove('hidden');
            document.getElementById('msg-input').focus();
        }
    };

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function updateTickOnUI(msgId, status) {
    const tickEl = document.getElementById(`tick-${msgId}`);
    if (tickEl) tickEl.innerHTML = status === 'seen' ? '<span class="tick-pink">✓✓</span>' : '✓✓';
}

function cancelReply() { currentReply = null; document.getElementById('reply-bar').classList.add('hidden'); }
document.getElementById('cancel-reply').onclick = cancelReply;

document.getElementById('send-btn').onclick = () => sendMessage();
document.getElementById('msg-input').onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
document.getElementById('burn-btn').onclick = (e) => {
    burnMode = !burnMode;
    e.target.style.background = burnMode ? '#ff0a54' : '#2a0825';
    alert(burnMode ? "🔥 Burn Mode ON: Messages delete in 30s!" : "Burn Mode OFF");
};

// =========================================================
// 6. EMOJI TABS, HISTORY (RECENT) & MAGIC HEARTS
// =========================================================
const panelContent = document.getElementById('panel-content');
document.querySelector('.tabs').innerHTML = `
    <button id="tab-recent" class="active" title="Recent">🕒</button>
    <button id="tab-faces" title="Faces">😀</button>
    <button id="tab-love" title="Love">❤️</button>
    <button id="tab-nature" title="Animals & Nature">🐻</button>
    <button id="tab-food" title="Food & Drink">🍔</button>
    <button id="tab-activities" title="Sports & Activities">⚽</button>
    <button id="tab-sticker" title="Stickers">💌</button>
`;
document.querySelector('.tabs').style.overflowX = 'auto';
document.querySelector('.tabs').style.whiteSpace = 'nowrap';
document.querySelector('.tabs').style.paddingBottom = '5px';
document.querySelector('.tabs').style.display = 'flex';

function saveRecentEmoji(emoji) {
    recentEmojis = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 36);
    localStorage.setItem('whisper_recent_emojis', JSON.stringify(recentEmojis));
    emojiSets.recent = recentEmojis;
}

function saveRecentSticker(sticker) {
    recentStickers = [sticker, ...recentStickers.filter(s => s !== sticker)].slice(0, 10);
    localStorage.setItem('whisper_recent_stickers', JSON.stringify(recentStickers));
}

function renderEmojiCategory(cat) {
    panelContent.innerHTML = '';
    const emojisToRender = emojiSets[cat] || emojiSets['faces'];
    
    if (emojisToRender.length === 0 && cat === 'recent') {
        panelContent.innerHTML = `<p style="color:#b57c9e; width:100%; text-align:center; font-size:12px; margin-top:20px;">No recent emojis yet</p>`;
        return;
    }

    panelContent.innerHTML = emojisToRender.map(e => `<span class="emoji-item">${e}</span>`).join('');
    document.querySelectorAll('.emoji-item').forEach(el => {
        el.onclick = () => { 
            const emj = el.innerText;
            document.getElementById('msg-input').value += emj; 
            document.getElementById('msg-input').focus(); 
            saveRecentEmoji(emj);
        };
    });
}

function renderStickers() {
    let html = '';
    if (recentStickers.length > 0) {
        html += `<div style="grid-column: 1 / -1; color: #ff85a2; font-size: 13px; font-weight: bold; margin-bottom: 5px; text-align: left; width: 100%;">🕒 Recently Used</div>`;
        html += recentStickers.map(s => `<div class="romantic-sticker-badge sticker-item" style="cursor:pointer; display:inline-block; margin:5px;">${escapeHTML(s)}</div>`).join('');
        html += `<div style="grid-column: 1 / -1; color: #ff85a2; font-size: 13px; font-weight: bold; margin: 15px 0 5px 0; text-align: left; width: 100%;">💌 All Stickers</div>`;
    }
    html += romanticStickers.map(s => `<div class="romantic-sticker-badge sticker-item" style="cursor:pointer; display:inline-block; margin:5px;">${escapeHTML(s)}</div>`).join('');
    
    panelContent.innerHTML = html;
    document.querySelectorAll('.sticker-item').forEach(el => {
        el.onclick = () => {
            const stk = el.innerText;
            sendMessage(stk, 'sticker');
            saveRecentSticker(stk);
        };
    });
}

function setActiveTab(btnId) {
    ['tab-recent', 'tab-faces', 'tab-love', 'tab-nature', 'tab-food', 'tab-activities', 'tab-sticker'].forEach(id => {
        document.getElementById(id).classList.toggle('active', id === btnId);
    });
}

document.getElementById('toggle-emoji').onclick = () => {
    document.getElementById('extra-panel').classList.toggle('hidden');
    if (!document.getElementById('extra-panel').classList.contains('hidden')) {
        setActiveTab('tab-recent');
        renderEmojiCategory('recent');
    }
};

document.getElementById('tab-recent').onclick = () => { setActiveTab('tab-recent'); renderEmojiCategory('recent'); };
document.getElementById('tab-faces').onclick = () => { setActiveTab('tab-faces'); renderEmojiCategory('faces'); };
document.getElementById('tab-love').onclick = () => { setActiveTab('tab-love'); renderEmojiCategory('love'); };
document.getElementById('tab-nature').onclick = () => { setActiveTab('tab-nature'); renderEmojiCategory('nature'); };
document.getElementById('tab-food').onclick = () => { setActiveTab('tab-food'); renderEmojiCategory('food'); };
document.getElementById('tab-activities').onclick = () => { setActiveTab('tab-activities'); renderEmojiCategory('activities'); };
document.getElementById('tab-sticker').onclick = () => { setActiveTab('tab-sticker'); renderStickers(); };

document.getElementById('msg-input').oninput = () => {
    if (realtimeChannel) realtimeChannel.send({ type: 'broadcast', event: 'typing', payload: { user: MY_USERNAME } });
};

document.getElementById('add-file').onclick = () => document.getElementById('file-input').click();
document.getElementById('file-input').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("Photo 2 MB peksha kami asava.");
    const reader = new FileReader();
    reader.onload = () => sendMessage(reader.result, 'image');
    reader.readAsDataURL(file);
};

function checkRomanticKeywords(text) {
    const lower = text.toLowerCase();
    if (lower.includes('love') || lower.includes('miss') || lower.includes('❤️') || lower.includes('kiss') || lower.includes('jaan') || lower.includes('shona')) {
        createHeartMagic();
    }
}

function createHeartMagic() {
    const container = document.getElementById('hearts-container');
    for (let i = 0; i < 20; i++) {
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
