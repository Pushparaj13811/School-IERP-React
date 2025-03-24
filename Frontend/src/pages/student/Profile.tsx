import React from "react";
import DetailsSection from "../../components/common/DetailsSection";
import Button from "../../components/ui/Button";

const Profile: React.FC = () => {
  const user = {
    name: "Rushi Pathak",
    role: "Student",
    imageUrl: "https://cdn.pixabay.com/photo/2015/06/22/08/40/child-817373_640.jpg",
  };

  const personalDetails = [
    { label: "Name", value: "Abhishek Khadkathoki" },
    { label: "As Per Birth Certificate", value: "Abhishek Khadkathoki" },
    { label: "Father's Name", value: "Tilak Bahadur B.K" },
    { label: "Mother's Name", value: "Sundevi Rasaili" },
    { label: "Gender", value: "Male" },
    { label: "Date of Birth", value: "16-12-2002" },
    { label: "DOB No", value: "772227272" },
    { label: "Blood Group", value: "B+" },
    { label: "Nationality", value: "Nepali" },
    { label: "Religion", value: "Hindu" },
  ];
  
  const addressDetails = [
    { label: "Address Line 1", value: "Thasang-3, Lete, Nepal" },
    { label: "Address Line 2", value: "Gharapjhong-3, Mustang, Nepal" },
    { label: "State/Province", value: "Gandaki" },
    { label: "Municipality", value: "Gharapjhong" },
    { label: "Ward No.", value: "3" },
    { label: "Town/City", value: "Shyang" },
    { label: "Pincode", value: "36200" },
    { label: "Country", value: "Nepal" },
    { label: "Permanent Address", value: "Thasang-3 Lete, Nepal" },
    { label: "Current Address", value: "Gharapjhong-3 Mustang, Nepal" },
  ];

  return (
    <div className="w-full p-4 bg-[#EEF5FF]">
      <div className="w-full bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          {/* Profile Picture & Download Button */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="relative mb-4">
                <img
                  className="rounded-full border-4 border-blue-400 shadow-md"
                  src={user.imageUrl}
                  alt="Profile"
                  width={150}
                  height={150}
                />
                <div className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full border-2 border-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-1">{user.name}</h4>
              <p className="text-gray-600 font-medium mb-4">{user.role}</p>
              <Button className="w-full mb-2" variant="primary">
                Download Profile
              </Button>
              <Button className="w-full" variant="outline">
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Personal Details */}
          <div className="lg:col-span-9">
            <DetailsSection title="Personal Details" details={personalDetails} />
          </div>
          
          {/* Address Details */}
          <div className="lg:col-span-12">
            <DetailsSection title="Address" details={addressDetails} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 