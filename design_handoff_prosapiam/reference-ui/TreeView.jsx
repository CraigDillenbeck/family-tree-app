function TreeView({ onPerson }) {
  const F = window.FAMILY;
  const [selected, setSelected] = useState('mw');
  // Manual layout (x,y on a 1100×640 canvas)
  const layout = {
    er:{x:140,y:60}, cr:{x:340,y:60}, mw:{x:620,y:60}, jw:{x:820,y:60},
    aw:{x:240,y:280}, pw:{x:720,y:280},
    sw:{x:480,y:520}, tw:{x:760,y:520},
  };
  const W=160, H=110;
  const center = (id) => ({ x: layout[id].x + W/2, y: layout[id].y + H/2 });

  function PCLine({from, to}) {
    const a = center(from), b = center(to);
    const midY = a.y + (b.y - a.y)/2;
    return <path d={`M${a.x} ${a.y+H/2} V${midY} H${b.x} V${b.y-H/2}`} stroke="#C4B9A8" strokeWidth="1" fill="none"/>;
  }
  function SpouseLine({a, b}) {
    const ca = center(a), cb = center(b);
    return <line x1={ca.x+W/2-8} y1={ca.y} x2={cb.x-W/2+8} y2={cb.y} stroke="#BFA882" strokeWidth="1.5"/>;
  }

  const parents = {}; F.edges.filter(e=>e[2]==='parent').forEach(([p,c])=>{ (parents[c]=parents[c]||[]).push(p); });

  return (
    <div style={{ background:'#F7F4EE', minHeight:'100%', position:'relative' }}>
      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'18px 32px', borderBottom:'0.5px solid #D6CFC4' }}>
        <h1 style={{ font:'500 20px var(--font-display)', color:'#1C1A17', margin:0 }}>The Walsh family</h1>
        <Badge variant="warm">8 people · 4 generations</Badge>
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:6, font:'400 12px var(--font-display)', color:'#7A6F63' }}>
            <span style={{ width:14, height:1.5, background:'#C4B9A8' }}/>parent
            <span style={{ width:14, height:1.5, background:'#BFA882', marginLeft:8 }}/>spouse
          </span>
          <Button variant="secondary" size="sm" icon="plus">Add person</Button>
          <Button size="sm">Add relationship</Button>
        </div>
      </div>
      {/* Canvas */}
      <div style={{ position:'relative', width:'100%', height:680, overflow:'hidden',
        backgroundImage:'radial-gradient(rgba(196,185,168,.35) 1px, transparent 1px)',
        backgroundSize:'18px 18px',
      }}>
        <svg width="100%" height="100%" style={{ position:'absolute', inset:0, pointerEvents:'none' }} viewBox="0 0 1100 680" preserveAspectRatio="xMidYMid meet">
          <SpouseLine a="er" b="cr"/>
          <SpouseLine a="mw" b="jw"/>
          <SpouseLine a="aw" b="pw"/>
          {Object.entries(parents).map(([c, ps]) => (
            <g key={c}>{ps.map(p => <PCLine key={p+'-'+c} from={p} to={c}/>)}</g>
          ))}
        </svg>
        <div style={{ position:'absolute', inset:0, transform:'scale(1)', transformOrigin:'top left' }}>
          {Object.values(F.people).map(p => {
            const pos = layout[p.id]; if(!pos) return null;
            const isSel = selected===p.id;
            return (
              <div key={p.id}
                onClick={()=>setSelected(p.id)}
                onDoubleClick={()=>onPerson(p.id)}
                style={{
                  position:'absolute', left:pos.x, top:pos.y, width:W, minHeight:H,
                  background: isSel?'#EDE8E0':'#fff',
                  border: isSel?'1px solid #8C7355':'0.5px solid #D6CFC4',
                  borderRadius:6, padding:'12px 10px',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                  cursor:'pointer', transition:'all 150ms cubic-bezier(.22,1,.36,1)',
                }}>
                <Avatar person={p} size={44}/>
                <div style={{ font:'500 13px var(--font-display)', color:'#1C1A17', textAlign:'center', lineHeight:1.2 }}>{p.given} {p.family}</div>
                <div style={{ font:'400 11px var(--font-display)', color:'#7A6F63' }}>{p.dates}</div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Detail drawer */}
      {selected && (() => {
        const p = F.people[selected];
        return (
          <aside style={{ position:'absolute', top:69, right:0, bottom:0, width:380, background:'#F7F4EE', borderLeft:'0.5px solid #D6CFC4', padding:24, display:'flex', flexDirection:'column', gap:16, overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ font:'500 11px var(--font-display)', letterSpacing:'.10em', textTransform:'uppercase', color:'#7A6F63' }}>Quick view</span>
              <span onClick={()=>setSelected(null)} style={{ cursor:'pointer', color:'#7A6F63' }}><Icon name="close" size={16}/></span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, paddingTop:8 }}>
              <Avatar person={p} size={96}/>
              <div style={{ font:'300 28px var(--font-display)', color:'#1C1A17', textAlign:'center' }}>{p.given} {p.family}</div>
              <div style={{ font:'400 13px var(--font-display)', color:'#7A6F63' }}>{p.dates} · {p.loc}</div>
              <Badge variant={p.status==='living'?'sage':'terra'} dot>{p.status==='living'?'Living':'Deceased'}</Badge>
              <div style={{ font:'400 12px var(--font-display)', color:'#7A6F63', marginTop:4 }}>{p.rel}</div>
            </div>
            {p.bio && <p style={{ font:'400 15px var(--font-body)', fontStyle:'italic', color:'#3D3A35', lineHeight:1.75, margin:0 }}>{p.bio}</p>}
            <div style={{ display:'flex', gap:8, marginTop:'auto' }}>
              <Button onClick={()=>onPerson(p.id)} style={{ flex:1, justifyContent:'center' }}>View profile</Button>
              <Button variant="secondary" icon="memory">Add memory</Button>
            </div>
          </aside>
        );
      })()}
    </div>
  );
}
window.TreeView = TreeView;
