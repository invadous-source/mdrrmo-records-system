const {auth,sb}=require('../_lib');

module.exports=async(req,res)=>{
  if(req.method==='GET'){
    if(!auth(req,res))return;
    const r=await sb('mdrrmo_records?select=data&order=created_at.desc');
    if(!r.ok)return res.status(r.status).send(await r.text());
    const rows=await r.json();
    return res.json(rows.map(x=>x.data).filter(x=>!x?.deletedAt));
  }

  if(req.method==='POST'){
    if(!auth(req,res,true))return;
    const d=req.body||{};
    const data={...d,deletedAt:null};
    const r=await sb('mdrrmo_records',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({id:String(data.id),data})});
    if(!r.ok)return res.status(r.status).send(await r.text());
    const row=(await r.json())[0];
    return res.status(201).json(row.data);
  }

  if(req.method==='DELETE'){
    const u=auth(req,res,true); if(!u)return;
    const ids=Array.isArray(req.body?.ids)?req.body.ids.map(x=>String(x)).filter(Boolean):[];
    if(!ids.length)return res.status(400).json({error:'No record IDs supplied.'});

    const q='mdrrmo_records?select=id,data&id=in.('+ids.map(encodeURIComponent).join(',')+')';
    const found=await sb(q);
    if(!found.ok)return res.status(found.status).send(await found.text());
    const rows=await found.json();
    const now=new Date().toISOString();
    const deletedBy=u.username||'Administrator';

    for(const row of rows){
      const data={...(row.data||{}),deletedAt:now,deletedBy};
      const r=await sb(`mdrrmo_records?id=eq.${encodeURIComponent(String(row.id))}`,{
        method:'PATCH',
        headers:{Prefer:'return=minimal'},
        body:JSON.stringify({data})
      });
      if(!r.ok)return res.status(r.status).send(await r.text());
    }
    return res.json({ok:true,ids:rows.map(x=>String(x.id)),count:rows.length});
  }

  res.status(405).end();
};
