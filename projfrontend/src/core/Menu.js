import React, { Fragment } from "react";
import { Link, withRouter } from "react-router-dom"; //withRouter help in compatibility bw navigation bar and router file
import { signout, isAuthenticated } from "../auth/helper";

const currentTab = (history, path) => {
  //history is given by Link, so we cannot change its name
  if (history.location.pathname === path) {
    //ie the active tab in navigation bar will be green else in white
    return { color: "#2ecc72" };
  } else {
    return { color: "#FFFFFF" };
  }
};

//history is passed as a prop
const Menu = ({ history }) => (
  <div>
    <ul className="nav nav-tabs bg-cover">
      <li className="nav-item">
        <Link style={currentTab(history, "/")} className="nav-link" to="/">
          Home
        </Link>
      </li>
      <li className="nav-item">
        <Link
          style={currentTab(history, "/cart")}
          className="nav-link"
          to="/cart"
        >
          Cart
        </Link>
      </li>
      {isAuthenticated() && isAuthenticated().user.role === 0 && (
        <li className="nav-item">
          <Link
            style={currentTab(history, "/user/dashboard")}
            className="nav-link"
            to="/user/dashboard"
          >
            U.Dashboard
          </Link>
        </li>
      )}
      {isAuthenticated() && isAuthenticated().user.role === 1 && (
        <li className="nav-item">
          <Link
            style={currentTab(history, "/admin/dashboard")}
            className="nav-link"
            to="/admin/dashboard"
          >
            A.Dashboard
          </Link>
        </li>
      )}
      {!isAuthenticated() && ( //signup and signin will only be shown if user is not authenticated
        <Fragment>
          <li className="nav-item">
            <Link
              style={currentTab(history, "/signup")}
              className="nav-link"
              to="/signup"
            >
              Signup
            </Link>
          </li>
          <li className="nav-item">
            <Link
              style={currentTab(history, "/signin")}
              className="nav-link"
              to="/signin"
            >
              Sign In
            </Link>
          </li>
        </Fragment>
      )}
      {isAuthenticated() && ( //the signout is only shown if isAuthenticated() is true; this is conditional rendering
        <li className="nav-item">
          {/*if we want to wrap something into a block we use div,when we want to wrap into a line we use span*/}
          <span
            className="nav-link text-warning"
            onClick={() => {
              signout(() => {
                history.push("/"); //we will be redirected to home after signout
              });
            }}
          >
            Signout
          </span>
        </li>
      )}
    </ul>
  </div>
);

export default withRouter(Menu);
