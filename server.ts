import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

// Scheme data structure
interface Scheme {
  id: number;
  name: string;
  description: string;
  education: string | null;
  category: string | null;
  state: string | null;
  max_income: number | null;
  min_percentage: number | null;
  min_age: number | null;
  max_age: number | null;
  application_url: string | null;
  start_date: string;
  last_date: string;
  verification_date: string;
}

const DEFAULT_SCHEMES: Scheme[] = [
  {
    id: 1,
    name: "Central Sector Scheme of Scholarship for College and University Students",
    description: "Financial support by the Ministry of Education for meritorious students from low-income families to meet day-to-day expenses while pursuing graduation and higher studies.",
    education: "Undergraduate",
    category: null,
    state: null,
    max_income: 450000,
    min_percentage: 80,
    min_age: 17,
    max_age: 25,
    application_url: "https://scholarships.gov.in",
    start_date: "July 15, 2026",
    last_date: "November 30, 2026",
    verification_date: "December 15, 2026"
  },
  {
    id: 2,
    name: "Post-Matric Scholarship for SC Students",
    description: "Centrally sponsored scheme providing financial support including full tuition fee reimbursement and maintenance allowances to Scheduled Caste students.",
    education: "Undergraduate",
    category: "SC",
    state: null,
    max_income: 250000,
    min_percentage: 50,
    min_age: 16,
    max_age: 30,
    application_url: "https://scholarships.gov.in",
    start_date: "August 1, 2026",
    last_date: "December 15, 2026",
    verification_date: "December 31, 2026"
  },
  {
    id: 3,
    name: "Post-Matric Scholarship for OBC Students",
    description: "Financial assistance to students belonging to Other Backward Classes pursuing post-matriculation or post-secondary education.",
    education: "Undergraduate",
    category: "OBC",
    state: null,
    max_income: 250000,
    min_percentage: 50,
    min_age: 16,
    max_age: 30,
    application_url: "https://scholarships.gov.in",
    start_date: "August 1, 2026",
    last_date: "December 15, 2026",
    verification_date: "December 31, 2026"
  },
  {
    id: 4,
    name: "National Means Cum Merit Scholarship (NMMSS)",
    description: "Assistance to meritorious students from economically weaker sections to arrest dropouts at class VIII and encourage secondary stage education.",
    education: "School",
    category: null,
    state: null,
    max_income: 350000,
    min_percentage: 55,
    min_age: 12,
    max_age: 16,
    application_url: "https://scholarships.gov.in",
    start_date: "July 1, 2026",
    last_date: "October 31, 2026",
    verification_date: "November 15, 2026"
  },
  {
    id: 5,
    name: "AICTE Pragati Scholarship Scheme for Girl Students",
    description: "Assistance aimed at advancing young women pursuing technical education (degree or diploma programs) in AICTE-approved institutions.",
    education: "Diploma",
    category: null,
    state: null,
    max_income: 800000,
    min_percentage: 60,
    min_age: 16,
    max_age: 26,
    application_url: "https://www.aicte-india.org",
    start_date: "August 15, 2026",
    last_date: "December 31, 2026",
    verification_date: "January 15, 2027"
  },
  {
    id: 6,
    name: "Karnataka State Post-Matric Scholarship (SSP)",
    description: "State scholarship portal initiative for students residing in Karnataka enrolled in undergraduate and diploma courses.",
    education: "Undergraduate",
    category: null,
    state: "Karnataka",
    max_income: 250000,
    min_percentage: 50,
    min_age: 17,
    max_age: 28,
    application_url: "https://ssp.postmatric.karnataka.gov.in",
    start_date: "September 1, 2026",
    last_date: "December 31, 2026",
    verification_date: "January 15, 2027"
  },
  {
    id: 7,
    name: "Tamil Nadu Chief Minister Higher Education Special Scholarship",
    description: "Special state government grant for meritorious students residing in Tamil Nadu pursuing higher degrees.",
    education: "Undergraduate",
    category: null,
    state: "Tamil Nadu",
    max_income: 200000,
    min_percentage: 60,
    min_age: 17,
    max_age: 25,
    application_url: "https://www.tn.gov.in",
    start_date: "August 10, 2026",
    last_date: "November 15, 2026",
    verification_date: "November 30, 2026"
  },
  {
    id: 8,
    name: "Economically Weaker Section (EWS) Higher Education Fellowship",
    description: "Tuition support and monthly stipend for Economically Weaker Section candidates pursuing postgraduate degrees.",
    education: "Postgraduate",
    category: "EWS",
    state: null,
    max_income: 800000,
    min_percentage: 55,
    min_age: 20,
    max_age: 32,
    application_url: "https://scholarships.gov.in",
    start_date: "August 1, 2026",
    last_date: "December 10, 2026",
    verification_date: "December 24, 2026"
  },
  {
    id: 9,
    name: "Prime Minister Research Fellowship (PMRF)",
    description: "Prestigious fellowship designed to attract the best talent for doctoral (PhD) research programs in cutting-edge science and technology.",
    education: "PhD",
    category: null,
    state: null,
    max_income: null,
    min_percentage: 75,
    min_age: 21,
    max_age: 35,
    application_url: "https://pmrf.in",
    start_date: "September 15, 2026",
    last_date: "October 31, 2026",
    verification_date: "November 10, 2026"
  },
  {
    id: 10,
    name: "Maharashtra Rajarshi Chhatrapati Shahu Maharaj Scheme",
    description: "Tuition and exam fee reimbursement for students from Maharashtra pursuing graduate and professional programs.",
    education: "Undergraduate",
    category: null,
    state: "Maharashtra",
    max_income: 800000,
    min_percentage: 50,
    min_age: 17,
    max_age: 28,
    application_url: "https://mahadbt.maharashtra.gov.in",
    start_date: "August 1, 2026",
    last_date: "January 31, 2027",
    verification_date: "February 15, 2027"
  },
  {
    id: 11,
    name: "Kerala Post-Matric Minority & Merit Scholarship",
    description: "Financial assistance from the Directorate of Collegiate Education in Kerala for postgraduate studies.",
    education: "Postgraduate",
    category: null,
    state: "Kerala",
    max_income: 250000,
    min_percentage: 50,
    min_age: 20,
    max_age: 30,
    application_url: "https://dcescholarship.kerala.gov.in",
    start_date: "August 20, 2026",
    last_date: "November 30, 2026",
    verification_date: "December 15, 2026"
  },
  {
    id: 12,
    name: "Telangana ePASS Post-Matric Welfare Scholarship",
    description: "Electronic Payment and Application System of Scholarships for Telangana students pursuing higher studies.",
    education: "Undergraduate",
    category: null,
    state: "Telangana",
    max_income: 200000,
    min_percentage: 50,
    min_age: 17,
    max_age: 28,
    application_url: "https://telanganaepass.cgg.gov.in",
    start_date: "September 1, 2026",
    last_date: "January 15, 2027",
    verification_date: "January 31, 2027"
  },
  {
    id: 13,
    name: "Andhra Pradesh Jagananna Vidya Deevena",
    description: "Full fee reimbursement scheme ensuring higher educational access to students belonging to poor families in Andhra Pradesh.",
    education: "Undergraduate",
    category: null,
    state: "Andhra Pradesh",
    max_income: 250000,
    min_percentage: 50,
    min_age: 17,
    max_age: 28,
    application_url: "https://jnanabhumi.ap.gov.in",
    start_date: "July 1, 2026",
    last_date: "December 31, 2026",
    verification_date: "January 15, 2027"
  },
  {
    id: 14,
    name: "National Fellowship for Scheduled Tribe (ST) Candidates",
    description: "Financial assistance for ST students to pursue higher studies leading to M.Phil and PhD degrees in Sciences, Humanities, and Engineering.",
    education: "PhD",
    category: "ST",
    state: null,
    max_income: 600000,
    min_percentage: 55,
    min_age: 21,
    max_age: 36,
    application_url: "https://tribal.nic.in",
    start_date: "August 1, 2026",
    last_date: "November 15, 2026",
    verification_date: "November 30, 2026"
  },
  {
    id: 15,
    name: "National Overseas Scholarship for Meritorious Students",
    description: "Financial assistance to students belonging to lower income backgrounds to pursue master's and doctorate degrees abroad.",
    education: "Postgraduate",
    category: null,
    state: null,
    max_income: 800000,
    min_percentage: 60,
    min_age: 20,
    max_age: 35,
    application_url: "https://nosmsje.gov.in",
    start_date: "July 15, 2026",
    last_date: "October 31, 2026",
    verification_date: "November 15, 2026"
  }
];

