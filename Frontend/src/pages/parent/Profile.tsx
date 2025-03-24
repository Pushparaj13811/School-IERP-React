import React from 'react';

const ParentProfile: React.FC = () => {
  // Mock data - replace with actual API data
  const parentData = {
    personalDetails: {
      fullName: 'KIRAN PATHAK',
      spouseName: 'Sarina Pathak',
      gender: 'Male',
      dateOfBirth: '2002-04-01',
      bloodGroup: 'B+',
      nationality: 'Nepali',
      religion: 'Hindu',
      childName: 'Ruchi Pathak',
      dobNo: '772227272'
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
    },
    professionDetails: {
      profession: 'Business',
      spouseProfession: 'Business',
      annualIncome: '1200000',
      officeAddress: 'Thasang-3, Lete, Nepal',
      officeContact: '97747367940'
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
                  src="/default-parent-avatar.png"
                  alt="Parent"
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-semibold">{parentData.personalDetails.fullName}</h2>
              <p className="text-gray-600">Parent</p>
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
                    <p className="font-medium">{parentData.personalDetails.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Spouse Name</p>
                    <p className="font-medium">{parentData.personalDetails.spouseName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Gender</p>
                    <p className="font-medium">{parentData.personalDetails.gender}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Date of Birth</p>
                    <p className="font-medium">{parentData.personalDetails.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Blood Group</p>
                    <p className="font-medium">{parentData.personalDetails.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Nationality</p>
                    <p className="font-medium">{parentData.personalDetails.nationality}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Religion</p>
                    <p className="font-medium">{parentData.personalDetails.religion}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Child's Name</p>
                    <p className="font-medium">{parentData.personalDetails.childName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">DOB No.</p>
                    <p className="font-medium">{parentData.personalDetails.dobNo}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Address</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 mb-1">Address Line 1</p>
                    <p className="font-medium">{parentData.address.addressLine1}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Address Line 2</p>
                    <p className="font-medium">{parentData.address.addressLine2}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">State/Province</p>
                    <p className="font-medium">{parentData.address.state}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Municipality</p>
                    <p className="font-medium">{parentData.address.municipality}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Ward No.</p>
                    <p className="font-medium">{parentData.address.wardNo}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Town/City</p>
                    <p className="font-medium">{parentData.address.city}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Country</p>
                    <p className="font-medium">{parentData.address.country}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Pincode</p>
                    <p className="font-medium">{parentData.address.pincode}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Permanent Address</p>
                    <p className="font-medium">{parentData.address.permanentAddress}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Current Address</p>
                    <p className="font-medium">{parentData.address.currentAddress}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Profession Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 mb-1">Profession</p>
                    <p className="font-medium">{parentData.professionDetails.profession}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Spouse's Profession</p>
                    <p className="font-medium">{parentData.professionDetails.spouseProfession}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Annual Income</p>
                    <p className="font-medium">{parentData.professionDetails.annualIncome}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Office Address</p>
                    <p className="font-medium">{parentData.professionDetails.officeAddress}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Office Contact</p>
                    <p className="font-medium">{parentData.professionDetails.officeContact}</p>
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

export default ParentProfile; 