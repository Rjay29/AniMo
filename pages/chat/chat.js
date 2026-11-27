// Local Buyer And Farmer Chat
document.addEventListener('DOMContentLoaded', async () => {
  const status = document.getElementById('chatStatus');
  const list = document.getElementById('conversationList');
  const messages = document.getElementById('chatMessages');
  const form = document.getElementById('chatForm');
  let user;
  let conversations = [];
  let activeId = null;
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  try {
    ({ user } = await window.aniMoApi('/api/auth/me'));
    if (!['customer', 'farmer'].includes(user.role)) throw new Error('Chat is available to buyers and verified farmers.');
    const targetId = new URLSearchParams(location.search).get('userId');
    if (targetId) {
      const { conversation } = await window.aniMoApi('/api/chat/start', {
        method: 'POST', body: JSON.stringify({ userId: targetId })
      });
      activeId = conversation.id;
    }
    await loadConversations();
  } catch (error) {
    status.textContent = error.message;
    form.hidden = true;
    return;
  }

  // Conversation Rendering
  async function loadConversations() {
    const result = await window.aniMoApi('/api/chat');
    conversations = result.conversations;
    list.innerHTML = conversations.length ? conversations.map((conversation) => {
      const partner = user.id === conversation.customer_id ? conversation.farmer_username : conversation.buyer_username;
      const recentMessage = conversation.messages.length ? escape(conversation.messages.at(-1).body.slice(0, 60)) : 'No messages yet';
      const deliveredOrders = (conversation.relatedOrders || []).filter((order) => order.status === 'completed').length;
      const orderSummary = deliveredOrders ? ` · ${deliveredOrders} delivered order${deliveredOrders === 1 ? '' : 's'}` : '';
      return `<button type="button" class="conversation-option${activeId === conversation.id ? ' active' : ''}" data-conversation="${conversation.id}">${escape(partner)}<small>${recentMessage}${orderSummary}</small></button>`;
    }).join('') : '<p>No conversations yet. Open a farmer profile to start a chat.</p>';
    if (!activeId && conversations.length) activeId = conversations[0].id;
    renderMessages();
  }
  function renderMessages() {
    const conversation = conversations.find((entry) => entry.id === activeId);
    if (!conversation) {
      messages.innerHTML = '<p>Select a conversation to view messages.</p>';
      return;
    }
    const relatedOrders = (conversation.relatedOrders || []).filter((order) => order.status === 'completed');
    const ordersNote = relatedOrders.length ? `
      <aside class="chat-order-context" aria-label="Related delivered orders">
        <strong>Delivered orders connected to this chat</strong>
        <div>${relatedOrders.map((order) => `<span>${escape(order.id)}</span>`).join('')}</div>
      </aside>` : '';
    messages.innerHTML = `${ordersNote}${conversation.messages.length ? conversation.messages.map((message) => `
      <article class="chat-message ${message.senderId === user.id ? 'mine' : ''}">
        <strong>${escape(message.senderName)}</strong><p>${escape(message.body)}</p><small>${escape(message.created_at)}</small>
      </article>`).join('') : '<p>No messages yet. Send a message to begin.</p>'}`;
    messages.scrollTop = messages.scrollHeight;
  }
  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-conversation]');
    if (!button) return;
    activeId = Number(button.dataset.conversation);
    loadConversations().catch((error) => { status.textContent = error.message; });
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activeId) {
      status.textContent = 'Open a conversation before sending a message.';
      return;
    }
    const input = document.getElementById('chatMessage');
    try {
      await window.aniMoApi('/api/chat', {
        method: 'POST', body: JSON.stringify({ conversationId: activeId, message: input.value })
      });
      input.value = '';
      await loadConversations();
    } catch (error) { status.textContent = error.message; }
  });
  window.setInterval(() => {
    if (!document.hidden) loadConversations().catch(() => {});
  }, 5000);
});
