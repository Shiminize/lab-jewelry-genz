---
description: Perform a gated git commit using protection gates
---

1. Ensure you are on a feature branch.
2. Run the protection gates script to verify system integrity.
// turbo
3. `node scripts/protection-gates.js`
4. If the gates pass, stage your changes.
5. Commit using the strategic commit protocol: `<type>(<scope>): <message> [id:<task-id>]`
6. Update `Agent/git-status.md` with the new commit information.
