import React, { useState } from 'react';

const CreateAnnouncement: React.FC = () => {
  const [eventFor, setEventFor] = useState('Student');
  const [eventName, setEventName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 font-bold text-lg">
        Add Announcements
      </div>
      
      <div className="p-6 bg-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block font-medium mb-1">Event For</label>
            <input
              type="text"
              value={eventFor}
              onChange={(e) => setEventFor(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              placeholder="Student"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-1">Event Name</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              placeholder="Enter event name"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-1">From (Date)</label>
            <input
              type="text"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              placeholder="Enter start date"
            />
          </div>
          
          <div>
            <label className="block font-medium mb-1">To (Date)</label>
            <input
              type="text"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
              placeholder="Enter end date"
            />
          </div>
        </div>
        
        <div className="mt-5">
          <label className="block font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
            placeholder="Enter announcement description"
            rows={6}
          ></textarea>
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

export default CreateAnnouncement; 