const jwt = require('jsonwebtoken');
const redisClient = require('../services/redis')

exports.authuser = async(req,res,next)=>{
    try{
        console.log("req=>",req.headers);
        console.log("auht above=>",req.headers.authorization);
        const token = req.headers.authorization.split(' ')[1] || req.headers.authorization;

        console.log("token in backend : ", token);
        if(!token){
            return res.status(401).json({msg: 'No token, authorization denied'});
        }
        console.log("redisClient=>",redisClient);
        // const blacklisted = await redisClient.get(token);
        // if(blacklisted){
        //     return res.status(403).json({msg: 'Token is blacklisted'});
        // }
        const decode =  jwt.verify(token,process.env.TOKEN_SECRET);
        console.log("decode=>",decode);
        req.user = decode;
        next();
    }
    catch(err){
        console.error("error in auth=>",err);
        res.status(401).json({msg: 'Not authorized'});
    }

}


// const jwt = require("jsonwebtoken");

// const authUser = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) return res.status(401).json({ msg: "No token provided" });

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ msg: "Token expired or invalid" });
//   }
// };

// module.exports = authUser;


// const jwt = require("jsonwebtoken");

// exports.authuser = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//       return res.status(401).json({ msg: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1] || authHeader;

//     const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

//     req.user = decoded; // Attach user payload to request
//     next();
//   } catch (err) {
//     console.error("JWT verification error:", err.message);
//     return res.status(401).json({ msg: "Token expired or invalid" });
//   }
// };
