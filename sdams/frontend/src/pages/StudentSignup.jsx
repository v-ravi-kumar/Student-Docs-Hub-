import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  GraduationCap, 
  Lock, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  CheckCircle,
  Eye,
  EyeOff,
  Briefcase,
  PlusCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api";
import logo from '../assets/logo.png';

const StudentSignup = () => {
  const [formData, setFormData] = useState({
    register_number: "",
    name: "",
    department_id: "",
    dob: "",
    email: "",
    mobile: "",
    year_of_joining: "",
    year_of_passing_out: "",
    password: "",
    confirm_password: "",
  });

  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { studentSignup } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/auth/departments");
        setDepartments(res.data);
      } catch (err) {
        console.error("Failed to fetch departments", err);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.mobile.length !== 10) {
      setError("Mobile number must be 10 digits");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Invalid email format");
      return false;
    }
    
    // Strong Password Policy (Gmail-like)
    // At least 8 chars, mix of letters, numbers, and symbols
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      alert("You have entered an invalid password. Please correct it to meet all the conditions above.");
      setError("Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Ensure numeric values are numbers where appropriate, but keep register_number as a string
      const submissionData = {
        ...formData,
        register_number: String(formData.register_number),
        year_of_joining: parseInt(formData.year_of_joining),
        year_of_passing_out: parseInt(formData.year_of_passing_out),
      };

      await studentSignup(submissionData);
      setSuccessMsg("Registration successful! Redirecting to login...");
      
      // Clear form
      setFormData({
        register_number: "",
        name: "",
        department_id: "",
        dob: "",
        email: "",
        mobile: "",
        year_of_joining: "",
        year_of_passing_out: "",
        password: "",
        confirm_password: "",
      });

      setTimeout(() => {
        navigate("/student-login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container" style={{ minHeight: "100vh", padding: "2rem 1rem", overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "700px", margin: "auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ background: "white", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", overflow: "hidden", border: "2px solid var(--primary)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <img src={logo} alt="Logo" style={{ width: "85%", height: "85%", objectFit: "contain" }} />
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#fff", letterSpacing: '2px' }}>STUDENT DOCS HUB</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.2rem", fontSize: '1rem', fontWeight: '500' }}>Student Registration</p>
        </div>

        {error && (
          <div style={{ background: "#ef4444", color: "#ffffff", padding: "1rem", borderRadius: "12px", marginBottom: "1.5rem", textAlign: "center", fontSize: "0.95rem", fontWeight: "500", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)" }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ background: "#10b981", color: "#ffffff", padding: "1rem", borderRadius: "12px", marginBottom: "1.5rem", textAlign: "center", fontSize: "0.95rem", fontWeight: "500", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <CheckCircle size={18} />
              {successMsg}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {/* Register Number */}
            <div className="form-group">
              <label className="form-label" htmlFor="register_number">Register Number</label>
              <div style={{ position: "relative" }}>
                <UserIcon size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <input
                  id="register_number"
                  name="register_number"
                  type="number"
                  className="form-input"
                  style={{ paddingLeft: "2.8rem" }}
                  placeholder="Enter numbers only (Ex: 6226222...)"
                  value={formData.register_number}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <div style={{ position: "relative" }}>
                <Briefcase size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: "2.8rem" }}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Department */}
            <div className="form-group">
              <label className="form-label" htmlFor="department_id">Department</label>
              <div style={{ position: "relative" }}>
                <BookOpen size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <select
                  id="department_id"
                  name="department_id"
                  className="form-input"
                  style={{ paddingLeft: "2.8rem", appearance: "none" }}
                  value={formData.department_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments
                    .map((dept) => (
                    <option key={dept.id} value={dept.dept_id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <div style={{ 
                  position: "absolute", 
                  right: "1rem", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  pointerEvents: "none", 
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center"
                }}>
                  <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)", marginRight: "0.5rem" }}></div>
                  <PlusCircle size={16} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/add-department")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px dashed rgba(255, 255, 255, 0.2)",
                  color: "var(--primary)",
                  cursor: "pointer",
                  marginTop: "0.8rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  width: "fit-content",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => e.target.style.background = "rgba(255, 255, 255, 0.1)"}
                onMouseOut={(e) => e.target.style.background = "rgba(255, 255, 255, 0.05)"}
              >
                <PlusCircle size={14} />
                Add Department
              </button>
            </div>

            {/* Date of Birth */}
            <div className="form-group">
              <label className="form-label" htmlFor="dob">Date of Birth</label>
              <div style={{ position: "relative" }}>
                <Calendar size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  className="form-input"
                  style={{ paddingLeft: "2.8rem" }}
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: "2.8rem" }}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="form-group">
              <label className="form-label" htmlFor="mobile">Mobile Number</label>
              <div style={{ position: "relative" }}>
                <Phone size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  className="form-input"
                  style={{ paddingLeft: "2.8rem" }}
                  placeholder="10 digit number"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Year of Joining */}
            <div className="form-group">
              <label className="form-label" htmlFor="year_of_joining">Year of Joining</label>
              <div style={{ position: "relative" }}>
                <Calendar size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <input
                  id="year_of_joining"
                  name="year_of_joining"
                  type="number"
                  className="form-input"
                  style={{ paddingLeft: "2.8rem" }}
                  placeholder="Ex: 2021"
                  value={formData.year_of_joining}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Year of Passing Out */}
            <div className="form-group">
              <label className="form-label" htmlFor="year_of_passing_out">Year of Passing Out</label>
              <div style={{ position: "relative" }}>
                <Calendar size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <input
                  id="year_of_passing_out"
                  name="year_of_passing_out"
                  type="number"
                  className="form-input"
                  style={{ paddingLeft: "2.8rem" }}
                  placeholder="Ex: 2025"
                  value={formData.year_of_passing_out}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  style={{ paddingLeft: "2.8rem" }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div style={{ marginTop: "0.6rem", fontSize: "0.8rem", color: "#000000", background: "rgba(255,255,255,0.15)", padding: "0.6rem 0.9rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", fontWeight: "400" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#000" }}></div>
                  Password must be at least 8 characters.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#000" }}></div>
                  It must include letters, numbers, and symbols.
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="confirm_password">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  style={{ paddingLeft: "2.8rem" }}
                  placeholder="••••••••"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: "100%", marginTop: "2rem", padding: "1rem", fontSize: "1rem", fontWeight: "600", letterSpacing: "0.5px" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <button 
              onClick={() => navigate("/student-login")} 
              style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontWeight: "600", textDecoration: "underline" }}
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentSignup;
