import { NavLink, useNavigate } from "react-router-dom";
import "./Landing.css";
import { useSelector } from "react-redux";

export default function Landing() {
  const navigate = useNavigate();
  const sessionUser = useSelector((state) => state.session.user);
  // console.log("do i have session user?", sessionUser.user);
  return (
    <div className="main-container">
      <div className="first-part-container">
        <div className="text-container">
          <div className="text">
            <div className="first-p">
              The people platform—Where interests become friendships.
            </div>
            <div className="second-p">
              Whatever your interest, from hiking and reading to networking and
              skill sharing, there are thousands of people who share it on
              Meetup. Events are happening every day—sign up to join the fun.
            </div>
          </div>
          {sessionUser ? (
            ""
          ) : (
            <div className="join-button">
              <button>Join Metup</button>
            </div>
          )}
        </div>
        <img
          className="image"
          src="https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg"
          alt="people-image"
        />
      </div>
      <div className="second-part-container">
        <div className="col">
          <img
            onClick={() => navigate("/allgroups")}
            src="https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg"
          />
          <div>
            <NavLink className="nav-link" to="/allgroups">
              See all groups
            </NavLink>
          </div>
        </div>
        <div className="col">
          <img
            onClick={() => navigate("/")}
            src="https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg"
          />
          <div>
            <NavLink className="nav-link" to="/oneevent">
              Find an event
            </NavLink>
          </div>
        </div>
        <div className="col">
          <img src="https://res.cloudinary.com/dhukvbcqm/image/upload/v1717269281/samples/cup-on-a-table.jpg" />
          {sessionUser ? (
            <div>
              <NavLink className="nav-link" to="/newgroup">
                Start a new group
              </NavLink>
            </div>
          ) : (
            <div>
              <NavLink style={{ color: "gray" }} className="nav-link" to="#">
                Start a new group
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
