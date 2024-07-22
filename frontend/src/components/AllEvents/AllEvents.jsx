import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { getAllEvents } from "../../store/events";
import "./AllEvents.css";
import AllEventsBody from "./AllEventsBody";

export default function AllEvents() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllEvents());
  }, [dispatch]);
  const events = useSelector((state) => state.event);
  console.log(events.event.Events);
  const eventsArr = events.event.Events;
  return (
    <div>
      <div
        style={{ marginLeft: "3%", fontSize: "large" }}
        className="toggle-links"
      >
        <NavLink className="toggle-nav" to="/allevents" end>
          Events
        </NavLink>
        <NavLink className="toggle-nav" to="/allgroups" end>
          Groups
        </NavLink>
      </div>
      <div style={{ color: "grey", marginLeft: "3%" }} className="second-title">
        Events in Metup
      </div>
      <hr></hr>

      <AllEventsBody eventsArr={eventsArr} />
    </div>
  );
}
