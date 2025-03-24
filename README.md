# React School IERP - Janahit Secondary School Management System

A comprehensive Integrated Educational Resource Planning (IERP) solution designed for Janahit Secondary School in Jomsom, Nepal. This modern web application streamlines school administration, enhances communication between stakeholders, and provides a unified platform for educational management.

## 🌟 Features

### User Management
- **Multi-role Access**: Separate interfaces for students, teachers, parents, and administrators
- **Authentication & Authorization**: Secure login with role-based access control
- **Profile Management**: Detailed user profiles with personal information and customization options

### Academic Features
- **Attendance Tracking**: Subject-wise and monthly attendance records
- **Results & Grading**: Comprehensive result management with subject-wise breakdown
- **Course Management**: Curriculum planning and subject administration

### Communication
- **Announcements**: School-wide notification system for important updates
- **Messaging**: Direct communication between teachers, students, and parents

### Administrative Tools
- **Student Records**: Complete student information management
- **Faculty Management**: Teacher profiles, subject allocation, and workload tracking
- **Reporting**: Customizable reports for academic performance and attendance

## 🚀 Technology Stack

### Frontend
- **React**: Component-based UI library for building the user interface
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **TypeScript**: Typed JavaScript for better code quality and developer experience

### Backend
- **Node.js**: JavaScript runtime for server-side code
- **Express**: Web application framework for Node.js
- **MongoDB**: NoSQL database for flexible data storage

### Deployment
- **Docker**: Containerization for consistent deployment
- **AWS/Azure**: Cloud hosting options

## 📚 Project Structure

```
React-School-IERP/
├── Frontend/            # React frontend application
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # Reusable UI components
│       │   ├── common/  # General purpose components
│       │   ├── layout/  # Layout components (PublicLayout, AuthLayout)
│       │   └── ui/      # UI elements (Button, Table, etc.)
│       ├── context/     # React Context providers
│       ├── pages/       # Page components organized by role
│       │   ├── admin/   # Admin-specific pages
│       │   ├── student/ # Student-specific pages
│       │   ├── teacher/ # Teacher-specific pages
│       │   └── parent/  # Parent-specific pages
│       ├── services/    # API services and data fetching
│       ├── utils/       # Utility functions and helpers
│       ├── App.tsx      # Main application component with routing
│       └── index.tsx    # Application entry point
├── Backend/             # Node.js backend application
│   ├── controllers/     # Request handlers
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   └── services/        # Business logic
└── README.md            # Project documentation
```

## 🔧 Getting Started

### Prerequisites
- Node.js (v14.x or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/React-School-IERP.git
cd React-School-IERP
```

2. Install frontend dependencies
```bash
cd Frontend
npm install
```

3. Install backend dependencies
```bash
cd ../Backend
npm install
```

4. Set up environment variables
Create `.env` files in both Frontend and Backend directories with the necessary configuration.

5. Start the development servers
```bash
# In Frontend directory
npm run dev

# In Backend directory
npm run dev
```

6. Access the application
Open your browser and navigate to `http://localhost:3000`

## 🔒 Authentication

The system uses JWT-based authentication with the following demo accounts:

- **Student**: student@example.com / password
- **Teacher**: teacher@example.com / password
- **Admin**: admin@example.com / password
- **Parent**: parent@example.com / password

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile devices

## 🔍 Key Components

### UI Components
- **Table**: Versatile data display with sorting and filtering
- **Button**: Customizable button component with variants
- **DetailsSection**: Structured display of user information
- **Announcement**: School announcements with date and content

### Layout Components
- **PublicLayout**: Layout for unauthenticated users (login page)
- **AuthLayout**: Layout for authenticated users with navigation and user menu
- **ProtectedRoute**: Route wrapper to ensure proper authorization

## 📊 Data Visualization

The system includes various data visualization components for:
- Attendance statistics
- Academic performance trends
- Result analytics

## 🔮 Future Enhancements

- **Mobile App**: Native mobile applications for Android and iOS
- **Online Learning**: Integration of e-learning tools and resources
- **Fee Management**: Comprehensive fee tracking and payment system
- **Library Management**: Digital library catalog and borrowing system
- **Event Calendar**: School event scheduling and notifications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Janahit Secondary School for their collaboration
- All contributors who have helped shape this project
