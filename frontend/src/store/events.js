const ALL_EVENTS = "event/allevents";
const ALL_EVENTS_BY_GROUPID = "group";

//ACTION
const allEvents = (events) => {
  return {
    type: ALL_EVENTS,
    events,
  };
};
const allEventsByGroupId = (events) => {
  return {
    type: ALL_EVENTS_BY_GROUPID,
    events,
  };
};
//THUNK
export const getAllEvents = () => async (dispatch) => {
  const res = await fetch("/api/events");
  if (res.ok) {
    const events = await res.json();
    dispatch(allEvents(events));
  }
};
export const getEventsByGroupId = (groupId) => async (dispatch) => {
  const res = await fetch(`/api/groups/${groupId}/events`);
  if (res.ok) {
    const events = await res.json();
    dispatch(allEventsByGroupId(events));
  }
};
//REDUCER
const intialState = { event: {} };
const eventReducer = (state = intialState, action) => {
  switch (action.type) {
    case ALL_EVENTS:
      return { ...state, event: action.events };
    case ALL_EVENTS_BY_GROUPID:
      return { ...state, event: action.events };
    default:
      return state;
  }
};
export default eventReducer;
