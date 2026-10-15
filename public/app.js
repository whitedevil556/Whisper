// फक्त इमोजी आहे का ते ओळखणारे फंक्शन (1 ते 3 Emojis साठी 3D Giant Animation)
function isOnlyEmojis(str) {
    const clean = str.trim();
    if (!clean || clean.length > 14) return false;
    const noText = clean.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\u200d\ufe0f\s]/gu, '');
    return noText.length === 0;
}

function populateBubbleHTML(msgDiv, msgObj, parsed, isMe) {
    const time = new Date(msgObj.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const quotedHTML = parsed.replyTo ? `<div class="quoted-box">${escapeHTML(parsed.replyTo)}</div>` : '';
    const editedTag = parsed.edited ? `<small style="opacity:0.7;">(edited)</small> ` : '';

    let contentHTML = '';
    msgDiv.classList.remove('giant-emoji-msg');

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
        msgDiv.classList.add('giant-emoji-msg');
        contentHTML = `<div class="romantic-sticker-badge">${escapeHTML(parsed.text)}</div>`;
    } else {
        // जर युजरने फक्त इमोजी पाठवले असतील तर मोठा 3D Animated Emoji दाखवणे!
        if (!parsed.isSpoiler && !parsed.replyTo && isOnlyEmojis(parsed.text)) {
            msgDiv.classList.add('giant-emoji-msg');
            contentHTML = `<span class="big-3d-emoji">${escapeHTML(parsed.text)}</span>`;
        } else {
            const textClass = parsed.isSpoiler ? 'spoiler-text' : '';
            contentHTML = `${quotedHTML}<p class="${textClass}">${escapeHTML(parsed.text)}</p>`;
        }
    }

    const tickHTML = isMe ? `<span id="tick-${msgObj.id}" class="ticks ${msgObj.status === 'seen' ? 'tick-pink' : 'tick-gray'}">${msgObj.status === 'sent' ? '✓' : '✓✓'}</span>` : '';
    const senderHTML = !isMe ? `<span class="sender-label">${escapeHTML(msgObj.sender)}</span>` : '';

    msgDiv.innerHTML = `${senderHTML}${contentHTML}<span class="time">${editedTag}${time} ${tickHTML}</span>`;
}
