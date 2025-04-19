import React from 'react';
import Button from './Button';

interface NotificationProps {
  show: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ show, message, type, onClose }) => {
  if (!show) return null;

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
      type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <Button 
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          ×
        </Button>
      </div>
    </div>
  );
};

export default Notification; 