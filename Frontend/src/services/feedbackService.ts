import { toast } from 'react-toastify';
import api from './api';

export interface Feedback {
  id?: number;
  content: string;
  rating: number;
  createdAt: string;
  studentId: number;
  givenBy: {
    id: number;
    name: string;
    role: string;
  };
}

export interface FeedbackFormData {
  content: string;
  rating: number;
  studentId: number;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message: string;
}

class FeedbackService {
  // Get feedbacks for a student
  async getStudentFeedbacks(studentId: number): Promise<Feedback[]> {
    try {
      const response = await api.get<ApiResponse<{ feedbacks: Feedback[] }>>(
        `/feedback/student/${studentId}`
      );
      
      if (response.data.status === 'success') {
        return response.data.data.feedbacks;
      } else {
        throw new Error(response.data.message || 'Failed to fetch feedbacks');
      }
    } catch (error) {
      console.error('Error fetching student feedbacks:', error);
      toast.error('Failed to load feedback data');
      return [];
    }
  }

  // Add a new feedback
  async addFeedback(feedbackData: FeedbackFormData): Promise<Feedback | null> {
    try {
      const response = await api.post<ApiResponse<{ feedback: Feedback }>>(
        '/feedback',
        feedbackData
      );
      
      if (response.data.status === 'success') {
        toast.success('Feedback submitted successfully');
        return response.data.data.feedback;
      } else {
        throw new Error(response.data.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
      return null;
    }
  }

  // Get mock feedbacks (for development/testing)
  getMockFeedbacks(studentId: number): Feedback[] {
    return [
      {
        id: 1,
        content: "Shows great initiative in class discussions.",
        rating: 4,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        studentId,
        givenBy: {
          id: 101,
          name: "Mrs. Sharma",
          role: "TEACHER"
        }
      },
      {
        id: 2,
        content: "Completes homework on time and with good quality.",
        rating: 5,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        studentId,
        givenBy: {
          id: 102,
          name: "Mr. Patel",
          role: "TEACHER"
        }
      }
    ];
  }
}

export const feedbackService = new FeedbackService();
export default feedbackService; 