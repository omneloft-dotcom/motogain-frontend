const fs = require('fs');

const content = `// src/pages/messages/MessagesLayout.jsx
import { Outlet } from "react-router-dom";

/**
 * MessagesLayout - Dark premium chat container
 * LEFT: Conversation list (bg-background)
 * RIGHT: Active chat (bg-background)
 */
const MessagesLayout = () => {
  return (
    <div className="w-full min-h-screen bg-background flex">
      <div className="flex w-full">
        {/* LEFT - Conversation List */}
        <div className="hidden md:block w-1/3 border-r border-border/60 bg-background">
          <Outlet context={{ side: "list" }} />
        </div>

        {/* RIGHT - Active Chat */}
        <div className="flex-1 bg-background p-4">
          <Outlet context={{ side: "chat" }} />
        </div>
      </div>
    </div>
  );
};

export default MessagesLayout;
`;

fs.writeFileSync('./src/pages/messages/MessagesLayout.jsx', content, 'utf8');
console.log('✅ MessagesLayout transformed to dark premium design');
