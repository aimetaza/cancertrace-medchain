#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    BytesN, Env, String, Symbol, Vec,
};

// ================================================================
// CancerTrace AI — Blockchain-Secured Cancer Screening System
// Built on Stellar Soroban Smart Contract Platform
// ================================================================

// Struktur data screening
#[contracttype]
#[derive(Clone, Debug)]
pub struct ScreeningRecord {
    pub patient_record_id: u64,

    // Jangan simpan nama pasien asli di blockchain.
    // Simpan hash/kode pasien saja.
    pub patient_hash: BytesN<32>,

    // Hash dari hasil detail screening yang disimpan off-chain.
    // Misalnya detail biomarker disimpan di database biasa/IPFS,
    // lalu hash-nya disimpan di blockchain.
    pub result_hash: BytesN<32>,

    // Ringkasan biomarker untuk demo.
    // Untuk produksi, sebaiknya tidak menyimpan detail medis langsung.
    pub biomarker_summary: String,

    pub cancer_risk_level: String,
    pub biomarker_score: u32,
    pub screening_timestamp: u64,
    pub screening_notes: String,

    // Daripada delete permanen, record dibuat nonaktif.
    pub is_active: bool,
}

// Storage key
const MED_DATA: Symbol = symbol_short!("MEDDATA");

#[contract]
pub struct CancerTraceContract;

#[contractimpl]
impl CancerTraceContract {
    // ============================================================
    // Ambil semua record
    // ============================================================
    pub fn get_all_records(env: Env) -> Vec<ScreeningRecord> {
        env.storage()
            .instance()
            .get(&MED_DATA)
            .unwrap_or(Vec::new(&env))
    }

    // ============================================================
    // Ambil hanya record yang masih aktif
    // ============================================================
    pub fn get_active_records(env: Env) -> Vec<ScreeningRecord> {
        let records: Vec<ScreeningRecord> = env
            .storage()
            .instance()
            .get(&MED_DATA)
            .unwrap_or(Vec::new(&env));

        let mut active_records = Vec::new(&env);

        for i in 0..records.len() {
            let record = records.get(i).unwrap();

            if record.is_active {
                active_records.push_back(record);
            }
        }

        active_records
    }

    // ============================================================
    // Ambil record berdasarkan ID
    // ============================================================
    pub fn get_record_by_id(
        env: Env,
        patient_record_id: u64,
    ) -> Option<ScreeningRecord> {
        let records: Vec<ScreeningRecord> = env
            .storage()
            .instance()
            .get(&MED_DATA)
            .unwrap_or(Vec::new(&env));

        for i in 0..records.len() {
            let record = records.get(i).unwrap();

            if record.patient_record_id == patient_record_id {
                return Some(record);
            }
        }

        None
    }

    // ============================================================
    // Ambil record HIGH RISK yang masih aktif
    // ============================================================
    pub fn get_high_risk_records(env: Env) -> Vec<ScreeningRecord> {
        let records: Vec<ScreeningRecord> = env
            .storage()
            .instance()
            .get(&MED_DATA)
            .unwrap_or(Vec::new(&env));

        let mut high_risk_records = Vec::new(&env);

        for i in 0..records.len() {
            let record = records.get(i).unwrap();

            if record.is_active
                && record.cancer_risk_level == String::from_str(&env, "HIGH")
            {
                high_risk_records.push_back(record);
            }
        }

        high_risk_records
    }

    // ============================================================
    // Submit screening baru
    // ============================================================
    pub fn submit_screening(
        env: Env,
        patient_hash: BytesN<32>,
        result_hash: BytesN<32>,
        biomarker_summary: String,
        screening_notes: String,
    ) -> String {
        // Validasi agar tidak error saat copy ke buffer 256
        if biomarker_summary.len() > 256 {
            return String::from_str(&env, "ERROR: biomarker_summary too long, max 256 chars");
        }

        if screening_notes.len() > 256 {
            return String::from_str(&env, "ERROR: screening_notes too long, max 256 chars");
        }

        let mut records: Vec<ScreeningRecord> = env
            .storage()
            .instance()
            .get(&MED_DATA)
            .unwrap_or(Vec::new(&env));

        let cancer_risk_level = Self::classify_risk(&env, &biomarker_summary);
        let biomarker_score = Self::score_biomarkers(&biomarker_summary);
        let screening_timestamp: u64 = env.ledger().timestamp();

        // Pseudo-unique ID dari timestamp XOR ledger sequence
        let patient_record_id: u64 = env.ledger().timestamp()
            ^ (env.ledger().sequence() as u64).wrapping_mul(0x9e3779b97f4a7c15);

        let record = ScreeningRecord {
            patient_record_id,
            patient_hash,
            result_hash,
            biomarker_summary,
            cancer_risk_level,
            biomarker_score,
            screening_timestamp,
            screening_notes,
            is_active: true,
        };

        records.push_back(record);
        env.storage().instance().set(&MED_DATA, &records);

        // Event sederhana untuk tracking blockchain
        env.events().publish(
            (symbol_short!("SUBMIT"),),
            patient_record_id,
        );

        String::from_str(&env, "Screening record submitted and secured on blockchain")
    }

