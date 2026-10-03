const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test backend
app.get("/", (req, res) => {
  res.json({
    message: "ScholarCheck backend is running!",
  });
});

// Test database
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "OK",
      database: "Connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "ERROR",
      database: "Not connected",
    });
  }
});

// Match scholarships
app.post("/api/schemes/match", async (req, res) => {
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

    // Save student information
    await pool.query(
      `INSERT INTO student_profiles
      (name, age, state, category, education, income, percentage)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        name,
        age,
        state,
        category,
        education,
        income,
        percentage,
      ]
    );

    // Find matching schemes
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
      [
  state,
  category,
  education,
  income,
  percentage,
  age,
]
    );

    res.json({
      success: true,
      student: {
        name,
        age,
        state,
        category,
        education,
        income,
        percentage,
      },
      schemes: result.rows,
    });
  } catch (error) {
    console.error("Matching error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while checking eligibility.",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});