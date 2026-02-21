const form       = document.getElementById('chat-form');
const textarea   = document.getElementById('user-input');
const chatBox    = document.getElementById('chat-box');
const submitBtn  = document.getElementById('submit-btn');
const clearBtn   = document.getElementById('clear-btn');
const charCount  = document.getElementById('char-count');
const welcomeState = document.getElementById('welcome-state');

// Maintains conversation history for multi-turn context
const conversationHistory = [];

// ── Character Counter ──
textarea.addEventListener('input', () => {
  charCount.textContent = textarea.value.length;
});

// ── Clear Button ──
clearBtn.addEventListener('click', () => {
  textarea.value = '';
  charCount.textContent = '0';
  textarea.focus();
});

// ── Enter to Send, Shift+Enter for new line ──
textarea.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!submitBtn.disabled) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  }
});

// ── Form Submit ──
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = textarea.value.trim();
  if (!userMessage) return;

  // Hide welcome state on first message
  if (welcomeState) welcomeState.remove();

  // Prevent duplicate submissions
  setLoading(true);

  appendUserMessage(userMessage);
  textarea.value = '';
  charCount.textContent = '0';

  conversationHistory.push({ role: 'user', text: userMessage });

  // Show "Thinking..." placeholder
  const thinkingEl = appendThinking();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation: conversationHistory }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get response from server.');
    }

    if (!data.result) {
      throw new Error('Sorry, no response received.');
    }

    // Replace thinking with formatted analysis card
    thinkingEl.replaceWith(createAnalysisRow(data.result));

    // Save bot reply in history
    conversationHistory.push({ role: 'bot', text: data.result.summary });

  } catch (err) {
    thinkingEl.replaceWith(createErrorRow(err.message));
  } finally {
    setLoading(false);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

// ── Append User Message ──
function appendUserMessage(text) {
  const row = document.createElement('div');
  row.classList.add('message-row', 'user-row');

  row.innerHTML = `
    <div class="message-label">You</div>
    <div class="message-bubble">${escapeHtml(text)}</div>
  `;

  chatBox.appendChild(row);
  chatBox.scrollTop = chatBox.scrollHeight;
  return row;
}

// ── Append Thinking Indicator ──
function appendThinking() {
  const row = document.createElement('div');
  row.classList.add('message-row', 'bot-row');

  row.innerHTML = `
    <div class="message-label">SalesIQ</div>
    <div class="message-bubble thinking">
      Analyzing
      <div class="thinking-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;

  chatBox.appendChild(row);
  chatBox.scrollTop = chatBox.scrollHeight;
  return row;
}

// ── Create Analysis Card Row ──
function createAnalysisRow(result) {
  const row = document.createElement('div');
  row.classList.add('message-row', 'bot-row');

  const sentimentClass = (result.sentiment || '').toLowerCase();
  const probabilityNum = parseInt(result.dealProbability) || 0;
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  row.innerHTML = `
    <div class="message-label">SalesIQ · ${now}</div>
    <div class="analysis-card">

      <div class="analysis-card-header">
        <span class="analysis-card-title">◈ Analysis Complete</span>
        <span class="analysis-card-meta">CRM Report</span>
      </div>

      <div class="analysis-body">

        <!-- Summary -->
        <div class="analysis-row">
          <span class="analysis-key">Summary</span>
          <span class="analysis-value">${escapeHtml(result.summary)}</span>
        </div>

        <div class="analysis-divider"></div>

        <!-- Sentiment + Deal Probability -->
        <div class="analysis-row inline">
          <div style="flex:1">
            <div class="analysis-key" style="margin-bottom:6px">Sentiment</div>
            <span class="badge ${sentimentClass}">${escapeHtml(result.sentiment)}</span>
          </div>
          <div style="flex:2">
            <div class="analysis-key" style="margin-bottom:6px">Deal Probability</div>
            <div class="probability-wrap">
              <div class="probability-row">
                <span class="probability-number">${escapeHtml(result.dealProbability)}</span>
              </div>
              <div class="probability-bar-bg">
                <div class="probability-bar-fill" style="width: ${probabilityNum}%"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="analysis-divider"></div>

        <!-- Objections -->
        <div class="analysis-row">
          <span class="analysis-key">🚧 Objections Detected</span>
          <div class="tag-list">
            ${renderTags(result.objections, 'objection')}
          </div>
        </div>

        <!-- Buying Signals -->
        <div class="analysis-row">
          <span class="analysis-key">✅ Buying Signals</span>
          <div class="tag-list">
            ${renderTags(result.buyingSignals, 'signal')}
          </div>
        </div>

        <div class="analysis-divider"></div>

        <!-- Recommended Next Action -->
        <div class="analysis-row">
          <span class="analysis-key">⚡ Recommended Next Action</span>
          <span class="analysis-value">${escapeHtml(result.recommendedNextAction)}</span>
        </div>

        <div class="analysis-divider"></div>

        <!-- Follow-Up Message -->
        <div class="analysis-row">
          <span class="analysis-key">✉️ Suggested Follow-Up Message</span>
          <div class="followup-block">${escapeHtml(result.followUpMessage)}</div>
        </div>

      </div>
    </div>
  `;

  return row;
}

// ── Create Error Row ──
function createErrorRow(message) {
  const row = document.createElement('div');
  row.classList.add('message-row', 'bot-row');

  row.innerHTML = `
    <div class="message-label">SalesIQ</div>
    <div class="message-bubble error">⚠ ${escapeHtml(message)}</div>
  `;

  return row;
}

// ── Render Tags ──
function renderTags(items, type) {
  if (!Array.isArray(items) || items.length === 0) {
    return `<span class="tag none">None detected</span>`;
  }
  return items.map(i => `<span class="tag ${type}">${escapeHtml(i)}</span>`).join('');
}

// ── Escape HTML (XSS prevention) ──
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Loading State ──
function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  textarea.disabled  = isLoading;
  clearBtn.disabled  = isLoading;

  const btnText = submitBtn.querySelector('.btn-text');
  const btnIcon = submitBtn.querySelector('.btn-icon');

  if (isLoading) {
    btnText.textContent = 'Analyzing';
    btnIcon.textContent = '…';
  } else {
    btnText.textContent = 'Analyze';
    btnIcon.textContent = '→';
    textarea.focus();
  }
}