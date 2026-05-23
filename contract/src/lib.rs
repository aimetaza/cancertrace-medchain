// ================================================================
// CancerTrace AI — Blockchain-Secured Cancer Screening System
// Built on Stellar Soroban Smart Contract Platform
//
// Contract ID: CD2WU2Z4CYJR7DKYS4HRLJ3FEZQAMCH5XMKFSFGU5ABFBZXHCU3LKPPY
// ================================================================

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Bytes, BytesN, Env, String, Symbol, Vec};

#[contracttype]
#[derive(Clone)]
pub struct ScreeningRecord {
    patient_record_id:   u64,
    biomarker_summary:   String,
    cancer_risk_level:   String,
    biomarker_score:     u32,
    screening_timestamp: u64,
    screening_notes:     String,
}

const MED_DATA: Symbol = symbol_short!("MED_DATA");

#[contract]
pub struct CancerTraceContract;

#[contractimpl]
impl CancerTraceContract {

    // ============================================================
    // GET ALL RECORDS
    // ============================================================
    pub fn get_all_records(env: Env) -> Vec<ScreeningRecord> {
        env.storage()
            .instance()
            .get(&MED_DATA)
            .unwrap_or(Vec::new(&env))
    }

    // ============================================================
    // SUBMIT SCREENING
    // ============================================================
    pub fn submit_screening(
        env: Env,
        biomarker_summary: String,
        screening_notes: String,
    ) -> String {
        let mut records: Vec<ScreeningRecord> = env
            .storage()
            .instance()
            .get(&MED_DATA)
            .unwrap_or(Vec::new(&env));

        let cancer_risk_level = Self::classify_risk(&env, &biomarker_summary);
        let biomarker_score   = Self::score_biomarkers(&env, &biomarker_summary);
        let screening_timestamp: u64 = env.ledger().timestamp();

        // Pseudo-unique ID dari timestamp XOR sequence
        let patient_record_id: u64 = env.ledger().timestamp()
            ^ (env.ledger().sequence() as u64).wrapping_mul(0x9e3779b97f4a7c15);

        let record = ScreeningRecord {
            patient_record_id,
            biomarker_summary,
            cancer_risk_level,
            biomarker_score,
            screening_timestamp,
            screening_notes,
        };

        records.push_back(record);
        env.storage().instance().set(&MED_DATA, &records);

        String::from_str(&env, "Screening record submitted and secured on blockchain")
    }

    // ============================================================
    // DELETE RECORD
    // ============================================================
    pub fn delete_record(env: Env, patient_record_id: u64) -> String {
        let mut records: Vec<ScreeningRecord> = env
            .storage()
            .instance()
            .get(&MED_DATA)
            .unwrap_or(Vec::new(&env));

        for i in 0..records.len() {
            if records.get(i).unwrap().patient_record_id == patient_record_id {
                records.remove(i);
                env.storage().instance().set(&MED_DATA, &records);
                return String::from_str(&env, "Screening record deleted successfully");
            }
        }

        String::from_str(&env, "Record not found: patient_record_id does not exist")
    }

    // ============================================================
    // PRIVATE HELPER: classify_risk
    //
    // FIX: Soroban String tidak punya .to_bytes() langsung.
    // Cara yang benar: konversi String → Bytes via Bytes::from
    // menggunakan soroban_sdk::IntoVal / xdr encoding.
    //
    // Solusi paling bersih di Soroban SDK v21:
    // Gunakan String::as_bytes() yang tersedia via xdr, atau
    // encode manual via BytesN. Cara termudah yang compile:
    // bandingkan char by char via String::get(index).
    // ============================================================
    fn classify_risk(env: &Env, biomarker_summary: &String) -> String {
        // Konversi Soroban String ke Bytes yang bisa di-iterate
        // Cara yang benar di SDK v21: pakai Bytes::from_slice
        let len = biomarker_summary.len();
        let mut buf = [0u8; 256];
        // Copy bytes dari String ke buffer via copy_into_slice
        biomarker_summary.copy_into_slice(&mut buf[..len as usize]);
        let summary_bytes = &buf[..len as usize];

        // Cek keyword HIGH
        if Self::slice_contains(summary_bytes, b"HIGH") {
            return String::from_str(env, "HIGH RISK - Immediate Oncology Referral Required");
        }

        // Cek keyword ELEVATED
        if Self::slice_contains(summary_bytes, b"ELEVATED") {
            return String::from_str(env, "MEDIUM RISK - Follow-up Screening Recommended");
        }

        String::from_str(env, "LOW RISK - Routine Annual Monitoring")
    }

    // ============================================================
    // PRIVATE HELPER: score_biomarkers
    // ============================================================
    fn score_biomarkers(_env: &Env, biomarker_summary: &String) -> u32 {
        let len = biomarker_summary.len();
        let mut buf = [0u8; 256];
        biomarker_summary.copy_into_slice(&mut buf[..len as usize]);
        let summary_bytes = &buf[..len as usize];

        let high_count     = Self::slice_count(summary_bytes, b"HIGH")     as u32;
        let elevated_count = Self::slice_count(summary_bytes, b"ELEVATED") as u32;

        let raw_score = (high_count * 35) + (elevated_count * 15);
        if raw_score > 100 { 100 } else { raw_score }
    }

    // ============================================================
    // PRIVATE HELPER: slice_contains
    // Mencari needle di dalam haystack slice — no_std compatible.
    // ============================================================
    fn slice_contains(haystack: &[u8], needle: &[u8]) -> bool {
        let hay_len = haystack.len();
        let ned_len = needle.len();

        if ned_len > hay_len {
            return false;
        }

        for i in 0..=(hay_len - ned_len) {
            if &haystack[i..i + ned_len] == needle {
                return true;
            }
        }
        false
    }

    // ============================================================
    // PRIVATE HELPER: slice_count
    // Hitung kemunculan needle di dalam haystack slice.
    // ============================================================
    fn slice_count(haystack: &[u8], needle: &[u8]) -> usize {
        let hay_len = haystack.len();
        let ned_len = needle.len();
        let mut count = 0;

        if ned_len > hay_len {
            return 0;
        }

        let mut i = 0;
        while i <= hay_len - ned_len {
            if &haystack[i..i + ned_len] == needle {
                count += 1;
                i += ned_len;
            } else {
                i += 1;
            }
        }
        count
    }
}