    // ============================================================
    // Revoke record
    // Bukan delete permanen, tapi ubah is_active menjadi false.
    // Ini lebih cocok untuk audit medical record.
    // ============================================================
    pub fn revoke_record(env: Env, patient_record_id: u64) -> String {
        let mut records: Vec<ScreeningRecord> = env
            .storage()
            .instance()
            .get(&MED_DATA)
            .unwrap_or(Vec::new(&env));

        for i in 0..records.len() {
            let mut record = records.get(i).unwrap();

            if record.patient_record_id == patient_record_id {
                record.is_active = false;

                records.set(i, record);
                env.storage().instance().set(&MED_DATA, &records);

                env.events().publish(
                    (symbol_short!("REVOKE"),),
                    patient_record_id,
                );

                return String::from_str(&env, "Screening record revoked successfully");
            }
        }

        String::from_str(&env, "Record not found")
    }

    // ============================================================
    // Delete record permanen
    // Untuk demo boleh ada, tapi untuk medical record lebih baik
    // pakai revoke_record().
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

                env.events().publish(
                    (symbol_short!("DELETE"),),
                    patient_record_id,
                );

                return String::from_str(&env, "Screening record deleted successfully");
            }
        }

        String::from_str(&env, "Record not found")
    }

    // ============================================================
    // Helper: klasifikasi risiko
    //
    // Catatan:
    // Input harus menggunakan huruf besar:
    // HIGH, ELEVATED, NORMAL
    //
    // Contoh:
    // "CEA:HIGH; CA125:ELEVATED; AFP:NORMAL"
    // ============================================================
    fn classify_risk(env: &Env, biomarker_summary: &String) -> String {
        let len = biomarker_summary.len();
        let mut buf = [0u8; 256];

        biomarker_summary.copy_into_slice(&mut buf[..len as usize]);
        let summary_bytes = &buf[..len as usize];

        if Self::slice_contains(summary_bytes, b"HIGH") {
            return String::from_str(env, "HIGH");
        }

        if Self::slice_contains(summary_bytes, b"ELEVATED") {
            return String::from_str(env, "MEDIUM");
        }

        String::from_str(env, "LOW")
    }

    // ============================================================
    // Helper: score biomarker
    //
    // HIGH     = 35 poin
    // ELEVATED = 15 poin
    // Maksimum score = 100
    // ============================================================
    fn score_biomarkers(biomarker_summary: &String) -> u32 {
        let len = biomarker_summary.len();
        let mut buf = [0u8; 256];

        biomarker_summary.copy_into_slice(&mut buf[..len as usize]);
        let summary_bytes = &buf[..len as usize];

        let high_count = Self::slice_count(summary_bytes, b"HIGH") as u32;
        let elevated_count = Self::slice_count(summary_bytes, b"ELEVATED") as u32;

        let raw_score = (high_count * 35) + (elevated_count * 15);

        if raw_score > 100 {
            100
        } else {
            raw_score
        }
    }

    // ============================================================
    // Helper: cek apakah keyword ada di text
    // no_std compatible
    // ============================================================
    fn slice_contains(haystack: &[u8], needle: &[u8]) -> bool {
        let hay_len = haystack.len();
        let needle_len = needle.len();

        if needle_len > hay_len {
            return false;
        }

        for i in 0..=(hay_len - needle_len) {
            if &haystack[i..i + needle_len] == needle {
                return true;
            }
        }

        false
    }

    // ============================================================
    // Helper: hitung jumlah keyword
    // no_std compatible
    // ============================================================
    fn slice_count(haystack: &[u8], needle: &[u8]) -> usize {
        let hay_len = haystack.len();
        let needle_len = needle.len();
        let mut count = 0;

        if needle_len > hay_len {
            return 0;
        }

        let mut i = 0;

        while i <= hay_len - needle_len {
            if &haystack[i..i + needle_len] == needle {
                count += 1;
                i += needle_len;
            } else {
                i += 1;
            }
        }

        count
    }
}

mod test;