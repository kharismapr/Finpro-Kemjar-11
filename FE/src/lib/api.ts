const API_URL = 'http://localhost:3000/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
}

export interface Answer {
  id: string;
  userId: string;
  questionId: string;
  answer: string;
  is_correct: boolean;
  score: number;
}

export interface User{
    id: number;
    name: string;
    email: string;
    role: string;
}

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Login failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Connection failed. Please ensure backend is running on port 3000');
      }
      throw error;
    }
  },

  register: async (data: { name: string; email: string; password: string; role: string }) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Registration failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Connection failed. Please ensure backend is running on port 3000');
      }
      throw error;
    }
  },

  logout: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Connection failed');
      }
      throw error;
    }
  },
};

// Quiz API
export const quizAPI = {
  getQuestions: async (token: string): Promise<Question[]> => {
    try {
      const response = await fetch(`${API_URL}/quiz/questions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Connection failed');
      }
      throw error;
    }
  },

  submitAnswer: async (token: string, questionId: number, answer: string) => {
    try {
      const response = await fetch(`${API_URL}/quiz/answers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          answer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Connection failed');
      }
      throw error;
    }
  },

  getMyAnswers: async (token: string): Promise<Answer[]> => {
    try {
      const response = await fetch(`${API_URL}/quiz/my-answers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch answers');
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Connection failed');
      }
      throw error;
    }
  },

  getAllUsers: async (token: string): Promise<User[]> => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Connection failed");
    }
    throw error;
  }
},


};
