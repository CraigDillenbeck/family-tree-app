function AuthScreen({ onSignIn }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('sarah@example.com');
  const [pw, setPw] = useState('•••••••••');
  const isSignin = mode === 'signin';
  return (
    <div style={{ minHeight:'100%', background:'#F7F4EE', display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 24px' }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <img src="../../assets/logo-mark.svg" width="40" height="40" alt=""/>
          <div style={{ font:'300 32px var(--font-display)', letterSpacing:'-0.01em', color:'#1C1A17', marginTop:14 }}>prosapiam</div>
          <div style={{ font:'400 14px var(--font-body)', fontStyle:'italic', color:'#7A6F63', marginTop:6 }}>The people who made you, kept.</div>
        </div>
        <div style={{ background:'#EDE8E0', border:'0.5px solid #D6CFC4', borderRadius:10, padding:32 }}>
          <div style={{ display:'flex', borderBottom:'0.5px solid #D6CFC4', marginBottom:24 }}>
            <div onClick={()=>setMode('signin')} style={{ flex:1, textAlign:'center', font:'500 13px var(--font-display)', height:40, lineHeight:'40px', color: isSignin?'#1C1A17':'#7A6F63', borderBottom: isSignin?'2px solid #8C7355':'2px solid transparent', marginBottom:-1, cursor:'pointer' }}>Sign in</div>
            <div onClick={()=>setMode('signup')} style={{ flex:1, textAlign:'center', font:'500 13px var(--font-display)', height:40, lineHeight:'40px', color: !isSignin?'#1C1A17':'#7A6F63', borderBottom: !isSignin?'2px solid #8C7355':'2px solid transparent', marginBottom:-1, cursor:'pointer' }}>Create account</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {!isSignin && <Input label="Given name" placeholder="Sarah"/>}
            <Input label="Email" type="email" prefix="mail" value={email} onChange={e=>setEmail(e.target.value)}/>
            <Input label="Password" type="password" prefix="lock" value={pw} onChange={e=>setPw(e.target.value)}/>
            {isSignin && <a className="mn-link" style={{ font:'400 12px var(--font-display)', color:'#3D3A35', alignSelf:'flex-end' }}>Forgotten password?</a>}
            <Button onClick={onSignIn} size="lg" style={{ width:'100%', justifyContent:'center', marginTop:8 }}>{isSignin ? 'Sign in' : 'Create account'}</Button>
            {!isSignin && <p style={{ font:'400 12px var(--font-display)', color:'#7A6F63', lineHeight:1.6, margin:0, textAlign:'center' }}>By creating an account you agree to keep family stories with the care they deserve.</p>}
          </div>
        </div>
        <div style={{ textAlign:'center', marginTop:20, font:'400 13px var(--font-display)', color:'#7A6F63' }}>
          {isSignin ? <>New to Prosapiam? <a onClick={()=>setMode('signup')} className="mn-link" style={{ cursor:'pointer' }}>Create an account</a></>
                    : <>Already have one? <a onClick={()=>setMode('signin')} className="mn-link" style={{ cursor:'pointer' }}>Sign in</a></>}
        </div>
      </div>
    </div>
  );
}
window.AuthScreen = AuthScreen;
