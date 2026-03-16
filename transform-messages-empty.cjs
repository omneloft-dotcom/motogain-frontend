const fs = require('fs');

const filePath = './src/pages/messages/MessagesInbox.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add EmptyState import
content = content.replace(
  /import { ConversationCardSkeleton } from "\.\.\/\.\.\/components\/common\/Skeleton";/,
  `import { ConversationCardSkeleton } from "../../components/common/Skeleton";\nimport EmptyState from "../../components/common/EmptyState";`
);

// Replace empty state
const oldEmpty = `      {conversations.length === 0 && (
        <div className="text-center py-20 text-text-secondary">
          <p className="text-lg">Henüz mesajınız yok.</p>
          <p className="text-sm mt-2">
            İlanlardan satıcılara mesaj göndererek konuşma başlatabilirsiniz.
          </p>
        </div>
      )}`;

const newEmpty = `      {conversations.length === 0 && (
        <EmptyState
          icon="💬"
          title="Henüz mesajınız yok"
          description="İlanlardan satıcılara mesaj göndererek konuşma başlatabilirsiniz."
          actionLabel="İlanları Keşfet"
          actionTo="/listings"
        />
      )}`;

content = content.replace(oldEmpty, newEmpty);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Messages inbox empty state updated');
