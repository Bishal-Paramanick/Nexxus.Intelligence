// Comprehensive Knowledge Graph Dataset for Nexxus Intelligence Platform
// Synthesized from ground truth, output_contract.json, FIR 101-103, CDR logs, and Bank records

export const MOCK_GRAPH_DATA = {
  case_info: {
    id: "CASE-KOL-2026-088",
    title: "Operation Kolkata Synergy: Cyber Extortion & Multi-Tier Money Laundering Syndicate",
    lead_investigator: "Insp. Jayanta (Special Task Force / Cyber Crime Cell)",
    jurisdictions: ["Bidhannagar PS", "Howrah PS", "Park Street PS, Kolkata"],
    status: "ACTIVE_SURVEILLANCE",
    last_updated: "2026-03-24T18:00:00Z",
    legal_framework: "Bharatiya Sakshya Adhiniyam (BSA) 2023 / Sec 65B Indian Evidence Act",
  },
  nodes: [
    // --- KEY PERSONS & SUSPECTS ---
    {
      id: "P008",
      name: "Debasish Chatterjee",
      type: "Person",
      role: "Syndicate Mastermind / Bridge Kingpin",
      cluster: "Bridge Kingpin",
      cluster_id: "bridge",
      risk_score: 96,
      risk_tier: "CRITICAL",
      betweenness_centrality: 0.942,
      degree_centrality: 4,
      aliases: ["The Owner", "Chatterjee Da"],
      phone: "7896541230",
      account: "30123456792",
      vehicle: "WB06EF9012 (Toyota Innova) / WB01AB1234",
      source_docs: ["FIR_102", "FIR_103"],
      score_breakdown: {
        centrality_score: 30, // +30 High Betweenness (Only link between Cluster A & B)
        cross_case_links: 25, // +25 Appears in FIR_102 & FIR_103
        call_velocity: 15,    // +15 Covert coordinator (very low direct calling, high impact)
        financial_anomalies: 26 // +26 Directs accounts without personal transactions
      },
      summary: "Identified as the apex coordinator bridging the Extortion Cell (Cluster A) and Shell Laundering Cell (Cluster B). Maintains low operational degree to evade detection while holding 94.2% network betweenness centrality.",
      status: "PRIMARY_TARGET"
    },
    {
      id: "P003",
      name: "Rajesh Kumar Sharma",
      type: "Person",
      role: "Extortion Operations Head",
      cluster: "Cluster A (Extortion Cell)",
      cluster_id: "cluster_a",
      risk_score: 91,
      risk_tier: "CRITICAL",
      betweenness_centrality: 0.725,
      degree_centrality: 8,
      aliases: ["R.K. Sharma"],
      phone: "9832145678",
      account: "30123456789",
      vehicle: "WB02CD5678 (Maruti Swift) / WB01AB1234",
      source_docs: ["FIR_101", "FIR_103"],
      score_breakdown: {
        centrality_score: 22,
        cross_case_links: 25, // Extortion in Salt Lake & Bank visit in Park Street
        call_velocity: 25,    // 22 calls/day extortion spike
        financial_anomalies: 19 // ₹45k extortion credit & transfers to Bimal Das
      },
      summary: "Heads loan recovery and extortion under Shubh Laxmi Finance front. Reconciled with alias 'R.K. Sharma' in FIR_103 during joint bank surveillance with Debasish Chatterjee.",
      status: "WARRANT_ISSUED"
    },
    {
      id: "P004",
      name: "Bimal Das",
      type: "Person",
      role: "Field Enforcer / Collection Agent",
      cluster: "Cluster A (Extortion Cell)",
      cluster_id: "cluster_a",
      risk_score: 79,
      risk_tier: "HIGH",
      betweenness_centrality: 0.412,
      degree_centrality: 6,
      aliases: [],
      phone: "9748123456",
      account: "30123456790",
      vehicle: "WB02CD5678 (White Maruti Swift)",
      source_docs: ["FIR_101", "FIR_102"],
      score_breakdown: {
        centrality_score: 18,
        cross_case_links: 20, // Present at victim residence & dropping papers at Howrah
        call_velocity: 21,
        financial_anomalies: 20
      },
      summary: "Accompanies Rajesh Sharma on intimidation visits and delivers extortion ledgers to Sunita Roy in Howrah. Transacted ₹15k & ₹4k with Rajesh Sharma.",
      status: "UNDER_SURVEILLANCE"
    },
    {
      id: "P007",
      name: "Sunita Roy",
      type: "Person",
      role: "Operations Coordinator (Howrah)",
      cluster: "Cluster A (Extortion Cell)",
      cluster_id: "cluster_a",
      risk_score: 84,
      risk_tier: "CRITICAL",
      betweenness_centrality: 0.680,
      degree_centrality: 7,
      aliases: ["Madam Ji"],
      phone: "8967234561",
      account: "30123456791",
      vehicle: "Public Transit / Meets at Howrah Maidan",
      source_docs: ["FIR_102"],
      score_breakdown: {
        centrality_score: 25,
        cross_case_links: 18,
        call_velocity: 22,
        financial_anomalies: 19
      },
      summary: "Coordinates recovery agents for Shubh Laxmi Finance from Howrah Maidan office. Directly answers to Debasish Chatterjee ('the owner') via secret tea-stall meetings.",
      status: "PRIMARY_TARGET"
    },
    {
      id: "P010",
      name: "Ashok Mehta",
      type: "Person",
      role: "Shell Account Ring Leader",
      cluster: "Cluster B (Laundering Cell)",
      cluster_id: "cluster_b",
      risk_score: 89,
      risk_tier: "CRITICAL",
      betweenness_centrality: 0.695,
      degree_centrality: 7,
      aliases: [],
      phone: "9123456780",
      account: "30123456793",
      vehicle: "WB01AB1234",
      source_docs: ["FIR_103"],
      score_breakdown: {
        centrality_score: 24,
        cross_case_links: 18,
        call_velocity: 20,
        financial_anomalies: 27 // Initiated ₹5,00,000 circular laundering loop
      },
      summary: "Proprietor of Mehta Global Traders. Initiated ₹5,00,000 circular transfer loop with Priya Banerjee and Nikhil Ghosh to layer illicit funds through Kolkata Commercial Bank.",
      status: "WARRANT_ISSUED"
    },
    {
      id: "P011",
      name: "Priya Banerjee",
      type: "Person",
      role: "Syndicate Accountant / Layering Node",
      cluster: "Cluster B (Laundering Cell)",
      cluster_id: "cluster_b",
      risk_score: 82,
      risk_tier: "HIGH",
      betweenness_centrality: 0.540,
      degree_centrality: 6,
      aliases: [],
      phone: "8801234567",
      account: "30123456794",
      vehicle: null,
      source_docs: ["FIR_103"],
      score_breakdown: {
        centrality_score: 19,
        cross_case_links: 16,
        call_velocity: 20,
        financial_anomalies: 27 // Forwarded ₹4,95,000 within 6 hours
      },
      summary: "Accountant at Mehta Global Traders. Executed ₹4,95,000 forward routing to Nikhil Ghosh within 6 hours of receiving ₹500k from Ashok Mehta.",
      status: "UNDER_SURVEILLANCE"
    },
    {
      id: "P012",
      name: "Nikhil Ghosh",
      type: "Person",
      role: "Mule Account Operator",
      cluster: "Cluster B (Laundering Cell)",
      cluster_id: "cluster_b",
      risk_score: 80,
      risk_tier: "HIGH",
      betweenness_centrality: 0.510,
      degree_centrality: 5,
      aliases: [],
      phone: "7012345698",
      account: "30123456795",
      vehicle: null,
      source_docs: ["FIR_103"],
      score_breakdown: {
        centrality_score: 18,
        cross_case_links: 15,
        call_velocity: 20,
        financial_anomalies: 27 // Closed circular loop with ₹4,90,000 back to Ashok
      },
      summary: "Mule account holder on Park Street. Routed ₹4,90,000 back to Ashok Mehta, completing the 48-hour circular laundering cycle.",
      status: "UNDER_SURVEILLANCE"
    },
    {
      id: "P001",
      name: "Manoj Tiwari",
      type: "Person",
      role: "Victim (Salt Lake Loan)",
      cluster: "Victims / Witnesses",
      cluster_id: "victim",
      risk_score: 12,
      risk_tier: "LOW",
      betweenness_centrality: 0.04,
      degree_centrality: 3,
      aliases: [],
      phone: "9434567123",
      account: "30123456796",
      vehicle: null,
      source_docs: ["FIR_101"],
      score_breakdown: {
        centrality_score: 2,
        cross_case_links: 2,
        call_velocity: 5,
        financial_anomalies: 3
      },
      summary: "Complainant in FIR_101. Coerced into paying ₹45,000 extortion installment following 22 harassment calls in a single day.",
      status: "PROTECTED_WITNESS"
    },
    {
      id: "P005",
      name: "Debjani Sen",
      type: "Person",
      role: "Victim (Howrah Loan)",
      cluster: "Victims / Witnesses",
      cluster_id: "victim",
      risk_score: 10,
      risk_tier: "LOW",
      betweenness_centrality: 0.03,
      degree_centrality: 2,
      aliases: [],
      phone: "9007123456",
      account: "30123456797",
      vehicle: null,
      source_docs: ["FIR_102"],
      score_breakdown: {
        centrality_score: 2,
        cross_case_links: 2,
        call_velocity: 3,
        financial_anomalies: 3
      },
      summary: "Complainant in FIR_102. Pressured by Sunita Roy; personally witnessed Sunita meeting Debasish Chatterjee at Howrah Maidan.",
      status: "PROTECTED_WITNESS"
    },
    {
      id: "P009",
      name: "Anil Kapoor",
      type: "Person",
      role: "Branch Manager (Complainant)",
      cluster: "Victims / Witnesses",
      cluster_id: "victim",
      risk_score: 5,
      risk_tier: "LOW",
      betweenness_centrality: 0.01,
      degree_centrality: 1,
      aliases: [],
      phone: null,
      account: null,
      vehicle: null,
      source_docs: ["FIR_103"],
      score_breakdown: {
        centrality_score: 1,
        cross_case_links: 1,
        call_velocity: 1,
        financial_anomalies: 2
      },
      summary: "Branch Manager of Kolkata Commercial Bank, Park Street. Raised AML alert flagging the ₹500k circular transactions.",
      status: "COMPLAINANT"
    },

    // --- KEY PHONES ---
    {
      id: "PH009",
      name: "7896541230",
      type: "Phone",
      role: "Mastermind Burner SIM",
      cluster: "Bridge Kingpin",
      cluster_id: "bridge",
      risk_score: 94,
      risk_tier: "CRITICAL",
      owner: "Debasish Chatterjee",
      source_docs: ["FIR_102", "FIR_103"],
      summary: "High-value burner phone used exclusively to contact Sunita Roy (Cluster A) and Ashok Mehta (Cluster B).",
    },
    {
      id: "PH002",
      name: "9832145678",
      type: "Phone",
      role: "Extortion Calling Line",
      cluster: "Cluster A (Extortion Cell)",
      cluster_id: "cluster_a",
      risk_score: 92,
      risk_tier: "CRITICAL",
      owner: "Rajesh Kumar Sharma",
      source_docs: ["FIR_101", "FIR_102"],
      summary: "Logged 22 calls to victim Manoj Tiwari on 2026-03-05. Coordinates field enforcers.",
    },
    {
      id: "PH003",
      name: "9748123456",
      type: "Phone",
      role: "Enforcer Line",
      cluster: "Cluster A (Extortion Cell)",
      cluster_id: "cluster_a",
      risk_score: 75,
      risk_tier: "HIGH",
      owner: "Bimal Das",
      source_docs: ["FIR_101", "FIR_102"],
      summary: "Interconnected with Rajesh Sharma and Sunita Roy.",
    },
    {
      id: "PH005",
      name: "8967234561",
      type: "Phone",
      role: "Operations Dispatch",
      cluster: "Cluster A (Extortion Cell)",
      cluster_id: "cluster_a",
      risk_score: 83,
      risk_tier: "CRITICAL",
      owner: "Sunita Roy",
      source_docs: ["FIR_102"],
      summary: "Key coordination hub linking field enforcers to kingpin Debasish Chatterjee.",
    },
    {
      id: "PH007",
      name: "9123456780",
      type: "Phone",
      role: "Laundering Cell Line",
      cluster: "Cluster B (Laundering Cell)",
      cluster_id: "cluster_b",
      risk_score: 87,
      risk_tier: "CRITICAL",
      owner: "Ashok Mehta",
      source_docs: ["FIR_103"],
      summary: "Main coordination phone for Mehta Global Traders shell transactions.",
    },
    {
      id: "PH008",
      name: "8801234567",
      type: "Phone",
      role: "Accountant Line",
      cluster: "Cluster B (Laundering Cell)",
      cluster_id: "cluster_b",
      risk_score: 78,
      risk_tier: "HIGH",
      owner: "Priya Banerjee",
      source_docs: ["FIR_103"],
      summary: "High frequency calls with Ashok Mehta and Nikhil Ghosh during transfer windows.",
    },
    {
      id: "PH006",
      name: "7012345698",
      type: "Phone",
      role: "Mule Line",
      cluster: "Cluster B (Laundering Cell)",
      cluster_id: "cluster_b",
      risk_score: 76,
      risk_tier: "HIGH",
      owner: "Nikhil Ghosh",
      source_docs: ["FIR_103"],
      summary: "Registered against Park Street address.",
    },
    {
      id: "PH001",
      name: "9434567123",
      type: "Phone",
      role: "Victim Telemetry",
      cluster: "Victims / Witnesses",
      cluster_id: "victim",
      risk_score: 12,
      risk_tier: "LOW",
      owner: "Manoj Tiwari",
      source_docs: ["FIR_101"],
      summary: "Target of 22 extortion calls on 2026-03-05.",
    },
    {
      id: "PH004",
      name: "9007123456",
      type: "Phone",
      role: "Victim Telemetry",
      cluster: "Victims / Witnesses",
      cluster_id: "victim",
      risk_score: 10,
      risk_tier: "LOW",
      owner: "Debjani Sen",
      source_docs: ["FIR_102"],
      summary: "Received high-pressure demand call on 2026-03-06.",
    },

    // --- ORGANIZATIONS & FRONTS ---
    {
      id: "ORG001",
      name: "Shubh Laxmi Finance",
      type: "Organization",
      role: "Extortion & Predatory Lending Front",
      cluster: "Cluster A (Extortion Cell)",
      cluster_id: "cluster_a",
      risk_score: 88,
      risk_tier: "CRITICAL",
      source_docs: ["FIR_101", "FIR_102"],
      summary: "Unregistered micro-loan racket front operating in Salt Lake and Howrah.",
    },
    {
      id: "ORG003",
      name: "Chatterjee Textiles",
      type: "Organization",
      role: "Kingpin Commercial Front",
      cluster: "Bridge Kingpin",
      cluster_id: "bridge",
      risk_score: 85,
      risk_tier: "CRITICAL",
      source_docs: ["FIR_102"],
      summary: "Garment trading business in Howrah owned by Debasish Chatterjee; suspected integration channel for laundered proceeds.",
    },
    {
      id: "ORG005",
      name: "Mehta Global Traders",
      type: "Organization",
      role: "Shell Laundering Vehicle",
      cluster: "Cluster B (Laundering Cell)",
      cluster_id: "cluster_b",
      risk_score: 90,
      risk_tier: "CRITICAL",
      source_docs: ["FIR_103"],
      summary: "Trading entity used to justify high-velocity circular wire transfers.",
    },
    {
      id: "ORG004",
      name: "Kolkata Commercial Bank",
      type: "Organization",
      role: "Banking Institution (Reporting Body)",
      cluster: "Victims / Witnesses",
      cluster_id: "victim",
      risk_score: 8,
      risk_tier: "LOW",
      source_docs: ["FIR_103"],
      summary: "Park Street branch where circular fund trail and suspect visits were recorded.",
    },

    // --- VEHICLES ---
    {
      id: "VEH001",
      name: "WB02CD5678",
      type: "Vehicle",
      role: "Intimidation Transport (White Maruti Swift)",
      cluster: "Cluster A (Extortion Cell)",
      cluster_id: "cluster_a",
      risk_score: 75,
      risk_tier: "HIGH",
      source_docs: ["FIR_101"],
      summary: "Used by Rajesh Sharma & Bimal Das during Salt Lake home raid on 2026-03-05.",
    },
    {
      id: "VEH002",
      name: "WB06EF9012",
      type: "Vehicle",
      role: "Executive Transport (Black Toyota Innova)",
      cluster: "Bridge Kingpin",
      cluster_id: "bridge",
      risk_score: 85,
      risk_tier: "CRITICAL",
      source_docs: ["FIR_102"],
      summary: "Driven by Debasish Chatterjee during rendezvous at Howrah Maidan tea stall.",
    },
    {
      id: "VEH003",
      name: "WB01AB1234",
      type: "Vehicle",
      role: "Syndicate Liaison (Silver Honda City)",
      cluster: "Bridge Kingpin",
      cluster_id: "bridge",
      risk_score: 88,
      risk_tier: "CRITICAL",
      source_docs: ["FIR_103"],
      summary: "Occupied jointly by Rajesh Sharma and Debasish Chatterjee during Park Street bank visit.",
    },

    // --- KEY BANK ACCOUNTS ---
    {
      id: "ACCT006",
      name: "30123456793 (Ashok Mehta)",
      type: "Account",
      role: "Loop Origin & Sink",
      cluster: "Cluster B (Laundering Cell)",
      cluster_id: "cluster_b",
      risk_score: 93,
      risk_tier: "CRITICAL",
      source_docs: ["FIR_103"],
      summary: "Originated ₹500k to Priya and received back ₹490k from Nikhil in 48h.",
    },
    {
      id: "ACCT007",
      name: "30123456794 (Priya Banerjee)",
      type: "Account",
      role: "Layering Node",
      cluster: "Cluster B (Laundering Cell)",
      cluster_id: "cluster_b",
      risk_score: 84,
      risk_tier: "HIGH",
      source_docs: ["FIR_103"],
      summary: "Transferred ₹495k to Nikhil Ghosh within hours.",
    },
    {
      id: "ACCT008",
      name: "30123456795 (Nikhil Ghosh)",
      type: "Account",
      role: "Closing Node",
      cluster: "Cluster B (Laundering Cell)",
      cluster_id: "cluster_b",
      risk_score: 82,
      risk_tier: "HIGH",
      source_docs: ["FIR_103"],
      summary: "Transferred ₹490k back to Ashok Mehta to complete the loop.",
    },
    {
      id: "ACCT002",
      name: "30123456789 (Rajesh Sharma)",
      type: "Account",
      role: "Extortion Ingestion",
      cluster: "Cluster A (Extortion Cell)",
      cluster_id: "cluster_a",
      risk_score: 89,
      risk_tier: "CRITICAL",
      source_docs: ["FIR_101"],
      summary: "Received ₹45,000 coerced payment from victim Manoj Tiwari.",
    },
    {
      id: "ACCT005",
      name: "30123456792 (Debasish Chatterjee)",
      type: "Account",
      role: "Mastermind Dormant Account",
      cluster: "Bridge Kingpin",
      cluster_id: "bridge",
      risk_score: 86,
      risk_tier: "CRITICAL",
      source_docs: ["FIR_103"],
      summary: "Maintains minimal transaction footprint while directing network assets.",
    }
  ],

  edges: [
    // === CDR CALL CONNECTIONS ===
    // 22-call spike between Rajesh and Manoj
    {
      id: "e_spike_01",
      source: "PH002",
      target: "PH001",
      source_name: "Rajesh Kumar Sharma (9832145678)",
      target_name: "Manoj Tiwari (9434567123)",
      type: "CALLED",
      sub_type: "CALL_SPIKE_ANOMALY",
      confidence: 0.99,
      frequency: 22,
      total_duration_sec: 765,
      timestamp: "2026-03-05T08:01:00Z - 16:20:00Z",
      evidence: "22 repetitive telephonic threat calls logged on 2026-03-05, matching extortion report in FIR_101.",
      doc_id: "FIR_101",
      is_anomaly: true,
      anomaly_type: "VELOCITY_SPIKE"
    },
    // Extortion cell internal calls
    {
      id: "e_call_02",
      source: "PH002",
      target: "PH003",
      source_name: "Rajesh Sharma (9832145678)",
      target_name: "Bimal Das (9748123456)",
      type: "CALLED",
      confidence: 0.95,
      frequency: 4,
      total_duration_sec: 320,
      timestamp: "2026-03-01T10:15:00Z",
      evidence: "Operational coordination between Rajesh Sharma and field agent Bimal Das.",
      doc_id: "FIR_101"
    },
    {
      id: "e_call_03",
      source: "PH002",
      target: "PH005",
      source_name: "Rajesh Sharma (9832145678)",
      target_name: "Sunita Roy (8967234561)",
      type: "CALLED",
      confidence: 0.95,
      frequency: 5,
      total_duration_sec: 450,
      timestamp: "2026-03-02T09:00:00Z",
      evidence: "Cross-jurisdiction dispatch between Salt Lake and Howrah.",
      doc_id: "FIR_102"
    },
    {
      id: "e_call_04",
      source: "PH003",
      target: "PH005",
      source_name: "Bimal Das (9748123456)",
      target_name: "Sunita Roy (8967234561)",
      type: "CALLED",
      confidence: 0.95,
      frequency: 3,
      total_duration_sec: 210,
      timestamp: "2026-03-03T14:20:00Z",
      evidence: "Collection ledger and document delivery coordination.",
      doc_id: "FIR_102"
    },
    {
      id: "e_call_05",
      source: "PH005",
      target: "PH004",
      source_name: "Sunita Roy (8967234561)",
      target_name: "Debjani Sen (9007123456)",
      type: "CALLED",
      confidence: 0.95,
      frequency: 1,
      total_duration_sec: 50,
      timestamp: "2026-03-06T11:00:00Z",
      evidence: "High pressure extortion demand call logged in FIR_102.",
      doc_id: "FIR_102"
    },

    // Bridge Calls (Debasish to Cluster A & Cluster B)
    {
      id: "e_call_06",
      source: "PH009",
      target: "PH005",
      source_name: "Debasish Chatterjee (7896541230)",
      target_name: "Sunita Roy (8967234561)",
      type: "CALLED",
      sub_type: "BRIDGE_COMMAND_CALL",
      confidence: 0.98,
      frequency: 2,
      total_duration_sec: 275,
      timestamp: "2026-03-10T08:00:00Z",
      evidence: "Covert direction call preceding the in-person tea stall rendezvous at Howrah Maidan.",
      doc_id: "FIR_102",
      is_bridge: true
    },
    {
      id: "e_call_07",
      source: "PH009",
      target: "PH007",
      source_name: "Debasish Chatterjee (7896541230)",
      target_name: "Ashok Mehta (9123456780)",
      type: "CALLED",
      sub_type: "BRIDGE_COMMAND_CALL",
      confidence: 0.98,
      frequency: 1,
      total_duration_sec: 130,
      timestamp: "2026-03-20T09:15:00Z",
      evidence: "Direct command call to Ashok Mehta initiating the ₹500k circular routing on 2026-03-20.",
      doc_id: "FIR_103",
      is_bridge: true
    },

    // Cluster B (Laundering Cell) Calls
    {
      id: "e_call_08",
      source: "PH007",
      target: "PH008",
      source_name: "Ashok Mehta (9123456780)",
      target_name: "Priya Banerjee (8801234567)",
      type: "CALLED",
      confidence: 0.95,
      frequency: 4,
      total_duration_sec: 480,
      timestamp: "2026-03-06T10:00:00Z",
      evidence: "Accountant transaction verification calls.",
      doc_id: "FIR_103"
    },
    {
      id: "e_call_09",
      source: "PH008",
      target: "PH006",
      source_name: "Priya Banerjee (8801234567)",
      target_name: "Nikhil Ghosh (7012345698)",
      type: "CALLED",
      confidence: 0.95,
      frequency: 3,
      total_duration_sec: 290,
      timestamp: "2026-03-07T15:45:00Z",
      evidence: "Mule account routing synchronization.",
      doc_id: "FIR_103"
    },
    {
      id: "e_call_10",
      source: "PH006",
      target: "PH007",
      source_name: "Nikhil Ghosh (7012345698)",
      target_name: "Ashok Mehta (9123456780)",
      type: "CALLED",
      confidence: 0.95,
      frequency: 3,
      total_duration_sec: 270,
      timestamp: "2026-03-08T09:30:00Z",
      evidence: "Confirmation of wire return to Ashok Mehta.",
      doc_id: "FIR_103"
    },

    // === FINANCIAL TRANSACTIONS (CIRCULAR ROUTING & EXTORTION TRAIL) ===
    {
      id: "e_tx_circ_01",
      source: "ACCT006",
      target: "ACCT007",
      source_name: "Ashok Mehta (30123456793)",
      target_name: "Priya Banerjee (30123456794)",
      type: "TRANSACTED_WITH",
      amount: 500000,
      timestamp: "2026-03-20T09:00:00Z",
      confidence: 0.99,
      evidence: "Step 1 of Circular Laundering Loop: ₹5,00,000 transferred from Mehta Global Traders to accountant Priya Banerjee.",
      doc_id: "FIR_103",
      is_anomaly: true,
      anomaly_type: "CIRCULAR_LAUNDERING_HOP_1"
    },
    {
      id: "e_tx_circ_02",
      source: "ACCT007",
      target: "ACCT008",
      source_name: "Priya Banerjee (30123456794)",
      target_name: "Nikhil Ghosh (30123456795)",
      type: "TRANSACTED_WITH",
      amount: 495000,
      timestamp: "2026-03-20T15:00:00Z",
      confidence: 0.99,
      evidence: "Step 2 of Circular Laundering Loop: ₹4,95,000 onward transferred to mule Nikhil Ghosh 6h later.",
      doc_id: "FIR_103",
      is_anomaly: true,
      anomaly_type: "CIRCULAR_LAUNDERING_HOP_2"
    },
    {
      id: "e_tx_circ_03",
      source: "ACCT008",
      target: "ACCT006",
      source_name: "Nikhil Ghosh (30123456795)",
      target_name: "Ashok Mehta (30123456793)",
      type: "TRANSACTED_WITH",
      amount: 490000,
      timestamp: "2026-03-21T09:00:00Z",
      confidence: 0.99,
      evidence: "Step 3 of Circular Laundering Loop: ₹4,90,000 closed back to Ashok Mehta completing ₹500k round-trip within 48h.",
      doc_id: "FIR_103",
      is_anomaly: true,
      anomaly_type: "CIRCULAR_LAUNDERING_HOP_3"
    },
    {
      id: "e_tx_extortion_01",
      source: "ACCT001",
      target: "ACCT002",
      source_name: "Manoj Tiwari (30123456796)",
      target_name: "Rajesh Kumar Sharma (30123456789)",
      type: "TRANSACTED_WITH",
      amount: 45000,
      timestamp: "2026-03-05T16:30:00Z",
      confidence: 0.98,
      evidence: "Coerced extortion settlement transferred under duress right after 22 intimidation calls.",
      doc_id: "FIR_101",
      is_anomaly: true,
      anomaly_type: "EXTORTION_PAYMENT"
    },
    {
      id: "e_tx_cut_01",
      source: "ACCT002",
      target: "ACCT003",
      source_name: "Rajesh Sharma (30123456789)",
      target_name: "Bimal Das (30123456790)",
      type: "TRANSACTED_WITH",
      amount: 15000,
      timestamp: "2026-03-06T10:00:00Z",
      confidence: 0.95,
      evidence: "Field commission cut paid to Bimal Das post-intimidation.",
      doc_id: "FIR_101"
    },
    {
      id: "e_tx_cut_02",
      source: "ACCT003",
      target: "ACCT004",
      source_name: "Bimal Das (30123456790)",
      target_name: "Sunita Roy (30123456791)",
      type: "TRANSACTED_WITH",
      amount: 5000,
      timestamp: "2026-03-06T12:00:00Z",
      confidence: 0.95,
      evidence: "Branch management cut paid to Sunita Roy.",
      doc_id: "FIR_102"
    },
    {
      id: "e_tx_cut_03",
      source: "ACCT004",
      target: "ACCT005",
      source_name: "Sunita Roy (30123456791)",
      target_name: "Debasish Chatterjee (30123456792)",
      type: "TRANSACTED_WITH",
      amount: 3000,
      timestamp: "2026-03-11T09:00:00Z",
      confidence: 0.95,
      evidence: "Tribute payment routed to Debasish Chatterjee following tea stall meeting.",
      doc_id: "FIR_102",
      is_bridge: true
    },

    // === ENTITY ASSOCIATIONS & MEMBERSHIP ===
    {
      id: "e_mem_01",
      source: "P003",
      target: "ORG001",
      source_name: "Rajesh Kumar Sharma",
      target_name: "Shubh Laxmi Finance",
      type: "MEMBER_OF",
      role: "Recovery Lead",
      confidence: 0.95,
      evidence: "Named as head recovery agent operating out of Salt Lake in FIR_101.",
      doc_id: "FIR_101"
    },
    {
      id: "e_mem_02",
      source: "P004",
      target: "ORG001",
      source_name: "Bimal Das",
      target_name: "Shubh Laxmi Finance",
      type: "MEMBER_OF",
      role: "Field Collection Agent",
      confidence: 0.92,
      evidence: "Field collection agent accompanying recovery visits in FIR_101.",
      doc_id: "FIR_101"
    },
    {
      id: "e_mem_03",
      source: "P008",
      target: "ORG003",
      source_name: "Debasish Chatterjee",
      target_name: "Chatterjee Textiles",
      type: "OWNS_ORGANIZATION",
      role: "Proprietor",
      confidence: 0.95,
      evidence: "Documented owner of Chatterjee Textiles operating in Howrah in FIR_102.",
      doc_id: "FIR_102"
    },
    {
      id: "e_mem_04",
      source: "P010",
      target: "ORG005",
      source_name: "Ashok Mehta",
      target_name: "Mehta Global Traders",
      type: "OWNS_ORGANIZATION",
      role: "Proprietor",
      confidence: 0.95,
      evidence: "Owner of Mehta Global Traders bank accounts in FIR_103.",
      doc_id: "FIR_103"
    },
    {
      id: "e_mem_05",
      source: "P011",
      target: "ORG005",
      source_name: "Priya Banerjee",
      target_name: "Mehta Global Traders",
      type: "MEMBER_OF",
      role: "Accountant",
      confidence: 0.92,
      evidence: "Accountant operating bank transfers for Mehta Global Traders in FIR_103.",
      doc_id: "FIR_103"
    },

    // Vehicle links
    {
      id: "e_veh_01",
      source: "P003",
      target: "VEH001",
      source_name: "Rajesh Sharma",
      target_name: "WB02CD5678 (Swift)",
      type: "OWNS_VEHICLE",
      confidence: 0.96,
      evidence: "Seen driving white Maruti Swift during extortion visit in FIR_101.",
      doc_id: "FIR_101"
    },
    {
      id: "e_veh_02",
      source: "P008",
      target: "VEH002",
      source_name: "Debasish Chatterjee",
      target_name: "WB06EF9012 (Innova)",
      type: "OWNS_VEHICLE",
      confidence: 0.96,
      evidence: "Arrived in black Toyota Innova for secret meeting in FIR_102.",
      doc_id: "FIR_102"
    },
    {
      id: "e_veh_03",
      source: "P008",
      target: "VEH003",
      source_name: "Debasish Chatterjee",
      target_name: "WB01AB1234 (Honda City)",
      type: "PRESENT_WITH",
      confidence: 0.98,
      evidence: "Arrived together with Rajesh Sharma (alias 'R.K. Sharma') in silver Honda City at Kolkata Commercial Bank in FIR_103.",
      doc_id: "FIR_103",
      is_bridge: true
    },
    {
      id: "e_veh_04",
      source: "P003",
      target: "VEH003",
      source_name: "Rajesh Kumar Sharma ('R.K. Sharma')",
      target_name: "WB01AB1234 (Honda City)",
      type: "PRESENT_WITH",
      confidence: 0.98,
      evidence: "Passenger in WB01AB1234 with Debasish Chatterjee during Park Street surveillance.",
      doc_id: "FIR_103",
      is_bridge: true
    },

    // Direct Person-to-Phone Ownership
    {
      id: "e_has_ph_01",
      source: "P008",
      target: "PH009",
      source_name: "Debasish Chatterjee",
      target_name: "7896541230",
      type: "USES_PHONE",
      confidence: 0.99,
      evidence: "Directly linked to Debasish Chatterjee in FIR_102 and FIR_103 telemetry.",
      doc_id: "FIR_102"
    },
    {
      id: "e_has_ph_02",
      source: "P003",
      target: "PH002",
      source_name: "Rajesh Kumar Sharma",
      target_name: "9832145678",
      type: "USES_PHONE",
      confidence: 0.99,
      evidence: "Registered mobile in FIR_101 and CDR logs.",
      doc_id: "FIR_101"
    },
    {
      id: "e_has_ph_03",
      source: "P010",
      target: "PH007",
      source_name: "Ashok Mehta",
      target_name: "9123456780",
      type: "USES_PHONE",
      confidence: 0.99,
      evidence: "Registered mobile in FIR_103.",
      doc_id: "FIR_103"
    },
    {
      id: "e_has_ph_04",
      source: "P007",
      target: "PH005",
      source_name: "Sunita Roy",
      target_name: "8967234561",
      type: "USES_PHONE",
      confidence: 0.99,
      evidence: "Registered mobile in FIR_102.",
      doc_id: "FIR_102"
    },

    // Direct Person-to-Account Ownership
    {
      id: "e_has_acct_01",
      source: "P010",
      target: "ACCT006",
      source_name: "Ashok Mehta",
      target_name: "30123456793",
      type: "OWNS_ACCOUNT",
      confidence: 0.99,
      evidence: "Account holder verified at Kolkata Commercial Bank.",
      doc_id: "FIR_103"
    },
    {
      id: "e_has_acct_02",
      source: "P011",
      target: "ACCT007",
      source_name: "Priya Banerjee",
      target_name: "30123456794",
      type: "OWNS_ACCOUNT",
      confidence: 0.99,
      evidence: "Account holder verified in FIR_103.",
      doc_id: "FIR_103"
    },
    {
      id: "e_has_acct_03",
      source: "P012",
      target: "ACCT008",
      source_name: "Nikhil Ghosh",
      target_name: "30123456795",
      type: "OWNS_ACCOUNT",
      confidence: 0.99,
      evidence: "Account holder verified in FIR_103.",
      doc_id: "FIR_103"
    },
    {
      id: "e_has_acct_04",
      source: "P003",
      target: "ACCT002",
      source_name: "Rajesh Sharma",
      target_name: "30123456789",
      type: "OWNS_ACCOUNT",
      confidence: 0.99,
      evidence: "Account holder verified in FIR_101.",
      doc_id: "FIR_101"
    },
    {
      id: "e_has_acct_05",
      source: "P008",
      target: "ACCT005",
      source_name: "Debasish Chatterjee",
      target_name: "30123456792",
      type: "OWNS_ACCOUNT",
      confidence: 0.99,
      evidence: "Dormant mastermind account at Kolkata Commercial Bank in FIR_103.",
      doc_id: "FIR_103"
    }
  ]
};

