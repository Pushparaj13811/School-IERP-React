import React from 'react';
import Button from '../ui/Button';

interface ProfileDetail {
  label: string;
  value: string;
}

interface ProfileSectionProps {
  details: ProfileDetail[];
  profileImage: string;
  onEdit?: () => void;
  onPrint?: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ 
  details, 
  profileImage, 
  onEdit, 
  onPrint 
}) => {
  return (
    <div className="shadow-sm p-4 rounded bg-white w-full h-full">
      <h2 className="text-xl font-bold heading-font">My Details</h2>
      <hr className="border border-gray-300 mb-3 w-full" />
      
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 lg:w-1/4 flex flex-col items-center mb-4 md:mb-0">
          <img 
            className="mb-3 rounded-full border-4 border-blue-500 w-3/4" 
            alt="Profile" 
            src={profileImage} 
          />
          <div className="flex justify-around w-full">
            <Button 
              variant="primary" 
              className="px-3"
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button 
              variant="primary" 
              className="px-3"
              onClick={onPrint}
            >
              Print
            </Button>
          </div>
        </div>
        
        <div className="md:w-2/3 lg:w-3/4">
          <table className="w-full">
            <tbody>
              {details.map((detail, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <th className="py-2 text-left font-medium">{detail.label}:</th>
                  <td className="py-2">{detail.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection; 