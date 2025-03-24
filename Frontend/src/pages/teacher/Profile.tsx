import React from 'react';

const TeacherProfile: React.FC = () => {
  // Mock data - replace with actual API data
  const teacherData = {
    personalDetails: {
      fullName: 'Ruchi Pathak',
      employeeId: 'EMP001',
      gender: 'Female',
      dateOfBirth: '1990-05-15',
      bloodGroup: 'B+',
      nationality: 'Nepali',
      religion: 'Hindu',
      subject: 'Science',
      designation: 'Senior Teacher',
      joiningDate: '2020-01-15',
      employeeCode: 'T2020001'
    },
    address: {
      addressLine1: 'Thasang-3, Lete, Nepal',
      addressLine2: 'Gharapjhong-3, Mustang, Nepal',
      state: 'Gandaki',
      municipality: 'Gharapjhong',
      wardNo: '3',
      city: 'Shyang',
      country: 'Nepal',
      pincode: '36200',
      permanentAddress: 'Thasang-3, Lete, Nepal',
      currentAddress: 'Gharapjhong-3, Mustang, Nepal'
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start gap-6">
            <div className="w-48 flex flex-col items-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full mb-4 overflow-hidden">
                <img
                  src="/default-teacher-avatar.png"
                  alt="Teacher"
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-semibold">{teacherData.personalDetails.fullName}</h2>
              <p className="text-gray-600">Teacher</p>
              <div className="mt-4 space-y-2">
                <button className="w-full bg-indigo-900 text-white px-4 py-2 rounded-md hover:bg-indigo-800">
                  Download Pdf
                </button>
                <button className="w-full border border-indigo-900 text-indigo-900 px-4 py-2 rounded-md hover:bg-indigo-50">
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-6">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Personal Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 mb-1">Full Name</p>
                    <p className="font-medium">{teacherData.personalDetails.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Employee ID</p>
                    <p className="font-medium">{teacherData.personalDetails.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Gender</p>
                    <p className="font-medium">{teacherData.personalDetails.gender}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Date of Birth</p>
                    <p className="font-medium">{teacherData.personalDetails.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Blood Group</p>
                    <p className="font-medium">{teacherData.personalDetails.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Nationality</p>
                    <p className="font-medium">{teacherData.personalDetails.nationality}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Religion</p>
                    <p className="font-medium">{teacherData.personalDetails.religion}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Subject</p>
                    <p className="font-medium">{teacherData.personalDetails.subject}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Designation</p>
                    <p className="font-medium">{teacherData.personalDetails.designation}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Joining Date</p>
                    <p className="font-medium">{teacherData.personalDetails.joiningDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Employee Code</p>
                    <p className="font-medium">{teacherData.personalDetails.employeeCode}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Address</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 mb-1">Address Line 1</p>
                    <p className="font-medium">{teacherData.address.addressLine1}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Address Line 2</p>
                    <p className="font-medium">{teacherData.address.addressLine2}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">State/Province</p>
                    <p className="font-medium">{teacherData.address.state}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Municipality</p>
                    <p className="font-medium">{teacherData.address.municipality}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Ward No.</p>
                    <p className="font-medium">{teacherData.address.wardNo}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Town/City</p>
                    <p className="font-medium">{teacherData.address.city}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Country</p>
                    <p className="font-medium">{teacherData.address.country}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Pincode</p>
                    <p className="font-medium">{teacherData.address.pincode}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Permanent Address</p>
                    <p className="font-medium">{teacherData.address.permanentAddress}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Current Address</p>
                    <p className="font-medium">{teacherData.address.currentAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile; 