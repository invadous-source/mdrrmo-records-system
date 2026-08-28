const crypto = require('crypto');
const SECRET = process.env.SESSION_SECRET;
function sign(payload){return crypto.createHmac('sha256',SECRET).update(payload).digest('base64url')}
function parseCookie(req){const out={};(req.headers.cookie||'').split(';').forEach(x=>{let i=x.indexOf('=');if(i>0)out[x.slice(0,i).trim()]=decodeURIComponent(x.slice(i+1).trim())});return out}
function makeToken(role){const payload=Buffer.from(JSON.stringify({role,username:'MDRRMO',exp:Date.now()+1000*60*60*12})).toString('base64url');return payload+'.'+sign(payload)}
function user(req){const t=parseCookie(req).mdrrmo_session;if(!t||!SECRET)return null;const [p,s]=t.split('.');if(!p||s!==sign(p))return null;try{const x=JSON.parse(Buffer.from(p,'base64url').toString());return x.exp>Date.now()?x:null}catch{return null}}
function auth(req,res,admin=false){const u=user(req);if(!u||(admin&&u.role!=='admin')){res.status(403).json({error:'Forbidden'});return null}return u}
async function sb(path,opts={}){const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('Supabase environment variables are missing');const r=await fetch(url+'/rest/v1/'+path,{...opts,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',...(opts.headers||{})}});return r}
module.exports={makeToken,user,auth,sb};
