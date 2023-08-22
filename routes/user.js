const express = require("express");
const connection = require("../connection");
const router = express.Router();

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

router.post("/signup", (req, resp) => {
  let user = req.body;
  query = "select email,password,role status from USER where email = ?";

  connection.query(query, [user.email], (err, result) => {
    if (!err) {
      if (result.length <= 0) {
        query =
          'insert into USER (name,contactNumber,email,password,status,role) values(?,?,?,?,"false","user")';
        connection.query(
          query,
          [user.name, user.contactNumber, user.email, user.password],
          (err, result) => {
            if (!err) {
              return resp
                .status(200)
                .json({ message: "Successfully Registered" });
            } else {
              return resp.status(500).json(err);
            }
          }
        );
      } else {
        return resp.status(400).json({ message: "Email already registered" });
      }
    } else {
      return resp.status(500).json(err);
    }
  });
});

router.post("/login", (req, res) => {
  const user = req.body;

  query = "select name,contactNumber,email,password,role,status from USER where email = ?";

  connection.query(query, [user.email], (err, result) => {
    if (!err) {
      if (result.length <= 0 || result[0].password != user.password) {
        return res
          .status(401)
          .json({ message: "Incorrect username or password" });
      } else if (result[0].status == "false") {
        return res.status(401).json({ message: "wait for admin approval" });
      } else if (result[0].password == user.password) {
        const response = { email: result[0].email, role: result[0].role , name : result[0].name , contactNumber : result[0].contactNumber };
        const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {
          expiresIn: "8h",
        });
        // console.log(accessToken.response);
        res.status(200).json({ token: accessToken , response : response});
      } else {
        return res
          .status(400)
          .json({ message: "something went wrong please try again later" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

// var transporter = nodemailer.createTransport("SMTP",{
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.PASSWORD,
//   },
// });

// // var smtpConfig = {
// //   servie : "gmail",// use SSL
// //   auth: {
// //       user: process.env.EMAIL,
// //       pass: process.env.PASSWORD
// //   }
// // };
// // var transporter = nodemailer.createTransport(smtpConfig);

// router.post("/forgotpassword", (req, res) => {
//   const user = req.body;

//   query = "select email,password from USER where email = ?";

//   connection.query(query, [user.email], (err, result) => {
//     if (!err) {
//       if (result.length <= 0) {
//         return res.status(200).json({ message: "Password Sent successfully" });
//       } else {
//         var mailOptions = {
//           from: process.env.EMAIL,
//           to: result[0].email,
//           subject: "Password by CMS",
//           html:
//             "<p><b>Your Login Details for CMS</b><br><b>Email :</b>" +
//             result[0].email +
//             "<br><b>Password: </b>" +
//             result[0].password +
//             "<br><a href='http://localhost:4200'>Click Here to login</a></p>",
//         };
//         transporter.sendMail(mailOptions, function (error, info) {
//           if (error) {
//             console.log(error);
//           } else {
//             console.log("Email send : " + info.response);
//           }
//         });
//       }
//     } else {
//       return res.status(500).json(err);
//     }
//   });
// });

router.get("/get", auth.authenticateToken, checkRole.checkRole, (req, res) => {
  var query =
    'select id,name,email,contactNumber,status from USER where role = "user"';

  connection.query(query, (err, result) => {
    console.log(err, result);
    if (!err) {
      return res.status(200).json(result);
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
    let user = req.body;
    var query = "update USER set status = ? where id = ?";
    connection.query(query, [user.status, user.id], (err, result) => {
      if (!err) {
        if (result.affectedRows == 0) {
          return res.status(404).json({ message: "userId Does not exist" });
        }
        return res.status(200).json({ message: "User updated successfully" });
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

router.get("/checktoken", auth.authenticateToken, (req, res) => {
  return res.status(200).json({ message: "true" });
});

// router.post("/changepassword", auth.authenticateToken, (req, res) => {
//   const user = req.body;
//   const email = res.locals.email;
//   console.log(email);

//   var query = "select * from USER where email = ? and password = ?";

//   connection.query(query, [email, user.oldPassword], (err, result) => {
//     if (!err) {
//       if (result.length <= 0) {
//         console.log("at password");
//         return res.status(400).json({ message: "Incorrect Old Password" });
//       }

//       else if (result[0].password == user.oldPassword) {
//         query = "update USER set password = ? where email = ?";
//         connection.query(query, [user.newPassword, email], (err, result) => {
//           if (err || user.oldPassword == user.newPassword ) {
//               return res.status(500).json({message : "you can not set old password and new password same"});
//             } else {
//               return res
//               .status(200)
//               .json({ message: "Password Updated Successfully" });
//             }
//         });
//       } else {
//         return res
//           .status(400)
//           .json({ message: "Something went Wrong , please try again later" });
//       }
//     } else {
//       return res.status(500).json(err);
//     }
//   });
// });

router.post("/getEmail", (req, res) => {
  const email = req.body.email;
  const user = req.body;

  // console.log(), req);
  var query = "select * from USER where email = ?";

  connection.query(query, [email], (err, result) => {
    if (!err) {
      if (result.length <= 0) {
        // console.log(query, result);

        return res.status(400).json({ message: "Incorrect Email" });
      } else if (result[0].email == email) {
        // console.log("true");
        var name = result.concat({ message: "Email is Verified" });
        return res.send(name);
        // return res.send().json({result},{message : "Ok"})
        // return res.status(200).json({message : "Email is Verified"})
        // query = "update USER set password = ? where email = ?";
        // connection.query(query, [user.newPassword, email], (err, result) => {
        //   if (!err) {
        //     return res
        //       .status(200)
        //       .json({ message: "Password Updated Successfully" });
        //   } else {
        //     return res.status(500).json(err);
        //   }
        // });
      } else {
        return res
          .status(400)
          .json({ message: "Something went Wrong , please try again later" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

router.post("/ChangePass", (req, res) => {
  const email = req.body.email;
  const user = req.body;

  // console.log(), req);
  var query = "select * from USER where email = ?";

  connection.query(query, [email], (err, result) => {
    if (!err) {
      if (result.length <= 0) {
        // console.log(query, result);

        return res.status(400).json({ message: "Incorrect Email" });
      } else if (result[0].email == email) {
        // console.log("true");
        query = "update USER set password = ? where email = ?";
        connection.query(query, [user.newPassword, email], (err, result) => {
          if (!err) {
            return res
              .status(200)
              .json({ message: "Password Updated Successfully" });
          } else {
            return res.status(500).json(err);
          }
        });
      } else {
        return res
          .status(400)
          .json({ message: "Something went Wrong , please try again later" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

// router.get("/getEmail",(req, res) => {

//   var query =
//     'select id,name,email,contactNumber,status from USER where role = "user"';

//     console.log(req);

//   connection.query(query, (err, result) => {
//     if (!err) {
//       return res.status(200).json(result);
//     } else {
//       return res.status(500).json(err);
//     }  
//   });
// });

router.post("/changepassword", auth.authenticateToken, (req, res) => {
  const user = req.body;
  const email = res.locals.email;
  // console.log(email);

  var query = "select * from USER where email = ? and password = ?";

  connection.query(query, [email, user.oldPassword], (err, result) => {
    if (!err) {
      if (result.length <= 0) {
        return res.status(400).json({ message: "Incorrect Old Password" });
      } else if (result[0].password == user.oldPassword) {
        query = "update USER set password = ? where email = ?";
        connection.query(query, [user.newPassword, email], (err, result) => {
          if (!err) {
            return res
              .status(200)
              .json({ message: "Password Updated Successfully" });
          } else {
            return res.status(500).json(err);
          }
        });
      } else {
        return res
          .status(400)
          .json({ message: "Something went Wrong , please try again later" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

module.exports = router;
