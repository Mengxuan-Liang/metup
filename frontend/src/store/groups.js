import { csrfFetch } from "./csrf";

const ALL_GROUPS = "group/allgroups";
const NEW_GROUP = "group/newgroup";
const UPDATE_GROUP = "group/updategroup";
const DELETE_GROUP = "group/deletegroup";

//ACTION
const allGroups = (groups) => {
  return {
    type: ALL_GROUPS,
    groups,
  };
};
const newGroup = (group) => {
  return {
    type: NEW_GROUP,
    payload: group,
  };
};
const editGroup = (group) => {
  return {
    type: UPDATE_GROUP,
    payload: group,
  };
};
const deleteGroup = (id) => {
  return {
    type: DELETE_GROUP,
    payload: id,
  };
};
//THUNK
export const getAllGroups = () => async (dispatch) => {
  const response = await fetch("/api/groups");
  if (response.ok) {
    const groups = await response.json();
    dispatch(allGroups(groups));
  }
};
export const createGroup = (userInput) => async (dispatch) => {
  const {
    city,
    state,
    name,
    about,
    type,
    privateState,
    organizerId,
    previewImage,
  } = userInput;
  try {
    const res = await csrfFetch("api/groups", {
      method: "POST",
      body: JSON.stringify({
        city,
        state,
        name,
        about,
        type,
        privateState,
        organizerId,
        previewImage,
      }),
    });
    if (res.ok) {
      console.log("res from thunk", res);
      const data = await res.json();
      //if successfully created the group, then make another fetch call to add img
      console.log(data);
      const groupId = data.id;
      console.log("group id for add img", groupId);
      const imgRes = await csrfFetch(`/api/groups/${groupId}/images`, {
        method: "POST",
        body: JSON.stringify({
          url: previewImage,
          groupId,
          preview: true,
        }),
      });
      if (imgRes.ok) {
        const newImg = await imgRes.json();
        data.previewImage = newImg.url;
        dispatch(newGroup(data));
        return data;
      } else {
        console.error("Failed to add image:", await imgRes.json());
        return data; // Return group data even if image upload fails
      }
    } else {
      const err = await res.json();
      return Promise.reject(err); //Creates a promise that is immediately rejected with the given reason (err). This is similar to how throw new Error works synchronously, but for asynchronous code. Allows the error to propagate up the call stack. In an async/await context, it makes the await expression throw the rejected value as an exception. In component, we can get the err in .catch() block.
    }
  } catch (error) {
    const err = await error.json();
    return Promise.reject(err);
  }
};
export const updateGroup = (userInput, id) => async (dispatch) => {
  const {
    previewImage,
  } = userInput;
  try {
    const res = await csrfFetch(`/api/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(userInput),
    });
    if (res.ok) {
      console.log("res from thunk", res);
      const data = await res.json();
      // if(previewImage.length !== 0) {
      //   await csrfFetch(`/api/group-images/${imageId}`)
      // }
      const imgRes = await csrfFetch(`/api/groups/${id}/images`, {
        method: "POST",
        body: JSON.stringify({
          url: previewImage[0],
          groupId:id,
          preview: true,
        }),
      });
      if (imgRes.ok) {
        const newImg = await imgRes.json();
        console.log('new image objjjjjj',newImg)
        data.previewImage = newImg.url;
        dispatch(editGroup(data));
        return data;
      } else {
        console.error("Failed to add image:", await imgRes.json());
        return data;
      }
    } else {
      const err = await res.json();
      return Promise.reject(err);
    }
  } catch (error) {
    const err = await error.json();
    return Promise.reject(err);
  }
};

export const removeGroup = (id) => async (dispatch) => {
  try {
    const res = await csrfFetch(`/api/groups/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      // const data = await res.json();
      dispatch(deleteGroup());
    }
  } catch (e) {
    throw new Error({ message: "failed to delete" });
  }
};
//REDUCER
const intialState = {};
const groupReducer = (state = intialState, action) => {
  switch (action.type) {
    case ALL_GROUPS: {
      return { ...state, ...action.groups };
    }
    case NEW_GROUP:{

      return { ...state, ...action.payload };
    }
    case UPDATE_GROUP:{

      return { ...state, [action.payload.id]: action.payload };
    }
    case DELETE_GROUP:{
      const newState = { ...state };
      delete newState[action.id];
      return newState;

    }
    default: {

      return state;
    }
  }
};
export default groupReducer;
