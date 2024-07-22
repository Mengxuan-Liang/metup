import { NavLink, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getAllGroups } from "../../store/groups";
import "./OneEvent.css";

export default function OneEvent() {
  const { eventId } = useParams();
  const event = useSelector((state) =>
    state.event.event.Events?.find((e) => e.id === parseInt(eventId))
  );
  //get group info for hoster
  const groupId = event?.groupId;
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllGroups());
  }, [dispatch]);
  const group = useSelector((state) =>
    state.group.Groups?.find((group) => group.id === parseInt(groupId))
  );
  if (!event) return <div>Loading...</div>;
  if (!group) return <div>Loading...</div>;
  return (
    <div>
      <nav className="breadcrumb">
        <NavLink to="/allevents">Events</NavLink> &gt; {event.name}
      </nav>
      <h2>{event.name}</h2>
      <div style={{ color: "grey" }}>
        Hosted by {group.organizer.firstName} {group.organizer.lastName}
      </div>
      <div className="all-grey">
        <div className="event-detail-container">
          <img src={event.previewImage} />
          <di>
            <div className="event-group-info-container">
              <img src={group.previewImage} />
              <div className="event-group-info-text">
                <div>{group.name}</div>
                <div style={{ color: "grey" }}>
                  {group.private ? "Private" : "Public"}
                </div>
              </div>
            </div>
            <div>
              <p>START {event.startDate.split("T")[0]}</p>
              <p>END {event.endDate.split("T")[0]}</p>
              <p>${event.price}</p>
              <p>{event.type}</p>
            </div>
          </di>
        </div>
        <div className="desription">
          <h2>Details</h2>
          {event.description}
        </div>
      </div>
    </div>
  );
}
