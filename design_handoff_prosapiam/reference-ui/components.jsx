// components.jsx — atoms + small molecules for the Prosapiam UI kit
const { useState, useRef, useEffect } = React;

// ---------- Icon (Lucide-style inline SVGs) ----------
const PATHS = {
  search:    'M21 21l-4.3-4.3 M11 11 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0',
};
function Icon({ name, size = 16, color = 'currentColor', strokeWidth = 1.5, style = {} }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  switch (name) {
    case 'search': return (<svg {...common}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>);
    case 'plus':   return (<svg {...common}><path d="M5 12h14M12 5v14"/></svg>);
    case 'user':   return (<svg {...common}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
    case 'tree':   return (<svg {...common}><circle cx="12" cy="5" r="2.5"/><path d="M12 7.5V13"/><path d="M6 18 L12 13 L18 18"/><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="19" r="2.5"/></svg>);
    case 'memory': return (<svg {...common}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
    case 'photo':  return (<svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>);
    case 'date':   return (<svg {...common}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>);
    case 'close':  return (<svg {...common}><path d="M18 6L6 18M6 6l12 12"/></svg>);
    case 'arrow':  return (<svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
    case 'chevron':return (<svg {...common}><path d="M6 9l6 6 6-6"/></svg>);
    case 'menu':   return (<svg {...common}><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>);
    case 'edit':   return (<svg {...common}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>);
    case 'home':   return (<svg {...common}><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>);
    case 'mail':   return (<svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg>);
    case 'lock':   return (<svg {...common}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>);
    default: return null;
  }
}

// ---------- Button ----------
function Button({ variant = 'primary', size = 'md', icon, iconRight, children, onClick, style = {}, ...rest }) {
  const heights = { sm: 28, md: 36, lg: 48 };
  const fonts   = { sm: 12, md: 13, lg: 15 };
  const padX    = { sm: 16, md: 24, lg: 32 };
  const radii   = { sm: 3,  md: 4,  lg: 4 };
  const base = {
    fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: fonts[size],
    height: heights[size], padding: `0 ${padX[size]}px`, borderRadius: radii[size],
    border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
    transition: 'all 150ms cubic-bezier(.22,1,.36,1)', minWidth: 80, lineHeight: 1, whiteSpace: 'nowrap',
  };
  const styles = {
    primary:     { ...base, background: '#1C1A17', color: '#F7F4EE' },
    secondary:   { ...base, background: 'transparent', border: '0.5px solid #D6CFC4', color: '#1C1A17' },
    ghost:       { ...base, background: 'transparent', color: '#1C1A17', textDecoration: 'underline', textUnderlineOffset: 3, minWidth: 0, padding: '0 8px' },
    destructive: { ...base, background: '#8C4A38', color: '#F7F4EE' },
  };
  return (
    <button onClick={onClick} style={{ ...styles[variant], ...style }}
      onMouseEnter={e => { if (variant==='primary'||variant==='destructive') e.currentTarget.style.opacity='.85'; if(variant==='secondary'){e.currentTarget.style.background='#EDE8E0';e.currentTarget.style.borderColor='#C4B9A8';} if(variant==='ghost')e.currentTarget.style.opacity='.70'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity='1'; if(variant==='secondary'){e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='#D6CFC4';} }}
      {...rest}>
      {icon && <Icon name={icon} size={size==='lg'?18:16}/>}
      <span style={{ whiteSpace: 'nowrap' }}>{children}</span>
      {iconRight && <Icon name={iconRight} size={16}/>}
    </button>
  );
}

// ---------- Input ----------
function Input({ label, type='text', placeholder, value, onChange, error, prefix, style = {}, ...rest }) {
  const [focus, setFocus] = useState(false);
  return (
    <label style={{ display:'flex', flexDirection:'column', gap:6, ...style }}>
      {label && <span style={{ font:'500 11px var(--font-display)', letterSpacing:'.10em', textTransform:'uppercase', color:'#7A6F63' }}>{label}</span>}
      <span style={{
        display:'flex', alignItems:'center', gap:8, height:36, padding:'0 12px',
        background: focus ? '#fff' : (error ? '#F2E4E1' : '#E5DDD2'),
        border: error ? '0.5px solid #8C4A38' : (focus ? '0.5px solid #8C7355' : '0.5px solid #D6CFC4'),
        borderRadius:4, outline: focus ? '2px solid rgba(28,26,23,.20)' : 'none', outlineOffset: 2,
        transition:'all 150ms cubic-bezier(.22,1,.36,1)',
      }}>
        {prefix && <Icon name={prefix} size={14} color="#7A6F63"/>}
        <input type={type} placeholder={placeholder} value={value||''} onChange={onChange}
          onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
          style={{ flex:1, border:'none', outline:'none', background:'transparent', font:'400 14px var(--font-display)', color:'#1C1A17' }}
          {...rest}/>
      </span>
      {error && <span style={{ font:'400 12px var(--font-display)', color:'#8C4A38' }}>{error}</span>}
    </label>
  );
}

// ---------- Avatar ----------
function Avatar({ person, size=48, deceased, style={} }) {
  const fontSize = Math.round(size * 0.36);
  const initials = person?.initials || (person ? (person.given?.[0]||'') + (person.family?.[0]||'') : '?');
  return (
    <span style={{
      width:size, height:size, borderRadius:9999, background:'#E5DDD2',
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      font:`500 ${fontSize}px var(--font-display)`, color:'#7A6F63',
      border:'0.5px solid #D6CFC4', flexShrink:0,
      filter: (deceased || person?.status==='deceased') ? 'grayscale(.25)' : 'none',
      background: (deceased || person?.status==='deceased') ? '#D9D0C4' : '#E5DDD2',
      ...style,
    }}>{initials}</span>
  );
}

// ---------- Badge ----------
function Badge({ variant='default', children, dot }) {
  const styles = {
    default: { bg:'rgba(28,26,23,.08)', fg:'#3D3A35' },
    gold:    { bg:'rgba(140,115,85,.12)', fg:'#7A5F3E' },
    sage:    { bg:'#E4EDE5', fg:'#5A6B5C', dot:'#5A6B5C' },
    terra:   { bg:'#F2E4E1', fg:'#8C4A38', dot:'#8C4A38' },
    warm:    { bg:'#E5DDD2', fg:'#7A6F63' },
  };
  const s = styles[variant];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, font:'500 10px var(--font-display)', letterSpacing:'.06em', textTransform:'uppercase', padding:'3px 8px', borderRadius:2, background:s.bg, color:s.fg }}>
      {dot && s.dot && <span style={{ width:6, height:6, borderRadius:9999, background:s.dot }}/>}
      {children}
    </span>
  );
}