// FIR Full-Text Corpus with Ground Truth Entity Offsets for interactive in-text highlighting
export const FIR_CORPUS = [
  {
    doc_id: "FIR_101",
    fir_no: "101/2026",
    date: "2026-03-12",
    police_station: "Bidhannagar (Salt Lake) PS, Kolkata",
    district: "North 24 Parganas",
    complainant: "Manoj Tiwari (9434567123)",
    accused: ["Rajesh Kumar Sharma", "Bimal Das"],
    offence: "Extortion, Criminal Intimidation & Harassment (Sec 384/506 IPC / BNS)",
    summary: "Loan extortion under Shubh Laxmi Finance front; 22 harassment phone calls on 05/03/2026 followed by in-person threat in white Maruti Swift (WB02CD5678) and coerced ₹45,000 transfer to acct 30123456789.",
    text: `FIRST INFORMATION REPORT

FIR No: 101/2026
Date: 12/03/2026
Police Station: Bidhannagar (Salt Lake) PS, Kolkata
District: North 24 Parganas
Complainant: Manoj Tiwari, S/o Ram Tiwari, R/o Salt Lake Sector V, Kolkata, Mobile: 9434567123

STATEMENT OF THE COMPLAINANT:

1. I, Manoj Tiwari, state that I had taken a personal loan of Rs. 2,00,000 from "Shubh Laxmi Finance" in January 2026.
2. I state that one Rajesh Kumar Sharma, representing himself as a recovery agent of Shubh Laxmi Finance, began calling me repeatedly on my mobile number 9434567123 from his number 9832145678, threatening dire consequences if I did not repay the amount immediately.
3. I state that on 05/03/2026 I received a large number of such threatening calls from Rajesh Kumar Sharma throughout the day.
4. I further state that on the same date, Rajesh Kumar Sharma, along with an associate identified as Bimal Das (mobile number 9748123456), came to my residence at Salt Lake Sector V in a white Maruti Swift bearing registration number WB02CD5678 and threatened me in person.
5. I state that Bimal Das works for Shubh Laxmi Finance as a field collection agent in the Salt Lake area.
6. I state that under duress, I was forced to transfer Rs. 45,000 from my account to an account bearing number 30123456789, which I later learned belongs to Rajesh Kumar Sharma.
7. I state that Rajesh Kumar Sharma warned me that further "installments" would need to be transferred in the same manner.
8. I identify Bimal Das as a known associate of Rajesh Kumar Sharma who frequently accompanies him during collection visits.
9. I request the police to register a case and take strict action against Rajesh Kumar Sharma and Bimal Das for extortion and criminal intimidation under relevant sections of law.

(Statement recorded and signed by the complainant)`
  },
  {
    doc_id: "FIR_102",
    fir_no: "102/2026",
    date: "2026-03-18",
    police_station: "Howrah PS",
    district: "Howrah",
    complainant: "Debjani Sen (9007123456)",
    accused: ["Sunita Roy", "Bimal Das", "Debasish Chatterjee"],
    offence: "Criminal Intimidation, Syndicate Extortion & Mastermind Link",
    summary: "Loan recovery threats in Howrah; Complainant witnessed Sunita Roy meeting Debasish Chatterjee ('the owner' of Chatterjee Textiles) in black Toyota Innova (WB06EF9012) at Howrah Maidan tea stall.",
    text: `FIRST INFORMATION REPORT

FIR No: 102/2026
Date: 18/03/2026
Police Station: Howrah PS
District: Howrah
Complainant: Debjani Sen, D/o Ashim Sen, R/o Shibpur, Howrah, Mobile: 9007123456

STATEMENT OF THE COMPLAINANT:

1. I, Debjani Sen, state that I had taken a personal loan of Rs. 1,50,000 from "Shubh Laxmi Finance" in February 2026.
2. I state that one Sunita Roy, who I later learned operates from a small office near Howrah Maidan coordinating collection agents for Shubh Laxmi Finance, called me on 06/03/2026 from her mobile number 8967234561 pressuring me to clear my dues.
3. During that call Sunita Roy told me "everything is handled by our people," which I found suspicious given the aggressive tone of the call.
4. I state that on 10/03/2026, while I was near Howrah Maidan to visit Sunita Roy's office regarding my loan, I personally saw her meet a man at a tea stall who was later identified to me as Debasish Chatterjee.
5. I state that Debasish Chatterjee arrived at the meeting in a black Toyota Innova bearing registration number WB06EF9012.
6. I state that Sunita Roy referred to Debasish Chatterjee as "the owner" during their conversation, even though his name does not appear on any of the loan documents given to me.
7. I state that Debasish Chatterjee is known locally to own Chatterjee Textiles, a garment trading business operating out of Howrah.
8. I state that I also saw one Bimal Das dropping papers at Sunita Roy's office on 04/03/2026, and I was told he assists with collections in the Salt Lake area.
9. I request the police to investigate the possible role of Debasish Chatterjee as a mastermind behind the racket being run under the name of Shubh Laxmi Finance.

(Statement recorded and signed by the complainant)`
  },
  {
    doc_id: "FIR_103",
    fir_no: "103/2026",
    date: "2026-03-24",
    police_station: "Park Street PS, Kolkata",
    district: "Kolkata",
    complainant: "Anil Kapoor (Branch Manager, Kolkata Commercial Bank)",
    accused: ["Ashok Mehta", "Priya Banerjee", "Nikhil Ghosh", "Rajesh Kumar Sharma", "Debasish Chatterjee"],
    offence: "Money Laundering, Circular Fund Routing & Smurfing (PMLA / BNS)",
    summary: "Circular transfer loop ₹500,000 -> ₹495,000 -> ₹490,000 within 48 hours across Mehta Global Traders, Priya Banerjee, and Nikhil Ghosh; R.K. Sharma (Rajesh Kumar Sharma) and Debasish Chatterjee arrived jointly in silver Honda City (WB01AB1234).",
    text: `FIRST INFORMATION REPORT

FIR No: 103/2026
Date: 24/03/2026
Police Station: Park Street PS, Kolkata
District: Kolkata
Complainant: Anil Kapoor, Branch Manager, Kolkata Commercial Bank, Park Street Branch, Kolkata

STATEMENT OF THE COMPLAINANT:

1. I, Anil Kapoor, Branch Manager of Kolkata Commercial Bank, Park Street Branch, state that our internal monitoring system flagged suspicious circular transactions among three account holders at our branch.
2. I state that Ashok Mehta, who owns and operates Mehta Global Traders, transferred Rs. 5,00,000 from his account to the account of Priya Banerjee on 20/03/2026.
3. I state that Priya Banerjee, an accountant associated with Mehta Global Traders, transferred a near-identical sum onward to the account of Nikhil Ghosh the same day.
4. I state that Nikhil Ghosh, whose mobile number is registered as 7012345698 against an address on Park Street, Kolkata, transferred the funds back to Ashok Mehta's account within 48 hours, completing a circular routing of the money.
5. I state that on 20/03/2026, one "R.K. Sharma" was seen visiting our branch along with a man later identified as Debasish Chatterjee.
6. I state that "R.K. Sharma" has since been identified by police as Rajesh Kumar Sharma, already named in connection with a separate complaint of extortion filed at Bidhannagar PS.
7. I state that Rajesh Kumar Sharma and Debasish Chatterjee arrived together in a silver Honda City bearing registration number WB01AB1234.
8. I state that Debasish Chatterjee holds account number 30123456792 at our branch but conducts very few transactions personally, which raised our suspicion that he may be directing the network without direct financial involvement.
9. I state that our branch has no record of Debasish Chatterjee's account being used in the circular transfer among Ashok Mehta, Priya Banerjee, and Nikhil Ghosh, but he is known to be associated with all three through prior branch visits.
10. I request the police to investigate possible money laundering conducted through Mehta Global Traders and the associated individuals named above.

(Statement recorded and signed by the complainant)`
  }
];

