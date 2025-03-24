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
    <div className="container p-3 flex flex-col justify-center items-start bg-gray-100 mt-5 w-[100vw]">
      <h1 className="text-gray-900 font-bold text-2xl">Profile</h1>
      <hr className="border-2 border-gray-800 mb-3 w-full" />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 w-full">
        {/* Profile Picture & Download Button */}
        <div className="lg:col-span-3">
          <div className="flex flex-col justify-start items-center bg-white p-4 rounded shadow-sm">
            <img
              className="rounded-full border-4 border-blue-400 shadow mb-3"
              src={user.imageUrl}
              alt="Profile"
              width={170}
              height={170}
            />
            <h4 className="text-gray-900 font-bold text-center">{user.name}</h4>
            <p className="text-gray-500 text-center font-bold">{user.role}</p>
            <Button className="w-full" variant="primary">
              Download PDF
            </Button>
          </div>
        </div>

        {/* Personal Details */}
        <div className="lg:col-span-9">
          <DetailsSection title="Personal Details" details={personalDetails} />
        </div>
        
        <div className="lg:col-span-3"></div>
        
        {/* Address */}
        <div className="lg:col-span-9">
          <DetailsSection title="Address" details={addressDetails} />
        </div>
      </div>
    </div>
  );
};

export default Profile; 