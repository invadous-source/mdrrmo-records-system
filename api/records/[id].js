const {auth,sb}=require('../_lib');
module.exports=async(req,res)=>{
  const u=auth(req,res,true); if(!u)return;
  const id=encodeURIComponent(String(req.query.id));
  if(req.method==='PUT'){
    const d=req.body||{};
    const r=await sb(`mdrrmo_records?id=eq.${id}&select=data`,{method:'GET'});
    if(!r.ok)return res.status(r.status).send(await r.text());
    const rows=await r.json();
    if(!rows[0])return res.status(404).json({error:'Record not found.'});
    const data={...(rows[0].data||{}),...d,deletedAt:null,updatedAt:new Date().toISOString()};
    const u=await sb(`mdrrmo_records?id=eq.${id}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({data})});
    if(!u.ok)return res.status(u.status).send(await u.text());
    const out=(await u.json())[0];
    return res.json(out?.data||data);
  }
  if(req.method==='DELETE'){
    const r=await sb(`mdrrmo_records?id=eq.${id}&select=data`,{method:'GET'});
    if(!r.ok)return res.status(r.status).send(await r.text());
    const rows=await r.json();
    if(!rows[0])return res.status(404).json({error:'Record not found.'});
    const data={...(rows[0].data||{}),deletedAt:new Date().toISOString(),deletedBy:u.username||'Administrator'};
    const u=await sb(`mdrrmo_records?id=eq.${id}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({data})});
    return res.status(u.ok?200:u.status).json({ok:u.ok});
  }
  res.status(405).end();
};
