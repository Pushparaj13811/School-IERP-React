import React, { useState } from 'react';

const AddParents: React.FC = () => {
  const [category, setCategory] = useState('Parent');
  const [mobileNumber, setMobileNumber] = useState('');
  const [childName, setChildName] = useState('');
  const [relation, setRelation] = useState('Father');
  const [grade, setGrade] = useState('');
  const [uniqueNo, setUniqueNo] = useState('');
  const [secondChildName, setSecondChildName] = useState('');
  const [secondGrade, setSecondGrade] = useState('');
  const [secondUniqueNo, setSecondUniqueNo] = useState('');
  const [thirdChildName, setThirdChildName] = useState('');
  const [thirdGrade, setThirdGrade] = useState('');
  const [thirdUniqueNo, setThirdUniqueNo] = useState('');
  const [address, setAddress] = useState('');

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 font-bold text-lg">
        Add Parent
      </div>
      
      <div className="p-6 bg-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block font-medium mb-1">CATEGORY</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
            >
              <option value="Parent">Parent</option>
            </select>
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
            <label className="block font-medium mb-1">Mobile Number</label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              placeholder="Enter mobile number"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-1">Relation With The Child</label>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
            >
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Guardian">Guardian</option>
            </select>
          </div>
          
          <div>
            <label className="block font-medium mb-1">Child's Full Name</label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              placeholder="Enter child's full name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              >
                <option value="">Select</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>
            
            <div>
              <label className="block font-medium mb-1">Unique No</label>
              <input
                type="text"
                value={uniqueNo}
                onChange={(e) => setUniqueNo(e.target.value)}
                className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
                placeholder="Enter ID"
              />
            </div>
          </div>
          
          <div>
            <label className="block font-medium mb-1">Second Child's Full Name (If studies)</label>
            <input
              type="text"
              value={secondChildName}
              onChange={(e) => setSecondChildName(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              placeholder="Enter second child's name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Grade</label>
              <select
                value={secondGrade}
                onChange={(e) => setSecondGrade(e.target.value)}
                className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              >
                <option value="">Select</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>
            
            <div>
              <label className="block font-medium mb-1">Unique No</label>
              <input
                type="text"
                value={secondUniqueNo}
                onChange={(e) => setSecondUniqueNo(e.target.value)}
                className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
                placeholder="Enter ID"
              />
            </div>
          </div>
          
          <div>
            <label className="block font-medium mb-1">Second Child's Full Name (If studies)</label>
            <input
              type="text"
              value={thirdChildName}
              onChange={(e) => setThirdChildName(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              placeholder="Enter third child's name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Grade</label>
              <select
                value={thirdGrade}
                onChange={(e) => setThirdGrade(e.target.value)}
                className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              >
                <option value="">Select</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>
            
            <div>
              <label className="block font-medium mb-1">Unique No</label>
              <input
                type="text"
                value={thirdUniqueNo}
                onChange={(e) => setThirdUniqueNo(e.target.value)}
                className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
                placeholder="Enter ID"
              />
            </div>
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
        
        <div className="flex justify-end mt-8">
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

export default AddParents; 