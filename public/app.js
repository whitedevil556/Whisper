// =========================================================
// 1. SUPABASE CONFIGURATION (तुझे Supabase URL आणि Key इथे टाक)
// =========================================================
const DEFAULT_SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL"; 
const DEFAULT_SUPABASE_KEY = "YOUR_SUPABASE_ANON_PUBLIC_KEY";

let supabaseClient = null;
let realtimeChannel = null;

// User & Encryption State
let MY_USERNAME = localStorage.getItem('whisper_user') || '';
let ROOM_ID = localStorage.getItem('whisper_room') || '';
let SECRET_KEY = sessionStorage.getItem('whisper_key') || ''; // फक्त चालू सेशनपुरती मेमरीत राहते

// DOM Elements
const setupModal = document.getElementById('setup-modal');
const privacyShield = document.getElementById('privacy-shield');
const chatBox = document.getElementById('chat-box');
const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const connStatus = document.getElementById('connection-status');
const roomTitle = document.getElementById('room-title');
const extraPanel = document.getElementById('extra-panel');
const panelContent = document.getElementById('panel-content');

const emojis = ['❤️', '😍', '😘', '🥰', '💕', '💖', '💘', '🥺', '😊', '😉', '🔥', '✨', '💋', '🤗', '🙈', '🌹', '🥂'];
const stickers = ['🧸', '🌹', '💌', '💍', '🍫', '🥂', '💝', '💃'];

// =========================================================
// 2. PWA SERVICE WORKER & SECRET NOTIFICATIONS
// =========================================================
let swRegistration = null;
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            swRegistration = reg;
        }).catch(err => console.error('SW Error:', err));
    });
}

document.getElementById('notify-btn').onclick = async () => {
    if (!('Notification' in window)) {
        alert("तुमचा ब्राउझर नोटिफिकेशन सपोर्ट करत नाही.");
        return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
        triggerSecretNotification();
        alert("🔔 Stealth Notifications ON! आता मेसेज आल्यावर फक्त 'System Sync' असा गुप्त अलर्ट येईल.");
    }
};

// गुप्त नोटिफिकेशन पाठवणारे फंक्शन (मेसेज किंवा नाव अजिबात दिसणार नाही)
function triggerSecretNotification() {
    if (Notification.permission === 'granted' && document.visibilityState === 'hidden') {
        if (swRegistration && swRegistration.showNotification) {
            swRegistration.showNotification("System Sync 🔒", {
                body: "1 new background update available. Tap to verify.",
                icon: "https://cdn-icons-png.flaticon.com/512/833/833472.png",
                tag: "whisper-stealth", // एकावर एक अनेक नोटिफिकेशन्स न दिसता एकच दिसेल
                renotify: true,
                vibrate: [100, 50, 100]
            });
        } else {
            new Notification("System Sync 🔒", {
                body: "1 new background update available."
            });
        }
    }
}

// =========================================================
// 3. STEALTH PRIVACY SHIELD (BOSS KEY / AUTO-BLUR)
// =========================================================
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && SECRET_KEY) {
        privacyShield.classList.remove('hidden');
        document.title = "System Sync";
    } else if (document.visibilityState === 'visible' && SECRET_KEY) {
        markAllReceivedAsSeen();
    }
});

document.getElementById('panic-btn').onclick = () => {
    privacyShield.classList.remove('hidden');
};

document.getElementById('unlock-btn').onclick = () => {
    privacyShield.classList.add('hidden');
    markAllReceivedAsSeen();
};

// =========================================================
// 4. END-TO-END ENCRYPTION (AES-256)
// =========================================================
function encryptPayload(plainText) {
    return CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
}

function decryptPayload(cipherText) {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText || "🔒 [वेगळी Secret Key वापरल्याने मेसेज अनलॉक झाला नाही]";
    } catch (e) {
        return "🔒 [Encrypted Message]";
    }
}

// =========================================================
// 5. INITIALIZE SUPABASE & REALTIME CONNECTION
// =========================================================
function initSetup() {
    document.getElementById('my-username').value = MY_USERNAME;
    document.getElementById('room-id').value = ROOM_ID;
    document.getElementById('sb-url').value = localStorage.getItem('sb_url') || '';
    document.getElementById('sb-key').value = localStorage.getItem('sb_key') || '';
}
initSetup();

