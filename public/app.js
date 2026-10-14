// =========================================================
// 1. SUPABASE KEYS (Tuza URL ani Key ithe paste kar)
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
let burnMode = false;
let currentReply = null;
let typingTimeout = null;

// DOM Elements
const calcScreen = document.getElementById('calc-screen');
const calcDisplay = document.getElementById('calc-display');
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
// 2. WHATSAPP STYLE EMOJIS & HISTORY (RECENT) LOGIC
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
// 3. DECOY CALCULATOR LOGIC (SECRET UNLOCK)
// =========================================================
let calcExp = "";

window.calcInput = (val) => {
    if (calcExp === "0") calcExp = "";
    calcExp += val;
    calcDisplay.innerText = calcExp;
};

window.calcClear = () => {
    calcExp = "";
    calcDisplay.innerText = "0";
};

window.calcDel = () => {
    calcExp = calcExp.slice(0, -1);
    calcDisplay.innerText = calcExp || "0";
};

window.calcEvaluate = () => {
    if (calcExp === CALC_PIN) {
        calcExp = "";
        calcDisplay.innerText = "0";
        calcScreen.classList.add('hidden');
        if (!SECRET_KEY || !MY_USERNAME || !ROOM_ID) {
            setupModal.classList.remove('hidden');
        } else {
            markAllReceivedAsSeen();
        }
        return;
    }
    try {
        const res = Function('"use strict";return (' + calcExp + ')')();
        calcDisplay.innerText = res;
        calcExp = String(res);
    } catch {
        calcDisplay.innerText = "Error";
        calcExp = "";
    }
};

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && SECRET_KEY) {
        calcScreen.classList.remove('hidden');
        document.title = "CalcPro";
    }
});

document.getElementById('panic-btn').onclick = () => calcScreen.classList.remove('hidden');
document.getElementById('chat-header').ondblclick = () => calcScreen.classList.remove('hidden');

// =========================================================
// 4. PWA & STEALTH NOTIFICATIONS
// =========================================================
let swRegistration = null;
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => swRegistration = reg).catch(() => {});
    });
}

document.getElementById('notify-btn').onclick = async () => {
    if (!('Notification' in window)) return alert("Browser notification support karat nahi.");
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
        alert("🔔 Stealth Alert ON! Message alyavar fakt 'CalcPro: Memory Synced' asa gupt notification yeil.");
    }
};

function triggerSecretNotification() {
    if (Notification.permission === 'granted' && (document.visibilityState === 'hidden' || !calcScreen.classList.contains('hidden'))) {
        const title = "CalcPro Utility ⚙️";
        const options = {
            body: "Background calculation cache updated.",
            icon: "https://cdn-icons-png.flaticon.com/512/2344/2344132.png",
            tag: "calc-sync",
            renotify: true,
            vibrate: [80, 40, 80]
        };
        if (swRegistration && swRegistration.showNotification) {
            swRegistration.showNotification(title, options);
        } else {
            new Notification(title, options);
        }
    }
}

// =========================================================
// 5. AES-256 END-TO-END ENCRYPTION
// =========================================================
function encryptPayload(plainText) {
    return CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
}

function decryptPayload(cipherText) {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const text = bytes.toString(CryptoJS.enc.Utf8);
        return text || "🔒 [Wrong Secret Key]";
    } catch {
        return "🔒 [Encrypted Data]";
    }
}

// =========================================================
// 6. SETUP & SUPABASE REALTIME CONNECTION
// =========================================================
function initForm() {
    document.getElementById('my-username').value = MY_USERNAME;
    document.getElementById('room-id').value = ROOM_ID;
    document.getElementById('calc-pin').value = CALC_PIN;
    document.getElementById('sb-url').value = localStorage.getItem('sb_url') || '';
    document.getElementById('sb-key').value = localStorage.getItem('sb_key') || '';
}
initForm();

