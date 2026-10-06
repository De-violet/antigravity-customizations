#!/usr/bin/env node
// Ponytail PreToolUse Hook for Antigravity CLI
// 1. Blocks catastrophic destructive commands.
// 2. Prunes context on view_file for large files without line limits.

const fs = require('fs');

const DANGEROUS_PATTERNS = [
  /\brm\s+-[rfR]*\s+[\/~]/,
  /\brm\s+-[rfR]*\s+\$HOME/,
  /\bmkfs\b/,
  /\bdd\s+if=.*of=\/dev\/[snhv]d/,
  />\s*\/dev\/[snhv]d/
];

async function main() {
  let input = '';
  process.stdin.setEncoding('utf8');

  const readStdin = new Promise((resolve) => {
    process.stdin.on('data', (chunk) => { input += chunk; });
    process.stdin.on('end', () => { resolve(input); });
    setTimeout(() => { resolve(input); }, 150);
  });

  await readStdin;

  let parsed = null;
  try {
    parsed = JSON.parse(input);
  } catch (e) {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }

  const toolCall = parsed?.toolCall;
  if (!toolCall) {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }

  // 1. Guard destructive terminal commands
  if (toolCall.name === 'run_command') {
    const cmd = toolCall.args?.CommandLine || '';
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(cmd)) {
        process.stdout.write(JSON.stringify({
          decision: "deny",
          reason: `[PONYTAIL SAFETY GUARD] Perintah destruktif berisiko tinggi diblokir: "${cmd}"`
        }));
        return;
      }
    }
  }

  // 2. Context Pruning for view_file on huge files (>300 lines) without slices
  if (toolCall.name === 'view_file') {
    const filePath = toolCall.args?.AbsolutePath;
    const hasSlice = toolCall.args?.StartLine !== undefined || toolCall.args?.EndLine !== undefined;

    if (filePath && !hasSlice && fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        // Jika ukuran file > 15KB (~300+ baris), batasi pembacaan awal ke 250 baris untuk mencegah context bloat
        if (stats.size > 15000) {
          process.stdout.write(JSON.stringify({
            decision: "allow",
            overwrite: {
              StartLine: 1,
              EndLine: 250
            }
          }));
          return;
        }
      } catch (err) {
        // Fallback allow
      }
    }
  }

  process.stdout.write(JSON.stringify({ decision: "allow" }));
}

try {
  main().catch(() => {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    process.exit(0);
  });
} catch (e) {
  process.stdout.write(JSON.stringify({ decision: "allow" }));
  process.exit(0);
}
