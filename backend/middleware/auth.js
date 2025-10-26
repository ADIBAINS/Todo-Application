const jwt = require("jsonwebtoken");
const jwtsec = process.env.JWT_SECRET;

function auth(req, res, next){
    try {

        const authHeader = req.headers.authorization || req.cookies.token;
        
        if(!authHeader){
            return res.status(401).json({msg: "No token provided"});
        }
        
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;
        
        const decoded = jwt.verify(token, jwtsec);
        
        if(!decoded.email){
            return res.status(403).json({msg: "Invalid token payload"});
        }
        
        req.email = decoded.email;
        next();
        
    } catch(err) {
        if(err.name === 'TokenExpiredError'){
            return res.status(401).json({msg: "Token expired"});
        }
        if(err.name === 'JsonWebTokenError'){
            return res.status(403).json({msg: "Invalid token"});
        }
        return res.status(500).json({msg: "Authentication error", error: err.message});
    }
}

module.exports = auth;