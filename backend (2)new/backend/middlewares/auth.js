const jwt = require("jsonwebtoken");
const redisClient = require("../services/redis");

exports.authuser = async (req, res, next) => {
  try {
    console.log("req=>", req.headers);
    console.log("auht above=>", req.headers.authorization);
    const token =
      req.headers.authorization.split(" ")[1] || req.headers.authorization;

    console.log("token in backend : ", token);
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }
    console.log("redisClient=>", redisClient);

    const decode = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log("decode=>", decode);
    req.user = decode;
    next();
  } catch (err) {
    console.error("error in auth=>", err);
    res.status(401).json({ msg: "Not authorized" });
  }
};

