import { useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/session";
import { Navigate } from "react-router-dom";
import './LoginForm.css'



export default function LoginFormPage (){

	const dispatch = useDispatch();

	const [credential, setCredential] = useState('');
	const [password, setPassword] = useState('');
	const [validation, setValidation] = useState({});

	const sessionUser = useSelector(state => state.session.user);
	if(sessionUser) return <Navigate to='/' replace={true}/>

	const handleSubmit = async(e)=>{
		e.preventDefault();
		const userInput = {
			credential,
			password
		}
		const data = await dispatch(login(userInput));
		// const data = await res.json()
		// console.log('response in login page',data)
		if(data.errors){
			setValidation(data.errors)
		}else {
			setValidation({})
		}
	}

	return (
		<>
		<h1>Log In</h1>
		<form onSubmit={handleSubmit}>
			<label htmlFor="credential">
				Username or Email
				<input
					name="credential"
					value={credential}
					onChange={e=>setCredential(e.target.value)}
					>
				</input>
			</label>
			{/* {validation.password && <div>{validation.password}</div>} */}
			<label htmlFor="password">
				Password
				<input
					name="password"
					value={password}
					onChange={e=>setPassword(e.target.value)}
					>
				</input>
			</label>
					{validation.credential && <div style={{color:'red'}}>{validation.credential}</div>}
			<button type="submit">Log In</button>
		</form>
		</>
	)
}
