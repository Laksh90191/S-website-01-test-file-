import { useState } from "react";
import "./App.css";

function App() {
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    state: "",
    category: "",
    education: "",
    income: "",
    percentage: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/schemes/match",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      console.log("Server response:", data);

      setSchemes(data.schemes || []);
      setSelectedScheme(null);
    } catch (error) {
      console.error("Error:", error);
      alert("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">ScholarCheck</div>

        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">Schemes</a>
          <a href="#">About</a>
        </div>
      </nav>

      {/* MAIN */}
      <main className="hero">

        {/* HERO CONTENT */}
        <div className="hero-content">
          <h1>
            Find Scholarships &<br />
            Government Schemes
          </h1>

          <p>
            Enter your details and discover scholarships and government
            schemes that may match your eligibility.
          </p>
        </div>

        {/* FORM */}
        <div className="form-card">
          <h2>Check Your Eligibility</h2>

          <form onSubmit={handleSubmit}>

            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label>Age</label>
            <input
              type="number"
              name="age"
              placeholder="Enter your age"
              value={formData.age}
              onChange={handleChange}
              min="1"
              max="100"
              required
            />

            <label>State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            >
              <option value="">Select state</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Kerala">Kerala</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Telangana">Telangana</option>
            </select>

            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>

            <label>Education Level</label>
            <select
              name="education"
              value={formData.education}
              onChange={handleChange}
              required
            >
              <option value="">Select education</option>
              <option value="School">School</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="Diploma">Diploma</option>
              <option value="PhD">PhD</option>
            </select>

            <label>Annual Family Income</label>
            <input
              type="number"
              name="income"
              placeholder="₹ Annual income"
              value={formData.income}
              onChange={handleChange}
              min="0"
              required
            />

            <label>Percentage / CGPA</label>
            <input
              type="number"
              name="percentage"
              placeholder="Enter percentage"
              value={formData.percentage}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              required
            />

            <div className="form-buttons">
              <button type="submit" disabled={loading}>
                {loading
                  ? "Checking Eligibility..."
                  : "Find Eligible Schemes"}
              </button>

              <button
                type="button"
                className="reset-button"
                onClick={handleReset}
              >
                Start Over
              </button>
            </div>

          </form>
        </div>

        {/* RESULTS */}
        <div className="results">
          <h2>Eligible Schemes</h2>

          {schemes.length === 0 ? (
            <div className="no-results">
              <h3>No matching schemes found</h3>

              <p>
                We could not find a scholarship that matches the
                details you entered.
              </p>

              <p>
                Try checking your category, education level,
                income, or percentage.
              </p>
            </div>
          ) : (
            schemes.map((scheme) => (
              <div className="scheme-card" key={scheme.id}>

                <h3>{scheme.name}</h3>

                <p>{scheme.description}</p>

                <div className="scheme-info">

                  <p>
                    <strong>Education:</strong>{" "}
                    {scheme.education || "All levels"}
                  </p>

                  <p>
                    <strong>Category:</strong>{" "}
                    {scheme.category || "All categories"}
                  </p>

                  <p>
                    <strong>State:</strong>{" "}
                    {scheme.state || "All states"}
                  </p>

                  <p>
                    <strong>Maximum Income:</strong>{" "}
                    {scheme.max_income
                      ? `₹${scheme.max_income}`
                      : "No limit"}
                  </p>

                  <p>
                    <strong>Minimum Percentage:</strong>{" "}
                    {scheme.min_percentage
                      ? `${scheme.min_percentage}%`
                      : "No minimum"}
                  </p>

                  <p>
                    <strong>Age Requirement:</strong>{" "}
                    {scheme.min_age !== null &&
                    scheme.max_age !== null
                      ? `${scheme.min_age}-${scheme.max_age} years`
                      : "No age limit"}
                  </p>

                </div>

                {/* WHY YOU MATCHED */}
                <div className="eligibility-summary">

                  <h4>Why you matched</h4>

                  <p>
                    ✓ Age: {formData.age}
                    {scheme.min_age !== null &&
                    scheme.max_age !== null
                      ? ` — eligible age ${scheme.min_age}-${scheme.max_age}`
                      : ""}
                  </p>

                  <p>
                    ✓ Income: ₹{formData.income}
                    {scheme.max_income
                      ? ` ≤ ₹${scheme.max_income}`
                      : ""}
                  </p>

                  <p>
                    ✓ Percentage: {formData.percentage}%
                    {scheme.min_percentage
                      ? ` ≥ ${scheme.min_percentage}%`
                      : ""}
                  </p>

                  <p>
                    ✓ Category:{" "}
                    {scheme.category || "All categories"}
                  </p>

                  <p>
                    ✓ Education:{" "}
                    {scheme.education || "All levels"}
                  </p>

                  <p>
                    ✓ State:{" "}
                    {scheme.state || "All states"}
                  </p>

                </div>

                {/* VIEW DETAILS */}
                <button
                  className="apply-button"
                  onClick={() => setSelectedScheme(scheme)}
                >
                  View Details
                </button>

              </div>
            ))
          )}

          {/* SCHEME DETAILS */}
          {selectedScheme && (
            <div className="scheme-details">

              <h2>{selectedScheme.name}</h2>

              <p>{selectedScheme.description}</p>

              <div className="scheme-badges">

                <div className="scheme-badge">
                  <span>🎓</span>

                  <div>
                    <small>Education</small>

                    <strong>
                      {selectedScheme.education ||
                        "All levels"}
                    </strong>
                  </div>
                </div>

                <div className="scheme-badge">
                  <span>👤</span>

                  <div>
                    <small>Category</small>

                    <strong>
                      {selectedScheme.category ||
                        "All categories"}
                    </strong>
                  </div>
                </div>

                <div className="scheme-badge">
                  <span>📍</span>

                  <div>
                    <small>State</small>

                    <strong>
                      {selectedScheme.state ||
                        "All states"}
                    </strong>
                  </div>
                </div>

                <div className="scheme-badge">
                  <span>💰</span>

                  <div>
                    <small>Maximum Income</small>

                    <strong>
                      {selectedScheme.max_income
                        ? `₹${selectedScheme.max_income}`
                        : "No limit"}
                    </strong>
                  </div>
                </div>

                <div className="scheme-badge">
                  <span>📊</span>

                  <div>
                    <small>Minimum Percentage</small>

                    <strong>
                      {selectedScheme.min_percentage
                        ? `${selectedScheme.min_percentage}%`
                        : "No minimum"}
                    </strong>
                  </div>
                </div>

                <div className="scheme-badge">
                  <span>🎂</span>

                  <div>
                    <small>Age Requirement</small>

                    <strong>
                      {selectedScheme.min_age !== null &&
                      selectedScheme.max_age !== null
                        ? `${selectedScheme.min_age}-${selectedScheme.max_age} years`
                        : "No age limit"}
                    </strong>
                  </div>
                </div>

              </div>

              {/* DETAILS BUTTONS */}
              <div className="details-buttons">

                {selectedScheme.application_url ? (
                  <a
                    className="apply-button"
                    href={selectedScheme.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apply Now
                  </a>
                ) : (
                  <button
                    className="apply-button"
                    onClick={() =>
                      alert(
                        "Application link is not available for this scheme."
                      )
                    }
                  >
                    Application Link Unavailable
                  </button>
                )}

                <button
                  className="close-button"
                  onClick={() => setSelectedScheme(null)}
                >
                  Close Details
                </button>

              </div>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default App;