// ---------- Tag ----------
function Tag({ children, onDismiss, onClick }) {
  return (
    <span onClick={onClick} style={{ display:'inline-flex', alignItems:'center', gap:6, font:'400 12px var(--font-display)', height:28, padding: onDismiss?'0 8px 0 10px':'0 10px', background:'#E5DDD2', border:'0.5px solid #D6CFC4', borderRadius:2, color:'#3D3A35', cursor:onClick?'pointer':'default' }}>
      {children}
      {onDismiss && <span onClick={e=>{e.stopPropagation();onDismiss();}} style={{ color:'#7A6F63', cursor:'pointer', fontSize:14, lineHeight:1 }}>×</span>}
    </span>
  );
}

// ---------- Card ----------
function Card({ children, interactive, featured, onClick, style={} }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={()=>interactive&&setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        background: hover ? '#D9D0C4' : '#EDE8E0',
        border: featured ? '1px solid #8C7355' : (hover ? '0.5px solid #C4B9A8' : '0.5px solid #D6CFC4'),
        borderRadius:10, padding:24, cursor: interactive?'pointer':'default',
        transition:'all 150ms cubic-bezier(.22,1,.36,1)', ...style,
      }}>
      {children}
    </div>
  );
}

// ---------- Tabs ----------
function Tabs({ value, onChange, items }) {
  return (
    <div style={{ display:'flex', borderBottom:'0.5px solid #D6CFC4' }}>
      {items.map(it => {
        const active = value === it.value;
        return (
          <div key={it.value} onClick={()=>onChange(it.value)}
            style={{ font:'500 13px var(--font-display)', height:40, padding:'0 24px',
              display:'flex', alignItems:'center', cursor:'pointer',
              color: active ? '#1C1A17' : '#7A6F63',
              borderBottom: active ? '2px solid #8C7355' : '2px solid transparent',
              marginBottom:-1,
            }}>
            {it.label}
            {it.count!=null && <span style={{ marginLeft:8, background:'#E5DDD2', color:'#7A6F63', font:'500 10px var(--font-display)', padding:'1px 7px', borderRadius:9999 }}>{it.count}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ---------- TopNav ----------
function TopNav({ active, onNav, onAvatar }) {
  const links = [
    { id:'dashboard', label:'Home' },
    { id:'tree', label:'Tree' },
    { id:'memories', label:'Memories' },
  ];
  return (
    <header style={{ background:'#1C1A17', color:'#F7F4EE', padding:'14px 32px', display:'flex', alignItems:'center', gap:32 }}>
      <span style={{ font:'300 22px var(--font-display)', letterSpacing:'-0.01em', whiteSpace:'nowrap', flexShrink:0 }}>prosapiam</span>
      <nav style={{ display:'flex', gap:24 }}>
        {links.map(l => (
          <a key={l.id} onClick={()=>onNav(l.id)}
            style={{ font:'500 13px var(--font-display)', color: active===l.id ? '#F7F4EE' : '#C4B9A8', textDecoration:'none', cursor:'pointer' }}>
            {l.label}
          </a>
        ))}
      </nav>
      <div style={{ marginLeft:'auto', display:'flex', gap:18, alignItems:'center' }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'0 12px', height:32, background:'rgba(247,244,238,.07)', border:'0.5px solid rgba(247,244,238,.15)', borderRadius:4, color:'#C4B9A8', font:'400 13px var(--font-display)' }}>
          <Icon name="search" size={14}/> Search family members…
        </span>
        <span onClick={onAvatar} style={{ width:32, height:32, borderRadius:9999, background:'#3D3A35', display:'inline-flex', alignItems:'center', justifyContent:'center', font:'600 12px var(--font-display)', color:'#F7F4EE', cursor:'pointer' }}>SW</span>
      </div>
    </header>
  );
}

Object.assign(window, { Icon, Button, Input, Avatar, Badge, Tag, Card, Tabs, TopNav });
