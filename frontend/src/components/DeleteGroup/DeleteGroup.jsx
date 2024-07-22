import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllGroups, removeGroup } from "../../store/groups";

export default function DeleteGroup({ groupId }) {
  //   console.log("goup id ", groupId);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(removeGroup(groupId));
    dispatch(getAllGroups());
    navigate("/allgroups");
  }, [dispatch,groupId,navigate]);
  return;
}