// Pre-computed Multi-Agent Autonomous Query Responses (LangGraph Engine Simulation)
export const AGENT_QUERY_PRESETS = [
  {
    id: "query_kingpin",
    label: "👑 Uncover the Hidden Kingpin",
    query: "Who is the hidden mastermind bridging the extortion and money-laundering cells?",
    response: {
      summary: "Through Betweenness Centrality (0.942) and cross-case trajectory matching, DEBASISH CHATTERJEE (P008) is unequivocally identified as the hidden apex kingpin. Despite maintaining the lowest transaction frequency in the network, he is the single topological bridge connecting Cluster A (Extortion / Shubh Laxmi Finance) and Cluster B (Money Laundering / Mehta Global Traders).",
      reasoning_steps: [
        {
          agent: "NER & Query Agent",
          action: "spaCy Extraction & Cypher Synthesis",
          details: "MATCH (p1:Person)-[r1]-(bridge:Person)-[r2]-(p2:Person) WHERE p1.cluster = 'cluster_a' AND p2.cluster = 'cluster_b' RETURN bridge, count(DISTINCT r1+r2) as cut_edges",
          status: "SUCCESS"
        },
        {
          agent: "Graph Traversal Agent",
          action: "Multi-Hop Subgraph Traversal",
          details: "Traversed 3 hops across FIR_102 & FIR_103. Found Debasish Chatterjee connected to Sunita Roy (Cluster A) via tea stall rendezvous in WB06EF9012 and to Ashok Mehta (Cluster B) via Park Street Bank visit in WB01AB1234.",
          status: "SUCCESS"
        },
        {
          agent: "Intelligence & Risk Engine",
          action: "Centrality & Anomaly Calculation",
          details: "Computed PageRank & Betweenness Centrality. Debasish Chatterjee scored 0.942 Betweenness (highest in graph) while possessing only 4 degree edges, satisfying the classic 'low-degree apex coordinator' signature.",
          status: "SUCCESS"
        },
        {
          agent: "Legal Evidence Agent",
          action: "BSA / Section 65B Audit Trail Synthesis",
          details: "Extracted corroborated witness testimony from Debjani Sen (FIR_102 ¶4-6) and Bank Manager Anil Kapoor (FIR_103 ¶5-8). Admissibility confidence: 96%.",
          status: "SUCCESS"
        }
      ],
      highlighted_nodes: ["P008", "P003", "P007", "P010", "VEH002", "VEH003", "PH009", "ACCT005", "ORG003"],
      highlighted_edges: ["e_call_06", "e_call_07", "e_veh_02", "e_veh_03", "e_veh_04", "e_tx_cut_03"]
    }
  },
  {
    id: "query_circular_money",
    label: "💸 Trace Circular Money Laundering",
    query: "Trace the circular fund-routing loop across bank accounts and highlight amounts.",
    response: {
      summary: "Detected a high-confidence 3-Hop Circular Fund Routing Loop totaling ₹5,00,000 -> ₹495,000 -> ₹490,000 executed within a 48-hour window (2026-03-20 to 2026-03-21) among Mehta Global Traders, Priya Banerjee, and Nikhil Ghosh at Kolkata Commercial Bank.",
      reasoning_steps: [
        {
          agent: "Financial Anomaly Agent",
          action: "Cycle Detection Algorithm (Tarjan's Directed Cycle)",
          details: "Found closed directed loop: Acct 30123456793 (Ashok Mehta) -> Acct 30123456794 (Priya Banerjee) -> Acct 30123456795 (Nikhil Ghosh) -> Acct 30123456793 (Ashok Mehta).",
          status: "SUCCESS"
        },
        {
          agent: "Telemetry & Temporal Correlator",
          action: "Temporal Proximity & Amount Decay Analysis",
          details: "Delta between tx1 and tx2 = 6h (₹500k -> ₹495k, 1% layering fee). Delta between tx2 and tx3 = 18h (₹495k -> ₹490k, 1% mule cut). Total cycle duration = 48 hours.",
          status: "SUCCESS"
        },
        {
          agent: "Legal Evidence Agent",
          action: "Banking Telemetry Admissibility",
          details: "Corroborated by FIR_103 ¶1-4 lodged by Branch Manager Anil Kapoor. Certified under BSA Sec 65B electronic ledger logs.",
          status: "SUCCESS"
        }
      ],
      highlighted_nodes: ["P010", "P011", "P012", "ACCT006", "ACCT007", "ACCT008", "ORG005", "ORG004"],
      highlighted_edges: ["e_tx_circ_01", "e_tx_circ_02", "e_tx_circ_03", "e_call_08", "e_call_09", "e_call_10"]
    }
  },
  {
    id: "query_call_spike",
    label: "📞 Detect 22-Call Extortion Spike",
    query: "Identify call velocity spikes between extortion suspects and victims.",
    response: {
      summary: "Detected a severe Anomaly Calling Spike: 22 calls logged on 2026-03-05 between Rajesh Kumar Sharma (9832145678) and victim Manoj Tiwari (9434567123), exceeding baseline frequency by 2200%. This directly precipitated the ₹45,000 extortion wire transfer.",
      reasoning_steps: [
        {
          agent: "CDR Telemetry Agent",
          action: "Poisson Call Velocity Anomaly Detection",
          details: "Scanned 38 CDR records. Filtered date 2026-03-05: 9832145678 -> 9434567123 generated 22 calls within 8 hours. Z-score = 4.87 (P < 0.0001).",
          status: "SUCCESS"
        },
        {
          agent: "Narrative Alignment Agent",
          action: "FIR Corroboration",
          details: "Aligned CDR timestamps (08:01 to 16:20) with FIR_101 ¶2-4 and verified in-person visit in vehicle WB02CD5678 with Bimal Das.",
          status: "SUCCESS"
        }
      ],
      highlighted_nodes: ["P003", "P001", "P004", "PH002", "PH001", "PH003", "VEH001", "ACCT001", "ACCT002"],
      highlighted_edges: ["e_spike_01", "e_tx_extortion_01", "e_call_02", "e_veh_01"]
    }
  },
  {
    id: "query_entity_resolution",
    label: "🔍 Resolve Alias 'R.K. Sharma'",
    query: "Is 'R.K. Sharma' in FIR_103 the same person as Rajesh Kumar Sharma in FIR_101?",
    response: {
      summary: "Entity Resolution confirmed with 100% confidence: 'R.K. Sharma' (FIR_103 ¶5-6) and 'Rajesh Kumar Sharma' (FIR_101 ¶2) resolve to single unified entity P003. Corroborated by joint travel with Debasish Chatterjee in vehicle WB01AB1234 and police verification notes.",
      reasoning_steps: [
        {
          agent: "Entity Resolution Engine",
          action: "Jaro-Winkler & Lexical Disambiguation",
          details: "Matched initials 'R.K.' to 'Rajesh Kumar', normalized against Bidhannagar PS case records.",
          status: "SUCCESS"
        },
        {
          agent: "Multi-Source Linker",
          action: "Vehicle & Location Co-occurrence",
          details: "Linked via vehicle WB01AB1234 and shared criminal nexus with Debasish Chatterjee.",
          status: "SUCCESS"
        }
      ],
      highlighted_nodes: ["P003", "P008", "VEH003", "ORG006", "ORG001"],
      highlighted_edges: ["e_veh_03", "e_veh_04", "e_mem_01"]
    }
  }
];

