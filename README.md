CancerTrace AI README

# CancerTrace AI

AI-Powered Oncology Screening Platform with Stellar Blockchain Integration

## Overview

CancerTrace AI is a healthcare-focused prototype application that combines artificial intelligence and blockchain technology for early cancer risk screening and secure medical record management.

The platform simulates AI-assisted oncology analysis using biomarker-inspired screening data and stores medical screening records with blockchain-integrated verification concepts powered by Stellar.

This project was developed as part of an IEEE technology workshop focused on AI and blockchain innovation.

---

## Features

- AI-assisted cancer risk screening simulation
- Biomarker-based patient assessment
- Healthcare-focused dashboard interface
- Secure screening record management
- Stellar blockchain-inspired medical verification workflow
- Beginner-friendly React + TypeScript implementation

---

## Technology Stack

### Frontend
- React
- TypeScript
- Vite

### Blockchain
- Stellar blockchain integration concept
- Decentralized medical record verification

### AI Concept
- Biomarker-based cancer risk classification
- Predictive healthcare screening workflow

---

## Current Functionalities

### Create Screening Record
Allows users to simulate creating a cancer screening record for a patient.

### Load Records
Displays sample oncology screening data including:
- Patient record ID
- Cancer risk level
- Biomarker score

---

## Example Screening Output

```json
{
  "patient_record_id": 1,
  "cancer_risk_level": "High",
  "biomarker_score": 82
}


---

Project Structure

src/
 ├── App.tsx
 ├── main.tsx
 └── assets/


---

Installation

Clone the repository and install dependencies:

npm install

Run the development server:

npm run dev


---

Future Development

Potential future improvements include:

Real AI/ML prediction models

Integration with biomedical datasets

Stellar wallet authentication

Blockchain transaction verification

Patient-owned medical records

Advanced oncology analytics dashboard



---

Vision

CancerTrace AI aims to explore how artificial intelligence and decentralized technologies can support secure, accessible, and early-stage healthcare screening systems.

The project promotes the idea of trusted digital healthcare infrastructure through AI-assisted medical analysis and blockchain-secured records.


---

Disclaimer

This project is a prototype created for educational and workshop purposes only. It is not intended for real medical diagnosis or clinical use.


---

Authors

Developed for IEEE AI & Blockchain Workshop Innovation Project.
```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