document.getElementById('enter-chat-btn').onclick = async () => {
    const user = document.getElementById('my-username').value.trim();
    const room = document.getElementById('room-id').value.trim();
    const key = document.getElementById('secret-key').value.trim();
    const customUrl = document.getElementById('sb-url').value.trim();
    const customKey = document.getElementById('sb-key').value.trim();

    if (!user || !room || !key) {
        alert("कृपया नाव, Room ID आणि Secret Key भरा!");
        return;
    }

    MY_USERNAME = user;
    ROOM_ID = room;
    SECRET_KEY = key;

    localStorage.setItem('whisper_user', MY_USERNAME);
    localStorage.setItem('whisper_room', ROOM_ID);
    sessionStorage.setItem('whisper_key', SECRET_KEY);

    if (customUrl && customKey) {
        localStorage.setItem('sb_url', customUrl);
        localStorage.setItem('sb_key', customKey);
    }

    setupModal.classList.add('hidden');
    roomTitle.innerText = `Room: ${ROOM_ID} 🔒`;
    connectToSupabase(customUrl || DEFAULT_SUPABASE_URL, customKey || DEFAULT_SUPABASE_KEY);
};

document.getElementById('logout-btn').onclick = () => {
    sessionStorage.removeItem('whisper_key');
    location.reload();
};

document.getElementById('clear-btn').onclick = () => {
    chatBox.innerHTML = `<div class="security-banner">🔒 स्क्रीन क्लिअर केली आहे.</div>`;
};

