import React, { useState } from "react";
interface LeaveApplicationData {
  leaveType: string;
  subject: string;
  fromDate: string;
  toDate: string;
  description: string;
}

const LeaveApplication: React.FC = () => {
  const [formData, setFormData] = useState<LeaveApplicationData>({
    leaveType: "",
    subject: "",
    fromDate: "",
    toDate: "",
    description: "",
  });

  const [applications, setApplications] = useState<LeaveApplicationData[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplications([...applications, formData]);
    setFormData({ leaveType: "", subject: "", fromDate: "", toDate: "", description: "" });
  };
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplicationData | null>(null);

  // Function to open the modal with the selected application data
  const openModal = (application: LeaveApplicationData) => {
    setSelectedApplication(application);
  };

  // Function to close the modal
  const closeModal = () => {
    setSelectedApplication(null);
  };
  return (
    <>
    <div className="container-fluid  bg-light mb-5 text-start  rounded shadow-md" >
      <div className="leave_application_form p-3 d-flex flex-column justify-content-start">
      <h1 className="text-dark fw-bold fs-4">Leave Application</h1>
      <hr className="border border-secondary border-1 mb-4 w-100" />

      <div className="container p-3 shadow-sm rounded bg-white bg-opacity-75" style={{ width: "75vw" }}>
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="form-group col-md-6">
              <label className="fw-bold text-dark">Leave Type:</label>
              <select className="form-control rounded" name="leaveType" value={formData.leaveType} onChange={handleChange}>
                <option value="">Select Leave Type</option>
                <option value="sick">Sick Leave</option>
                <option value="vacation">Vacation Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group col-md-6">
              <label className="fw-bold text-dark">Subject:</label>
              <input type="text" className="form-control rounded" name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} />
            </div>
          </div>

          <div className="row mb-3">
            <div className="form-group col-md-6">
              <label className="fw-bold text-dark">From:</label>
              <input type="date" className="form-control rounded" name="fromDate" value={formData.fromDate} onChange={handleChange} />
            </div>

            <div className="form-group col-md-6">
              <label className="fw-bold text-dark">To:</label>
              <input type="date" className="form-control rounded" name="toDate" value={formData.toDate} onChange={handleChange} />
            </div>
          </div>

          <div className="row mb-3">
            <div className="form-group col-md-12">
              <label className="fw-bold text-dark">Description:</label>
              <textarea className="form-control rounded" name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <button type="submit" className="btn text-white px-3" style={{ backgroundColor: "#292648" }}>
              Submit Application
            </button>
          </div>
        </form>
      </div>

      <div className="mt-4 w-100">
        <div className="row">
          {applications.map((app, index) => (
            <div key={index} className="col-md-6 col-12 mb-3">
              <div className="card shadow-sm p-0 bg-white rounded leave-card" >
                <div className="card-header l primary-bg-color text-white fw-bold text-start ">{app.subject}</div>
                <div className="card-body d-flex flex-column justify-content-center p-2 secondary-bg-color leave-body-card">
                  <div className="leave-description h-75 w-md-75 mb-1">
                    <p className="card-text">{app.description}</p>
                  </div>
                  <div className="d-flex flex-row justify-content-end">
                    <button className="btn primary-bg-color text-light" onClick={() => openModal(app)} >ViewMore</button>
                  </div>
                </div>
              </div>
                  
            </div>
          ))}
        </div>
      </div>
      {/* Modal for displaying full leave details */}
      {selectedApplication && (
        <div className="modal show d-block " tabIndex={-1} >
          <div className="modal-dialog ">
            <div className="modal-content ">
              <div className="modal-header"  >
                <h5 className="modal-title fw-bold primary-color text-uppercase"  >{selectedApplication.leaveType} Leave</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <h6 className="fw-bold fs-5 primary-color">{selectedApplication.subject}</h6>
                <p><strong>From:</strong> {selectedApplication.fromDate} <strong>To:</strong> {selectedApplication.toDate}</p>
                <p>{selectedApplication.description}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-dark primary-bg-color text-light" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
      </div>
  </>
  );
};

export default LeaveApplication;
