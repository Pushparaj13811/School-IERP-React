import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Achievements: React.FC = () => {
  const [show, setShow] = useState(false);
  const handleOpen = () => setShow(true);
  const handleClose = () => setShow(false);
  const handleEdit = () => setShow(false);
  
  const [achievements] = useState(
    Array.from({ length: 10 }, (_, index) => ({ id: index, title: "21 Day NextCode Challenge" })),
  );
  const [viewMore, setViewMore] = useState({
    activityType: "Challenge",
    activityName: "NxtCode Challenge",
    organization: "Nxt Wave",
    heldFrom: "19-02-2025",
    heldTo: "28-02-2025",
    noOfDays: "9",
    description: "The NxtCode Challenge was a 9 day challenge organized by Nxt Wave which inclded challenges having various problems with fixed time limitations. It provided me an amazing opportunity to deep dive into diffrent problems and revived my learnings.",
    certificateUrl: "https://via.placeholder.com/250x150", // Replace with actual image
  });
  

  return (
    <div className="container main p-3 d-flex flex-column justify-content-center align-items-start" style={{width:"100vw"}} >
      <div className="container mt-4 p-3 shadow-sm rounded bg-white d-flex flex-column justify-content-center align-items-start">
        <div className="w-100 mb-2 d-flex flex-row justify-content-between">
          <h1 className="heading-font fs-4">My Achievements</h1>
          <button className="btn text-white" style={{ backgroundColor: "#292648" }} data-bs-toggle="modal" data-bs-target="#addAchievementModal">
            Add Achievements
          </button>
        </div>
        <hr className="border border-secondary border-1 mb-4 w-100" />

        <div className="row w-100 d-flex flex-row justify-content-start">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="col-12 col-sm-6 col-md-4 p-2 col-xl-3 mb-3 text-white">
              <div className="shadow w-100 rounded d-flex flex-column justify-content-center" style={{ width: "18rem" }}>
                <img className="card-img-top img-fluid" src="https://cdn.pixabay.com/photo/2015/06/22/08/40/child-817373_640.jpg" alt="Achievement" />
                <div className="p-2 py-3 achieveCard d-flex flex-column justify-content-start align-items-start text-start secondary-bg-color shadow-sm rounded">
                  <h5 className="fw-bold topic-font primary-color">{achievement.title}</h5>
                  <p className="truncate-text text-secondary">
                    Some quick example text to build on the card title and make up the bulk of the card's content.
                  </p>
                  <button className="btn text-white" style={{ backgroundColor: "#292648" }} data-bs-toggle="modal" data-bs-target={`#modal_${achievement.id}`} onClick={handleOpen} >
                    View More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

  


            {/*Edit Achievement Modal */}
    <div
    className="modal fade container bd-example-modal-lg rounded"
    id={`editAchievementModal_${achievements}`}
    tabIndex={-1}
    aria-labelledby="ModalLabel"
    aria-hidden="true"
  >
  <div className="modal-dialog modal-lg rounded shadow bg-light">
    <div className="modal-content bg-primary bg-opacity-10">
      <div className="modal-header">
        <h5 className="topic-font">Edit Achievements</h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>
      <div className="modal-body">
        <form>
          <div className="row mb-3">
            <div className="form-group col-md-6">
              <label htmlFor="activityType" className="topic-font fw-bold">
                Activity Type:
              </label>
              <input
                type="text"
                className="form-control shadow-sm rounded"
                id="activityType"
                name="activityType"
                placeholder="Activity Type"
              />
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="title" className="topic-font fw-bold">
                Title:
              </label>
              <input
                type="text"
                className="form-control shadow-sm rounded"
                id="title"
                name="title"
                placeholder="Title"
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="form-group col-md-6">
              <label htmlFor="organizations" className="topic-font fw-bold">
                Organizations:
              </label>
              <input
                type="text"
                className="form-control shadow-sm rounded"
                id="organizations"
                name="organizations"
                placeholder="Organizations"
              />
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="noOfDays" className="topic-font fw-bold">
                No of Days:
              </label>
              <input
                type="number"
                className="form-control shadow-sm rounded"
                id="noOfDays"
                name="noOfDays"
                placeholder="No of Days"
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="form-group col-md-6">
              <label htmlFor="fromDate" className="topic-font fw-bold">
                From:
              </label>
              <input
                type="date"
                className="form-control shadow-sm rounded"
                id="fromDate"
                name="fromDate"
              />
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="toDate" className="topic-font fw-bold">
                To:
              </label>
              <input
                type="date"
                className="form-control shadow-sm rounded"
                id="toDate"
                name="toDate"
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="form-group col-md-12">
              <label htmlFor="description" className="topic-font fw-bold">
                Description:
              </label>
              <textarea
                className="form-control shadow-sm rounded"
                id="description"
                name="description"
                placeholder="Description"
              ></textarea>
            </div>
          </div>

          <div className="row mb-3">
            <div className="form-group col-md-12">
              <label htmlFor="testimonialImage" className="topic-font fw-bold">
                Testimonial Image:
              </label>
              <input
                type="file"
                className="form-control shadow-sm rounded"
                id="testimonialImage"
                name="testimonialImage"
                accept="image/*"
              />
            </div>
          </div>

          <div className="mb-3 d-flex pt-3 flex-row justify-content-end">
            <button
              type="submit"
              className="btn text-white px-5"
              style={{ backgroundColor: "#292648" }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>


           {/*Add Acheivement Modal*/} 
  <div className="modal fade container bd-example-modal-lg rounded" id="addAchievementModal" tabIndex={-1} aria-labelledby="ModalLabel" aria-hidden="true">
    <div className="modal-dialog modal-lg rounded shadow  bg-light">
        <div className="modal-content bg-primary bg-opacity-10"> 
            <div className="modal-header">
            <h5 className="topic-font">Add Achievements</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body ">
            	<form className=" text-start primary-color">
				    <div className="row mb-3">
				        <div className="form-group col-md-6">
				            <label htmlFor="activityType" className="topic-font text- fw-bold">Activity Type:</label>
				            <input type="text" className="form-control shadow-sm rounded" id="activityType" name="activityType" placeholder="Activity Type" />
				        </div>
				        <div className="form-group col-md-6">
				            <label htmlFor="title" className="topic-font fw-bold">Title:</label>
				            <input type="text" className="form-control shadow-sm rounded" id="title" name="title" placeholder="Title" />
				        </div>
				    </div>
				
				    <div className="row mb-3">
				        <div className="form-group col-md-6">
				            <label htmlFor="organizations" className="topic-font fw-bold">Organizations:</label>
				            <input type="text" className="form-control shadow-sm rounded" id="organizations" name="organizations" placeholder="Organizations" />
				        </div>
				        <div className="form-group col-md-6">
				            <label htmlFor="noOfDays" className="topic-font fw-bold">No of Days:</label>
				            <input type="number" className="form-control shadow-sm rounded" id="noOfDays" name="noOfDays" placeholder="No of Days" />
				        </div>
				    </div>
				
				    <div className="row mb-3">
				        <div className="form-group col-md-6">
				            <label htmlFor="fromDate" className="topic-font fw-bold">From:</label>
				            <input type="date" className="form-control shadow-sm rounded" id="fromDate" name="fromDate" />
				        </div>
				        <div className="form-group col-md-6">
				            <label htmlFor="toDate" className="topic-font fw-bold">To:</label>
				            <input type="date" className="form-control shadow-sm rounded" id="toDate" name="toDate" />
				        </div>
				    </div>
				
				    <div className="row mb-3">
				        <div className="form-group col-md-12">
				            <label htmlFor="description" className="topic-font fw-bold">Description:</label>
				            <textarea className="form-control shadow-sm rounded" id="description" name="description" placeholder="Description"></textarea>
				        </div>
				    </div>
				
				    <div className="row mb-3">
				        <div className="form-group col-md-12">
				            <label htmlFor="testimonialImage" className="topic-font fw-bold">Testimonial Image:</label>
				            <input type="file" className="form-control shadow-sm rounded" id="testimonialImage" name="testimonialImage" accept="image/*" />
				        </div>
				    </div>
				 	<div className="mb-3 d-flex pt-3 flex-row justify-content-end">	
				    	<button type="submit" className="btn text-white px-5" style={{backgroundColor: "#292648"}}>Add</button>
				   	</div>
				</form>

	        </div>
	    </div>
	</div>
</div>
 {/*View More Acheivement Modal*/}
<div className="container mt-5 text-center">

      {/* Bootstrap Modal */}
      <div className={`modal fade ${show ? "show d-block" : "d-none"}`} tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header">
              <h5 className="modal-title">Achievement Details</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              <div className="row">
                {/* Left Side: Achievement Details */}
                <div className="col-12 col-md-6">
                  <div className=" view-more-modal row">
                    <div className="col-6 text-start">
                    <p><strong>Activity Name:</strong></p>
                    <p><strong>Activity Type:</strong></p>
                    <p><strong>Organization:</strong></p>
                    <p><strong>Held From:</strong></p>
                    <p><strong>Held To:</strong></p>
                    <p><strong>No of Days:</strong></p>
                    </div>
                  <div className="col-6 text-start">
                    <p><span className="view-more-subdata">{viewMore.activityName}</span></p>
                    <p><span className="view-more-subdata">{viewMore.activityType}</span></p>
                    <p><span className="view-more-subdata">{viewMore.organization}</span></p>
                    <p><span className="view-more-subdata">{viewMore.heldFrom}</span></p>
                    <p><span className="view-more-subdata">{viewMore.heldTo}</span></p>
                    <p><span className="view-more-subdata">{viewMore.noOfDays}</span></p>
                  </div>
                  </div>
                </div>
                {/* Right Side: Certificate Image */}
                <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
                  <img
                    src="src\components\student\images\child-817373_640 (1).jpg" // Replace with actual certificate image
                    alt="Certificate"
                    className="img-fluid border rounded"
                  />
                </div>
              </div>
              
              <div className="modal-body">

              <div className=" container row ">
                    <div className="col-12 col-md-6 text-start ">
                  <p><strong>Description:</strong></p>
                    </div>
                  <div className="col-12 text-start ">
                    <p><span className="view-more-subdata">{viewMore.description}</span></p>
                    </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button type="button" className="btn primary-bg-color secondary-color">Download</button>
              <button type="button" className=" btn primary-bg-color secondary-color" onClick={handleEdit}>Edit</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      {show && <div className="modal-backdrop fade show" onClick={handleClose}></div>}
    </div>


    
</div>

  );
};

export default Achievements;
