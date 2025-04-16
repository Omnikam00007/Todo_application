const jwt = require("jsonwebtoken");
let JWT_SECRET = "iamhulk";

function Auth(req,res,next)
{
    try{
        const token= req.headers.token;
        const decodeToken = jwt.verify(token,JWT_SECRET);
        
        if(!decodeToken.id){
            throw new  Error(`Response status:${decodeToken.id.status}`);
        }
        req.ObjectId = decodeToken.id;
        next();
    }catch(error){
        console.log("You need to first signin"); 
    }
}

module.exports = {
   Auth , 
   JWT_SECRET
}