// Raw CDR telemetry for matrix analysis
export const RAW_CDR_RECORDS = [
  { caller: "9832145678", receiver: "9748123456", timestamp: "2026-03-01 10:15:00", duration_sec: 120, doc: "FIR_101", caller_name: "Rajesh Sharma", receiver_name: "Bimal Das" },
  { caller: "9748123456", receiver: "9832145678", timestamp: "2026-03-01 18:30:00", duration_sec: 45, doc: "FIR_101", caller_name: "Bimal Das", receiver_name: "Rajesh Sharma" },
  { caller: "9832145678", receiver: "8967234561", timestamp: "2026-03-02 09:00:00", duration_sec: 200, doc: "FIR_102", caller_name: "Rajesh Sharma", receiver_name: "Sunita Roy" },
  { caller: "8967234561", receiver: "9748123456", timestamp: "2026-03-03 14:20:00", duration_sec: 90, doc: "FIR_102", caller_name: "Sunita Roy", receiver_name: "Bimal Das" },
  { caller: "9748123456", receiver: "8967234561", timestamp: "2026-03-04 11:05:00", duration_sec: 60, doc: "FIR_102", caller_name: "Bimal Das", receiver_name: "Sunita Roy" },
  { caller: "9832145678", receiver: "9434567123", timestamp: "2026-03-05 08:01:00", duration_sec: 42, doc: "FIR_101", caller_name: "Rajesh Sharma", receiver_name: "Manoj Tiwari (Victim)", is_spike: true },
  { caller: "9434567123", receiver: "9832145678", timestamp: "2026-03-05 08:15:00", duration_sec: 15, doc: "FIR_101", caller_name: "Manoj Tiwari", receiver_name: "Rajesh Sharma", is_spike: true },
  { caller: "9832145678", receiver: "9434567123", timestamp: "2026-03-05 08:40:00", duration_sec: 55, doc: "FIR_101", caller_name: "Rajesh Sharma", receiver_name: "Manoj Tiwari", is_spike: true },
  { caller: "9434567123", receiver: "9832145678", timestamp: "2026-03-05 09:05:00", duration_sec: 10, doc: "FIR_101", caller_name: "Manoj Tiwari", receiver_name: "Rajesh Sharma", is_spike: true },
  { caller: "9832145678", receiver: "9434567123", timestamp: "2026-03-05 09:20:00", duration_sec: 38, doc: "FIR_101", caller_name: "Rajesh Sharma", receiver_name: "Manoj Tiwari", is_spike: true },
  { caller: "9434567123", receiver: "9832145678", timestamp: "2026-03-05 09:45:00", duration_sec: 22, doc: "FIR_101", caller_name: "Manoj Tiwari", receiver_name: "Rajesh Sharma", is_spike: true },
  { caller: "9832145678", receiver: "9434567123", timestamp: "2026-03-05 10:10:00", duration_sec: 60, doc: "FIR_101", caller_name: "Rajesh Sharma", receiver_name: "Manoj Tiwari", is_spike: true },
  { caller: "9434567123", receiver: "9832145678", timestamp: "2026-03-05 10:35:00", duration_sec: 18, doc: "FIR_101", caller_name: "Manoj Tiwari", receiver_name: "Rajesh Sharma", is_spike: true },
  { caller: "9832145678", receiver: "9434567123", timestamp: "2026-03-05 11:00:00", duration_sec: 45, doc: "FIR_101", caller_name: "Rajesh Sharma", receiver_name: "Manoj Tiwari", is_spike: true },
  { caller: "9434567123", receiver: "9832145678", timestamp: "2026-03-05 11:20:00", duration_sec: 12, doc: "FIR_101", caller_name: "Manoj Tiwari", receiver_name: "Rajesh Sharma", is_spike: true },
  { caller: "9832145678", receiver: "9434567123", timestamp: "2026-03-05 11:45:00", duration_sec: 50, doc: "FIR_101", caller_name: "Rajesh Sharma", receiver_name: "Manoj Tiwari", is_spike: true },
  { caller: "9434567123", receiver: "9832145678", timestamp: "2026-03-05 12:10:00", duration_sec: 20, doc: "FIR_101", caller_name: "Manoj Tiwari", receiver_name: "Rajesh Sharma", is_spike: true },
  { caller: "9832145678", receiver: "9434567123", timestamp: "2026-03-05 12:35:00", duration_sec: 33, doc: "FIR_101", caller_name: "Rajesh Sharma", receiver_name: "Manoj Tiwari", is_spike: true },
  { caller: "9434567123", receiver: "9832145678", timestamp: "2026-03-05 13:00:00", duration_sec: 25, doc: "FIR_101", caller_name: "Manoj Tiwari", receiver_name: "Rajesh Sharma", is_spike: true },
  { caller: "9832145678", receiver: "9434567123", timestamp: "2026-03-05 13:25:00", duration_sec: 48, doc: "FIR_101", caller_name: "Rajesh Sharma", receiver_name: "Manoj Tiwari", is_spike: true },
  { caller: "9434567123", receiver: "9832145678", timestamp: "2026-03-05 13:50:00", duration_sec: 14, doc: "FIR_101", caller_name: "Manoj Tiwari", receiver_name: "Rajesh Sharma", is_spike: true },
  { caller: "9832145678", receiver: "9434567123", timestamp: "2026-03-05 14:15:00", duration_sec: 58, doc: "FIR_101", caller_name: "Rajesh Sharma", receiver_name: "Manoj Tiwari", is_spike: true },
  { caller: "9434567123", receiver: "9832145678", timestamp: "2026-03-05 14:40:00", duration_sec: 19, doc: "FIR_101", caller_name: "Manoj Tiwari", receiver_name: "Rajesh Sharma", is_spike: true },
  { caller: "9832145678", receiver: "9434567123", timestamp: "2026-03-05 15:05:00", duration_sec: 36, doc: "FIR_101", caller_name: "Rajesh Sharma", receiver_name: "Manoj Tiwari", is_spike: true },
  { caller: "9434567123", receiver: "9832145678", timestamp: "2026-03-05 15:30:00", duration_sec: 11, doc: "FIR_101", caller_name: "Manoj Tiwari", receiver_name: "Rajesh Sharma", is_spike: true },
  { caller: "9832145678", receiver: "9434567123", timestamp: "2026-03-05 15:55:00", duration_sec: 44, doc: "FIR_101", caller_name: "Rajesh Sharma", receiver_name: "Manoj Tiwari", is_spike: true },
  { caller: "9434567123", receiver: "9832145678", timestamp: "2026-03-05 16:20:00", duration_sec: 16, doc: "FIR_101", caller_name: "Manoj Tiwari", receiver_name: "Rajesh Sharma", is_spike: true },
  { caller: "8967234561", receiver: "9007123456", timestamp: "2026-03-06 11:00:00", duration_sec: 50, doc: "FIR_102", caller_name: "Sunita Roy", receiver_name: "Debjani Sen (Victim)" },
  { caller: "9123456780", receiver: "8801234567", timestamp: "2026-03-06 10:00:00", duration_sec: 300, doc: "FIR_103", caller_name: "Ashok Mehta", receiver_name: "Priya Banerjee" },
  { caller: "8801234567", receiver: "7012345698", timestamp: "2026-03-07 15:45:00", duration_sec: 150, doc: "FIR_103", caller_name: "Priya Banerjee", receiver_name: "Nikhil Ghosh" },
  { caller: "7012345698", receiver: "9123456780", timestamp: "2026-03-08 09:30:00", duration_sec: 80, doc: "FIR_103", caller_name: "Nikhil Ghosh", receiver_name: "Ashok Mehta" },
  { caller: "9123456780", receiver: "7012345698", timestamp: "2026-03-09 17:00:00", duration_sec: 110, doc: "FIR_103", caller_name: "Ashok Mehta", receiver_name: "Nikhil Ghosh" },
  { caller: "8801234567", receiver: "9123456780", timestamp: "2026-03-10 12:15:00", duration_sec: 70, doc: "FIR_103", caller_name: "Priya Banerjee", receiver_name: "Ashok Mehta" },
  { caller: "7896541230", receiver: "8967234561", timestamp: "2026-03-10 08:00:00", duration_sec: 180, doc: "FIR_102", caller_name: "Debasish Chatterjee (Mastermind)", receiver_name: "Sunita Roy", is_mastermind: true },
  { caller: "8967234561", receiver: "7896541230", timestamp: "2026-03-10 20:10:00", duration_sec: 95, doc: "FIR_102", caller_name: "Sunita Roy", receiver_name: "Debasish Chatterjee", is_mastermind: true },
  { caller: "7896541230", receiver: "9123456780", timestamp: "2026-03-20 09:15:00", duration_sec: 130, doc: "FIR_103", caller_name: "Debasish Chatterjee (Mastermind)", receiver_name: "Ashok Mehta", is_mastermind: true }
];

