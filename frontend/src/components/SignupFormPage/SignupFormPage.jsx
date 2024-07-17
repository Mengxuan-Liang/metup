import { useState } from "react";
import { signup } from "../../store/session";
import { Navigate } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import './SignupFormPage.css';

export default function SignupFormPAGE(){
	const [username, setUserName] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email,setEmail] = useState('')
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [validation, setValidation] = useState({});

	const sessionUser = useSelector(state => state.session.user)
	const dispatch = useDispatch();

	if(sessionUser) return <Navigate to='/' replace={true}/> // replace={true} ensures that the navigation will replace the current entry in the history stack instead of adding a new one.This is useful in cases where we do not want the user to navigate back to the previous page, such as after a successful login or logout.

	const handleSubmit = async(e)=>{
		e.preventDefault();
		const user = {
			username,
			firstName,
			lastName,
			email,
			password
		}
		if(password === confirmPassword){
			const res = await dispatch(signup(user));
			// console.log(res)
			if(res.errors){
				setValidation(res.errors)
			}
		}else {
			return setValidation({
				confirmPassword: "Confirm Password field must be the same as the Password field"
			})
		}
	}
	return (
		<>
			<h1>Sign up</h1>
			<form onSubmit={handleSubmit}>
					{validation.username && <div>{validation.username}</div>}
				<label htmlFor="username">
					username
					<input
						name="username"
						value={username}
						onChange={e=>setUserName(e.target.value)}
					>
					</input>
				</label>
					{validation.firstName && <div>{validation.firstName}</div>}
				<label htmlFor="firstName">
					first name
					<input
						name="firstName"
						value={firstName}
						onChange={e=>setFirstName(e.target.value)}
					>
					</input>
				</label>
					{validation.lastName && <div>{validation.lastName}</div>}
				<label htmlFor="lastName">
					last name
					<input
						name="lastName"
						value={lastName}
						onChange={e=>setLastName(e.target.value)}
					>
					</input>
				</label>
					{validation.email && <div>{validation.email}</div>}
				<label htmlFor="email">
					email
					<input
						name="email"
						value={email}
						onChange={e=>setEmail(e.target.value)}
					>
					</input>
				</label>
				{validation.password && <div>{validation.password}</div>}
				<label htmlFor="password">
					password
					<input
						name="password"
						value={password}
						onChange={e=>setPassword(e.target.value)}
					>
					</input>
				</label>
				{validation.confirmPassword && <div>{validation.confirmPassword}</div>}
				<label htmlFor="confirmPassword">
				confirmPassword
					<input
						name="confirmPassword"
						value={confirmPassword}
						onChange={e=>setConfirmPassword(e.target.value)}
					>
					</input>
				</label>
				<button type="submit">Sign up</button>
			</form>
		</>
	)
}
