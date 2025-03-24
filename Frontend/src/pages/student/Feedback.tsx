import React, { useState } from "react";

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

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted feedback:", formData);
    setSubmitted(true);
    
    // Reset form after submission
    setTimeout(() => {
      setFormData({
        feedbackType: "",
        subject: "",
        description: "",
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="w-full p-4 bg-[#EEF5FF]">
      <div className="w-full bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Feedback Form</h2>
        
        {submitted ? (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
            Thank you for your feedback! We appreciate your input.
          </div>
        ) : null}
        
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-3 w-full">
            <label htmlFor="feedbackType" className="block text-gray-700 font-semibold mb-2">
              Feedback Type
            </label>
            <select
              id="feedbackType"
              name="feedbackType"
              value={formData.feedbackType}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select Feedback Type</option>
              <option value="Academic">Academic</option>
              <option value="Teacher">Teacher</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Administrative">Administrative</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="mb-3 w-full">
            <label htmlFor="subject" className="block text-gray-700 font-semibold mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter subject of your feedback"
              required
            />
          </div>
          
          <div className="mb-3 w-full">
            <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
              rows={5}
              placeholder="Enter your feedback details here..."
              required
            ></textarea>
          </div>
          
          <div className="flex justify-end w-full">
            <button
              type="submit"
              className="bg-[#292648] hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback; 