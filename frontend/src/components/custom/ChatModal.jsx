import { useEffect, useState } from "react";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import api from "../../api/axios";

const formatMessageTime = (value) => new Date(value).toLocaleTimeString([], {
  hour: "numeric",
  minute: "2-digit",
});

export default function ChatModal({ isOpen, onClose, currentUser, contact }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !contact) return;

    const loadMessages = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/messages/${contact.user_id}`);
        setMessages(response.data?.data || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Could not load messages");
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [isOpen, contact]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending || !contact) return;

    setSending(true);
    setError("");
    try {
      const response = await api.post(`/messages/${contact.user_id}`, { body });
      setMessages((current) => [...current, response.data.data]);
      setDraft("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not send message");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center" role="presentation">
      <div className="flex h-[min(560px,calc(100vh-1.5rem))] w-full max-w-lg flex-col rounded-sm border border-white/10 bg-[#0c0e14] shadow-2xl" role="dialog" aria-modal="true" aria-label={`Chat with ${contact?.name || "contact"}`}>
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-orange-500/15 text-orange-300">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{contact?.name || "Conversation"}</h2>
              <p className="text-[11px] text-neutral-500">Private trainer-client chat</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-sm p-1.5 text-neutral-500 transition hover:bg-white/10 hover:text-white" aria-label="Close chat">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {loading && <Loader2 className="mx-auto h-5 w-5 animate-spin text-orange-400" />}
          {!loading && messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-center text-xs text-neutral-500">
              Start the conversation with {contact?.name || "your contact"}.
            </div>
          )}
          {messages.map((message) => {
            const isMine = String(message.sender_id) === String(currentUser?.user_id);
            return (
              <div key={message.message_id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-sm px-3 py-2 ${isMine ? "bg-orange-500 text-white" : "bg-white/[0.07] text-neutral-200"}`}>
                  <p className="whitespace-pre-wrap wrap-break-word text-sm">{message.body}</p>
                  <p className={`mt-1 text-[10px] ${isMine ? "text-orange-100" : "text-neutral-500"}`}>
                    {formatMessageTime(message.sent_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {error && <p className="border-t border-white/10 px-4 py-2 text-xs text-red-300">{error}</p>}
        <form onSubmit={sendMessage} className="flex gap-2 border-t border-white/10 p-3">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a message..."
            maxLength={2000}
            className="min-w-0 flex-1 rounded-sm border border-white/10 bg-black/30 px-3 py-2 text-sm text-neutral-100 outline-none"
          />
          <button type="submit" disabled={sending || !draft.trim()} className="inline-flex items-center gap-1.5 rounded-sm bg-orange-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50">
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