async function connectToSupabase(url, key) {
    if (!url || url === "YOUR_SUPABASE_PROJECT_URL" || !key || key === "YOUR_SUPABASE_ANON_PUBLIC_KEY") {
        connStatus.innerText = "Local Demo Mode (Supabase जोडलेला नाही)";
        return;
    }

    try {
        supabaseClient = window.supabase.createClient(url, key);
        connStatus.innerText = "Connecting to Encrypted Server...";

        // 1. जुने Encrypted मेसेजेस लोड करून Decrypt करणे
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('room_id', ROOM_ID)
            .order('created_at', { ascending: true })
            .limit(50);

        if (!error && data) {
            data.forEach(row => renderMessageOnUI(row));
            markAllReceivedAsSeen();
        }

        // 2. Realtime Channel सुरू करणे (Instant Message & Live Ticks साठी)
        realtimeChannel = supabaseClient
            .channel(`room:${ROOM_ID}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `room_id=eq.${ROOM_ID}`
            }, async (payload) => {
                const newMsg = payload.new;
                renderMessageOnUI(newMsg);

                // जर समोरच्याचा मेसेज आला असेल
                if (newMsg.sender !== MY_USERNAME) {
                    triggerSecretNotification();
                    const newStatus = document.visibilityState === 'visible' ? 'seen' : 'delivered';
                    await supabaseClient
                        .from('messages')
                        .update({ status: newStatus })
                        .eq('id', newMsg.id);
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages',
                filter: `room_id=eq.${ROOM_ID}`
            }, (payload) => {
                updateTickOnUI(payload.new.id, payload.new.status);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    connStatus.innerText = "🟢 Online • End-to-End Encrypted";
                }
            });

    } catch (err) {
        console.error(err);
        connStatus.innerText = "🔴 Connection Error (Check Supabase Keys)";
    }
}

// =========================================================
// 6. SEND, RECEIVE & TICK STATUS LOGIC
// =========================================================
async function sendMessage(rawContent = msgInput.value, msgType = 'text') {
    if (!rawContent.trim()) return;

    if (msgType === 'text') {
        msgInput.value = '';
        checkRomanticKeywords(rawContent);
    }
    extraPanel.classList.add('hidden');

    // ★ महत्त्वाची स्टेप: डेटाबेसला पाठवण्यापूर्वीच मेसेज Encrypt होतो
    const encryptedCipher = encryptPayload(rawContent);

    // जर Supabase कनेक्ट नसेल तर लोकल डेमो चालवा
    if (!supabaseClient) {
        const tempId = 'local-' + Date.now();
        renderMessageOnUI({
            id: tempId,
            sender: MY_USERNAME,
            cipher_text: encryptedCipher,
            msg_type: msgType,
            status: 'sent',
            created_at: new Date().toISOString()
        });
        setTimeout(() => updateTickOnUI(tempId, 'delivered'), 800);
        setTimeout(() => updateTickOnUI(tempId, 'seen'), 2000);
        return;
    }

    // Supabase मध्ये फक्त Encrypted कोड सेव्ह करणे
    const { error } = await supabaseClient
        .from('messages')
        .insert([{
            room_id: ROOM_ID,
            sender: MY_USERNAME,
            cipher_text: encryptedCipher,
            msg_type: msgType,
            status: 'sent'
        }]);

    if (error) {
        console.error("Send Error:", error.message);
        alert("मेसेज पाठवताना अडचण आली. Supabase SQL टेबल सेट केले आहे का ते तपासा.");
    }
}

function renderMessageOnUI(msgObj) {
    if (document.getElementById(`msg-${msgObj.id}`)) return;

    const decryptedText = decryptPayload(msgObj.cipher_text);
    const isMe = msgObj.sender === MY_USERNAME;

    if (!isMe && msgObj.msg_type === 'text') {
        checkRomanticKeywords(decryptedText);
    }

    const msgDiv = document.createElement('div');
    msgDiv.id = `msg-${msgObj.id}`;
    msgDiv.dataset.status = msgObj.status;
    msgDiv.dataset.sender = msgObj.sender;
    msgDiv.className = `message ${isMe ? 'sent' : 'received'}`;

    const time = new Date(msgObj.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let contentHTML = '';
    if (msgObj.msg_type === 'image') {
        contentHTML = `<img src="${decryptedText}" class="chat-img" alt="Encrypted Photo">`;
    } else if (msgObj.msg_type === 'sticker') {
        msgDiv.style.background = 'transparent';
        msgDiv.style.boxShadow = 'none';
        msgDiv.style.fontSize = '54px';
        contentHTML = `<p>${decryptedText}</p>`;
    } else {
        contentHTML = `<p>${escapeHTML(decryptedText)}</p>`;
    }

    const tickHTML = isMe ? getTickHTML(msgObj.status, msgObj.id) : '';
    const senderHTML = !isMe ? `<span class="sender-label">${escapeHTML(msgObj.sender)}</span>` : '';

    msgDiv.innerHTML = `
        ${senderHTML}
        ${contentHTML}
        <span class="time">${time} ${tickHTML}</span>
    `;

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function getTickHTML(status, id) {
    if (status === 'seen') {
        return `<span id="tick-${id}" class="ticks tick-pink">✓✓</span>`;
    } else if (status === 'delivered') {
        return `<span id="tick-${id}" class="ticks tick-gray">✓✓</span>`;
    }
    return `<span id="tick-${id}" class="ticks tick-gray">✓</span>`;
}

function updateTickOnUI(msgId, newStatus) {
    const tickEl = document.getElementById(`tick-${msgId}`);
    if (!tickEl) return;

    if (newStatus === 'delivered') {
        tickEl.innerHTML = '✓✓';
        tickEl.className = 'ticks tick-gray';
    } else if (newStatus === 'seen') {
        tickEl.innerHTML = '✓✓';
        tickEl.className = 'ticks tick-pink';
    }
}

async function markAllReceivedAsSeen() {
    if (!supabaseClient) return;
    await supabaseClient
        .from('messages')
        .update({ status: 'seen' })
        .eq('room_id', ROOM_ID)
        .neq('sender', MY_USERNAME)
        .neq('status', 'seen');
}

// =========================================================
// 7. ENCRYPTED IMAGE UPLOAD, EMOJIS & ROMANTIC MAGIC
// =========================================================
document.getElementById('add-file').onclick = () => document.getElementById('file-input').click();

document.getElementById('file-input').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
        alert("कृपया 2 MB पेक्षा कमी साईजचा फोटो निवडा.");
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        // फोटोचा Base64 डेटा सुद्धा पूर्णपणे Encrypt होऊन जाईल
        sendMessage(reader.result, 'image');
    };
    reader.readAsDataURL(file);
};

function checkRomanticKeywords(text) {
    const lower = text.toLowerCase();
    if (lower.includes('love') || lower.includes('miss') || lower.includes('❤️') || lower.includes('kiss') || lower.includes('jaan')) {
        createHeartMagic();
    }
}

function createHeartMagic() {
    const container = document.getElementById('hearts-container');
    for (let i = 0; i < 18; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'heart';
            heart.innerText = ['❤️', '💖', '💕', '💘', '✨'][Math.floor(Math.random() * 5)];
            heart.style.left = Math.random() * 90 + '%';
            heart.style.fontSize = (Math.random() * 18 + 20) + 'px';
            container.appendChild(heart);
            setTimeout(() => heart.remove(), 3000);
        }, i * 90);
    }
}

function loadEmojis() {
    panelContent.innerHTML = emojis.map(e => `<span class="emoji-item">${e}</span>`).join('');
    document.querySelectorAll('.emoji-item').forEach(el => {
        el.onclick = () => { msgInput.value += el.innerText; msgInput.focus(); };
    });
}

function loadStickers() {
    panelContent.innerHTML = stickers.map(s => `<span class="sticker-item">${s}</span>`).join('');
    document.querySelectorAll('.sticker-item').forEach(el => {
        el.onclick = () => sendMessage(el.innerText, 'sticker');
    });
}

document.getElementById('toggle-emoji').onclick = () => {
    extraPanel.classList.toggle('hidden');
    if (!extraPanel.classList.contains('hidden')) loadEmojis();
};
document.getElementById('tab-emoji').onclick = (e) => {
    loadEmojis();
    e.target.classList.add('active');
    document.getElementById('tab-sticker').classList.remove('active');
};
document.getElementById('tab-sticker').onclick = (e) => {
    loadStickers();
    e.target.classList.add('active');
    document.getElementById('tab-emoji').classList.remove('active');
};

sendBtn.onclick = () => sendMessage();
msgInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag]));
}
