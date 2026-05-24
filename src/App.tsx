import { useState } from "react";

type ScreeningRecord = {
  patient_record_id: number;
  patient_hash: string;
  result_hash: string;
  biomarker_summary: string;
  cancer_risk_level: "LOW" | "MEDIUM" | "HIGH";
  biomarker_score: number;
  screening_timestamp: number;
  screening_notes: string;
  is_active: boolean;
};

export default function App() {
  const [records, setRecords] = useState<ScreeningRecord[]>([]);
  const [patientHash, setPatientHash] = useState("");
  const [resultHash, setResultHash] = useState("");
  const [biomarkerSummary, setBiomarkerSummary] = useState(
    "CEA:HIGH; CA125:ELEVATED; AFP:NORMAL"
  );
  const [screeningNotes, setScreeningNotes] = useState(
    "Patient requires further oncology review."
  );

  function classifyRisk(summary: string): "LOW" | "MEDIUM" | "HIGH" {
    const text = summary.toUpperCase();

    if (text.includes("HIGH")) {
      return "HIGH";
    }

    if (text.includes("ELEVATED")) {
      return "MEDIUM";
    }

    return "LOW";
  }

  function calculateScore(summary: string): number {
    const text = summary.toUpperCase();

    const highCount = (text.match(/HIGH/g) || []).length;
    const elevatedCount = (text.match(/ELEVATED/g) || []).length;

    const score = highCount * 35 + elevatedCount * 15;

    return score > 100 ? 100 : score;
  }

  function generateMockHash(prefix: string) {
    const random = Math.random().toString(16).substring(2);
    return `${prefix}_${random.padEnd(32, "0").substring(0, 32)}`;
  }

  function handleCreate() {
    if (!biomarkerSummary.trim()) {
      alert("Biomarker summary cannot be empty.");
      return;
    }

    if (biomarkerSummary.length > 256) {
      alert("Biomarker summary is too long. Maximum 256 characters.");
      return;
    }

    if (screeningNotes.length > 256) {
      alert("Screening notes is too long. Maximum 256 characters.");
      return;
    }

    const riskLevel = classifyRisk(biomarkerSummary);
    const score = calculateScore(biomarkerSummary);

    const newRecord: ScreeningRecord = {
      patient_record_id: Date.now(),
      patient_hash: patientHash || generateMockHash("patient"),
      result_hash: resultHash || generateMockHash("result"),
      biomarker_summary: biomarkerSummary,
      cancer_risk_level: riskLevel,
      biomarker_score: score,
      screening_timestamp: Math.floor(Date.now() / 1000),
      screening_notes: screeningNotes,
      is_active: true,
    };

    setRecords([newRecord, ...records]);

    alert("Cancer screening record created successfully!");
  }

  function handleLoadSampleRecords() {
    setRecords([
      {
        patient_record_id: 1001,
        patient_hash: "patient_8f91a3b2c4d5e6f78900000000000000",
        result_hash: "result_a12b34c56d78e90f1230000000000000",
        biomarker_summary: "CEA:HIGH; CA125:ELEVATED; AFP:NORMAL",
        cancer_risk_level: "HIGH",
        biomarker_score: 50,
        screening_timestamp: 1767200400,
        screening_notes: "High biomarker pattern detected. Referral required.",
        is_active: true,
      },
      {
        patient_record_id: 1002,
        patient_hash: "patient_123abc456def78900000000000000000",
        result_hash: "result_987zyx654wvu32100000000000000000",
        biomarker_summary: "CEA:ELEVATED; CA125:NORMAL; AFP:NORMAL",
        cancer_risk_level: "MEDIUM",
        biomarker_score: 15,
        screening_timestamp: 1767201400,
        screening_notes: "Medium risk. Follow-up screening recommended.",
        is_active: true,
      },
      {
        patient_record_id: 1003,
        patient_hash: "patient_555aaa666bbb77700000000000000000",
        result_hash: "result_111ccc222ddd33300000000000000000",
        biomarker_summary: "CEA:NORMAL; CA125:NORMAL; AFP:NORMAL",
        cancer_risk_level: "LOW",
        biomarker_score: 0,
        screening_timestamp: 1767202400,
        screening_notes: "No significant biomarker abnormality detected.",
        is_active: true,
      },
    ]);
  }

  function handleRevoke(id: number) {
    const updatedRecords = records.map((record) => {
      if (record.patient_record_id === id) {
        return {
          ...record,
          is_active: false,
        };
      }

      return record;
    });

    setRecords(updatedRecords);
  }

  function getRiskColor(risk: string) {
    if (risk === "HIGH") return "#dc2626";
    if (risk === "MEDIUM") return "#f59e0b";
    return "#16a34a";
  }

  function getRiskBackground(risk: string) {
    if (risk === "HIGH") return "#fee2e2";
    if (risk === "MEDIUM") return "#fef3c7";
    return "#dcfce7";
  }

  function formatDate(timestamp: number) {
    return new Date(timestamp * 1000).toLocaleString();
  }

  const totalRecords = records.length;
  const activeRecords = records.filter((r) => r.is_active).length;
  const highRiskRecords = records.filter(
    (r) => r.cancer_risk_level === "HIGH" && r.is_active
  ).length;
  const averageScore =
    records.length > 0
      ? Math.round(
          records.reduce((sum, record) => sum + record.biomarker_score, 0) /
            records.length
        )
      : 0;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.badge}>Blockchain Medical Screening</div>
            <h1 style={styles.title}>CancerTrace AI</h1>
            <p style={styles.subtitle}>
              AI-assisted oncology screening platform secured with Stellar
              Soroban smart contract.
            </p>
          </div>

          <div style={styles.headerCard}>
            <p style={styles.headerCardLabel}>Contract Status</p>
            <h3 style={styles.headerCardValue}>Prototype Mode</h3>
            <p style={styles.headerCardText}>
              Frontend is aligned with lib.rs structure.
            </p>
          </div>
        </header>

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Records</p>
            <h2 style={styles.statValue}>{totalRecords}</h2>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>Active Records</p>
            <h2 style={styles.statValue}>{activeRecords}</h2>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>High Risk</p>
            <h2 style={{ ...styles.statValue, color: "#dc2626" }}>
              {highRiskRecords}
            </h2>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>Average Score</p>
            <h2 style={styles.statValue}>{averageScore}</h2>
          </div>
        </section>

        <main style={styles.mainGrid}>
          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Create Screening Record</h2>
            <p style={styles.panelDescription}>
              Input screening summary. For demo, use keywords HIGH, ELEVATED,
              or NORMAL.
            </p>

            <label style={styles.label}>Patient Hash</label>
            <input
              style={styles.input}
              value={patientHash}
              onChange={(e) => setPatientHash(e.target.value)}
              placeholder="Optional. Auto generated if empty."
            />

            <label style={styles.label}>Result Hash</label>
            <input
              style={styles.input}
              value={resultHash}
              onChange={(e) => setResultHash(e.target.value)}
              placeholder="Optional. Auto generated if empty."
            />

            <label style={styles.label}>Biomarker Summary</label>
            <textarea
              style={styles.textarea}
              value={biomarkerSummary}
              onChange={(e) => setBiomarkerSummary(e.target.value)}
              placeholder="Example: CEA:HIGH; CA125:ELEVATED; AFP:NORMAL"
            />

            <div style={styles.helperRow}>
              <span>{biomarkerSummary.length}/256 characters</span>
              <span>
                Risk Preview:{" "}
                <b style={{ color: getRiskColor(classifyRisk(biomarkerSummary)) }}>
                  {classifyRisk(biomarkerSummary)}
                </b>
              </span>
            </div>

            <label style={styles.label}>Screening Notes</label>
            <textarea
              style={styles.textarea}
              value={screeningNotes}
              onChange={(e) => setScreeningNotes(e.target.value)}
              placeholder="Write screening notes here."
            />

            <div style={styles.helperRow}>
              <span>{screeningNotes.length}/256 characters</span>
              <span>Score Preview: {calculateScore(biomarkerSummary)}</span>
            </div>

            <div style={styles.buttonRow}>
              <button style={styles.primaryButton} onClick={handleCreate}>
                Create Screening Record
              </button>

              <button style={styles.secondaryButton} onClick={handleLoadSampleRecords}>
                Load Sample Records
              </button>
            </div>
          </section>

          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Screening Records</h2>
            <p style={styles.panelDescription}>
              Records follow the same structure as ScreeningRecord in lib.rs.
            </p>

            {records.length === 0 ? (
              <div style={styles.emptyState}>
                <h3>No records yet</h3>
                <p>Create a new record or load sample records.</p>
              </div>
            ) : (
              <div style={styles.recordList}>
                {records.map((record) => (
                  <div
                    key={record.patient_record_id}
                    style={{
                      ...styles.recordCard,
                      opacity: record.is_active ? 1 : 0.55,
                    }}
                  >
                    <div style={styles.recordTop}>
                      <div>
                        <p style={styles.recordId}>
                          Record #{record.patient_record_id}
                        </p>
                        <p style={styles.recordDate}>
                          {formatDate(record.screening_timestamp)}
                        </p>
                      </div>

                      <span
                        style={{
                          ...styles.riskBadge,
                          color: getRiskColor(record.cancer_risk_level),
                          background: getRiskBackground(record.cancer_risk_level),
                        }}
                      >
                        {record.cancer_risk_level}
                      </span>
                    </div>

                    <div style={styles.scoreBox}>
                      <div>
                        <p style={styles.scoreLabel}>Biomarker Score</p>
                        <h3 style={styles.scoreValue}>
                          {record.biomarker_score}/100
                        </h3>
                      </div>

                      <div style={styles.progressTrack}>
                        <div
                          style={{
                            ...styles.progressBar,
                            width: `${record.biomarker_score}%`,
                            background: getRiskColor(record.cancer_risk_level),
                          }}
                        />
                      </div>
                    </div>

                    <div style={styles.detailBox}>
                      <p>
                        <b>Patient Hash:</b> {record.patient_hash}
                      </p>
                      <p>
                        <b>Result Hash:</b> {record.result_hash}
                      </p>
                      <p>
                        <b>Biomarker:</b> {record.biomarker_summary}
                      </p>
                      <p>
                        <b>Notes:</b> {record.screening_notes}
                      </p>
                      <p>
                        <b>Status:</b>{" "}
                        {record.is_active ? "ACTIVE" : "REVOKED"}
                      </p>
                    </div>

                    {record.is_active && (
                      <button
                        style={styles.dangerButton}
                        onClick={() => handleRevoke(record.patient_record_id)}
                      >
                        Revoke Record
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #eef2ff 0%, #f8fafc 45%, #ecfeff 100%)",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial",
    color: "#0f172a",
    padding: "32px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    alignItems: "stretch",
    marginBottom: "24px",
  },
  badge: {
    display: "inline-block",
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    marginBottom: "14px",
  },
  title: {
    fontSize: "44px",
    lineHeight: 1.1,
    margin: 0,
    letterSpacing: "-1px",
  },
  subtitle: {
    fontSize: "17px",
    color: "#475569",
    maxWidth: "680px",
    marginTop: "12px",
  },
  headerCard: {
    minWidth: "280px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    padding: "22px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  },
  headerCardLabel: {
    color: "#64748b",
    fontSize: "13px",
    margin: 0,
  },
  headerCardValue: {
    fontSize: "24px",
    margin: "8px 0",
  },
  headerCardText: {
    color: "#64748b",
    margin: 0,
    fontSize: "14px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 14px 35px rgba(15, 23, 42, 0.06)",
  },
  statLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
  },
  statValue: {
    margin: "8px 0 0 0",
    fontSize: "32px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "420px 1fr",
    gap: "24px",
    alignItems: "start",
  },
  panel: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  },
  panelTitle: {
    margin: 0,
    fontSize: "24px",
  },
  panelDescription: {
    color: "#64748b",
    fontSize: "14px",
    marginTop: "8px",
    marginBottom: "22px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: 700,
    marginBottom: "8px",
    marginTop: "16px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "14px",
    outline: "none",
    background: "#f8fafc",
  },
  textarea: {
    width: "100%",
    minHeight: "92px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    background: "#f8fafc",
  },
  helperRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "8px",
    color: "#64748b",
    fontSize: "12px",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    marginTop: "22px",
  },
  primaryButton: {
    flex: 1,
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "13px 16px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
  },
  secondaryButton: {
    flex: 1,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    padding: "13px 16px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
  },
  emptyState: {
    border: "1px dashed #cbd5e1",
    borderRadius: "20px",
    padding: "40px",
    textAlign: "center",
    color: "#64748b",
    background: "#f8fafc",
  },
  recordList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  recordCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "18px",
    background: "#f8fafc",
  },
  recordTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    marginBottom: "16px",
  },
  recordId: {
    margin: 0,
    fontWeight: 800,
    fontSize: "16px",
  },
  recordDate: {
    margin: "4px 0 0 0",
    color: "#64748b",
    fontSize: "13px",
  },
  riskBadge: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 800,
  },
  scoreBox: {
    display: "grid",
    gridTemplateColumns: "140px 1fr",
    gap: "16px",
    alignItems: "center",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "14px",
    border: "1px solid #e2e8f0",
    marginBottom: "14px",
  },
  scoreLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "12px",
  },
  scoreValue: {
    margin: "4px 0 0 0",
    fontSize: "24px",
  },
  progressTrack: {
    height: "12px",
    background: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: "999px",
  },
  detailBox: {
    fontSize: "13px",
    color: "#334155",
    lineHeight: 1.6,
    wordBreak: "break-word",
  },
  dangerButton: {
    marginTop: "12px",
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#be123c",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
  },
};