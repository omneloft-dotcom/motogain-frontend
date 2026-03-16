/**
 * MessageBubble - Dark premium chat message display
 * Incoming: bg-card
 * Outgoing: bg-card-hover
 * NO green bubbles
 */
export default function MessageBubble({ message, isMine, senderName, isLastMessage }) {
  const formatTime = (value) => {
    if (!value) return "";
    try {
      return new Date(value).toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const timestamp = formatTime(message.createdAt || message.updatedAt || message.timestamp);

  const getStatusText = () => {
    if (!isMine || !isLastMessage || message.type !== "text") return null;

    if (message.readAt) {
      return <span className="text-xs text-text-muted mt-1">Okundu</span>;
    }

    if (message.deliveredAt) {
      return <span className="text-xs text-text-muted mt-1">İletildi</span>;
    }

    return null;
  };

  // System messages (centered, muted)
  if (message.type === "system") {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-card text-text-muted text-sm px-4 py-2 rounded-full border border-border/60">
          {message.content}
        </div>
      </div>
    );
  }

  // Regular text messages
  return (
    <div className={`flex max-w-[80%] flex-col ${isMine ? "items-end" : "items-start"}`}>
      <span className="mb-1 text-xs font-semibold text-text-muted">
        {isMine ? "Ben" : senderName}
      </span>

      <div
        className={`max-w-full rounded-2xl p-3 ${
          isMine
            ? "bg-card-hover text-text-primary"
            : "bg-card text-text-primary border border-border/60"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {message.content || message.text}
        </p>
        {timestamp ? (
          <div className={`mt-2 text-[11px] ${isMine ? "text-right" : "text-left"} text-text-muted`}>
            {timestamp}
          </div>
        ) : null}
      </div>

      {getStatusText()}
    </div>
  );
}
