import { useState, useEffect } from "react";
import heroImage from "./assets/images/hero_students_campus_1790873887242.jpg";

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
  verification_date?: string;
}

interface StudentData {
  name: string;
  age: string;
  state: string;
  category: string;
  education: string;
  income: string;
  percentage: string;
}

const SAMPLE_PRESETS: { label: string; data: StudentData }[] = [
  {
    label: "Undergrad Merit (82%, ₹3.5L)",
    data: {
      name: "Aditi Rao",
      age: "19",
      state: "Karnataka",
      category: "General",
      education: "Undergraduate",
      income: "350000",
      percentage: "82.5",
    },
  },
  {
    label: "Karnataka SSP (OBC, 75%)",
    data: {
      name: "Kiran Kumar",
      age: "20",
      state: "Karnataka",
      category: "OBC",
      education: "Undergraduate",
      income: "220000",
      percentage: "75",
    },
  },
  {
    label: "AICTE Technical Diploma (68%)",
    data: {
      name: "Sneha Patil",
      age: "18",
      state: "Maharashtra",
      category: "General",
      education: "Diploma",
      income: "450000",
      percentage: "68",
    },
  },
  {
    label: "School NMMSS (Class 9, 65%)",
    data: {
      name: "Rahul Verma",
      age: "14",
      state: "Tamil Nadu",
      category: "SC",
      education: "School",
      income: "180000",
      percentage: "65",
    },
  },
  {
    label: "PhD Doctoral Research (78%)",
    data: {
      name: "Dr. Sandeep Nair",
      age: "24",
      state: "Kerala",
      category: "General",
      education: "PhD",
      income: "600000",
      percentage: "78",
    },
  },
];

const OFFICIAL_PORTALS = [
  {
    name: "National Scholarship Portal (NSP)",
    org: "Ministry of Electronics & Information Technology, Govt. of India",
    desc: "Single-window electronic platform for Central Sector schemes, minority welfare, and social justice scholarships.",
    url: "https://scholarships.gov.in",
  },
  {
    name: "State Scholarship Portal (SSP Karnataka)",
    org: "Center for e-Governance, Govt. of Karnataka",
    desc: "Direct Benefit Transfer portal for pre-matric and post-matric students domiciled in Karnataka.",
    url: "https://ssp.postmatric.karnataka.gov.in",
  },
  {
    name: "MahaDBT Scholarship Portal",
    org: "Government of Maharashtra",
    desc: "Post-matric scholarship schemes and fee reimbursement for students belonging to Maharashtra state.",
    url: "https://mahadbt.maharashtra.gov.in",
  },
  {
    name: "ePASS Telangana",
    org: "Electronic Payment and Application System of Scholarships",
    desc: "Welfare department portal managing post-matric fee reimbursements and maintenance stipends.",
    url: "https://telanganaepass.cgg.gov.in",
  },
  {
    name: "Jnanabhumi (Andhra Pradesh)",
    org: "Department of Social Welfare, Govt. of AP",
    desc: "State scholarship and fee reimbursement framework for post-matric eligible students.",
    url: "https://jnanabhumi.ap.gov.in",
  },
  {
    name: "Prime Minister's Research Fellowship (PMRF)",
    org: "Ministry of Education & IIT Council",
    desc: "Dedicated doctoral fellowship portal offering ₹70,000–₹80,000 monthly stipends for PhD research scholars.",
    url: "https://pmrf.in",
  },
];

