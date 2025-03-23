import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Profile: React.FC = () => {
  const user = {
    name: "Rushi Pathak",
    role: "Student",
    imageUrl:
      "https://cdn.pixabay.com/photo/2015/06/22/08/40/child-817373_640.jpg",
  };

  const personalDetails = [
    { label: "Name", value: "Abhishek Khadkathoki" },
    { label: "As Per Birth Certificate ", value: "Abhishek Khadkathoki" },
    { label: "Father’s Name", value: "Tilak Bahadur B.K" },
    { label: "Mother’s Name ", value: "Sundevi Rasaili" },
    { label: "Gender", value: "Male" },
    { label: "Date of Birth", value: "16-12-2002 " },
    { label: "DOB No", value: "772227272" },
    { label: "Blood Group", value: "B+" },
    { label: "Nationality", value: "Nepali" },

    { label: "Relegion", value: "Hindu" },

  ];
  const Address = [
    { label: "Address Line 1", value: "Thasang-3, Lete, Nepal" },
    { label: "Address Line 2 ", value: "Gharapjhong-3, Mustang, Nepal" },
    { label: "State/Province", value: "Gandaki" },
    { label: "Municipalality ", value: "Gharapjhong" },
    { label: "Ward No.", value: "3" },
    { label: "Town/City", value: "Shyang " },
    { label: "Pincode", value: "36200" },
    { label: "Country", value: "Nepal" },
    { label: "Permanent Address", value: "Thasang-3 Lete, Nepal" },
    { label: "Current Address", value: "Gharapjhong-3 Mustang, Nepal" },

  ];

  return (
    <div className="container p-3 d-flex flex-column justify-content-center align-items-start bg-light mt-5" style={{width:"100vw"}} >
      <h1 className="text-dark fw-bold fs-2">Profile</h1>
      <hr className="border border-dark border-2 mb-3 w-100" />
      <div className="row w-100">
        {/* Profile Picture & Download Button */}
        <div className="col-12 col-lg-3 mb-3">
          <div className="d-flex flex-column justify-content-start align-items-center bg-white p-4 rounded shadow-sm">
            <img
              className="rounded-circle border border-4 border-info shadow mb-3"
              src={user.imageUrl}
              alt="Profile"
              width={170}
              height={170}
            />
            <h4 className="text-dark fw-bold text-center">{user.name}</h4>
            <p className="text-muted text-center fw-bold">{user.role}</p>
            <button className="btn text-white w-100" style={{ backgroundColor: "#292648" }}>
              Download PDF
            </button>
          </div>
        </div>

        {/* Personal Details */}
        <div className="col-12 col-lg-9 mb-3">
          <div className="p-4 shadow-sm bg-white rounded text-start">
            <h2 className="text-dark fw-bold fs-4 ">Personal Details</h2>
            <hr className="border border-dark border-1 mb-4" />
            <div className="row p-3">
              {personalDetails.map((detail, index) => (
                <div key={index} className="col-12 col-md-6 d-flex">
                  <strong className="col-4 text-dark">{detail.label}:</strong>
                  <p className="col-8 text-muted">{detail.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-3"></div>
        {/* Address */}
        <div className="col-12 col-lg-9 mb-3">
          <div className="p-4 shadow-sm bg-white rounded text-start">
            <h2 className="text-dark fw-bold fs-4 ">Address</h2>
            <hr className="border border-dark border-1 mb-4" />
            <div className="row p-3">
              {Address.map((detail, index) => (
                <div key={index} className="col-12 col-md-6 d-flex">
                  <strong className="col-4 text-dark">{detail.label}:</strong>
                  <p className="col-8 text-muted">{detail.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