// In-memory student profiles store as fallback
const inMemoryStudentProfiles: any[] = [];

// Database connection setup with fallback
let pool: pg.Pool | null = null;
let isDbConnected = false;

if (process.env.DATABASE_URL) {
  try {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 3000,
    });
    // Check connection
    pool.query('SELECT NOW()')
      .then(async () => {
        isDbConnected = true;
        console.log('[AI Studio] PostgreSQL database connected successfully.');
        if (pool) {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS schemes (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              description TEXT,
              education VARCHAR(50),
              category VARCHAR(50),
              state VARCHAR(50),
              max_income NUMERIC,
              min_percentage NUMERIC,
              min_age INT,
              max_age INT,
              application_url TEXT,
              start_date VARCHAR(50),
              last_date VARCHAR(50),
              verification_date VARCHAR(50)
            );
            CREATE TABLE IF NOT EXISTS student_profiles (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255),
              age INT,
              state VARCHAR(50),
              category VARCHAR(50),
              education VARCHAR(50),
              income NUMERIC,
              percentage NUMERIC,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);

          const countRes = await pool.query('SELECT count(*) FROM schemes');
          if (parseInt(countRes.rows[0].count, 10) === 0) {
            for (const s of DEFAULT_SCHEMES) {
              await pool.query(
                `INSERT INTO schemes (id, name, description, education, category, state, max_income, min_percentage, min_age, max_age, application_url, start_date, last_date, verification_date)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                [s.id, s.name, s.description, s.education, s.category, s.state, s.max_income, s.min_percentage, s.min_age, s.max_age, s.application_url, s.start_date, s.last_date, s.verification_date]
              );
            }
            console.log('[AI Studio] Seeded schemes table in PostgreSQL.');
          }
        }
      })
      .catch((err) => {
        isDbConnected = false;
        console.warn('[AI Studio] PostgreSQL not reachable — in-memory scheme database active:', err.message);
      });
  } catch (err: any) {
    console.warn('[AI Studio] Could not initialize PostgreSQL pool — in-memory fallback active:', err.message);
  }
} else {
  console.log('[AI Studio] No DATABASE_URL specified — in-memory scheme database active.');
}

// In-memory matching helper
function matchInMemorySchemes(student: {
  age: number;
  state: string;
  category: string;
  education: string;
  income: number;
  percentage: number;
}): Scheme[] {
  return DEFAULT_SCHEMES.filter((scheme) => {
    if (scheme.state !== null && scheme.state !== student.state) return false;
    if (scheme.category !== null && scheme.category !== student.category) return false;
    if (scheme.education !== null && scheme.education !== student.education) return false;
    if (scheme.max_income !== null && student.income > scheme.max_income) return false;
    if (scheme.min_percentage !== null && student.percentage < scheme.min_percentage) return false;
    if (scheme.min_age !== null && student.age < scheme.min_age) return false;
    if (scheme.max_age !== null && student.age > scheme.max_age) return false;
    return true;
  });
}

// API Routes

// Test backend status
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    message: 'ScholarCheck backend is running!',
  });
});

// Test database health
app.get('/api/health', async (req: Request, res: Response) => {
  if (isDbConnected && pool) {
    try {
      const result = await pool.query('SELECT NOW()');
      return res.json({
        status: 'OK',
        database: 'Connected',
        time: result.rows[0].now,
      });
    } catch {
      // Fallback
    }
  }

  res.json({
    status: 'OK',
    database: isDbConnected ? 'Connected' : 'In-Memory (Mock)',
    time: new Date().toISOString(),
  });
});

// List all schemes with optional search and filters
app.get('/api/schemes', (req: Request, res: Response) => {
  const { education, category, state, search } = req.query;

  let schemes = [...DEFAULT_SCHEMES];

  if (education && typeof education === 'string' && education !== 'All') {
    schemes = schemes.filter((s) => !s.education || s.education === education);
  }
  if (category && typeof category === 'string' && category !== 'All') {
    schemes = schemes.filter((s) => !s.category || s.category === category);
  }
  if (state && typeof state === 'string' && state !== 'All') {
    schemes = schemes.filter((s) => !s.state || s.state === state);
  }
  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    schemes = schemes.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    total: schemes.length,
    schemes,
  });
});

// Match scholarships
app.post('/api/schemes/match', async (req: Request, res: Response) => {
  try {
    const {
      name,
      age,
      state,
      category,
      education,
      income,
      percentage,
    } = req.body;

    const parsedAge = Number(age);
    const parsedIncome = Number(income);
    const parsedPercentage = Number(percentage);

    const studentData = {
      name,
      age: parsedAge,
      state,
      category,
      education,
      income: parsedIncome,
      percentage: parsedPercentage,
    };

    // If PostgreSQL is connected, use it
    if (isDbConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO student_profiles
          (name, age, state, category, education, income, percentage)
          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [name, parsedAge, state, category, education, parsedIncome, parsedPercentage]
        );

        const result = await pool.query(
          `SELECT *
           FROM schemes
           WHERE (state IS NULL OR state = $1)
           AND (category IS NULL OR category = $2)
           AND (education IS NULL OR education = $3)
           AND (max_income IS NULL OR max_income >= $4)
           AND (min_percentage IS NULL OR min_percentage <= $5)
           AND (min_age IS NULL OR min_age <= $6)
           AND (max_age IS NULL OR max_age >= $6)
           ORDER BY id`,
          [state, category, education, parsedIncome, parsedPercentage, parsedAge]
        );

        return res.json({
          success: true,
          student: studentData,
          schemes: result.rows,
        });
      } catch (dbErr) {
        console.warn('[AI Studio] PostgreSQL query error, falling back to in-memory matching:', dbErr);
      }
    }

    // In-memory fallback
    inMemoryStudentProfiles.push({
      ...studentData,
      created_at: new Date(),
    });

    const matchingSchemes = matchInMemorySchemes(studentData);

    res.json({
      success: true,
      student: studentData,
      schemes: matchingSchemes,
    });
  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while checking eligibility.',
    });
  }
});

// Serve frontend: dev mode uses Vite middleware, prod mode serves dist static assets
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: HOST, port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`ScholarCheck server running on http://${HOST}:${PORT}`);
  });
}

startServer();
