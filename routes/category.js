var express = require("express");
const connection = require("../connection");

const router = express.Router();
var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

router.post("/add", auth.authenticateToken, checkRole.checkRole, (req, res) => {
  let category = req.body;

  query = "insert into category (name) values (?)";

  connection.query(query, [category.name], (err, result) => {
    if (!err) {
      return res.status(200).json({ message: "Added Category Successfully" });
    } else {
      return res.status(500).json(err);
    }
  });
});

// , auth.authenticateToken

router.post("/get", (req, res, next) => {
 var name = req.body.name

  var query = `select * from category where name like '%${name}%'`;

  connection.query(query, name , (err, result) => {
    if (!err) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(err);
    }
  });
});

router.patch("/update", auth.authenticateToken, checkRole.checkRole, (req, res) => {
  let product = req.body;
  var query = "update category set name = ? where id = ?";

  connection.query(query, [product.name, product.id], (err, result) => {
    if (!err) {
      if (result.affectedRows == 0) {
        return res.status(404).json({ message: "Given Id is Incorrect" });
      } else {
        return res
          .status(200)
          .json({ message: "Category updated successfully" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});


module.exports = router;