const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/dashboard/Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add StatCard import after isSoftLaunch import
content = content.replace(
  'import { isSoftLaunch } from "../../utils/isSoftLaunch";',
  'import { isSoftLaunch } from "../../utils/isSoftLaunch";\nimport StatCard from "../../components/dashboard/StatCard";'
);

// Replace stats.map section with StatCard usage
const oldStatsBlock = `      {/* User Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className={\`rounded-xl  border p-6  transition-all \${
              stat.highlight
                ? "bg-card border-primary hover:bg-card-hover"
                : "bg-card border-border hover:border-primary"
            }\`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{stat.icon}</span>
              <p className="text-sm text-text-secondary font-medium">{stat.label}</p>
            </div>
            <p
              className={\`text-4xl font-bold \${
                stat.highlight ? "text-primary" : "text-text-primary"
              }\`}
            >
              {stat.value}
            </p>
          </Link>
        ))}
      </div>`;

const newStatsBlock = `      {/* User Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            link={stat.link}
            icon={stat.icon}
            highlight={stat.highlight}
          />
        ))}
      </div>`;

content = content.replace(oldStatsBlock, newStatsBlock);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Dashboard stats transformed to StatCard component');
