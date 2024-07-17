import { VscAccount } from "react-icons/vsc";
import { useDispatch } from "react-redux";
import { logout } from "../../store/session";
import { useEffect, useState, useRef } from "react";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import LoginFormModal from "../LoginFormModal/LoginFormModal.jsx";
import SignupFormModal from "../SignupFormModal/SignupFormModal.jsx";
import "./ProfileButton.css";

//Overall goal for profile button, click it to show dropdown menu(toggleMenu()), click inside the menu doesn't get closed(ulRef.current.contains), click the button again(toggleMenu()) or outside(document.addEventListener()) the button, dropdown menu will be closed.
export default function ProfileButton({ sessionUser }) {
  const [showMenu, setShowMenu] = useState(false);
  // need useRef() because we don't want the dropdown menu close when we click inside the profile button, we need it to reference the profile button in DOM
  const ulRef = useRef(); //useRef is used to reference DOM elements;ulRef: A reference to the dropdown menu <ul> element. <ul className={ulClassName} ref={ulRef}>
  useEffect(() => {
    //Runs side effects based on showMenu state.
    if (!showMenu) return; //only work when the dropdown menu is open
    const closeMenu = (e) => {
      //An event handler that closes the menu if a click occurs outside the menu.
      if (
        ulRef.current && //ulRef.current is the reference to the dropdown menu <ul> element
        !ulRef.current.contains(e.target)
      ) {
        //contains() method checks if the dropdown menu element (ulRef.current) contains the element that was clicked (e.target).In other words, it checks if the click happened outside the dropdown menu.
        setShowMenu(false);
      }
    };
    document.addEventListener("click", closeMenu); //Adds a click event listener to the DOCUMENT when showMenu is true and removes it when the component unmounts or showMenu changes.
    return () => {
      //clean up function: clear the event listener
      document.removeEventListener("click", closeMenu);
    };
  }, [showMenu]);

  //switch showMenu's state when click the profile button
  const toggleMenu = (e) => {
    //event handler if a click occurs inside the menu(profile button)
    e.stopPropagation(); // Keep click from bubbling up to document and triggering closeMenu
    setShowMenu(!showMenu);
  };

  //Dynamically sets the class name for the <ul> element based on the showMenu state.
  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

  //log out button
  const dispatch = useDispatch();
  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
  };
  // if(!sessionUser) return null;
  return (
    <>
      <button onClick={toggleMenu}>
        <VscAccount />
      </button>
      <ul className={ulClassName} ref={ulRef}>
        {/* <li>{sessionUser.username}</li>
				<li>{sessionUser.firstName} {sessionUser.lastName}</li>
				<li>{sessionUser.email}</li>
				<li><button onClick={handleLogout}>Log out</button></li> */}
        {sessionUser ? (
          <>
            <li>{sessionUser.username}</li>
            <li>
              {sessionUser.firstName} {sessionUser.lastName}
            </li>
            <li>{sessionUser.email}</li>
            <li>
              <button onClick={handleLogout}>Log Out</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <OpenModalButton
                buttonText="Log In"
                modalComponent={<LoginFormModal />}
              />
            </li>
            <li>
              <OpenModalButton
                buttonText="Sign Up"
                modalComponent={<SignupFormModal />}
              />
            </li>
          </>
        )}
      </ul>
    </>
  );
}
