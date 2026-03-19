import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import messageApi from "../../api/messageApi";
import conversationsApi from "../../api/conversationsApi";
import { useAuth } from "../../context/AuthProvider";
import { useSocket } from "../../context/SocketProvider";
import { joinConversation, leaveConversation, emitTyping, emitStopTyping, emitMessageRead } from "../../services/socket";
import ConversationHeader from "../../components/messages/ConversationHeader";
import MessageBubble from "../../components/messages/MessageBubble";
import OfferBubble from "../../components/messages/OfferBubble";

const ChatPage = () => {
  const { t } = useTranslation();
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [sendingText, setSendingText] = useState(false);

  const typingTimeoutRef = useRef(null);
  const messageListRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const sendInFlightRef = useRef(false);
  const previousMessageCountRef = useRef(0);

  useEffect(() => {
    loadConversationAndMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Socket.IO real-time event listeners
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join conversation room
    joinConversation(conversationId);

    // Listen for new messages
    const handleNewMessage = ({ message }) => {
      setMessages((prev) => {
        // Check if message already exists to prevent duplicates
        const exists = prev.some((m) => m._id === message._id);
        if (exists) {
          return prev;
        }
        return [...prev, message];
      });
    };

    // Listen for offers
    const handleOfferSent = ({ message }) => {
      setMessages((prev) => {
        // Check if offer already exists to prevent duplicates
        const exists = prev.some((m) => m._id === message._id);
        if (exists) {
          return prev;
        }
        return [...prev, message];
      });
    };

    // Listen for offer responses
    const handleOfferResponded = ({ offerMessage, systemMessage }) => {
      setMessages((prev) => {
        // Update the offer message and check if system message already exists
        const updatedMessages = prev.map((m) =>
          m._id === offerMessage._id ? offerMessage : m
        );

        // Only add system message if it doesn't already exist
        const systemMessageExists = updatedMessages.some((m) => m._id === systemMessage._id);
        if (systemMessageExists) {
          return updatedMessages;
        }

        return updatedMessages.concat(systemMessage);
      });
    };

    // Listen for typing indicator
    const handleTyping = ({ userName, userId }) => {
      // Don't show typing indicator for own messages
      if (userId !== user?._id) {
        setTypingUser(userName);
      }
    };

    const handleStopTyping = () => {
      setTypingUser(null);
    };

    // Listen for message read events
    const handleMessageRead = ({ messageIds }) => {
      setMessages((prev) =>
        prev.map((m) =>
          messageIds.includes(m._id)
            ? { ...m, isRead: true, readAt: new Date().toISOString() }
            : m
        )
      );
    };

    // Listen for counter offers
    const handleOfferCountered = ({ message }) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        if (exists) {
          return prev;
        }
        return [...prev, message];
      });
    };

    // Listen for deal closed
    const handleDealClosed = ({ offerMessage, systemMessage }) => {
      setMessages((prev) => {
        // 1. Update the accepted offer
        // 2. Expire all other pending offers
        const updatedMessages = prev.map((m) => {
          if (m._id === offerMessage._id) {
            return offerMessage; // This is the accepted offer
          }
          // Expire all other pending offers
          if (m.type === "offer" && m.offerStatus === "pending") {
            return { ...m, offerStatus: "expired" };
          }
          return m;
        });

        // Only add system message if it doesn't already exist
        const systemMessageExists = updatedMessages.some((m) => m._id === systemMessage._id);
        if (systemMessageExists) {
          return updatedMessages;
        }

        return updatedMessages.concat(systemMessage);
      });

      // Reload conversation to get updated listing status
      loadConversationAndMessages();
    };

    // Register socket event listeners
    socket.on("new_message", handleNewMessage);
    socket.on("offer_sent", handleOfferSent);
    socket.on("offer_responded", handleOfferResponded);
    socket.on("offer_countered", handleOfferCountered);
    socket.on("deal_closed", handleDealClosed);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("message_read", handleMessageRead);

    // Cleanup on unmount
    return () => {
      leaveConversation(conversationId);
      socket.off("new_message", handleNewMessage);
      socket.off("offer_sent", handleOfferSent);
      socket.off("offer_responded", handleOfferResponded);
      socket.off("offer_countered", handleOfferCountered);
      socket.off("deal_closed", handleDealClosed);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.off("message_read", handleMessageRead);
    };
  }, [socket, conversationId, user?._id]);

  useEffect(() => {
    const nextCount = messages.length;
    const previousCount = previousMessageCountRef.current;

    if (nextCount > previousCount && (previousCount === 0 || isNearBottomRef.current)) {
      requestAnimationFrame(() => {
        messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: previousCount === 0 ? "auto" : "smooth" });
      });
    }

    previousMessageCountRef.current = nextCount;
  }, [messages.length]);

  // Auto-mark messages as read when they arrive
  useEffect(() => {
    if (!socket || !conversationId || messages.length === 0) return;

    const unreadMessageIds = messages
      .filter((m) => !m.isRead && m.sender?._id !== user?._id)
      .map((m) => m._id);

    if (unreadMessageIds.length > 0 && isConnected) {
      // Use timeout to debounce rapid updates
      const timeoutId = setTimeout(() => {
        emitMessageRead(conversationId, unreadMessageIds);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, isConnected]); // ✅ Only run when NEW messages arrive (length changes) or connection state changes

  const loadConversationAndMessages = async () => {
    try {
      setLoading(true);

      // Load conversation details (listing info)
      const convData = await conversationsApi.getConversationById(conversationId);
      setConversation(convData);

      // Load messages
      const messagesRes = await messageApi.getMessages(conversationId);
      const loadedMessages = Array.isArray(messagesRes.messages) ? messagesRes.messages : [];
      setMessages(loadedMessages);

      // Mark messages as read
      await messageApi.markAsRead(conversationId).catch((err) => {
        console.error("Mark as read hatası:", err);
      });
    } catch (err) {
      console.error("Konuşma yükleme hatası:", err);
      setMessages([]);
      setConversation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);

    // Emit typing indicator via socket
    if (socket?.connected && e.target.value.trim()) {
      emitTyping(conversationId, user?.name);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 1.5 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(conversationId);
      }, 1500);
    } else if (socket?.connected && !e.target.value.trim()) {
      // If input is cleared, stop typing immediately
      emitStopTyping(conversationId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleSend = async () => {
    if (!text.trim() || sendingText || sendInFlightRef.current) return;

    // Stop typing indicator before sending
    if (socket?.connected) {
      emitStopTyping(conversationId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }

    try {
      setSendingText(true);
      sendInFlightRef.current = true;
      const payload = {
        conversationId,
        content: text,
      };

      // Send message via REST API
      await messageApi.sendReply(payload);

      // ✅ DO NOT add to state here - message will come via socket
      // Socket event will handle UI update to prevent duplicates

      setText("");
    } catch (err) {
      console.error("Mesaj gönderme hatası:", err);
      const errorMsg = err.response?.data?.message || "Mesaj gönderilemedi";
      alert(errorMsg);
    } finally {
      setSendingText(false);
      sendInFlightRef.current = false;
    }
  };

  const handleOfferRespond = (result) => {
    return result;
  };

  // Helper to normalize IDs for safe comparison
  const normalizeId = (id) => {
    if (!id) return "";
    if (typeof id === "string") return id;
    if (typeof id === "object" && id._id) return String(id._id);
    if (typeof id === "object" && id.id) return String(id.id);
    return String(id);
  };

  // Determine listing status
  const listingStatus = conversation?.listing?.status;
  const isClosed = listingStatus === "closed";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-text-secondary text-xl">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-88px)] max-w-4xl flex-col overflow-hidden px-4 py-4">
      {conversation && <ConversationHeader conversation={conversation} />}

      {isClosed && (
        <div className="mb-4 rounded-lg border border-border bg-card p-4 text-center">
          <div className="text-2xl mb-2">🔒</div>
          <div className="text-lg font-bold text-text-primary">{t("listings.closed")}</div>
          <div className="text-sm text-text-secondary mt-1">
            {t("messages.listingClosedDescription")}
          </div>
        </div>
      )}

      <div
        ref={messageListRef}
        onScroll={(event) => {
          const element = event.currentTarget;
          const distanceFromBottom = element.scrollHeight - (element.scrollTop + element.clientHeight);
          isNearBottomRef.current = distanceFromBottom <= 96;
        }}
        className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-border/60 bg-background p-4"
      >
        {messages.length === 0 && (
          <div className="flex h-full min-h-[240px] items-center justify-center text-center">
            <p className="max-w-sm text-sm text-text-muted">Henüz mesaj yok. İlk mesajı gönder.</p>
          </div>
        )}

        <div className="space-y-3">
        {messages.map((m, index) => {
          const senderId = normalizeId(
            m.senderId ||
            m.sender?._id ||
            m.sender?.id ||
            m.sender
          );
          const currentUserId = normalizeId(user?._id || user?.id);
          const isMine = senderId === currentUserId;
          const senderName = m.sender?.name || "Kullanıcı";
          const isLastMessage = index === messages.length - 1;

          // Render different components based on message type
          if (m.type === "offer") {
            return (
              <OfferBubble
                key={m._id}
                message={m}
                isMine={isMine}
                senderName={senderName}
                listing={conversation?.listing}
                currentUserId={currentUserId}
                onOfferRespond={handleOfferRespond}
              />
            );
          }

          return (
            <div key={m._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <MessageBubble
                message={m}
                isMine={isMine}
                senderName={senderName}
                isLastMessage={isLastMessage}
              />
            </div>
          );
        })}
        </div>
      </div>

      {typingUser && (
        <div className="mt-2 text-sm italic text-text-muted">
          {typingUser} {t("messages.typing")}
        </div>
      )}

      {!isClosed ? (
        <div className="mt-4 flex flex-none items-end gap-2 rounded-2xl border border-border/60 bg-card p-3">
          <input
            type="text"
            className="flex-1 rounded-xl border border-border bg-background p-3 text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-primary/60"
            placeholder={t("messages.placeholder")}
            value={text}
            onChange={handleTextChange}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={handleSend}
            disabled={!text.trim() || sendingText}
            className={`rounded-xl px-4 py-3 font-semibold transition-colors ${text.trim() && !sendingText ? "bg-primary text-background hover:bg-highlight" : "border border-border bg-card text-text-secondary opacity-70"}`}
          >
            {sendingText ? t("common.loading") : t("common.submit")}
          </button>
        </div>
      ) : (
        <div className="mt-4 flex-none rounded-2xl border border-border bg-card p-4 text-center text-text-secondary">
          {t("messages.listingClosed")}
        </div>
      )}
    </div>
  );
};

export default ChatPage;
