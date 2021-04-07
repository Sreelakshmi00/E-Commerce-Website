const express = require("express");
const router = express.Router();

const {
  getUserById,
  getUser,
  updateUser,
  userPurchaseList,
} = require("../controllers/user");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");

router.param("userId", getUserById); //getUserById method will populate the req.profile; whenever there is something inside any route as :id that will be interpreted as userid and this method will automatically populate a req.profile object with user object coming up from database

router.get("/user/:userId", isSignedIn, isAuthenticated, getUser); //user is used as prefix in route; user should be signed in and authenticated to be able to view his profile
router.put("/user/:userId", isSignedIn, isAuthenticated, updateUser);

router.get(
  "/orders/user/:userId",
  isSignedIn,
  isAuthenticated,
  userPurchaseList
);

module.exports = router;

//router.get("/users", getAllUsers); //this is a route to display all the users
