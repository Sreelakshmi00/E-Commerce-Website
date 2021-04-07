var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator"); //we will only use check here
const { signout, signup, signin, isSignedIn } = require("../controllers/auth"); //import methods from auth.js file in controllers

router.post(
  "/signup",
  [
    //validation; put as many checks as you want
    check("name", "name should be atleast 3 char").isLength({ min: 3 }), //custom messages can be given using .withmessage also
    check("email", "email is required").isEmail(),
    check("password", "password should be atleast 3 char").isLength({ min: 3 }),
  ],
  signup
); //the actual route will be /api/signup //the route will be handled by method signup which will come up from auth controller

router.post(
  "/signin", //signin route
  [
    check("email", "email is required").isEmail(),
    check("password", "password field is required").isLength({ min: 1 }),
  ],
  signin //controller which will come up from auth controllers
);

router.get("/signout", signout);

module.exports = router; //All the links or requests associated with this router are being thrown out

//router.get("/testroute", isSignedIn, (req, res) => { //route to test; isSignedIn is used as custom middleware
//    res.send("A protected route");
//});

//router.get("/testroute", isSignedIn, (req, res) => { //to understand userProperty: "auth"
//    res.json(req.auth); //when we test it using a postman(using bearer <token>), we get the same id as we get when sign in as output, "auth" contains that id
//});
