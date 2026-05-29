function ProfileView({ personId, onBack }) {
  const F = window.FAMILY;
  const p = F.people[personId] || F.people.mw;
  const [tab, setTab] = useState('memories');
  const memories = F.memories.filter(m => m.personId === p.id);

  return (
    <div style={{ background:'#F7F4EE', minHeight:'100%' }}>
      {/* breadcrumb */}
      <div style={{ padding:'16px 80px', borderBottom:'0.5px solid rgba(28,26,23,.07)' }}>
        <a onClick={onBack} className="mn-link" style={{ font:'400 12px var(--font-display)', color:'#7A6F63', cursor:'pointer', textDecorationColor:'#C4B9A8' }}>← Back to tree</a>
      </div>
      {/* header */}
      <header style={{ padding:'48px 80px 32px 80px', display:'flex', gap:48, alignItems:'flex-start', maxWidth:1280, margin:'0 auto' }}>
        <Avatar person={p} size={128}/>
        <div style={{ flex:1 }}>
          <h1 style={{ font:'300 40px var(--font-display)', letterSpacing:'-0.01em', color:'#1C1A17', margin:0 }}>{p.given} {p.middle?p.middle+' ':''}{p.family}</h1>
          <div style={{ font:'400 16px var(--font-display)', color:'#7A6F63', marginTop:6 }}>{p.dates === `b. ${new Date().getFullYear()}` ? p.dates : p.dates} · {p.loc}</div>
          <div style={{ font:'400 13px var(--font-display)', color:'#7A6F63', marginTop:8 }}>Your {p.rel.toLowerCase()} on your father&rsquo;s side</div>
          <div style={{ marginTop:14 }}>
            <Badge variant={p.status==='living'?'sage':'terra'} dot>{p.status==='living'?'Living':'Deceased'}</Badge>
          </div>
          {p.bio && <p style={{ font:'400 17px var(--font-body)', color:'#3D3A35', lineHeight:1.75, margin:'24px 0 0 0', maxWidth:680 }}>{p.bio}</p>}
          <div style={{ display:'flex', gap:10, marginTop:24 }}>
            <Button icon="memory">Add a memory</Button>
            <Button variant="secondary" icon="edit">Edit profile</Button>
            <Button variant="ghost">Add relationship</Button>
          </div>
        </div>
      </header>
      {/* tabs */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 80px' }}>
        <Tabs value={tab} onChange={setTab} items={[
          { value:'about', label:'About' },
          { value:'memories', label:'Memories', count: memories.length },
          { value:'media', label:'Media', count: 6 },
          { value:'relationships', label:'Relationships', count: 4 },
        ]}/>
      </div>
      {/* tab body */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'40px 80px 80px 80px' }}>
        {tab === 'memories' && (
          <div style={{ maxWidth:680, margin:'0 auto', display:'flex', flexDirection:'column', gap:24 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ font:'500 11px var(--font-display)', letterSpacing:'.10em', textTransform:'uppercase', color:'#7A6F63' }}>Newest first</span>
              <Tag>All memories</Tag>
            </div>
            {memories.map(m => (
              <Card key={m.id} interactive>
                <h3 style={{ font:'500 16px var(--font-display)', color:'#1C1A17', margin:0 }}>{m.title}</h3>
                <p style={{ font:'400 14px var(--font-body)', fontStyle:'italic', color:'#3D3A35', lineHeight:1.7, margin:'8px 0 0 0' }}>{m.excerpt}</p>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:14 }}>
                  <span style={{ font:'400 11px var(--font-display)', color:'#7A6F63' }}>{m.date}</span>
                  <span style={{ font:'400 11px var(--font-display)', color:'#C4B9A8' }}>·</span>
                  {m.tags.map(t => <Badge key={t} variant="warm">{t}</Badge>)}
                </div>
              </Card>
            ))}
          </div>
        )}
        {tab === 'about' && (
          <div style={{ maxWidth:680, margin:'0 auto' }}>
            <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', rowGap:16, columnGap:24 }}>
              {[['Given name', p.given],['Family name', p.family],['Born', p.dates.split('–')[0].replace('b.','').trim()],['Birthplace', p.loc],['Status', p.status==='living'?'Living':'Deceased']].map(([k,v]) => (
                <React.Fragment key={k}>
                  <div style={{ font:'500 11px var(--font-display)', letterSpacing:'.10em', textTransform:'uppercase', color:'#7A6F63', paddingTop:2 }}>{k}</div>
                  <div style={{ font:'400 15px var(--font-display)', color:'#1C1A17' }}>{v}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
        {tab === 'media' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, maxWidth:900, margin:'0 auto' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background:'#EDE8E0', border:'0.5px solid #D6CFC4', borderRadius:10, overflow:'hidden' }}>
                <div style={{ aspectRatio:'4/3', background:`hsl(${30+i*8}, ${22-i}%, ${72-i*3}%)`, position:'relative' }}>
                  <span style={{ position:'absolute', top:8, left:8 }}><Badge variant="warm">{i%2?'Photograph':'Letter'}</Badge></span>
                </div>
                <div style={{ padding:12 }}>
                  <div style={{ font:'400 12px var(--font-display)', color:'#3D3A35' }}>Cork, summer of {1960+i}</div>
                  <div style={{ font:'400 11px var(--font-display)', color:'#7A6F63', marginTop:2 }}>Added by Patrick</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'relationships' && (
          <div style={{ maxWidth:680, margin:'0 auto', display:'flex', flexDirection:'column', gap:12 }}>
            {[
              {id:'jw', label:'Spouse'},
              {id:'pw', label:'Son'},
              {id:'sw', label:'Granddaughter'},
              {id:'tw', label:'Grandson'},
            ].map(r => {
              const rp = F.people[r.id];
              return (
                <div key={r.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:'#EDE8E0', border:'0.5px solid #D6CFC4', borderRadius:10 }}>
                  <Avatar person={rp} size={48}/>
                  <div style={{ flex:1 }}>
                    <div style={{ font:'500 14px var(--font-display)', color:'#1C1A17' }}>{rp.given} {rp.family}</div>
                    <div style={{ font:'400 12px var(--font-display)', color:'#7A6F63' }}>{rp.dates}</div>
                  </div>
                  <Badge variant="warm">{r.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
window.ProfileView = ProfileView;
