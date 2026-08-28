const {auth}=require('./_lib');module.exports=(req,res)=>{if(!auth(req,res))return;res.json({database:'Supabase shared database',online:true})};
