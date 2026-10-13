import { useEffect, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import api from "../api/axios";

const formatMessageTime = (value) => new Date(value).toLocaleTimeString([], {
  hour: "numeric",
  minute: "2-digit",
});

export default function MessagesScreen({ user }) {
  const [contact, setContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingContact, setLoadingContact] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadContact = async () => {
      try {
        const response = await api.get("/messages/contacts");
        setContact(response.data?.data?.[0] || null);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Could not load your trainer");
      } finally {
        setLoadingContact(false);
      }
    };

    loadContact();
  }, []);

  useEffect(() => {
    if (!contact) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      setError("");
      try {
        const response = await api.get(`/messages/${contact.user_id}`);
        setMessages(response.data?.data || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Could not load messages");
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [contact]);

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

  return (
    <section className="flex min-h-[calc(100vh-8rem)] flex-1 flex-col overflow-hidden rounded-sm border border-white/10 bg-[#0c0e14]">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-orange-500/15 text-orange-300">
          <MessageCircle className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-mono uppercase tracking-widest text-orange-400">Messages</p>
          <h1 className="truncate text-lg font-bold text-white">
            {contact?.name || (loadingContact ? "Loading conversation" : "Your trainer")}
          </h1>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
          {loadingMessages && <Loader2 className="mx-auto h-5 w-5 animate-spin text-orange-400" />}
          {!loadingContact && !contact && !error && (
            <div className="flex h-full items-center justify-center text-center text-sm text-neutral-500">
              You do not have an active trainer conversation yet.
            </div>
          )}
          {!loadingMessages && contact && messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-center text-sm text-neutral-500">
              Start the conversation with {contact.name}.
            </div>
          )}
          {messages.map((message) => {
            const isMine = String(message.sender_id) === String(user?.user_id);
            return (
              <div key={message.message_id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[min(82%,42rem)] rounded-sm px-3 py-2 ${isMine ? "bg-orange-500 text-white" : "bg-white/[0.07] text-neutral-200"}`}>
                  <p className="whitespace-pre-wrap wrap-break-word text-sm">{message.body}</p>
                  <p className={`mt-1 text-[10px] ${isMine ? "text-orange-100" : "text-neutral-500"}`}>
                    {formatMessageTime(message.sent_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {error && <p className="shrink-0 border-t border-white/10 px-4 py-2 text-xs text-red-300 sm:px-6">{error}</p>}
        <form onSubmit={sendMessage} className="flex shrink-0 gap-2 border-t border-white/10 p-3 sm:p-4">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={contact ? "Write a message..." : "No active conversation"}
            maxLength={2000}
            disabled={!contact}
            className="min-w-0 flex-1 rounded-sm border border-white/10 bg-black/30 px-3 py-2 text-sm text-neutral-100 outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button type="submit" disabled={sending || !draft.trim() || !contact} className="inline-flex items-center gap-1.5 rounded-sm bg-orange-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50">
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
