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
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center w-48">
              <div className="w-32 h-32 mb-4 overflow-hidden bg-blue-100 rounded-full">
                <img
                  src="/default-parent-avatar.png"
                  alt="Parent"
                  className="object-cover w-100 h-100"
                />
              </div>
              <h2 className="text-xl font-semibold">{parentData.personalDetails.fullName}</h2>
              <p className="text-gray-600">Parent</p>
              <div className="mt-4 space-y-2">
                <button className="w-full px-4 py-2 bg-[#292648] text-white rounded-md ">
                  Download Pdf
                </button>
                <button className="w-full px-4 py-2 border bg-[#292648] text-white rounded-md">
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-6">
                <h3 className="pb-2 mb-4 text-lg font-semibold border-b">Personal Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="mb-1 text-gray-600">Full Name</p>
                    <p className="font-medium">{parentData.personalDetails.fullName}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Spouse Name</p>
                    <p className="font-medium">{parentData.personalDetails.spouseName}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Gender</p>
                    <p className="font-medium">{parentData.personalDetails.gender}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Date of Birth</p>
                    <p className="font-medium">{parentData.personalDetails.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Blood Group</p>
                    <p className="font-medium">{parentData.personalDetails.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Nationality</p>
                    <p className="font-medium">{parentData.personalDetails.nationality}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Religion</p>
                    <p className="font-medium">{parentData.personalDetails.religion}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Child's Name</p>
                    <p className="font-medium">{parentData.personalDetails.childName}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">DOB No.</p>
                    <p className="font-medium">{parentData.personalDetails.dobNo}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="pb-2 mb-4 text-lg font-semibold border-b">Address</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="mb-1 text-gray-600">Address Line 1</p>
                    <p className="font-medium">{parentData.address.addressLine1}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Address Line 2</p>
                    <p className="font-medium">{parentData.address.addressLine2}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">State/Province</p>
                    <p className="font-medium">{parentData.address.state}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Municipality</p>
                    <p className="font-medium">{parentData.address.municipality}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Ward No.</p>
                    <p className="font-medium">{parentData.address.wardNo}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Town/City</p>
                    <p className="font-medium">{parentData.address.city}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Country</p>
                    <p className="font-medium">{parentData.address.country}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Pincode</p>
                    <p className="font-medium">{parentData.address.pincode}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Permanent Address</p>
                    <p className="font-medium">{parentData.address.permanentAddress}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Current Address</p>
                    <p className="font-medium">{parentData.address.currentAddress}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="pb-2 mb-4 text-lg font-semibold border-b">Profession Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="mb-1 text-gray-600">Profession</p>
                    <p className="font-medium">{parentData.professionDetails.profession}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Spouse's Profession</p>
                    <p className="font-medium">{parentData.professionDetails.spouseProfession}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Annual Income</p>
                    <p className="font-medium">{parentData.professionDetails.annualIncome}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Office Address</p>
                    <p className="font-medium">{parentData.professionDetails.officeAddress}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Office Contact</p>
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