require('dotenv').config();

const checkRole = (req,res,next) => {
    if(res.locals.role == process.env.ADMIN){
        // console.log("abhdb");
        next();
        console.log(res.locals.role);
    }
    else{
        console.log("hii");
        res.sendStatus(401)
    }
}


module.exports = {checkRole : checkRole}