// Raw Bank Transfer logs for financial analytics
export const RAW_BANK_TRANSFERS = [
  { sender: "30123456796", receiver: "30123456789", amount: 45000, timestamp: "2026-03-05 16:30:00", doc: "FIR_101", sender_name: "Manoj Tiwari (Victim)", receiver_name: "Rajesh Sharma", type: "Extortion Payment" },
  { sender: "30123456789", receiver: "30123456790", amount: 15000, timestamp: "2026-03-06 10:00:00", doc: "FIR_101", sender_name: "Rajesh Sharma", receiver_name: "Bimal Das", type: "Enforcer Cut" },
  { sender: "30123456790", receiver: "30123456791", amount: 5000, timestamp: "2026-03-06 12:00:00", doc: "FIR_102", sender_name: "Bimal Das", receiver_name: "Sunita Roy", type: "Coordination Fee" },
  { sender: "30123456797", receiver: "30123456791", amount: 2000, timestamp: "2026-03-07 10:00:00", doc: "FIR_102", sender_name: "Debjani Sen (Victim)", receiver_name: "Sunita Roy", type: "Extortion Partial" },
  { sender: "30123456793", receiver: "30123456795", amount: 20000, timestamp: "2026-03-08 11:00:00", doc: "FIR_103", sender_name: "Ashok Mehta", receiver_name: "Nikhil Ghosh", type: "Noise Transfer" },
  { sender: "30123456794", receiver: "30123456793", amount: 10000, timestamp: "2026-03-09 14:00:00", doc: "FIR_103", sender_name: "Priya Banerjee", receiver_name: "Ashok Mehta", type: "Noise Transfer" },
  { sender: "30123456791", receiver: "30123456792", amount: 3000, timestamp: "2026-03-11 09:00:00", doc: "FIR_102", sender_name: "Sunita Roy", receiver_name: "Debasish Chatterjee", type: "Mastermind Cut" },
  { sender: "30123456795", receiver: "30123456794", amount: 12000, timestamp: "2026-03-12 13:00:00", doc: "FIR_103", sender_name: "Nikhil Ghosh", receiver_name: "Priya Banerjee", type: "Noise Transfer" },
  { sender: "30123456790", receiver: "30123456789", amount: 4000, timestamp: "2026-03-13 09:00:00", doc: "FIR_101", sender_name: "Bimal Das", receiver_name: "Rajesh Sharma", type: "Settlement Return" },
  { sender: "30123456796", receiver: "30123456789", amount: 5000, timestamp: "2026-03-14 10:00:00", doc: "FIR_101", sender_name: "Manoj Tiwari (Victim)", receiver_name: "Rajesh Sharma", type: "Installment 2" },
  { sender: "30123456791", receiver: "30123456790", amount: 2500, timestamp: "2026-03-15 09:30:00", doc: "FIR_102", sender_name: "Sunita Roy", receiver_name: "Bimal Das", type: "Field Reimbursement" },
  { sender: "30123456792", receiver: "30123456793", amount: 8000, timestamp: "2026-03-19 10:00:00", doc: "FIR_103", sender_name: "Debasish Chatterjee", receiver_name: "Ashok Mehta", type: "Bridge Injection" },
  // THE CIRCULAR LAUNDERING LOOP (500k -> 495k -> 490k)
  { sender: "30123456793", receiver: "30123456794", amount: 500000, timestamp: "2026-03-20 09:00:00", doc: "FIR_103", sender_name: "Ashok Mehta (Mehta Global)", receiver_name: "Priya Banerjee (Accountant)", type: "CIRCULAR LOOP (Hop 1)", is_circular: true },
  { sender: "30123456794", receiver: "30123456795", amount: 495000, timestamp: "2026-03-20 15:00:00", doc: "FIR_103", sender_name: "Priya Banerjee (Accountant)", receiver_name: "Nikhil Ghosh (Mule)", type: "CIRCULAR LOOP (Hop 2)", is_circular: true },
  { sender: "30123456795", receiver: "30123456793", amount: 490000, timestamp: "2026-03-21 09:00:00", doc: "FIR_103", sender_name: "Nikhil Ghosh (Mule)", receiver_name: "Ashok Mehta (Mehta Global)", type: "CIRCULAR LOOP (Hop 3)", is_circular: true }
];
