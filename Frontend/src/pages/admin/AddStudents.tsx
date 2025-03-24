import React, { useState } from 'react';

const AddStudents: React.FC = () => {
  const [category] = useState('Student');
  const [grade, setGrade] = useState('');
  const [dob, setDob] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [wardNo, setWardNo] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 font-bold text-lg">
        Add Student
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
            <label className="block font-medium mb-1">Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
            >
              <option value="">Select Grade</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
              <option value="6">Grade 6</option>
              <option value="7">Grade 7</option>
              <option value="8">Grade 8</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
            </select>
          </div>
          
          <div>
            <label className="block font-medium mb-1">DOB</label>
            <input
              type="text"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              placeholder="dd/mm/yyyy"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-1">Parents/Guardians Contact No</label>
            <input
              type="tel"
              value={parentContact}
              onChange={(e) => setParentContact(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              placeholder="Enter contact number"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-1">Emergency Contact Number</label>
            <select
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Municipality</label>
              <input
                type="text"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
                placeholder="Enter municipality"
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
        </div>
        
        <div className="mt-5">
          <label className="block font-medium mb-1">Address (/Municipal-Ward No/City/District)</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
            placeholder="Enter full address"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <div>
            <label className="block font-medium mb-1">City/Town</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              placeholder="Enter city/town"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-1">Province/State</label>
            <input
              type="text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              placeholder="Enter province/state"
            />
          </div>
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

export default AddStudents; 