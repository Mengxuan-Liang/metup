import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { NavLink } from "react-router-dom";
import "./OneGroup.css";
import { useEffect, useState } from "react";
import { getEventsByGroupId } from "../../store/events";
import AllEventsBody from "../AllEvents/AllEventsBody";
import DeleteGroup from "../DeleteGroup/DeleteGroup";
import UpdateGroup from "../UpdateGroup/UpdateGroup";

//Here're two ways to get all groups without dispatching another action by making oneGroup component as children component(in App.jsx) for allGroups, then use a ternary(in AllGroups) to decide with component to be rendered, then we can either get it via props or from state.
export default function OneGroup() {
  //const group = groups[groupId]; //get all groups from props
  const { groupId } = useParams();
  const group = useSelector((state) => {
    //get all groups from state
    return state.group.Groups?.find((el) => el?.id === parseInt(groupId));
  });
  // console.log('group from one group!!!!!',group.previewImage[group.previewImage.length -1])
  const groupImg = group.previewImage[group.previewImage.length -1];
  //EVENT
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getEventsByGroupId(groupId));
  }, [dispatch,groupId]);
  const events = useSelector((state) => state.event);
  const eventsArr = events.event.Events;
  const currentDate = new Date();
  const pastEvents = eventsArr?.filter(
    (e) => new Date(e.startDate) < currentDate
  );
  const futureEvents = eventsArr?.filter(
    (e) => new Date(e.startDate) >= currentDate
  );
  // console.log("past!!!!evetns by group id.....", futureEvents);
  const organizer = group?.organizer.id;
  const sessionUser = useSelector((state) => state.session.user?.id);
  const navigate = useNavigate();
  const [goUpdate, setGoUpdate] = useState(false);
  const [goDelete, setGoDelete] = useState(false);
  const handleUpdate = () => {
    setGoUpdate(true);
  };
  const handleDelete = () => {
    setGoDelete(true);
  };
  if (!group) {
    return <div>Loading</div>;
  }
  return (
    <div className="main-page">
      <nav className="breadcrumb">
        <NavLink to="/allgroups">Groups</NavLink> &gt; {group.name}
      </nav>
      <div className="two-rows">
        <div className=" first-row group-first-row">
          {group?.previewImage && (
            <img src={groupImg} alt="Group" />
          )}
          <div className="group-details">
            <h2>{group.name}</h2>
            <p>{group.city}</p>
            <p>Events {group.private ? "Private" : "Public"}</p>
            <p>
              Organized by {group.organizer.firstName}{" "}
              {group.organizer.lastName}
            </p>
            <p className="join-group-button">
              <button
                style={{
                  color: "white",
                  backgroundColor: "orangered",
                  boxShadow: "2px 3px 5px 1px black",
                  borderRadius: "10px",
                  border: "none",
                  size: "20px",
                }}
              >
                Join this group
              </button>
            </p>
            {organizer === sessionUser && (
              <div>
                <button onClick={() => navigate("/newevent")}>
                  Create event
                </button>
                <button onClick={handleDelete}>Delete group</button>
                {goDelete && <DeleteGroup groupId={group.id} />}
                <button onClick={handleUpdate}>Update group</button>
                {goUpdate && <UpdateGroup group={group} />}
              </div>
            )}
          </div>
        </div>
        <div className="group-second-row">
          <div className="second-row-text-container">
            <h4>Organizer</h4>
            <div style={{ color: "grey" }}>
              {group.organizer.firstName} {group.organizer.lastName}
            </div>
            <h4>What we&apos;re about</h4>
            {group.about}
            {pastEvents?.length && (
              <div>
                <h4>Past Events</h4>
                <div id="group-event-body">
                  <AllEventsBody eventsArr={pastEvents} />
                </div>
              </div>
            )}
            {futureEvents?.length && (
              <div>
                <h4>Upcoming Events</h4>
                <AllEventsBody eventsArr={futureEvents} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
