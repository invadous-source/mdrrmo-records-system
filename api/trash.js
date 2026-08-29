const {auth,sb}=require('./_lib');

module.exports=async(req,res)=>{
  if(!auth(req,res,true))return;

  if(req.method==='GET'){
    const r=await sb('mdrrmo_records?select=id,data&order=created_at.desc');
    if(!r.ok)return res.status(r.status).send(await r.text());
    const rows=await r.json();
    return res.json(rows.map(x=>({id:String(x.id),...(x.data||{})})).filter(x=>x.deletedAt));
  }

  const ids=Array.isArray(req.body?.ids)?req.body.ids.map(x=>String(x)).filter(Boolean):[];
  if(!ids.length)return res.status(400).json({error:'No record IDs supplied.'});

  if(req.method==='POST' && req.body?.action==='restore'){
    const found=await sb('mdrrmo_records?select=id,data&id=in.('+ids.map(encodeURIComponent).join(',')+')');
    if(!found.ok)return res.status(found.status).send(await found.text());
    const rows=await found.json();
    for(const row of rows){
      const data={...(row.data||{}),deletedAt:null,deletedBy:null,updatedAt:new Date().toISOString()};
      const u=await sb(`mdrrmo_records?id=eq.${encodeURIComponent(String(row.id))}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({data})});
      if(!u.ok)return res.status(u.status).send(await u.text());
    }
    return res.json({ok:true,ids:rows.map(x=>String(x.id)),count:rows.length});
  }

  if(req.method==='DELETE'){
    const found=await sb('mdrrmo_records?select=id&deletedAt=is.not.null&id=in.('+ids.map(encodeURIComponent).join(',')+')');
    if(!found.ok){
      // JSON fields cannot be filtered consistently across all PostgREST setups; fall back to all rows.
      const all=await sb('mdrrmo_records?select=id,data');
      if(!all.ok)return res.status(all.status).send(await all.text());
      const rows=await all.json();
      for(const row of rows){
        if(!ids.includes(String(row.id)) || !row.data?.deletedAt)continue;
        const d=await sb(`mdrrmo_records?id=eq.${encodeURIComponent(String(row.id))}`,{method:'DELETE'});
        if(!d.ok)return res.status(d.status).send(await d.text());
      }
      return res.json({ok:true,ids});
    }
    const rows=await found.json();
    for(const row of rows){
      const d=await sb(`mdrrmo_records?id=eq.${encodeURIComponent(String(row.id))}`,{method:'DELETE'});
      if(!d.ok)return res.status(d.status).send(await d.text());
    }
    return res.json({ok:true,ids:rows.map(x=>String(x.id))});
  }

  res.status(405).end();
};
