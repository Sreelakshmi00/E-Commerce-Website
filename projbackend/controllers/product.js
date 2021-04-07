const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs"); //file system; you dont need to install, it comes up as default; to access the path of file
const { sortBy } = require("lodash");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id) //we can chain as many methods as we want like sort, populate etc
    .populate("category") //populate the product based on category
    .exec((err, product) => {
      if (err || !product) {
        return res.status(400).json({
          error: "Product not found",
        });
      }
      req.product = product;
      next();
    });
};

exports.createProduct = (req, res) => {
  //it will use form data
  let form = new formidable.IncomingForm(); //created a new object, creation of object form
  form.keepExtensions = true; //default is false; but if we want to write files in the directory and want to keep the extensions of original file, we make it true
  form.parse(req, (err, fields, file) => {
    //parse is an incoming nodejs request containing form data; all fields and files are collected and passesd to the callback
    if (err) {
      return res.status(400).json({
        error: "Problem with image",
      });
    }

    //destructure the fields
    const { name, description, price, category, stock } = fields;
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: "Please include all fields",
      });
    }
    let product = new Product(fields); //product has been created based on fields

    //handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        //ie if file is bigger than 3mb
        return res.status(400).json({
          error: "File size too big!",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path); //full path of file; data is of buffer type in models
      product.photo.contentType = file.photo.type; //contentType is string type in models; contentType can be jpeg, png etc etc
    }

    //save to the DB
    product.save((err, product) => {
      //we can use save method as product is a mongoose object
      if (err) {
        return res.status(400).json({
          error: "Saving tshirt in DB failed",
        });
      }
      res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  req.product.photo = undefined; //so that the return request will be parsed quickly; done for optimization(not necessary)
  return res.json(req.product); //mp3s or photos not being served directly on a get request as they are bulky to grab from DB
};

//middleware (for optimization)
exports.photo = (req, res, next) => {
  //middleware to load the photo
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType); //Content-Type is set
    return res.send(req.product.photo.data);
  }
  next();
};

exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    //since product is a mongoose object we can use remove method
    if (err) {
      return res.status(400).json({
        error: "Failed to delete the product",
      });
    }
    res.json({
      message: "Deletion was a success",
      deletedProduct,
    });
  });
};

exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with image",
      });
    }

    //updation code
    let product = req.product; //instead of making a new product we are taking the existing product with the help of params
    product = _.extend(product, fields); //extend method of lodash takes the existing values of the object and extends the value ie updates the value; here fields will be updated inside the product

    //handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        //ie if file is bigger than 3mb
        return res.status(400).json({
          error: "File size too big!",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path); //full path of file; data is of buffer type in models
      product.photo.contentType = file.photo.type; //contentType is string type in models; contentType can be jpeg, png etc etc
    }

    //save to the DB
    product.save((err, product) => {
      //we can use save method as product is a mongoose object
      if (err) {
        return res.status(400).json({
          error: "Updation of product failed",
        });
      }
      res.json(product);
    });
  });
};

exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8; //majority lang inputs value from user as string, thus we are parsing it to int efore assigning; here default value of limit is 8
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

  Product.find()
    .select("-photo") //to select specific fields; or to not select specific, put a - sign in front; here it will not select photo of the product
    .populate("category") //populates the category
    .sort([[sortBy, "asc"]]) //to sort products acc to sortBy in ascending order
    .limit(limit) //it limits the number of products to limit(which will come from user frontend)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "NO products found",
        });
      }
      res.json(products);
    });
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(400).json({
        error: "NO category found",
      });
    }
    res.json(category);
  });
};

exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map((prod) => {
    //map will loop through every product in the order or cart
    return {
      updateOne: {
        filter: { _id: prod._id }, //product is located
        update: { $inc: { stock: -prod.count, sold: +prod.count } }, //we need to update stock and sold; prod.count will be thrown up from frontend
      },
    };
  });
  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Bulk operation failed",
      });
    }
    next();
  });
};
