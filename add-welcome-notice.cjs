const fs = require('fs');

const filePath = './src/pages/dashboard/Dashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add welcome notice state
content = content.replace(
  /const \[showBetaNotice, setShowBetaNotice\] = useState\(false\);/,
  `const [showBetaNotice, setShowBetaNotice] = useState(false);\n  const [showWelcome, setShowWelcome] = useState(false);`
);

// Add welcome notice logic
const welcomeLogic = `
  useEffect(() => {
    // Show welcome notice on first login (when user has 0 listings)
    if (summary && summary.myListingsCount === 0) {
      const dismissed = localStorage.getItem("welcomeNoticeDismissed");
      if (dismissed !== "true") {
        setShowWelcome(true);
      }
    }
  }, [summary]);

  const dismissWelcome = () => {
    localStorage.setItem("welcomeNoticeDismissed", "true");
    setShowWelcome(false);
  };`;

content = content.replace(
  /const dismissBetaNotice = \(\) => {/,
  `${welcomeLogic}\n\n  const dismissBetaNotice = () => {`
);

// Add welcome notice JSX after beta notice
const welcomeNotice = `
      {showWelcome && (
        <div className="mb-6">
          <Notice
            type="info"
            title="Hoş geldin"
            message="İlk ilanını ekleyerek başlayabilirsin. Sol menüden tüm özelliklere erişebilirsin."
            icon="👋"
            onDismiss={dismissWelcome}
          />
        </div>
      )}`;

content = content.replace(
  /{showBetaNotice && \(\s*<div className="mb-6">\s*<Notice[^}]+}\s*\/>\s*<\/div>\s*\)}/,
  (match) => match + '\n' + welcomeNotice
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Welcome notice added to Dashboard');
