const fs = require('fs');

const content = `/**
 * MessageBubble - Dark premium chat message display
 * Incoming: bg-card
 * Outgoing: bg-card-hover
 * NO green bubbles
 */
export default function MessageBubble({ message, isMine, senderName, isLastMessage }) {
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
    <div className="flex flex-col">
      <span className="text-xs text-text-muted font-semibold mb-1">
        {isMine ? "Ben" : senderName}
      </span>

      <div
        className={\`p-3 rounded-lg \${
          isMine
            ? "bg-card-hover text-text-primary"
            : "bg-card text-text-primary border border-border/60"
        }\`}
      >
        {message.content || message.text}
      </div>

      {getStatusText()}
    </div>
  );
}
`;

fs.writeFileSync('./src/components/messages/MessageBubble.jsx', content, 'utf8');
console.log('✅ MessageBubble transformed to dark premium design');
