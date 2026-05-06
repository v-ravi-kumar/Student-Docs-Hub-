import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PlusCircle, ArrowLeft, Bookmark, Hash } from "lucide-react";
import api from "../api";

const AddDepartment = () => {
  const [formData, setFormData] = useState({
    dept_id: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const fromAdmin = location.state?.from === "admin";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await api.post("/auth/departments", formData);
      // Redirect back to original page
      navigate(fromAdmin ? "/admin-dashboard" : "/student-signup");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to add department. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "500px" }}>
        <button 
          onClick={() => navigate(fromAdmin ? "/admin-dashboard" : "/student-signup")}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            background: "none", 
            border: "none", 
            color: "var(--text-secondary)", 
            cursor: "pointer",
            marginBottom: "1.5rem",
            fontSize: "0.9rem"
          }}
        >
          <ArrowLeft size={16} />
          Back to {fromAdmin ? "Dashboard" : "Signup"}
        </button>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ background: "var(--primary)", width: "56px", height: "56px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
            <PlusCircle size={28} color="white" />
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#fff" }}>Add New Department</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Create a new department category for the portal</p>
        </div>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.2)", color: "#F87171", padding: "0.8rem", borderRadius: "10px", marginBottom: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="dept_id">Department ID</label>
            <div style={{ position: "relative" }}>
              <Hash size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input
                id="dept_id"
                name="dept_id"
                type="text"
                className="form-input"
                style={{ paddingLeft: "2.8rem" }}
                placeholder="Ex: DEPT-CS"
                value={formData.dept_id}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Department Name</label>
            <div style={{ position: "relative" }}>
              <Bookmark size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                style={{ paddingLeft: "2.8rem" }}
                placeholder="Ex: Computer Science and Engineering"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: "100%", marginTop: "1rem", padding: "0.8rem" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Department"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDepartment;
