import React from 'react';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  onClick?: () => void;
}
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => {
  return (
    <div 
      className="overflow-hidden rounded-md shadow-sm cursor-pointer" 
      onClick={onClick}
    >
      <div className={`flex items-center justify-between p-4 ${color}`}>
        <div className="flex-1">
          <div className="text-xs text-white">{title}</div>
          <div className="text-3xl font-bold text-white">{value}</div>
        </div>
        <div className="text-4xl text-white">
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
    </div>
  );
};

interface StudentDetailProps {
  label: string;
  value: string;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ label, value }) => {
  return (
    <div className="flex py-2 border-b border-gray-200">
      <div className="w-1/3 text-gray-600">{label}</div>
      <div className="w-2/3 text-gray-800">{value}</div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const navigateProfileSection = () => {
    navigate('/profile');
  };
  const navigateToAnnoucementPage = () =>{
    navigate('/announcements')
  };
  
  // Student details data
  const studentDetails = [
    { label: 'Student No.', value: '22SOECE11630' },
    { label: 'Name', value: 'Ruchi Pathak' },
    { label: 'Gender', value: 'Female' },
    { label: "Father's Name", value: 'Kiran Pathak' },
    { label: "Mother's Name", value: 'Sarina Pathak' },
    { label: 'Date of Birth', value: '2002-04-01' },
    { label: 'DOB No.', value: '772227272' },
    { label: 'Class', value: '7' },
    { label: 'Section', value: 'A' },
    { label: 'Roll No.', value: '47' },
    { label: 'Permanent Address', value: 'घरपझोङ-३ मुस्ताङ नेपाल' },
    { label: 'संपर्क नं', value: '९८०९५८०५३०' },
  ];

  // Announcements data
  const announcements = [
    {
      id: 1,
      date: '20th Ashwin 2081',
      title: 'Exam Announcement!',
      content: 'We are excited to announce you that your Second Terminal Exam about to start from 21st of Ashwin to 5th of Kartik so do check the...'
    },
    {
      id: 2,
      date: '20th Ashwin 2081',
      title: 'Exam Announcement!',
      content: 'We are excited to announce you that your Second Terminal Exam about to start from 21st of Ashwin to 5th of Kartik so do check the...'
    }
  ];

  return (
    <div className="p-4 bg-[#EEF5FF]">
      {/* User welcome section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Ruchi Pathak <span className="font-normal">Welcome</span></h2>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 mb-6 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          title="Exam Result"
          value="01"
          icon="bi-clipboard-data"
          color="bg-[#62C25E]"
          onClick={() => navigate('/result')}
        />
        <StatCard
          title="Monthwise Attendence"
          value="66%"
          icon="bi-calendar-check"
          color="bg-[#AA9839]"
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          title="Holidays"
          value="15"
          icon="bi-calendar-event"
          color="bg-[#5096FF]"
          onClick={() => navigate('/holiday')}
        />
        <StatCard
          title="Achievements"
          value="05"
          icon="bi-trophy"
          color="bg-[#5E479B]"
          onClick={() => navigate('/achievement')}
        />
      </div>

      {/* Student details and announcements */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Student details */}
        <div className="p-6 bg-white rounded-lg shadow-sm md:col-span-7">
          <h3 className="mb-4 text-xl font-bold">My Details</h3>
          <hr className="mb-4" />

          <div className="flex mb-6">
            <div className="mr-6">
              <div className="overflow-hidden border-4 border-blue-100 rounded-full cursor-pointer w-36 h-36" onClick={navigateProfileSection}>
                <img
                  src="https://cdn.pixabay.com/photo/2015/06/22/08/40/child-817373_640.jpg"
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex justify-center mt-4 space-x-2">
                <button className="bg-[#292648] text-white px-4 py-2 rounded text-sm">Edit</button>
                <button className="bg-[#292648] text-white px-4 py-2 rounded text-sm">Download</button>
              </div>
            </div>

            <div className="flex-1">
              {studentDetails.slice(0, 6).map((detail, index) => (
                <StudentDetail key={index} label={detail.label} value={detail.value} />
              ))}
            </div>

            <div className="flex-1">
              {studentDetails.slice(6, 12).map((detail, index) => (
                <StudentDetail key={index} label={detail.label} value={detail.value} />
              ))}
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="p-6 bg-white rounded-lg shadow-sm md:col-span-5">
          <h3 className="mb-4 text-xl font-bold">Announcements</h3>
          <hr className="mb-4" />

          <div className="space-y-6">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="mb-4">
                <div className="text-xs text-gray-500">{announcement.date}</div>
                <div className="flex items-center mt-1">
                  <span className="font-semibold text-gray-700">📢 {announcement.title}</span>
                  <span className="ml-2 text-xs text-blue-500">📄</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{announcement.content}</p>
                <div className="mt-2 text-right">
                  <button className="text-sm text-white bg-[#292648]" onClick={navigateToAnnoucementPage} >View More</button>
                </div>
                <hr className="mt-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 