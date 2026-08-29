# Ground Truth Answer Key

## Cast

| Person | Phone | Account No. | Appears in | Alias | Role/Cluster |
|---|---|---|---|---|---|
| Manoj Tiwari (victim) | 9434567123 | 30123456796 | FIR101 | — | Victim, linked into Cluster A |
| Debjani Sen (victim) | 9007123456 | 30123456797 | FIR102 | — | Victim, linked into Cluster A |
| Rajesh Kumar Sharma | 9832145678 | 30123456789 | FIR101, FIR103 | "R.K. Sharma" in FIR103 | Cluster A |
| Bimal Das | 9748123456 | 30123456790 | FIR101, FIR102 | — | Cluster A |
| Sunita Roy | 8967234561 | 30123456791 | FIR102 | — | Cluster A |
| Debasish Chatterjee | 7896541230 | 30123456792 | FIR102, FIR103 | — | Bridge (kingpin) |
| Ashok Mehta | 9123456780 | 30123456793 | FIR103 | — | Cluster B |
| Priya Banerjee | 8801234567 | 30123456794 | FIR103 | — | Cluster B |
| Nikhil Ghosh | 7012345698 | 30123456795 | FIR103 | — | Cluster B |

## Entity Resolution Target

**Rajesh Kumar Sharma = "R.K. Sharma"** — full name used in FIR101 (extortion), alias used in FIR103 (bank complaint), explicitly reconciled in-text: *"R.K. Sharma... identified by police as Rajesh Kumar Sharma."*

## Hidden Kingpin

**Debasish Chatterjee** (7896541230 / acct 30123456792)

- Lowest degree in the network: only 2 direct call edges — to Sunita Roy (Cluster A) and Ashok Mehta (Cluster B) — plus one small transfer in each direction.
- The only node connecting Cluster A (Rajesh, Bimal, Sunita, and the two victims Manoj/Debjani) to Cluster B (Ashok, Priya, Nikhil).
- FIR102 places him with Sunita Roy; FIR103 places him with Rajesh/Ashok at the bank, and notes he "conducts very few transactions personally" — high betweenness, low degree, classic bridge/kingpin signature.

## Two Clusters (Community Detection)

- **Cluster A** (loan-recovery/extortion cell): Rajesh Kumar Sharma, Bimal Das, Sunita Roy — densely interconnected by calls and small transfers, plus two external victims (Manoj Tiwari, Debjani Sen) who each connect only to this cluster.
- **Cluster B** (shell-account/laundering cell): Ashok Mehta, Priya Banerjee, Nikhil Ghosh — densely interconnected by calls and the circular transfer loop.
- No direct A↔B edges exist except through Debasish Chatterjee.

## Calling Spike Anomaly

**9832145678 (Rajesh Kumar Sharma) ↔ 9434567123 (Manoj Tiwari)** — 22 calls on 2026-03-05, matching the in-person threat visit described in FIR101. All other pairs have 1–2 calls.

## Circular Fund-Routing Loop

**30123456793 (Ashok Mehta) → 30123456794 (Priya Banerjee) → 30123456795 (Nikhil Ghosh) → 30123456793 (Ashok Mehta)**

- ₹500,000 → ₹495,000 → ₹490,000
- All within a 48-hour window (2026-03-20 09:00 to 2026-03-21 09:00), matching FIR103.
- Surrounded by smaller noise transfers between the same three accounts (Ashok↔Nikhil, Priya↔Ashok, Nikhil↔Priya) to make the loop non-trivial to isolate by account pair alone — amount similarity + time clustering is the real signal.