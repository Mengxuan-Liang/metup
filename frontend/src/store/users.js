const ALL_USERS = "user/getallusers";

//ACTION
const allUsers = (users) => {
  return {
    type: ALL_USERS,
    users,
  };
};

//Thunk
export const getAllUsers = () => async (dispatch) => {
  const res = await fetch("/api/session");
  if (res.ok) {
    const data = res.json();
    dispatch(allUsers(data));
    return res;
  } else {
    return res;
  }
};

//REDUCER
const intialState = {};
const userReducer = (state = intialState, action) => {
  switch (action.typ) {
    case ALL_USERS:
      return { ...state, ...action.users };
    default:
      return state;
  }
};
export default userReducer;
