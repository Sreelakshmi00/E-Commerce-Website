const User = require("../models/user");
const Order = require("../models/order");

exports.getUserById = (req, res, next, id) => {
  //a method that uses params; it just populates req.profile
  User.findById(id).exec((err, user) => {
    //findOne or find can also be used instead of findById
    if (err || !user) {
      //whenever there is a database call back it either returns error or the object(here user)
      return res.status(400).json({
        //we are also chaining a json response back along with passing status code
        error: "No user was found in DB",
      });
    }
    req.profile = user;
    next();
  });
};

exports.getUser = (req, res) => {
  req.profile.salt = undefined; //so that salt(ie password(sensitive info)) is not displayed in the profile; we can also set salt as empty string (""), then salt will be shown as empty
  req.profile.encry_password = undefined; // we are making these undefined only in profile not in database
  return res.json(req.profile); //re.profile that we have set in prev method
};

exports.updateUser = (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.profile._id },
    { $set: req.body }, //values you want to update is in $set which will be taken from req.body(or frontend)
    { new: true, useFindAndModify: false }, //new is true as updation is going on
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "You are not authorized to update this user",
        });
      }
      user.salt = undefined;
      user.encry_password = undefined;
      res.json(user);
    }
  );
};

exports.userPurchaseList = (req, res) => {
  Order.find({ user: req.profile._id }) //anytime you are referencing something in a diff collection(here we are referencing User model in Order model), that is when we use populate
    .populate("user", "_id name") //model of which object you want to update and the fields you want to bring in are the parameters of populate
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: "No order in this account",
        });
      }
      return res.json(order);
    });
};

exports.pushOrderInPurchaseList = (req, res, next) => {
  let purchases = []; //an empty array
  req.body.order.products.forEach((product) => {
    //products in an array of products purchased
    purchases.push({
      //push is a method of array
      _id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      quantity: product.quantity,
      amount: req.body.order.amount,
      transaction_id: req.body.order.transaction_id,
    });
  });

  //store this in DB
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { purchases: purchases } }, //we are not using a $set because this is an array
    { new: true }, //new: true means from the database send back the updated object not the old one
    (err, purchases) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to save purchase list",
        });
      }
      next();
    }
  );
};

//exports.getAllUsers = (req, res) => { //this is the controller which will get all the users
//    User.find().exec((err, users) => {
//        if(err || !users){
//            return res.status(400).json({
//                errot: "NO users found"
//            })
//       }
//        res.json(users); //will show all the info of all users
//    })
//}
