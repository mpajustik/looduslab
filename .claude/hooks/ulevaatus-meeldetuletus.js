// PreToolUse hook: enne iga `git commit` käsku küsi kinnitust, et
// ülevaatus (skill /ulevaatus) on tehtud ja leiud triaažitud.
//
// Claude Code annab hook'ile stdin-i kaudu JSON-i kujul
// { tool_name, tool_input: { command: "..." } }.
// Kui vastus on ilma väljundita, käib tööriist tavapärast rada.

let sisend = "";
process.stdin.on("data", (tykk) => (sisend += tykk));
process.stdin.on("end", () => {
  let kask = "";
  try {
    kask = JSON.parse(sisend)?.tool_input?.command ?? "";
  } catch {
    process.exit(0); // vigane JSON – ära sega commit'i
  }

  // `git commit`, aga ka `git -C tee commit` ja `git commit --amend`.
  // Ei reageeri sõnale "commit" mujal (nt git log --grep="commit").
  const onCommit = /\bgit\b(\s+-[^\s]+(\s+[^\s]+)?)*\s+commit\b/.test(kask);
  if (!onCommit) process.exit(0);

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason:
          "Enne commit'i (CLAUDE.md „Definition of done“):\n" +
          "  1. npm run build ja npm run test õnnestuvad?\n" +
          "  2. Ülevaatus tehtud (skill /ulevaatus) ja leiud triaažitud?\n" +
          "  3. Riskisammul (model.ts, checker, engine, migratsioonid,\n" +
          "     Edge Functionid, saladused) ka Codex: npm run review?\n" +
          "Kinnita, kui on – või katkesta ja lase ülevaatus enne ära teha.",
      },
    }),
  );
});
