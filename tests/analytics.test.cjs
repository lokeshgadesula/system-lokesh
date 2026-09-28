/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS test harness resets require.cache to simulate fresh documents. */
const {test,after} = require('node:test');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const {mkdtempSync,rmSync,realpathSync} = require('node:fs');
const {tmpdir} = require('node:os');
const path = require('node:path');
const output = realpathSync(mkdtempSync(path.join(tmpdir(),'portfolio-analytics-tests-')));
execFileSync(process.execPath,[require.resolve('typescript/bin/tsc'),'--outDir',output,'--module','commonjs','--target','es2022','--skipLibCheck','lib/analytics/session.ts','supabase/functions/portfolio-notify/cors.ts']);
after(() => rmSync(output,{recursive:true,force:true}));
const storage = () => {const map = new Map(); return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};};
function setup(handler) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-placeholder';
  global.window = {localStorage:storage(),sessionStorage:storage(),location:{pathname:'/',search:''}};
  global.document = {referrer:'https://example.org/path?private=query',title:'Test',visibilityState:'visible'};
  Object.defineProperty(global,'navigator',{value:{userAgent:'Chrome/140',doNotTrack:'0'},configurable:true});
  const calls = [];
  global.fetch = async (url,options) => {
    const name = url.split('/').pop(), body = JSON.parse(options.body);
    calls.push({name,body});
    const custom = await handler?.(name,body,calls);
    if (custom instanceof Error) throw custom;
    return new Response(JSON.stringify(custom ?? {accepted:true}),{status:200});
  };
  for (const key of Object.keys(require.cache)) if (key.startsWith(output)) delete require.cache[key];
  return {api:require(path.join(output,'lib/analytics/session.js')),calls};
}
test('Strict Mode concurrent startup waits for acknowledged session and sends one startup/page event',async()=>{
  let release;
  const gate = new Promise(resolve=>release=resolve);
  const {api,calls} = setup(async name=>{if(name==='portfolio_session_touch') await gate;});
  const first=api.startAnalytics(),second=api.startAnalytics();
  await Promise.resolve();
  assert.equal(calls.length,1);
  assert.equal(calls[0].name,'portfolio_session_touch');
  release(); await Promise.all([first,second]);
  assert.deepEqual(calls.map(c=>c.body.p_event_type).filter(Boolean),['session_started','page_view']);
  assert.equal(calls[0].body.p_referrer,'https://example.org');
});
test('failed session acknowledgement never releases events and heartbeat recovers with same session',async()=>{
  let fail=true;
  const {api,calls}=setup(name=>name==='portfolio_session_touch' && fail ? {accepted:false}:undefined);
  assert.equal(await api.startAnalytics(),false);
  assert.equal(calls.length,1);
  fail=false;
  await api.heartbeatAnalytics();
  assert.equal(calls[0].body.p_session_id,calls[1].body.p_session_id);
  assert.equal(calls.filter(c=>c.body.p_event_type==='page_view').length,1);
});
test('returning state captures prior visit and survives effect replay/refresh',async()=>{
  let {api}=setup();
  await api.startAnalytics();
  assert.equal(api.isReturningSession(),false);
  assert.equal(window.localStorage.getItem('portfolio-returning'),'1');
  await api.startAnalytics(); assert.equal(api.isReturningSession(),false);
  for(const key of Object.keys(require.cache)) if(key.startsWith(output)) delete require.cache[key];
  api=require(path.join(output,'lib/analytics/session.js'));
  await api.startAnalytics(); assert.equal(api.isReturningSession(),false);
  ({api}=setup()); window.localStorage.setItem('portfolio-returning','1');
  await api.startAnalytics(); assert.equal(api.isReturningSession(),true);
});
test('lost event acknowledgement retries same UUID; notification follows committed activity',async()=>{
  let failed=false;
  const {api,calls}=setup((name,body)=>{if(name==='portfolio_record_event' && body.p_event_type==='contact_clicked' && !failed){failed=true;return new Error('lost response');}});
  await api.startAnalytics();
  await Promise.all([api.recordAnalytics('contact_clicked'),api.recordAnalytics('engaged_visitor',{},'engagement')]);
  const events=calls.filter(c=>c.body.p_event_type==='contact_clicked');
  assert.equal(events.length,2); assert.equal(events[0].body.p_event_id,events[1].body.p_event_id);
  assert.equal(calls.at(-1).name,'portfolio-notify');
});
test('identity failure cannot trigger notification and hidden heartbeats perform no work',async()=>{
  const {api,calls}=setup(name=>name==='portfolio_identify_visitor'?{accepted:false}:undefined);
  await api.identifyAnalytics({name:'Test'});
  assert.equal(calls.some(c=>c.name==='portfolio-notify'),false);
  const count=calls.length; document.visibilityState='hidden';
  await api.heartbeatAnalytics(); assert.equal(calls.length,count);
});
test('DNT and storage denial do not crash or create duplicate session IDs',async()=>{
  let {api,calls}=setup(); navigator.doNotTrack='1';
  await api.startAnalytics(); assert.equal(calls.length,0);
  ({api,calls}=setup());
  const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
  window.localStorage=blocked;window.sessionStorage=blocked;
  await Promise.all([api.startAnalytics(),api.startAnalytics()]); await api.heartbeatAnalytics();
  assert.equal(new Set(calls.filter(c=>c.name==='portfolio_session_touch').map(c=>c.body.p_session_id)).size,1);
});
test('CORS exact origin, configurable production, explicit localhost opt-in, no null or spoofed origins',()=>{
  const {corsForOrigin}=require(path.join(output,'supabase/functions/portfolio-notify/cors.js'));
  assert.equal(corsForOrigin('https://imlokesh.me','https://imlokesh.me',false)['Access-Control-Allow-Origin'],'https://imlokesh.me');
  for(const origin of [null,'null','https://evil.test','https://imlokesh.me.evil.test','http://localhost:3000']) assert.equal(corsForOrigin(origin,'https://imlokesh.me',false),null);
  assert.equal(corsForOrigin('http://localhost:4175','https://imlokesh.me',true)['Access-Control-Allow-Origin'],'http://localhost:4175');
  assert.equal(corsForOrigin('http://localhost.evil.test:3000','https://imlokesh.me',true),null);
  assert.ok(corsForOrigin('https://portfolio.example','https://portfolio.example',false));
});
