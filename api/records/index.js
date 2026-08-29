const {auth,sb}=require('../_lib');

module.exports=async(req,res)=>{
  if(req.method==='GET'){
    if(!auth(req,res))return;
    const r=await sb('mdrrmo_records?select=data&order=created_at.desc');
    if(!r.ok)return res.status(r.status).send(await r.text());
    const rows=await r.json();
    return res.json(rows.map(x=>x.data));
  }

  if(req.method==='POST'){
    if(!auth(req,res,true))return;
    const d=req.body||{};
    const r=await sb('mdrrmo_records',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({id:String(d.id),data:d})});
    if(!r.ok)return res.status(r.status).send(await r.text());
    const row=(await r.json())[0];
    return res.status(201).json(row.data);
  }

  if(req.method==='DELETE'){
    if(!auth(req,res,true))return;
    const ids=Array.isArray(req.body?.ids)?req.body.ids.map(x=>String(x)).filter(Boolean):[];
    if(!ids.length)return res.status(400).json({error:'No record IDs supplied.'});
    const filter='in.('+ids.join(',')+')';
    const r=await sb('mdrrmo_records?id='+encodeURIComponent(filter),{method:'DELETE'});
    if(!r.ok)return res.status(r.status).send(await r.text());
    return res.json({ok:true,ids});
  }

  res.status(405).end();
};
