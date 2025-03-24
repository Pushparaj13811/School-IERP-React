import React, { useState } from 'react';
import { FaCamera } from 'react-icons/fa';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock admin data - in a real application, this would come from API
  const [adminData, setAdminData] = useState({
    name: 'John Doe',
    email: 'admin@example.com',
    role: 'Administrator',
    phone: '+977 9801234567',
    address: 'Kathmandu, Nepal',
    dateOfBirth: '1985-06-15',
    joinDate: '2020-01-15',
    emergencyContact: '+977 9812345678',
    bio: 'Experienced educational administrator with over 10 years in school management systems.'
  });

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // In a real app, this would send data to an API
    setIsEditing(false);
    // Show success message
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdminData({
      ...adminData,
      [name]: value
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 font-bold text-lg flex justify-between items-center">
        <span>My Profile</span>
        <button
          onClick={handleEditToggle}
          className="px-4 py-1.5 text-sm bg-[#1e1c39] text-white rounded"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row">
          {/* Profile Picture Section */}
          <div className="w-full md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
            <div className="relative">
              <div className="w-48 h-48 rounded-full bg-gray-200 overflow-hidden">
                <img 
                  src="https://via.placeholder.com/300" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && (
                <div className="absolute bottom-2 right-2 bg-[#1e1c39] p-2 rounded-full text-white cursor-pointer hover:bg-opacity-80">
                  <FaCamera />
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold">{adminData.name}</h3>
              <p className="text-gray-500">{adminData.role}</p>
            </div>
          </div>
          
          {/* Profile Details */}
          <div className="w-full md:w-2/3 md:pl-8">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={adminData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                ) : (
                  <p className="text-gray-800">{adminData.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={adminData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                ) : (
                  <p className="text-gray-800">{adminData.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={adminData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                ) : (
                  <p className="text-gray-800">{adminData.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={adminData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                ) : (
                  <p className="text-gray-800">{adminData.dateOfBirth}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Emergency Contact</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="emergencyContact"
                    value={adminData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                ) : (
                  <p className="text-gray-800">{adminData.emergencyContact}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Join Date</label>
                <p className="text-gray-800">{adminData.joinDate}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-1">Address</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={adminData.address}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              ) : (
                <p className="text-gray-800">{adminData.address}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Bio</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={adminData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              ) : (
                <p className="text-gray-800">{adminData.bio}</p>
              )}
            </div>
            
            {isEditing && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-[#1e1c39] text-white rounded"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 