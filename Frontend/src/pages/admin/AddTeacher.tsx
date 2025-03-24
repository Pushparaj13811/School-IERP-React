import React, { useState } from 'react';

const AddTeacher: React.FC = () => {
  const [category] = useState('Teacher');
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [wardNo, setWardNo] = useState('');
  const [subjectAssigned, setSubjectAssigned] = useState('');
  const [gradeAssigned, setGradeAssigned] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [address, setAddress] = useState('');

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 font-bold text-lg">
        Add Teacher
      </div>
      
      <div className="p-6 bg-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block font-medium mb-1">CATEGORY</label>
            <input
              type="text"
              value={category}
              readOnly
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-1">Employee Id</label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              placeholder="Enter employee id"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-1">Designation/Role</label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              placeholder="Enter designation/role"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-1">Employee Id</label>
            <input
              type="text"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              placeholder="Enter employee code"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-1">District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
            >
              <option value="">Select district</option>
              <option value="mustang">Mustang</option>
              <option value="kaski">Kaski</option>
              <option value="myagdi">Myagdi</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">State/Province</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
                placeholder="Enter state/province"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">Ward No</label>
              <input
                type="text"
                value={wardNo}
                onChange={(e) => setWardNo(e.target.value)}
                className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
                placeholder="Enter ward no"
              />
            </div>
          </div>
          
          <div>
            <label className="block font-medium mb-1">Subject Assigned</label>
            <select
              value={subjectAssigned}
              onChange={(e) => setSubjectAssigned(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
            >
              <option value="">Select subject</option>
              <option value="mathematics">Mathematics</option>
              <option value="science">Science</option>
              <option value="english">English</option>
              <option value="social">Social Studies</option>
              <option value="nepali">Nepali</option>
            </select>
          </div>
          
          <div>
            <label className="block font-medium mb-1">Grade Assigned</label>
            <input
              type="text"
              value={gradeAssigned}
              onChange={(e) => setGradeAssigned(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              placeholder="Enter assigned grades"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-1">Emergency Contact No</label>
            <input
              type="tel"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              placeholder="Enter emergency contact"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-1">Upload a Password size Photograph</label>
            <button
              type="button"
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded text-gray-500 text-left"
            >
              Select a photo
            </button>
          </div>
        </div>
        
        <div className="mt-5">
          <label className="block font-medium mb-1">Address (Municipal-Ward No/City/District)</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
            placeholder="Enter full address"
          />
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            type="button"
            className="px-12 py-2 bg-gray-300 text-gray-700 font-medium rounded"
          >
            Back
          </button>
          
          <button
            type="button"
            className="px-12 py-2 bg-[#1e1c39] text-white font-medium rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTeacher; 