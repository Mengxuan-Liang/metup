import { NavLink, useParams } from "react-router-dom";
import "./AllGroups.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllGroups } from "../../store/groups";
import { useEffect } from "react";
import OneGroup from "../OneGroup/OneGroup";

export default function AllGroups() {
  const url = useParams();
  const groupArr = useSelector((state) => state.group.Groups);
  // console.log('GROUP FROM ALLGROUP.......',groupArr);
  // console.log("inside obj res", groups.group.Groups);
  // const groupArr = groups.group.Groups;
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllGroups());
  }, [dispatch]);
  if (!groupArr) {
    return <div>Loading...</div>;
  }
  // console.log("url in all groups", url);
  return (
    <div>
      <div style={{ marginLeft: "3%", fontSize: "large" }}>
        <NavLink to="/allevents">Events</NavLink>
        <NavLink to="/allgroups">Groups</NavLink>
      </div>
      <div style={{ color: "grey", marginLeft: "3%" }} className="second-title">
        Groups in Metup
      </div>
      <hr></hr>
      {!url.groupId ? (
        <div>
          {groupArr?.map((group) => (
            <div key={group.id}>
              <NavLink
                to={`${group.id}`}
                className="group-main-container"
                key={group.id}
                style={{ textDecoration: "none", color: "black" }}
              >
                {group?.previewImage && (
                  <img style={{ width: "40%" }} src={group?.previewImage[group.previewImage.length -1]} />
                )}
                <div className="group-text-container">
                  <div style={{ fontSize: "30px" }}>{group.name}</div>
                  <div style={{ color: "grey", marginBottom: "10px" }}>
                    {group.city}
                  </div>
                  <div style={{ marginBottom: "10px" }}>{group.about}</div>
                  <div className="event">
                    <div>Events</div>
                    <div>{group.private ? "Private" : "Public"}</div>
                  </div>
                </div>
              </NavLink>
              <hr style={{ width: "70%" }}></hr>
            </div>
          ))}
        </div>
      ) : (
        <OneGroup groups={groupArr} />
      )}
    </div>
  );
}
