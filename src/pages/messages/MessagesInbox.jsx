import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import conversationsApi from "../../api/conversationsApi";
import { ConversationCardSkeleton } from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import PageShell from "../../components/layout/PageShell";
import { useSocket } from "../../context/SocketProvider";
import { useAuth } from "../../context/AuthProvider";
import { getErrorMessage, logError } from "../../utils/errorHandler";

export default function MessagesInbox() {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Extract active conversation ID from location if coming from /messages/:id
  const activeConversationId = location.state?.fromConversation || null;

  // 🔒 SECURITY FIX: Only load/poll conversations when auth is ready and user exists
  useEffect(() => {
    // Don't start polling if auth is still loading or no user
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    loadConversations();

    // Polling: refresh every 15 seconds for live updates (fallback)
    const interval = setInterval(() => {
      loadConversations(true); // silent refresh
    }, 15000);

    return () => clearInterval(interval);
  }, [authLoading, user]);

  // Socket.IO real-time inbox updates
  useEffect(() => {
    if (!socket) return;

    const handleInboxUpdate = () => {
      loadConversations(true); // silent refresh
    };

    socket.on("inbox_update", handleInboxUpdate);

    return () => {
      socket.off("inbox_update", handleInboxUpdate);
    };
  }, [socket]);

  const loadConversations = async (silent = false) => {
    // 🔒 SECURITY FIX: Don't attempt to load if not authenticated
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      if (!silent) {
        setLoading(true);
      }
      setError("");
      const data = await conversationsApi.getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      logError("MessagesInbox - loadConversations", err);
      if (!silent) {
        setError(getErrorMessage(err));
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Şimdi";
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;

    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });
  };

  if (loading) {
    return (
      <PageShell title="Mesajlarım">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <ConversationCardSkeleton key={i} />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Mesajlarım">

      {error && (
        <div className="bg-card border border-error text-error p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {conversations.length === 0 && (
        <div className="text-center py-20 text-text-secondary">
          <p className="text-lg">Henüz mesajınız yok.</p>
          <p className="text-sm mt-2">
            İlanlardan satıcılara mesaj göndererek konuşma başlatabilirsiniz.
          </p>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border/30 overflow-hidden">
        {conversations.map((conv) => {
          const hasUnread = conv.unreadCount > 0;
          const isActive = activeConversationId === conv._id;

          return (
            <div
              key={conv._id}
              onClick={() => navigate(`/messages/${conv._id}`)}
              className={`w-full min-h-[100px] bg-card border-b border-border/30 last:border-b-0 border-l-2 p-4 hover:bg-card-hover transition cursor-pointer ${
                isActive
                  ? "border-l-primary"
                  : hasUnread
                  ? "border-l-primary/40"
                  : "border-l-primary/20"
              }`}
            >
              <div className="flex items-center gap-4 h-full">
                {/* Listing Image with Unread Badge */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <div className="w-full h-full bg-card rounded-lg overflow-hidden">
                    {conv.listing?.images?.[0] ? (
                      <img
                        src={conv.listing.images[0]}
                        alt={conv.listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <span className="text-2xl">📦</span>
                      </div>
                    )}
                  </div>
                  {hasUnread && (
                    <div className="absolute -top-2 -right-2 bg-primary text-background text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-baseline justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {hasUnread && (
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                      )}
                      <h3
                        className={`truncate text-base ${
                          hasUnread
                            ? "font-bold text-text-primary"
                            : "font-semibold text-text-primary"
                        }`}
                      >
                        {conv.listing?.title || "İlan bulunamadı"}
                      </h3>
                    </div>
                    <span className="text-xs text-text-muted whitespace-nowrap flex-shrink-0">
                      {formatDate(conv.lastMessageAt || conv.updatedAt)}
                    </span>
                  </div>

                  <p className="text-sm text-text-secondary mb-1">
                    💬 {conv.otherUser?.name || "Bilinmeyen kullanıcı"}
                  </p>

                  <div className="flex items-baseline justify-between gap-3">
                    {conv.lastMessage && (
                      <p
                        className={`text-sm truncate flex-1 ${
                          hasUnread
                            ? "text-text-primary font-medium"
                            : "text-text-muted"
                        } ${
                          conv.lastMessage.startsWith("Teklif")
                            ? "font-semibold"
                            : ""
                        }`}
                      >
                        {conv.lastMessage}
                      </p>
                    )}

                    {conv.listing?.price && (
                      <p className="text-sm font-semibold text-text-secondary flex-shrink-0">
                        {Number(conv.listing.price).toLocaleString("tr-TR")} ₺
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}