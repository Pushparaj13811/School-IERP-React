import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

interface FeedbackForm {
  feedbackType: string;
  subject: string;
  description: string;
}

const Feedback: React.FC = () => {
  const [formData, setFormData] = useState<FeedbackForm>({
    feedbackType: "",
    subject: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Feedback Submitted:", formData);
    alert("Feedback submitted successfully!");
    setFormData({ feedbackType: "", subject: "", description: "" });
  };

  return (
    <div className="container-fluid py-4 d-flex justify-content-center text-start" style={{width:"75vw"}}>
      <div className="container p-5 shadow-lg rounded bg-white" style={{ width: "100%" }}>
        <h2 className="fw-bold text-start mb-4">Feedback</h2>
        <hr />

        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            {/* Feedback Type Dropdown */}
            <div className="form-group col-md-6 ">
              <label htmlFor="feedbackType" className="fw-bold">Feedback Type:</label>
              <select
                className="form-control form-control-lg shadow-sm rounded fs-6"
                id="feedbackType"
                name="feedbackType"
                value={formData.feedbackType}
                onChange={handleChange}
              >
                <option value="">Select Feedback Type</option>
                <option value="teachers">Teachers</option>
                <option value="management">Management</option>
                <option value="school">School</option>
                <option value="academics">Academics</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Subject Input */}
            <div className="form-group col-md-6 ">
              <label htmlFor="subject" className="fw-bold">Subject:</label>
              <input
                type="text"
                className="form-control form-control-lg shadow-sm rounded fs-6"
                id="subject"
                name="subject"
                placeholder="Enter subject"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div className="mb-3">
            <label htmlFor="description" className="fw-bold fs-6">Description:</label>
            <textarea
              className="form-control form-control-lg shadow-sm rounded fs-6"
              id="description"
              name="description"
              placeholder="Enter your feedback..."
              rows={4}
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="d-flex justify-content-end">
            <button type="submit" className="btn text-white px-4 py-2 fs-5" style={{ backgroundColor: "#292648" }}>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Feedback;