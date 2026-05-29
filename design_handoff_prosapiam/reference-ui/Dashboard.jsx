function Dashboard({ onNav, onPerson }) {
  const F = window.FAMILY;
  const me = F.people.sw;
  return (
    <div style={{ background:'#F7F4EE', minHeight:'100%', padding:'40px 80px' }}>
      <div style={{ maxWidth:1120, margin:'0 auto' }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ font:'400 13px var(--font-body)', fontStyle:'italic', color:'#7A6F63' }}>Wednesday, March 12</div>
          <h1 style={{ font:'300 40px var(--font-display)', letterSpacing:'-0.01em', color:'#1C1A17', margin:'4px 0 0 0' }}>Welcome back, Sarah.</h1>
          <p style={{ font:'400 15px var(--font-body)', fontStyle:'italic', color:'#3D3A35', maxWidth:560, margin:'10px 0 0 0', lineHeight:1.7 }}>Three new memories were added this week. Your tree has grown to eight people across four generations.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:24 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
            <Card style={{ padding:0 }}>
              <div style={{ padding:'18px 24px', borderBottom:'0.5px solid #D6CFC4', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ font:'500 11px var(--font-display)', letterSpacing:'.10em', textTransform:'uppercase', color:'#7A6F63' }}>Recent activity</span>
                <a className="mn-link" style={{ font:'400 12px var(--font-display)', cursor:'pointer' }}>See all</a>
              </div>
              <div>
                {F.activity.map((a,i) => (
                  <div key={i} style={{ padding:'14px 24px', borderBottom: i<F.activity.length-1?'0.5px solid rgba(28,26,23,.07)':'none', display:'flex', alignItems:'center', gap:14 }}>
                    <Avatar person={{initials: a.who[0]+a.who[1]||a.who[0], status:'living'}} size={32}/>
                    <div style={{ flex:1, font:'400 14px var(--font-display)', color:'#3D3A35' }}>
                      <b style={{ color:'#1C1A17', fontWeight:500 }}>{a.who}</b> {a.action} <a className="mn-link" style={{ cursor:'pointer' }}>{a.target}</a>
                    </div>
                    <span style={{ font:'400 11px var(--font-display)', color:'#7A6F63', whiteSpace:'nowrap' }}>{a.when}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card style={{ padding:0 }}>
              <div style={{ padding:'18px 24px', borderBottom:'0.5px solid #D6CFC4', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ font:'500 11px var(--font-display)', letterSpacing:'.10em', textTransform:'uppercase', color:'#7A6F63' }}>Latest memory</span>
                <Button variant="ghost" size="sm">Add memory</Button>
              </div>
              <div style={{ padding:24 }}>
                <h3 style={{ font:'500 18px var(--font-display)', color:'#1C1A17', margin:0 }}>{F.memories[0].title}</h3>
                <p style={{ font:'400 17px var(--font-body)', fontStyle:'italic', color:'#3D3A35', lineHeight:1.75, margin:'10px 0 0 0', maxWidth:580 }}>{F.memories[0].excerpt}</p>
                <div style={{ display:'flex', gap:8, marginTop:14, alignItems:'center' }}>
                  <Avatar person={F.people[F.memories[0].personId]} size={24}/>
                  <span style={{ font:'400 12px var(--font-display)', color:'#7A6F63' }}>About Margaret Walsh · {F.memories[0].date}</span>
                </div>
              </div>
            </Card>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
            <Card interactive onClick={()=>onNav('tree')}>
              <div style={{ font:'500 11px var(--font-display)', letterSpacing:'.10em', textTransform:'uppercase', color:'#7A6F63', marginBottom:8 }}>Your tree</div>
              <div style={{ font:'300 40px var(--font-display)', color:'#1C1A17', lineHeight:1 }}>8</div>
              <div style={{ font:'400 13px var(--font-display)', color:'#7A6F63', marginTop:6 }}>family members across 4 generations</div>
              <div style={{ display:'flex', marginTop:14 }}>
                {Object.values(F.people).slice(0,5).map((p,i) => (
                  <span key={p.id} style={{ marginLeft: i?-8:0 }}><Avatar person={p} size={28} style={{ border:'0.5px solid #EDE8E0' }}/></span>
                ))}
              </div>
            </Card>
            <Card>
              <div style={{ font:'500 11px var(--font-display)', letterSpacing:'.10em', textTransform:'uppercase', color:'#7A6F63', marginBottom:14 }}>Quick add</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <Button icon="plus" style={{ width:'100%', justifyContent:'center' }}>Add a person</Button>
                <Button variant="secondary" icon="memory" style={{ width:'100%', justifyContent:'center' }}>Add a memory</Button>
                <Button variant="secondary" icon="photo" style={{ width:'100%', justifyContent:'center' }}>Upload media</Button>
              </div>
            </Card>
            <Card>
              <div style={{ font:'500 11px var(--font-display)', letterSpacing:'.10em', textTransform:'uppercase', color:'#7A6F63', marginBottom:10 }}>People you might add</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[{n:'Eileen Walsh',d:'Margaret\u2019s sister'},{n:'Daniel Reilly',d:'Cormac\u2019s brother'}].map(s => (
                  <div key={s.n} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <Avatar person={{initials:s.n.split(' ').map(x=>x[0]).join('')}} size={32}/>
                    <div style={{ flex:1 }}>
                      <div style={{ font:'500 13px var(--font-display)', color:'#1C1A17' }}>{s.n}</div>
                      <div style={{ font:'400 11px var(--font-display)', color:'#7A6F63' }}>{s.d}</div>
                    </div>
                    <Button variant="ghost" size="sm">Add</Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
window.Dashboard = Dashboard;
