import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import { NavLink } from "react-router-dom";
// import OpenModalButton from '../OpenModalButton/OpenModalButton';
// import LoginFormModal from '../LoginFormModal/LoginFormModal';
// import SignupFormModal from '../SignupFormModal/SignupFormModal';
import "./Navigation.css";

export default function Navigation({ isLoaded }) {
  const sessionUser = useSelector((state) => state.session.user);

  // const sessionLinks = sessionUser ? (
  // 	<li>
  // 			<ProfileButton sessionUser={sessionUser}/>
  // 		</li>
  // 	):(<>
  // 		{/* <li><NavLink to='/login'>Log in</NavLink></li> */}
  // 		<li>
  // 			<OpenModalButton
  // 			buttonText="Log In"
  // 			modalComponent={<LoginFormModal />}
  // 			/>
  //  	    </li>
  // 		{/* <li><NavLink to='/signup'>Sign up</NavLink></li> */}
  // 		<li>
  // 			<OpenModalButton
  // 			buttonText="Sign Up"
  // 			modalComponent={<SignupFormModal />}
  // 			/>
  //   		</li>
  // 	</>)

  return (
    <>
      <ul>
        <li>
          <NavLink className="metup" to="/">
            MetUp
          </NavLink>
        </li>
        <li>
          {sessionUser ? (
            <NavLink
              style={{
                textDecoration: "none",
                color: "orangered",
                fontSize: "large",
              }}
              to="/newgroup"
            >
              Start a new group
            </NavLink>
          ) : (
            <div className="join-button">
              <button>Join Metup</button>
            </div>
          )}
        </li>
        {/* {isLoaded && sessionLinks} */}
        {isLoaded && (
          <li className="profile-button-container">
            <ProfileButton sessionUser={sessionUser} />
          </li>
        )}
      </ul>
      <hr></hr>
    </>
  );
}
