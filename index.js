const express = require("express");
var cors = require("cors");
var connection = require("./connection");
const userRoute = require("./routes/user.js");
const categoryRoute = require('./routes/category')
const productRoute = require('./routes/products')
const billRoute = require('./routes/bill')
const dashBoardRoute = require('./routes/dashboard')



const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/user", userRoute);
app.use('/category' , categoryRoute);
app.use('/products' , productRoute);
app.use('/bill' , billRoute);
app.use('/dashboard' , dashBoardRoute);


module.exports = app;


