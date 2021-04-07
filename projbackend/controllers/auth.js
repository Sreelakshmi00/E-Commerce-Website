const User = require("../models/user"); //bringing up user model
const { check, validationResult } = require("express-validator"); //we will only use validationResult here
var jwt = require("jsonwebtoken"); //for creating tokens for signin
var expresJwt = require("express-jwt");

exports.signup = (req, res) => {
  const errors = validationResult(req); //express validator binds the validation result with the request body

  if (!errors.isEmpty()) {
    return res.status(422).json({
      //422: errors thrown from the database
      error: errors.array()[0].msg, //validationResult is present as an array(check documentation) and all info is in the first element of array //here we are taking out msg, we can also use param(to know in what field user is getting error)
    });
  }

  const user = new User(req.body); //created an object user of class User which further is created from class/var Mongoose;thus we can use all functionalitites provided by mongoose
  user.save((err, user) => {
    //either returns an error or the object itself
    if (err) {
      //validation ie checking whether there is error
      return res.status(400).json({
        err: "NOT able to save user in DB", //error comes up if the required fields are not being passed on
      }); //if there is error sending response with status code 400 and a json(for making it easy for frontend error message)
    }
    res.json({
      name: user.name,
      email: user.email,
      id: user._id,
    }); //sending json response if there is no error
  });
};

exports.signin = (req, res) => {
  const errors = validationResult(req);
  const { email, password } = req.body; //destructuring of data;selectively extract wanted information(email and password)

  if (!errors.isEmpty()) {
    //validation check
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  User.findOne({ email }, (err, user) => {
    //findOnefinds exactly one match(the very first one); we are able to pass email here directly because we have already destructured the email earlier
    if (err || !user) {
      return res.status(400).json({
        error: "USER email does not exists",
      });
    }

    if (!user.authenticate(password)) {
      //checks the user that has been returned using authenticate method of user model based on the password that we have extracted earlier
      return res.status(401).json({
        //only enters if block if authentication fails
        error: "Email and password do not match",
      });
    }

    //create token (ie when authentication is successful)
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    //put token in cookie
    res.cookie("token", token, { expire: new Date() + 9999 });

    //send response to front end
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, name, email, role } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token"); //clear cookies; we are getting access to clearCookie method because we have cookie parser
  res.json({
    //instead of sending response msg we now are sending json message
    message: "User Signout successfully", //there can be more than 1 key value pair
  });
}; //module.export exports 1; for more than 1 use exports

//protected routes
exports.isSignedIn = expresJwt({
  //refer documentation for parameters;express-jwt checks for authentication
  secret: process.env.SECRET,
  userProperty: "auth", //puts "auth" into the request
}); //custom middlewares require next(), but here we dont need that becoz express-jwt already has that

//custom middlewares
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id; //var checker checks whether the user is authenticated; ie the user can change things in his own account
  if (!checker) {
    //profile will be setup from frontend and auth was setup when signed in
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    //role is defined in user schema
    return res.status(403).json({
      error: "You are not ADMIN, Access denied",
    });
  }
  next();
};

//handling or using bodyparser middleware(not needed in the code)
//exports.signup = (req, res) => {
//    console.log("REQ BODY", req.body);//capitals are not compulsary, its just to spot them among other //here we are taking advantage of middleware(that is already installed) //we can fire up any request and req.body can handle that as we have already installed bodyparser middleware
//    res.json({
//        message: "Signup route works!"
//    });
//};
