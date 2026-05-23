import { useState } from "react";

export default function App() {
  const [records, setRecords] = useState<any[]>([]);

  function handleCreate() {
    alert("Cancer screening record stored!");
  }

  function handleLoad() {
    setRecords([
      {
        patient_record_id: 1,
        cancer_risk_level: "High",
        biomarker_score: 82,
      },
    ]);
  }

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>CancerTrace AI</h1>

      <p>AI-Assisted Oncology Screening Platform</p>

      <button onClick={handleCreate}>
        Create Screening Record
      </button>

      <button
        onClick={handleLoad}
        style={{ marginLeft: "10px" }}
      >
        Load Records
      </button>

      <pre>
        {JSON.stringify(records, null, 2)}
      </pre>
    </div>
  );
}