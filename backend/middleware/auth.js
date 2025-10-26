const jwt = require("jsonwebtoken");
const jwtsec = process.env.JWT_SECRET;

function auth(req, res, next){
    try {
        const token = req.cookies.token || 
                     (req.headers.authorization && req.headers.authorization.slice(7));
        
        if(!token){
            return res.status(401).json({msg: "No token provided"});
        }
        
        const decoded = jwt.verify(token, jwtsec);
        
        if(!decoded.email){
            return res.status(403).json({msg: "Invalid token payload"});
        }
        
        req.email = decoded.email;
        next();
        
    } catch(err) {
        console.log("Auth error:", err.message);
        
        if(err.name === 'TokenExpiredError'){
            return res.status(401).json({msg: "Token expired"});
        }
        if(err.name === 'JsonWebTokenError'){
            return res.status(403).json({msg: "Invalid token"});
        }
        return res.status(401).json({msg: "Authentication error", error: err.message});
    }
}

module.exports = auth;