document.getElementById('enter-chat-btn').onclick = () => {
    const user = document.getElementById('my-username').value.trim();
    const room = document.getElementById('room-id').value.trim();
    const key = document.getElementById('secret-key').value.trim();
    const pin = document.getElementById('calc-pin').value.trim() || '1430';
    const customUrl = document.getElementById('sb-url').value.trim();
    const customKey = document.getElementById('sb-key').value.trim();

    if (!user || !room || !key) return alert("Krupaya Naav, Room ID ani Encryption Key bhara!");

    MY_USERNAME = user;
    ROOM_ID = room;
    SECRET_KEY = key;
    CALC_PIN = pin;

    localStorage.setItem('whisper_user', MY_USERNAME);
    localStorage.setItem('whisper_room', ROOM_ID);
    localStorage.setItem('whisper_calc_pin', CALC_PIN);
    sessionStorage.setItem('whisper_key', SECRET_KEY);

    if (customUrl && customKey) {
        localStorage.setItem('sb_url', customUrl);
        localStorage.setItem('sb_key', customKey);
    }

    setupModal.classList.add('hidden');
    roomTitle.innerText = `${ROOM_ID} 💖`;
    connectToSupabase(customUrl || DEFAULT_SUPABASE_URL, customKey || DEFAULT_SUPABASE_KEY);
};

document.getElementById('logout-btn').onclick = () => setupModal.classList.remove('hidden');

document.getElementById('burn-btn').onclick = (e) => {
    burnMode = !burnMode;
    e.target.classList.toggle('burn-active', burnMode);
    alert(burnMode ? "🔥 Self-Destruct Mode ON: Messages 30 secondat automatic delete hotil!" : "Self-Destruct Mode OFF");
};