const INITIAL_DOCUMENTS = [
  {
    id: "aadhaar",
    title: "Aadhaar Card (Linked with Active Mobile & Bank)",
    desc: "Mandatory for National Scholarship Portal (NSP) DBT validation.",
    required: true,
  },
  {
    id: "income",
    title: "Income Certificate issued by Tehsildar / Competent Authority",
    desc: "Must be valid for the current financial year with certificate barcode/number.",
    required: true,
  },
  {
    id: "marksheet",
    title: "Previous Year Academic Marksheet / Passing Certificate",
    desc: "Attested copy of 10th, 12th, or semester degree mark sheet.",
    required: true,
  },
  {
    id: "caste",
    title: "Caste / Community Certificate (for SC / ST / OBC / EWS)",
    desc: "Permanent caste certificate issued by the competent revenue authority.",
    required: false,
  },
  {
    id: "domicile",
    title: "Domicile / Residential Certificate",
    desc: "Proof of residence within the state for state-specific welfare schemes.",
    required: true,
  },
  {
    id: "bank",
    title: "Bank Account Passbook (Aadhaar NPCI Seeded)",
    desc: "Active savings bank account in student's name with IFSC and branch details.",
    required: true,
  },
  {
    id: "bonafide",
    title: "Current Institution Bonafide / Enrollment Certificate",
    desc: "Certificate signed by Principal/Head of Institution confirming current enrollment.",
    required: true,
  },
  {
    id: "fee_receipt",
    title: "Fee Receipt for Current Academic Session",
    desc: "Official receipt showing tuition, library, and examination fees paid.",
    required: true,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"matcher" | "catalog" | "checklist" | "portals">("matcher");
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoNotice, setInfoNotice] = useState("");

  // Catalog search and filters
  const [catalogSearch, setCatalogSearch] = useState("");
  const [filterEdu, setFilterEdu] = useState("All");
  const [filterCat, setFilterCat] = useState("All");
  const [filterState, setFilterState] = useState("All");

  // Document checklist state
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    aadhaar: true,
    marksheet: true,
    bank: true,
  });

  const [formData, setFormData] = useState<StudentData>({
    name: "",
    age: "",
    state: "",
    category: "",
    education: "",
    income: "",
    percentage: "",
  });

  // Load all schemes once on mount for the catalog tab
  useEffect(() => {
    fetch("/api/schemes")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.schemes) {
          setAllSchemes(data.schemes);
        }
      })
      .catch((err) => console.warn("Could not load schemes catalog:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMessage) setErrorMessage("");
  };

  const handleApplyPreset = (presetData: StudentData) => {
    setFormData(presetData);
    setErrorMessage("");
  };

  const handleReset = () => {
    setFormData({
      name: "",
      age: "",
      state: "",
      category: "",
      education: "",
      income: "",
      percentage: "",
    });
    setSchemes([]);
    setSelectedScheme(null);
    setHasSearched(false);
    setErrorMessage("");
    setInfoNotice("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setInfoNotice("");

    try {
      const response = await fetch("/api/schemes/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSchemes(data.schemes || []);
        setHasSearched(true);
      } else {
        setErrorMessage(data.message || "Could not retrieve matching schemes.");
      }
      setSelectedScheme(null);
    } catch (error) {
      console.error("Submission error:", error);
      setErrorMessage("Could not connect to the backend server. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const docsCompletedCount = Object.values(checkedDocs).filter(Boolean).length;
  const docsProgress = Math.round((docsCompletedCount / INITIAL_DOCUMENTS.length) * 100);

  // Filter catalog schemes
  const filteredCatalog = allSchemes.filter((scheme) => {
    if (filterEdu !== "All" && scheme.education && scheme.education !== filterEdu) return false;
    if (filterCat !== "All" && scheme.category && scheme.category !== filterCat) return false;
    if (filterState !== "All" && scheme.state && scheme.state !== filterState) return false;
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      const matchName = scheme.name.toLowerCase().includes(q);
      const matchDesc = scheme.description.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="app">
      {/* 1. TOP NAVIGATION BAR (3-Zone Contract) */}
      <header className="navbar">
        <div className="navbar-container">
          {/* Zone 1: Single Wordmark */}
          <a href="#" className="logo" onClick={() => setActiveTab("matcher")}>
            ScholarCheck<span className="logo-dot">.</span>
          </a>

          {/* Zone 2: Navigation Links */}
          <nav className="nav-links">
            <button
              type="button"
              className={`nav-item ${activeTab === "matcher" ? "active" : ""}`}
              onClick={() => setActiveTab("matcher")}
            >
              Eligibility Matcher
            </button>
            <button
              type="button"
              className={`nav-item ${activeTab === "catalog" ? "active" : ""}`}
              onClick={() => setActiveTab("catalog")}
            >
              All Schemes ({allSchemes.length || "15+"})
            </button>
            <button
              type="button"
              className={`nav-item ${activeTab === "checklist" ? "active" : ""}`}
              onClick={() => setActiveTab("checklist")}
            >
              Document Checklist
            </button>
            <button
              type="button"
              className={`nav-item ${activeTab === "portals" ? "active" : ""}`}
              onClick={() => setActiveTab("portals")}
            >
              Official Portals
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <button
            type="button"
            className="nav-action-btn"
            onClick={() => {
              setActiveTab("matcher");
              window.scrollTo({ top: 380, behavior: "smooth" });
            }}
          >
            Check Eligibility
          </button>
        </div>
      </header>

      {/* 2. HERO BANNER */}
      <section className="hero-banner">
        <div className="hero-container">
          <div className="hero-content">
            <h1>Find Scholarships & Schemes You Actually Qualify For</h1>
            <p>
              Match your education level, income slab, state domicile, and social category against verified Central
              Ministries and State Government scholarship regulations.
            </p>

            <div className="trust-signals">
              <div className="trust-signal-item">
                <span className="icon">✓</span> Central & State Databases
              </div>
              <div className="trust-signal-item">
                <span className="icon">✓</span> Income & Merit Rules Checked
              </div>
              <div className="trust-signal-item">
                <span className="icon">✓</span> Direct Verified Application Links
              </div>
            </div>
          </div>

          <div className="hero-media">
            <img
              src={heroImage}
              alt="Indian university students collaborating on campus"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* 3. MAIN SECTION */}
      <main className="main-content">
        {activeTab === "matcher" && (
          <div className="layout-grid">
            {/* LEFT COLUMN: ELIGIBILITY FORM DECK */}
            <div className="form-panel">
              <div className="form-header">
                <h2>Check Your Eligibility</h2>
                <p>Fill in student details to filter official matching schemes.</p>
              </div>

              {/* Sample Presets */}
              <div className="preset-bar">
                <span className="preset-title">TRY SAMPLE PROFILE FOR INSTANT TEST</span>
                <div className="preset-pills">
                  {SAMPLE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="preset-btn"
                      onClick={() => handleApplyPreset(p.data)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="e.g. Aditi Rao"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-row">
                  <div className="form-group">
                    <label htmlFor="age">Age (Years)</label>
                    <input
                      id="age"
                      type="number"
                      name="age"
                      placeholder="e.g. 19"
                      value={formData.age}
                      onChange={handleChange}
                      min="5"
                      max="60"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="percentage">Marks / Percentage</label>
                    <div className="input-wrapper has-suffix">
                      <input
                        id="percentage"
                        type="number"
                        name="percentage"
                        placeholder="80.5"
                        value={formData.percentage}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        step="0.01"
                        required
                      />
                      <span className="input-suffix">%</span>
                    </div>
                  </div>
                </div>

                <div className="input-row">
                  <div className="form-group">
                    <label htmlFor="state">State Domicile</label>
                    <select id="state" name="state" value={formData.state} onChange={handleChange} required>
                      <option value="">Select state</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Telangana">Telangana</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Social Category</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                      <option value="">Select category</option>
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>
                </div>

                <div className="input-row">
                  <div className="form-group">
                    <label htmlFor="education">Current Education</label>
                    <select id="education" name="education" value={formData.education} onChange={handleChange} required>
                      <option value="">Select education</option>
                      <option value="School">School (Class 1-12)</option>
                      <option value="Diploma">Polytechnic / Diploma</option>
                      <option value="Undergraduate">Undergraduate (UG)</option>
                      <option value="Postgraduate">Postgraduate (PG)</option>
                      <option value="PhD">Doctoral / PhD</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="income">Annual Family Income</label>
                    <div className="input-wrapper has-prefix">
                      <span className="input-prefix">₹</span>
                      <input
                        id="income"
                        type="number"
                        name="income"
                        placeholder="250000"
                        value={formData.income}
                        onChange={handleChange}
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div
                    style={{
                      color: "#dc2626",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  >
                    {errorMessage}
                  </div>
                )}

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Matching Criteria..." : "Find Eligible Schemes"}
                  </button>
                  <button type="button" className="btn-secondary" onClick={handleReset}>
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: ELIGIBLE SCHEMES LIST */}
            <div className="results-panel">
              <div className="results-header">
                <div className="results-title-group">
                  <h2>Eligible Scholarships</h2>
                  <p className="results-meta">
                    {hasSearched ? (
                      <>
                        Found <span className="results-count">{schemes.length}</span> matching schemes for{" "}
                        <strong>{formData.name || "Student"}</strong>
                      </>
                    ) : (
                      "Submit student details on the left or select a sample preset to view matches."
                    )}
                  </p>
                </div>
              </div>

              {!hasSearched ? (
                <div className="empty-state">
                  <h3>No Eligibility Run Yet</h3>
                  <p>
                    Please select a sample profile above or enter your educational and income details to search against
                    verified Central and State scholarship regulations.
                  </p>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleApplyPreset(SAMPLE_PRESETS[0].data)}
                  >
                    Load Sample Profile & Test
                  </button>
                </div>
              ) : schemes.length === 0 ? (
                <div className="empty-state">
                  <h3>No Direct Schemes Matched</h3>
                  <p>
                    We could not find scholarships strictly meeting all your criteria (Category: {formData.category},
                    Education: {formData.education}, Income: ₹{formData.income}, Marks: {formData.percentage}%).
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    Tip: Check the "All Schemes" tab to explore all available central and open-merit grants.
                  </p>
                  <button type="button" className="btn-secondary" onClick={() => setActiveTab("catalog")}>
                    Browse Full Schemes Catalog
                  </button>
                </div>
              ) : (
                schemes.map((scheme) => (
                  <article className="scheme-card" key={scheme.id}>
                    <div className="scheme-card-header">
                      <h3 className="scheme-card-title">{scheme.name}</h3>

                      {/* Zero-Pill Unboxed Metadata */}
                      <div className="scheme-metadata-row">
                        <span>{scheme.education || "All Education Levels"}</span>
                        <span className="sep" aria-hidden="true">·</span>
                        <span>{scheme.category ? `Category: ${scheme.category}` : "All Categories"}</span>
                        <span className="sep" aria-hidden="true">·</span>
                        <span>{scheme.state ? `State: ${scheme.state}` : "All India (Central)"}</span>
                        <span className="sep" aria-hidden="true">·</span>
                        <span>{scheme.max_income ? `Income ≤ ₹${scheme.max_income.toLocaleString("en-IN")}` : "No Income Cap"}</span>
                      </div>

                      {/* Start Date & Last Date Timeline Strip */}
                      <div className="scheme-timeline-strip">
                        <div className="timeline-cell">
                          <span className="timeline-label">Application Start</span>
                          <span className="timeline-val">{scheme.start_date || "Open"}</span>
                        </div>
                        <div className="timeline-cell deadline">
                          <span className="timeline-label">Last Date to Apply</span>
                          <span className="timeline-val deadline-highlight">{scheme.last_date || "Ongoing"}</span>
                        </div>
                      </div>
                    </div>

                    <p className="scheme-desc">{scheme.description}</p>

                    {/* Why You Matched Section */}
                    <div className="match-reasons-box">
                      <div className="match-reasons-title">Criteria Verification Passed</div>
                      <div className="match-reasons-list">
                        <div className="match-reason-item">
                          <span className="tick">✓</span>
                          <span>
                            Age: {formData.age}
                            {scheme.min_age !== null && scheme.max_age !== null
                              ? ` (Range: ${scheme.min_age}–${scheme.max_age} yrs)`
                              : " (Eligible)"}
                          </span>
                        </div>
                        <div className="match-reason-item">
                          <span className="tick">✓</span>
                          <span>
                            Income: ₹{Number(formData.income).toLocaleString("en-IN")}
                            {scheme.max_income ? ` ≤ ₹${scheme.max_income.toLocaleString("en-IN")}` : " (No Cap)"}
                          </span>
                        </div>
                        <div className="match-reason-item">
                          <span className="tick">✓</span>
                          <span>
                            Percentage: {formData.percentage}%
                            {scheme.min_percentage ? ` ≥ ${scheme.min_percentage}% min` : " (Satisfied)"}
                          </span>
                        </div>
                        <div className="match-reason-item">
                          <span className="tick">✓</span>
                          <span>Education Level: {scheme.education || "All Levels Eligible"}</span>
                        </div>
                        <div className="match-reason-item">
                          <span className="tick">✓</span>
                          <span>Domicile: {scheme.state || "All Indian States Eligible"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="scheme-actions">
                      <button
                        type="button"
                        className="btn-details"
                        onClick={() => {
                          setSelectedScheme(scheme);
                          setInfoNotice("");
                        }}
                      >
                        View Guidelines & Checklist
                      </button>

                      {scheme.application_url ? (
                        <a
                          className="btn-apply-external"
                          href={scheme.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Official Portal ↗
                        </a>
                      ) : (
                        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Application portal rolling</span>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        )}

        {/* 4. ALL SCHEMES CATALOG TAB */}
        {activeTab === "catalog" && (
          <div className="catalog-section">
            <div className="catalog-filter-bar">
              <div className="search-input-box">
                <input
                  type="text"
                  placeholder="Search scholarship name, keywords, ministry, or field..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                />
              </div>

              <div className="filter-segments-group">
                <span className="segment-label">Education:</span>
                <div className="segment-buttons">
                  {["All", "School", "Diploma", "Undergraduate", "Postgraduate", "PhD"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className={`segment-btn ${filterEdu === lvl ? "active" : ""}`}
                      onClick={() => setFilterEdu(lvl)}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-segments-group">
                <span className="segment-label">Category:</span>
                <div className="segment-buttons">
                  {["All", "General", "OBC", "SC", "ST", "EWS"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`segment-btn ${filterCat === cat ? "active" : ""}`}
                      onClick={() => setFilterCat(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-segments-group">
                <span className="segment-label">State:</span>
                <div className="segment-buttons">
                  {["All", "Karnataka", "Tamil Nadu", "Kerala", "Maharashtra", "Andhra Pradesh", "Telangana"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`segment-btn ${filterState === st ? "active" : ""}`}
                      onClick={() => setFilterState(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
              Showing {filteredCatalog.length} of {allSchemes.length} verified government schemes
            </div>

            <div className="catalog-grid">
              {filteredCatalog.map((scheme) => (
                <article className="scheme-card" key={scheme.id}>
                  <h3 className="scheme-card-title">{scheme.name}</h3>

                  <div className="scheme-metadata-row">
                    <span>{scheme.education || "All Levels"}</span>
                    <span className="sep" aria-hidden="true">·</span>
                    <span>{scheme.category ? `Category: ${scheme.category}` : "All Categories"}</span>
                    <span className="sep" aria-hidden="true">·</span>
                    <span>{scheme.state ? scheme.state : "Central Scheme"}</span>
                  </div>

                  {/* Start Date & Last Date Timeline Strip */}
                  <div className="scheme-timeline-strip">
                    <div className="timeline-cell">
                      <span className="timeline-label">Application Start</span>
                      <span className="timeline-val">{scheme.start_date || "Open"}</span>
                    </div>
                    <div className="timeline-cell deadline">
                      <span className="timeline-label">Last Date to Apply</span>
                      <span className="timeline-val deadline-highlight">{scheme.last_date || "Ongoing"}</span>
                    </div>
                  </div>

                  <p className="scheme-desc">{scheme.description}</p>

                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                    <div>
                      <strong>Max Income:</strong>{" "}
                      {scheme.max_income ? `₹${scheme.max_income.toLocaleString("en-IN")}/year` : "No limit"}
                    </div>
                    <div>
                      <strong>Min Marks:</strong> {scheme.min_percentage ? `${scheme.min_percentage}%` : "No minimum"}
                    </div>
                  </div>

                  <div className="scheme-actions">
                    <button
                      type="button"
                      className="btn-details"
                      onClick={() => {
                        setSelectedScheme(scheme);
                        setInfoNotice("");
                      }}
                    >
                      Details & Documents
                    </button>

                    {scheme.application_url && (
                      <a
                        className="btn-apply-external"
                        href={scheme.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Portal ↗
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* 5. DOCUMENT CHECKLIST TAB */}
        {activeTab === "checklist" && (
          <div className="checklist-container">
            <div className="checklist-header">
              <h2>Mandatory Document Readiness Tracker</h2>
              <p>Ensure you have all necessary certificates scanned and verified before applying on government portals.</p>
            </div>

            <div className="readiness-meter">
              <div className="readiness-meta">
                <span>Application Readiness Score</span>
                <span>
                  {docsCompletedCount} of {INITIAL_DOCUMENTS.length} Documents ({docsProgress}%)
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${docsProgress}%` }}></div>
              </div>
            </div>

            <div className="checklist-items">
              {INITIAL_DOCUMENTS.map((doc) => (
                <label key={doc.id} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={!!checkedDocs[doc.id]}
                    onChange={() => toggleDoc(doc.id)}
                  />
                  <div className="checklist-item-content">
                    <div className="checklist-item-title">
                      {doc.title} {doc.required && <span style={{ color: "#dc2626", fontSize: "12px" }}>*Required</span>}
                    </div>
                    <div className="checklist-item-desc">{doc.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 6. OFFICIAL PORTALS TAB */}
        {activeTab === "portals" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Verified Government Portals Directory</h2>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                Official National and State Direct Benefit Transfer (DBT) portals for scholarship disbursement.
              </p>
            </div>

            <div className="portals-grid">
              {OFFICIAL_PORTALS.map((portal, idx) => (
                <div key={idx} className="portal-card">
                  <div>
                    <h3>{portal.name}</h3>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", marginBottom: "8px" }}>
                      {portal.org}
                    </div>
                    <p>{portal.desc}</p>
                  </div>

                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="portal-link-btn"
                  >
                    Open Official Portal ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 7. SCHEME DETAILS MODAL */}
      {selectedScheme && (
        <div className="modal-backdrop" onClick={() => setSelectedScheme(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedScheme.name}</h3>
              <button
                type="button"
                className="btn-close"
                onClick={() => setSelectedScheme(null)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.65" }}>
                {selectedScheme.description}
              </p>

              <div className="modal-grid-specs">
                <div className="spec-cell">
                  <small>Target Education Level</small>
                  <strong>{selectedScheme.education || "All Education Levels"}</strong>
                </div>

                <div className="spec-cell">
                  <small>Target Social Category</small>
                  <strong>{selectedScheme.category || "All Categories (General, OBC, SC, ST, EWS)"}</strong>
                </div>

                <div className="spec-cell">
                  <small>State Jurisdiction</small>
                  <strong>{selectedScheme.state || "All India (Central Scheme)"}</strong>
                </div>

                <div className="spec-cell">
                  <small>Maximum Annual Income</small>
                  <strong>
                    {selectedScheme.max_income
                      ? `₹${selectedScheme.max_income.toLocaleString("en-IN")}`
                      : "No Income Cap"}
                  </strong>
                </div>

                <div className="spec-cell">
                  <small>Minimum Percentage Required</small>
                  <strong>
                    {selectedScheme.min_percentage ? `${selectedScheme.min_percentage}% Marks` : "Passing Grade"}
                  </strong>
                </div>

                <div className="spec-cell">
                  <small>Age Window</small>
                  <strong>
                    {selectedScheme.min_age !== null && selectedScheme.max_age !== null
                      ? `${selectedScheme.min_age} to ${selectedScheme.max_age} Years`
                      : "No Age Restriction"}
                  </strong>
                </div>

                <div className="spec-cell highlight-start">
                  <small>Application Starting Date</small>
                  <strong>{selectedScheme.start_date || "Open for 2026-27 Cycle"}</strong>
                </div>

                <div className="spec-cell highlight-deadline">
                  <small>Last Date to Apply (Deadline)</small>
                  <strong>{selectedScheme.last_date || "Rolling Basis"}</strong>
                </div>

                {selectedScheme.verification_date && (
                  <div className="spec-cell">
                    <small>Institute Verification Last Date</small>
                    <strong>{selectedScheme.verification_date}</strong>
                  </div>
                )}
              </div>

              <div>
                <h4 className="modal-section-title">Required Documents Checklist</h4>
                <ul className="modal-bullets">
                  <li>Aadhaar Card linked to active bank account</li>
                  <li>Current year family income certificate from Tehsildar</li>
                  <li>Marksheet and passing certificate from previous qualifying exam</li>
                  <li>Institution Bonafide / Enrollment Certificate</li>
                  {selectedScheme.category && <li>Caste / Tribe / Category Certificate for {selectedScheme.category}</li>}
                  {selectedScheme.state && <li>Valid Domicile / Residence Certificate of {selectedScheme.state}</li>}
                </ul>
              </div>

              <div>
                <h4 className="modal-section-title">Application Guidelines</h4>
                <ol style={{ paddingLeft: "18px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                  <li>Register on the official portal using Aadhaar number and OTP verification.</li>
                  <li>Upload scanned documents in PDF format (under 200KB per document).</li>
                  <li>Submit application and obtain the acknowledgement tracking reference.</li>
                  <li>Submit hardcopy verification form to your institute's scholarship nodal officer.</li>
                </ol>
              </div>

              {infoNotice && (
                <div
                  style={{
                    color: "#1d4ed8",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                >
                  ℹ️ {infoNotice}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedScheme(null)}
              >
                Close
              </button>

              {selectedScheme.application_url ? (
                <a
                  className="btn-apply-external"
                  href={selectedScheme.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply on Official Portal ↗
                </a>
              ) : (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setInfoNotice("Direct portal link is being updated for the upcoming academic cycle.")
                  }
                >
                  Portal Link Pending
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <div>
            © {new Date().getFullYear()} ScholarCheck. Public scholarship discovery and eligibility matcher.
          </div>
          <div className="footer-links">
            <a href="https://scholarships.gov.in" target="_blank" rel="noopener noreferrer">
              National Scholarship Portal
            </a>
            <a href="https://www.education.gov.in" target="_blank" rel="noopener noreferrer">
              Ministry of Education
            </a>
            <button
              type="button"
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit" }}
              onClick={() => setActiveTab("checklist")}
            >
              Document Guide
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
