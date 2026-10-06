#!/usr/bin/env node
// Ponytail PreInvocation Hook for Antigravity CLI
// Prunes context, enforces the Ponytail ladder, and dynamically injects workspace-scoped memory.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { readMode } = require('./ponytail-runtime');
const { DEFAULT_MODE, normalizeMode } = require('./ponytail-config');

function getProjectScope(workspacePath) {
  const cwd = workspacePath || process.cwd();
  const home = os.homedir();
  const rel = path.relative(home, cwd);

  if (!rel || rel === '.') {
    return 'default';
  }
  const parts = rel.split(path.sep);
  return parts[0] || 'default';
}

function resolveMemoryFilePath(workspacePath) {
  const cwd = workspacePath || process.cwd();

  // 1. Prioritas utama: .agents lokal di proyek
  const localAgentsState = path.join(cwd, '.agents', 'memory', 'state.json');
  if (fs.existsSync(path.join(cwd, '.agents'))) {
    return { path: localAgentsState, scope: 'workspace-local' };
  }

  // 2. Prioritas kedua: Project-scoped memory di ~/.gemini/config/memory/projects/<name>.json
  const home = os.homedir();
  const projectName = getProjectScope(cwd);
  const projectState = path.join(home, '.gemini', 'config', 'memory', 'projects', `${projectName}.json`);
  return { path: projectState, scope: projectName };
}

function getMemoryPrompt(workspacePath) {
  const { path: statePath, scope } = resolveMemoryFilePath(workspacePath);

  let memorySummary = '';
  try {
    if (fs.existsSync(statePath)) {
      const data = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      const hasGoal = Boolean(data.active_project_goal);
      const hasConstraints = Array.isArray(data.user_constraints) && data.user_constraints.length > 0;
      const hasMilestones = Array.isArray(data.completed_milestones) && data.completed_milestones.length > 0;

      if (hasGoal || hasConstraints || hasMilestones) {
        memorySummary = `\n4. ACTIVE MEMORY [Scope: ${scope}] (${statePath}):\n` +
          `- Active Goal: ${data.active_project_goal || '(belum dispesifikasikan)'}\n` +
          `- Active Constraints: ${JSON.stringify(data.user_constraints || [])}\n` +
          `- Completed Milestones: ${JSON.stringify(data.completed_milestones || [])}\n` +
          `* Kelola Memory:\n` +
          `  - Update: python3 ~/.gemini/config/skills/task-manager/update_state.py --goal "<Goal>" --constraint "<Constraint>"\n` +
          `  - Reset saat selesai: python3 ~/.gemini/config/skills/task-manager/update_state.py --reset`;
      } else {
        memorySummary = `\n4. ACTIVE MEMORY [Scope: ${scope}]: (Idle / Tidak ada tugas aktif)\n` +
          `* Mulai tugas baru: python3 ~/.gemini/config/skills/task-manager/update_state.py --goal "<Tujuan Tugas>"`;
      }
    } else {
      memorySummary = `\n4. ACTIVE MEMORY [Scope: ${scope}]: (Idle / Belum diinisialisasi)\n` +
        `* Set goal: python3 ~/.gemini/config/skills/task-manager/update_state.py --goal "<Tujuan Tugas>"`;
    }
  } catch (e) {
    // Abaikan jika gagal baca
  }
  return memorySummary;
}

function getContextPruningPrompt(mode, workspacePath) {
  const effectiveMode = normalizeMode(mode) || DEFAULT_MODE;
  const memoryInfo = getMemoryPrompt(workspacePath);

  return `[PONYTAIL PRE-EXECUTION: CONTEXT PRUNING & EFFICIENCY ACTIVE — MODE: ${effectiveMode.toUpperCase()}]

1. CONTEXT PRUNING GUARD:
- Do NOT read whole files when viewing code; always use targeted StartLine & EndLine slices or grep.
- Do NOT run sprawling directory searches or recursive dumps into context.
- Keep tool calls minimal and precise; avoid speculative exploration.
- Never output unnecessary commentary, conversational padding, or boilerplate.

2. PONYTAIL PRE-EXECUTION LADDER:
Before generating any tool call or code, stop at the first rung that holds:
1. YAGNI: Does this need to exist at all?
2. REUSE: Already exists in this codebase? Reuse the helper/pattern.
3. STDLIB: Standard library does it? Use it.
4. NATIVE: Native platform feature covers it? Use it.
5. INSTALLED: Already-installed dependency solves it? Use it.
6. ONE LINE: Can it be one line? Make it one line.
7. MINIMUM CODE: Write only the shortest working diff.

3. EXECUTION PRINCIPLES:
- Fix root cause, not symptom (grep callers before editing).
- Code first, shortest working diff wins.
- Zero unrequested abstractions, zero boilerplate.
- No AI slop: lead directly with the answer/code.${memoryInfo}`;
}

async function main() {
  let input = '';
  process.stdin.setEncoding('utf8');

  const readStdin = new Promise((resolve) => {
    process.stdin.on('data', (chunk) => { input += chunk; });
    process.stdin.on('end', () => { resolve(input); });
    setTimeout(() => { resolve(input); }, 150);
  });

  await readStdin;

  let workspacePath = null;
  try {
    if (input) {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed.workspacePaths) && parsed.workspacePaths.length > 0) {
        workspacePath = parsed.workspacePaths[0];
      }
    }
  } catch (e) {}

  const mode = readMode() || DEFAULT_MODE;
  const message = getContextPruningPrompt(mode, workspacePath);

  const response = {
    injectSteps: [
      {
        ephemeralMessage: message
      }
    ]
  };

  process.stdout.write(JSON.stringify(response));
}

try {
  main().catch(() => {
    process.stdout.write(JSON.stringify({ injectSteps: [] }));
    process.exit(0);
  });
} catch (e) {
  process.stdout.write(JSON.stringify({ injectSteps: [] }));
  process.exit(0);
}
