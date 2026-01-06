import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import Spinner from "../../components/ui/Spinner";

interface FeedbackForm {
  feedbackType: string;
  subject: string;
  description: string;
}

interface FeedbackItem {
  id: number;
  subject: string;
  description: string;
  feedbackType: { name: string };
  createdAt: string;
}

const Feedback: React.FC = () => {
  const [formData, setFormData] = useState<FeedbackForm>({
    feedbackType: "",
    subject: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [myFeedbacks, setMyFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchMyFeedbacks();
  }, []);

  const fetchMyFeedbacks = async () => {
    try {
      setLoading(true);
      const response: { data: { data: { feedbacks: FeedbackItem[] } } } = await api.get("/feedback");
      if (response.data?.data?.feedbacks) {
        setMyFeedbacks(response.data.data.feedbacks);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.feedbackType || !formData.subject || !formData.description) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/feedback", formData);
      toast.success("Thank you for your feedback! We appreciate your input.");

      // Reset form
      setFormData({
        feedbackType: "",
        subject: "",
        description: "",
      });

      // Refresh feedback list
      fetchMyFeedbacks();
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast.error(error.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeedback = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }

    try {
      await api.delete(`/feedback/${id}`);
      toast.success("Feedback deleted successfully");
      fetchMyFeedbacks();
    } catch (error: any) {
      console.error("Error deleting feedback:", error);
      toast.error(error.response?.data?.message || "Failed to delete feedback");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full p-4 bg-[#EEF5FF] min-h-screen">
      <div className="w-full bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Feedback Form</h2>

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
              placeholder="Enter your feedback details here (minimum 10 characters)..."
              required
            ></textarea>
          </div>

          <div className="flex justify-end w-full">
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>

      {/* My Feedback History */}
      <div className="w-full bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">My Feedback History</h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-indigo-600 bg-primary/10 border border-primary hover:underline"
          >
            {showHistory ? "Hide" : "Show"} History
          </button>
        </div>

        {showHistory && (
          <>
            {loading ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : myFeedbacks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No feedback submitted yet.</p>
            ) : (
              <div className="space-y-4">
                {myFeedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                            {feedback.feedbackType?.name || "General"}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {formatDate(feedback.createdAt)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-800">{feedback.subject}</h3>
                        <p className="text-gray-600 mt-1 text-sm">{feedback.description}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteFeedback(feedback.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Feedback;
