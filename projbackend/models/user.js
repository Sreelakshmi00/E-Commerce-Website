var mongoose = require("mongoose");
const crypto = require("crypto");
const uuidv1 = require("uuid/v1");

var userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, //mandatory; does not accept empty field
      maxlength: 32,
      trim: true,
    },
    lastname: {
      type: String,
      maxlength: 32,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true, //asks for unique values
    },
    userinfo: {
      type: String,
      trim: true,
    },
    encry_password: {
      type: String,
      required: true,
    },
    salt: String,
    role: {
      type: Number, //to define the role like 0 for user, 1 for admin etc
      default: 0,
    },
    purchases: {
      type: Array, //list of purchased items
      default: [],
    },
  },
  { timestamps: true } //whenever we make a new entry in the schema it will record the time (both createdAt and updatedAt)
);

userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password; // _ is used for private variable
    this.salt = uuidv1(); //populating
    this.encry_password = this.securePassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  authenticate: function (plainpassword) {
    //this method takes the password in plain text and compare that with encrypted password
    return this.securePassword(plainpassword) === this.encry_password;
  },

  securePassword: function (plainpassword) {
    if (!plainpassword) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainpassword)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
};

module.exports = mongoose.model("User", userSchema); //User will act as the other name for userSchema