async function connectToSupabase(url, key) {
    if (!url || url === "YOUR_SUPABASE_PROJECT_URL" || !key || key === "YOUR_SUPABASE_ANON_PUBLIC_KEY") {
        connStatus.innerText = "✨ Demo Mode (Add Supabase Keys)";
        return;
    }

    try {
        supabaseClient = window.supabase.createClient(url, key);
        connStatus.innerText = "Connecting Vault...";

        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('room_id', ROOM_ID)
            .order('created_at', { ascending: true })
            .limit(60);

        if (!error && data) {
            chatBox.innerHTML = `<div class="security-banner">💖 AES-256 Encrypted Vault • Double-tap message for ❤️ • Click message to Reply</div>`;
            data.forEach(row => renderMessageOnUI(row));
            markAllReceivedAsSeen();
        }

        if (realtimeChannel) supabaseClient.removeChannel(realtimeChannel);

        realtimeChannel = supabaseClient
            .channel(`room:${ROOM_ID}`, { config: { broadcast: { self: false } } })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${ROOM_ID}` }, async (payload) => {
                const newMsg = payload.new;
                renderMessageOnUI(newMsg);

                if (newMsg.sender !== MY_USERNAME) {
                    triggerSecretNotification();
                    const isVisible = document.visibilityState === 'visible' && calcScreen.classList.contains('hidden');
                    await supabaseClient.from('messages').update({ status: isVisible ? 'seen' : 'delivered' }).eq('id', newMsg.id);
                }
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `room_id=eq.${ROOM_ID}` }, (payload) => {
                updateTickOnUI(payload.new.id, payload.new.status);
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
                const el = document.getElementById(`msg-${payload.old.id}`);
                if (el) el.remove();
            })
            .on('broadcast', { event: 'typing' }, (payload) => {
                if (payload.payload.user !== MY_USERNAME) {
                    connStatus.innerText = `✨ ${payload.payload.user} is whispering...`;
                    clearTimeout(typingTimeout);
                    typingTimeout = setTimeout(() => connStatus.innerText = "🟢 Online • End-to-End Encrypted", 2200);
                }
            })
            .on('broadcast', { event: 'reaction' }, (payload) => {
                addReactionBadge(payload.payload.msgId, payload.payload.emoji);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') connStatus.innerText = "🟢 Online • End-to-End Encrypted";
            });

    } catch (err) {
        connStatus.innerText = "🔴 Connection Error";
    }
}

// =========================================================
// 7. SEND, REPLY, REACT & BURN MESSAGES
// =========================================================
async function sendMessage(rawContent = msgInput.value, msgType = 'text') {
    if (!rawContent.trim()) return;

    let payloadToEncrypt = rawContent;
    if (currentReply && msgType === 'text') {
        payloadToEncrypt = JSON.stringify({ replyTo: currentReply, text: rawContent });
        cancelReply();
    }

    if (msgType === 'text') {
        msgInput.value = '';
        checkRomanticKeywords(rawContent);
    }
    extraPanel.classList.add('hidden');

    const encryptedCipher = encryptPayload(payloadToEncrypt);

    if (!supabaseClient) {
        const tempId = 'local-' + Date.now();
        renderMessageOnUI({
            id: tempId, sender: MY_USERNAME || 'Me', cipher_text: encryptedCipher,
            msg_type: msgType, status: 'sent', created_at: new Date().toISOString()
        });
        setTimeout(() => updateTickOnUI(tempId, 'delivered'), 600);
        setTimeout(() => updateTickOnUI(tempId, 'seen'), 1400);
        return;
    }

    const { data, error } = await supabaseClient.from('messages').insert([{
        room_id: ROOM_ID, sender: MY_USERNAME, cipher_text: encryptedCipher, msg_type: msgType, status: 'sent'
    }]).select();

    if (!error && burnMode && data && data[0]) {
        setTimeout(async () => {
            await supabaseClient.from('messages').delete().eq('id', data[0].id);
            const el = document.getElementById(`msg-${data[0].id}`);
            if (el) el.remove();
        }, 30000);
    }
}

function renderMessageOnUI(msgObj) {
    if (document.getElementById(`msg-${msgObj.id}`)) return;

    const decryptedRaw = decryptPayload(msgObj.cipher_text);
    const isMe = msgObj.sender === MY_USERNAME;

    let displayText = decryptedRaw;
    let quotedHTML = '';

    try {
        const parsed = JSON.parse(decryptedRaw);
        if (parsed && parsed.replyTo && parsed.text) {
            quotedHTML = `<div class="quoted-box">${escapeHTML(parsed.replyTo)}</div>`;
            displayText = parsed.text;
        }
    } catch {}

    if (!isMe && msgObj.msg_type === 'text') checkRomanticKeywords(displayText);

    const msgDiv = document.createElement('div');
    msgDiv.id = `msg-${msgObj.id}`;
    msgDiv.className = `message ${isMe ? 'sent' : 'received'}`;

    const time = new Date(msgObj.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let contentHTML = '';
    if (msgObj.msg_type === 'image') {
        contentHTML = `<img src="${displayText}" class="chat-img" alt="Secret Photo">`;
    } else if (msgObj.msg_type === 'sticker') {
        msgDiv.style.background = 'transparent'; msgDiv.style.border = 'none'; msgDiv.style.boxShadow = 'none';
        contentHTML = `<div class="romantic-sticker-badge">${escapeHTML(displayText)}</div>`;
    } else {
        contentHTML = `${quotedHTML}<p>${escapeHTML(displayText)}</p>`;
    }

    const tickHTML = isMe ? getTickHTML(msgObj.status, msgObj.id) : '';
    const senderHTML = !isMe ? `<span class="sender-label">${escapeHTML(msgObj.sender)}</span>` : '';

    msgDiv.innerHTML = `${senderHTML}${contentHTML}<span class="time">${burnMode ? '🔥 ' : ''}${time} ${tickHTML}</span>`;

    msgDiv.onclick = () => {
        if (msgObj.msg_type === 'text') {
            currentReply = `${msgObj.sender}: ${displayText.slice(0, 45)}`;
            replyText.innerText = `Replying to ${currentReply}`;
            replyBar.classList.remove('hidden');
            msgInput.focus();
        }
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

function cancelReply() { currentReply = null; replyBar.classList.add('hidden'); }
document.getElementById('cancel-reply').onclick = cancelReply;

function getTickHTML(status, id) {
    if (status === 'seen') return `<span id="tick-${id}" class="ticks tick-pink">✓✓</span>`;
    if (status === 'delivered') return `<span id="tick-${id}" class="ticks tick-gray">✓✓</span>`;
    return `<span id="tick-${id}" class="ticks tick-gray">✓</span>`;
}

function updateTickOnUI(msgId, newStatus) {
    const tickEl = document.getElementById(`tick-${msgId}`);
    if (!tickEl) return;
    tickEl.innerHTML = '✓✓';
    tickEl.className = newStatus === 'seen' ? 'ticks tick-pink' : 'ticks tick-gray';
}

async function markAllReceivedAsSeen() {
    if (!supabaseClient || !ROOM_ID) return;
    await supabaseClient.from('messages').update({ status: 'seen' }).eq('room_id', ROOM_ID).neq('sender', MY_USERNAME).neq('status', 'seen');
}

// =========================================================
// 8. DYNAMIC EMOJI TABS, HISTORY (RECENT) & STICKERS
// =========================================================

// HTML madhye Tabs automatically add kelyat (Tula HTML change karaychi garaj nahi)
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
    panelContent.classList.remove('sticker-grid');
    const emojisToRender = emojiSets[cat] || emojiSets['faces'];
    
    if (emojisToRender.length === 0 && cat === 'recent') {
        panelContent.innerHTML = `<p style="color:#b57c9e; width:100%; text-align:center; font-size:12px; margin-top:20px;">No recent emojis yet</p>`;
        return;
    }

    panelContent.innerHTML = emojisToRender.map(e => `<span class="emoji-item">${e}</span>`).join('');
    document.querySelectorAll('.emoji-item').forEach(el => {
        el.onclick = () => { 
            const emj = el.innerText;
            msgInput.value += emj; 
            msgInput.focus(); 
            saveRecentEmoji(emj);
        };
    });
}

function renderStickers() {
    panelContent.classList.add('sticker-grid');
    let html = '';
    
    // WhatsApp sarkhi Recent Stickers chi list sarvat var
    if (recentStickers.length > 0) {
        html += `<div style="grid-column: 1 / -1; color: #ff85a2; font-size: 13px; font-weight: bold; margin-bottom: 5px; text-align: left; width: 100%;">🕒 Recently Used</div>`;
        html += recentStickers.map(s => `<div class="romantic-sticker-badge sticker-item">${escapeHTML(s)}</div>`).join('');
        html += `<div style="grid-column: 1 / -1; color: #ff85a2; font-size: 13px; font-weight: bold; margin: 15px 0 5px 0; text-align: left; width: 100%;">💌 All Stickers</div>`;
    }
    
    html += romanticStickers.map(s => `<div class="romantic-sticker-badge sticker-item">${escapeHTML(s)}</div>`).join('');
    
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

// Event Listeners for Tabs
document.getElementById('toggle-emoji').onclick = () => {
    extraPanel.classList.toggle('hidden');
    if (!extraPanel.classList.contains('hidden')) {
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

// Live Typing Indicator Broadcast
msgInput.oninput = () => {
    if (realtimeChannel) {
        realtimeChannel.send({ type: 'broadcast', event: 'typing', payload: { user: MY_USERNAME } });
    }
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
    if (lower.includes('love') || lower.includes('miss') || lower.includes('❤️') || lower.includes('kiss') || lower.includes('jaan') || lower.includes('shona') || lower.includes('hug')) {
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

sendBtn.onclick = () => sendMessage();
msgInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

function escapeHTML(str) {
    return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag]));
}
