import { API } from "../../backend";
// API means ; http://localhost:8000/api/

export const signup = (user) => {
  return fetch(`${API}/signup`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then((response) => {
      //if everything goes right
      return response.json();
    })
    .catch((err) => console.log(err)); //if there is some error
};

export const signin = (user) => {
  return fetch(`${API}/signin`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

//this method sets the token into user browser
export const authenticate = (data, next) => {
  if (typeof window !== "undefined") {
    //if window object is accessible, then access local storage of react and set jwt(json web token) with JSON.stringify(data)
    localStorage.setItem("jwt", JSON.stringify(data)); //a token is being set if the user is signed in
    next();
  }
};

export const signout = (next) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("jwt"); //token is removed
    next();

    return fetch(`${API}/signout`, {
      method: "GET",
    })
      .then((response) => console.log("Signout success"))
      .catch((err) => console.log(err));
  }
};

export const isAuthenticated = () => {
  if (typeof window == "undefined") {
    return false; //ie user is not authenticated
  }
  //if we get a jwt value, instead of returning true we return the value of jwt which is again checked in the frontend before firing up as true
  if (localStorage.getItem("jwt")) {
    return JSON.parse(localStorage.getItem("jwt"));
  } else {
    return false;
  }
};
