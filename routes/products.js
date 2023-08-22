var express = require("express");
const connection = require("../connection");
const router = express.Router();
var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

router.post("/add", auth.authenticateToken, checkRole.checkRole, (req, res) => {
  console.log("Hello");
  var product = req.body;
  var query =
    "insert into product (name,categoryId, description,price,status) values (?,?,?,?,'true')";

  connection.query(
    query,
    [product.name, product.categoryId, product.description, product.price],
    (err, result) => {
      if (!err) {
        return res.status(200).json({ message: "Product added successfully" });
      } else {
        return res.status(500).json(err);
      }
    }
  );
});

router.get("/get", auth.authenticateToken, (req, res) => {
  var query =
    "select p.id,p.name,p.description,p.price,p.status,c.id as categoryId, c.name as categoryName from product as p INNER JOIN category as c where p.categoryId = c.id";

  connection.query(query, (err, result) => {
    if (!err) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(err);
    }
  });
});

router.get("/getbycategory/:id", auth.authenticateToken, (req, res) => {
  const id = req.params.id;
  var query = 'select id, name from product where categoryId = ? and status = "true" ';

  connection.query(query, [id], (err, result) => {
    if (!err) {
      // console.log(result.l);
      return res.status(200).json(result);
    } else {
      return res.status(500).json(err);
    }
  });
});
// , auth.authenticateToken

router.get("/getbyproduct/:id", (req, res) => {
  const id = req.params.id;
  var query = "select id, name, description , price from product where id  = ? ";
  // "select * from product WHERE id= ?";

  connection.query(query, [id], (err, result) => {
    // console.log(result);
    if (!err) {
      if (result.length) {
        res.status(200).json(result[0]);
      } else {
        res.status(500).json({ message: "record not found" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

router.patch(
  "/update",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res) => {
    const product = req.body;
    var query =
      "update product set name = ?, categoryId = ?, description = ?, price = ? where id = ?";

    connection.query(
      query,
      [
        product.name,
        product.categoryId,
        product.description,
        product.price,
        product.id,
      ],
      (err, result) => {
        if (!err) {
          if (result.affectedRows == 0) {
            return res
              .status(404)
              .json({ message: "Provide Valid ID or Id doesn't Exist" });
          } else {
            return res
              .status(200)
              .json({ message: "Product updated successfully" });
          }
        } else {
          return res.status(500).json(err);
        }
      }
    );
  }
);

router.delete(
  "/delete/:id",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res) => {
    let id = req.params.id;
    var query = "delete from product where id = ?";

    connection.query(query, [id], (err, result) => {
      if (!err) {
        if (result.affectedRows == 0) {
          return res.status(404).json({ message: "Given Id is Incorrect" });
        } else {
          return res
            .status(200)
            .json({ message: "Product deleted successfully" });
        }
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

router.patch(
  "/updateStatus",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res) => {
    const user = req.body;
    var query = "update product set status = ? where id = ?";

    connection.query(query, [user.status, user.id], (err, result) => {
      if (!err) {
        if (result.affectedRows == 0) {
          return res
            .status(404)
            .json({ message: "Provide Valid ID or Id doesn't Exist" });
        } else {
          console.log("hello");
          return res
            .status(200)
            .json({ message: "Product Status updated successfully" });
        }
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

router.get("/getc/:categoryId", (req, res) => {
  var categoryId = req.params.categoryId;

  var query = "select * from product where categoryId = ?";

  connection.query(query, [categoryId], (err, result) => {
    console.log(categoryId);
    if (!err) {
      console.log(result);
      // if(result.length > 0){
      //   // console.log(result.length);
      //   // console.log(result);
      return res.send(result);

      // }else{
      //   console.log('errs');
      //   res.status(401).json({message : "Record Not Found"})
      // }
      // console.log(result , id);
    } else {
      console.log("err");
      console.log(categoryId);
    }
  });
});

router.post('/getDetails' ,auth.authenticateToken , (req,res) => {
  var name = req.body.name
  var query = 
  // `select * from product where name like '%${name}%'`;
  `select p.id,p.name,p.description,p.price,p.status,c.id as categoryId, c.name as categoryName from product as p INNER JOIN category as c where p.categoryId = c.id and p.name like '%${name}%'`;

  connection.query(query, name , (err, result) => { 
    if (!err) {
      return res.status(200).json(result);
    } else {
      console.log("err");
    }
  });
})




module.exports = router;


























