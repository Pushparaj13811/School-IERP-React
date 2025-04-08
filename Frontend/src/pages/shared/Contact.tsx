import React, { useState } from "react";
import Table from "../../components/ui/Table";

interface Contact_Us {
  teacherName: string;
  role: string;
  phoneNumber: number;
}

const ContactUs: React.FC = () => {
    
  const subjects: Contact_Us[] = [
    {teacherName: "Ramchndra Adhikari", role: "Principal", phoneNumber:9856034391},
    {teacherName: "Madhav Ji Vandari", role: "Vice Principal", phoneNumber:9856034391},
    {teacherName: "Govida Sunar", role: "Science", phoneNumber:9856034391},
    {teacherName: "Jagad Mohan Adhikari", role: "English", phoneNumber:9856034391},
    {teacherName: "Rishi Ram Gautam", role: "Nepali", phoneNumber:9856034391},
    {teacherName: "Devi Paudel", role: "Social", phoneNumber:9856034391},
    {teacherName: "Maya Gurung", role: "Moral", phoneNumber:9856034391},
    {teacherName: "Karna Bahadur Thakali", role: "English", phoneNumber:9856034391},
    {teacherName: "Shanti Karki", role: "Social", phoneNumber:9856034391},
    {teacherName: "Laxman Dhakal", role: "Computer", phoneNumber:9856034391},
    
  ];
  
  const contactDetails = [
    { header: "Teacher Name", accessor: "teacherName", className: "text-start pl-5"},
    { header: "Role", accessor: "role", className: "text-start" },
    { header: "Phone Number", accessor: "phoneNumber" },
   
  ];

  return (
    <div className="w-full p-4 bg-[#EEF5FF]">
      

      <div className="w-full p-6 bg-white rounded-lg shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">Contact Us</h2>        
        
        {/* Contact Us */}
        <div className="w-full mb-6">
          <Table
            columns={contactDetails}
            data={subjects}
            headerBackgroundColor="#292648"
          />
        </div>
      </div>
      <div className="mt-8 ">
      <footer className="w-full bg-[#25234A] text-dark py-2 rounded">
      <div className="p-4 text-center">
        <p className="mb-2 font-bold text-white">Additional School Contact</p>
        <hr />
        <div className="bg-[#E8EFFC] p-5 rounded-md mt-3">
          <p className="mb-3 text-sm ">For Latest News Or Any Query<br />Get In Touch Via</p>
          <div className="flex justify-center gap-6 ">
            <a href="https://www.facebook.com/JanahitJomsom"  target="_blank" className="text-5xl text-blue-600">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="text-5xl text-green-500 ">
              <i className="fab fa-whatsapp"></i>
            </a>
            <a href="#" className="text-5xl text-blue-700">
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
      </div>
    </div>
  );
};

export default ContactUs; 