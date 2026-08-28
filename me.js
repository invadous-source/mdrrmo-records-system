const {user}=require('../_lib');module.exports=(req,res)=>{const u=user(req);if(!u)return res.status(401).json({error:'Unauthenticated'});res.json({username:u.username,role:u.role})};
