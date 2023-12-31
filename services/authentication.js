require("dotenv").config();
const jwt = require("jsonwebtoken");

var authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) 
  
  {console.log(token);
    return res.sendStatus(401);
  
  }
  else{
    jwt.verify(token , process.env.ACCESS_TOKEN, (err, resp) => {
        if (err) return res.sendStatus(403);
        else
            res.locals = resp;
            next();
        }
      );
  }
  
};

module.exports = { authenticateToken: authenticateToken };
