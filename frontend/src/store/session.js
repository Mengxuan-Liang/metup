//This file contains all the actions specific to the session user's information and the session user's Redux reducer.

import { csrfFetch } from "./csrf";

const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';

// ACTION
const setUser = (user) => {
	return {
		type: SET_USER,
		payload: user
	}
}
const removeUser = () => {
	return {
		type: REMOVE_USER
	}
}
// THUNK
export const login = (user) => async (dispatch) => {
	const {credential, password} = user;
	let response;
	try{
		response = await csrfFetch('/api/session', {
			method: 'POST',
			body: JSON.stringify({
				credential,
				password
			})
		});
	}catch(e){
		const err = await e.json()
		return err
	}
	if(response.ok){
		const data = await response.json();
		// console.log('data in thunk', data)
		dispatch(setUser(data.user));
		return {};
	}else{
		const data = await response.json()
		return {errors: data.errors};
	}
}
//dispatch this thunk in Layout componnet before App renders will retain the session user across a refresh
export const restoreUser = () => async(dispatch) => {
	const response = await csrfFetch('/api/session');
	const data = await response.json();
	dispatch(setUser(data.user));
	return data;
}
export const signup = (user) => async(dispatch) => {
	const {username, firstName, lastName, email, password} = user;
	let response;
	try{
			response = await csrfFetch('/api/users',{
			method: 'POST',
			body: JSON.stringify({
				username, firstName, lastName, email, password
			})
		});
	}catch(e){
		const err = await e.json();
		return err;
	}
	// console.log('res in thunk',response)
	if(response.ok){
		const data = await response.json();
		dispatch(setUser(data.user))
		return response;
	}else {
		const err =  response;
		return err;
	}
}
export const logout = () => async (dispatch) => {
	let res;
	try{
		res = await csrfFetch('/api/session',{
			method:'DELETE'
		});
	}catch(e){
		return e;
	}
	if(res.ok){
		dispatch(removeUser());
	}else {
		return res;
	}

}
// REDUCER
const intialState = {user:null};
const sessionReducer = (state = intialState, action) => {
	switch(action.type) {
		case SET_USER:
			return {...state, user: action.payload};
		case REMOVE_USER:
			return {...state, user: null};
		default:
			return state;
	}
}
export default sessionReducer;
