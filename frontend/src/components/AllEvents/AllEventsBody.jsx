import { NavLink, useParams } from "react-router-dom";
import "./AllEvents.css";
import OneEvent from "../OneEvent/OneEvent";

export default function AllEventsBody({ eventsArr }) {
  const url = useParams();
  return (
    <div>
      {!url.eventId ? (
        <div>
          {eventsArr?.map((event) => (
            <>
              <NavLink
                style={{ textDecoration: "none", color: "black" }}
                to={`${event.id}`}
              >
                <div key={event.id} className="page-container">
                  <div className="event-main-container">
                    <div className="first-row">
                      <img style={{ width: "50%" }} src={event.previewImage} />
                      <div className="event-text">
                        <div>{event.startDate?.split("T")[0]}</div>
                        <div
                          style={{
                            fontWeight: "bold",
                            fontSize: "30px",
                            wordWrap: "break-word",
                            width: "70%",
                          }}
                        >
                          {event?.name}
                        </div>
                        <div>{event?.Venue?.city}</div>
                      </div>
                    </div>
                    <div className="second-row">{event?.description}</div>
                  </div>
                  <hr style={{ width: "60%" }}></hr>
                </div>
              </NavLink>
            </>
          ))}
        </div>
      ) : (
        <OneEvent />
      )}
    </div>
  );
}
