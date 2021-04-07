require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//My routes
const authRoutes = require("./routes/auth"); //since its in our system, we need to specify its path
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const paymentBRoutes = require("./routes/paymentb");

//DB Connection
mongoose
  .connect(process.env.DATABASE, {
    //DATABASE is the variable where the string is stored
    useNewUrlParser: true, //compulsory
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("DB CONNECTED"); //displayed in terminal/console when npm start or node app.js command is used
  }); //myfun.run().then().catch() //then() runs when it is successful and catch() runs when there are errors

//Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//My routes
app.use("/api", authRoutes); //localhost:8000/api/... ie /api is added as prefix
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentBRoutes);

//Port
const port = process.env.PORT || 8000;

//Starting a server
app.listen(port, () => {
  console.log(`app is running at ${port}`); //another way of writing into console(when we have to write variables we can use this)
}); //displayed in terminal/console when npm start or node app.js command is used
