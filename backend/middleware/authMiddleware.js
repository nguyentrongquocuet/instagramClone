const jwt = require("jsonwebtoken");
const key = require("../config/json-key").key;
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, key);
    req.decodedToken = { token: decodedToken };
    next();
  } catch (error) {
    res.status(401).json("access denied");
  }
};
module.exports = authMiddleware;
