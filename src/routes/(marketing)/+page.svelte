<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData } from './$types'

  let { form }: { form: ActionData } = $props()

  let activeTab = $state<'signup' | 'login'>('signup')
  let loading = $state(false)
  let oauthLoading = $state(false)
  let errorVisible = $state(false)

  $effect(() => {
    if (form?.error) errorVisible = true
  })

  function switchTab(tab: 'signup' | 'login') {
    activeTab = tab
    loading = false
    errorVisible = false
  }

  let billing = $state<'monthly' | 'annual'>('monthly')

  const plans = [
    {
      key: 'remembrance',
      name: 'Remembrance',
      description: 'For families just beginning to gather their story.',
      price: 'Free',
      period: 'Forever',
      annualPrice: null as number | null,
      ctaPrimary: false,
      ctaLabel: 'Begin for free',
      ctaHref: '/signup',
      storage: '500 MB storage',
      storageNote: 'Plenty of room for your first family stories',
      features: [
        'Unlimited family members',
        'Unlimited written memories and stories',
        'Family tree canvas',
        'Profile thumbnails for each family member',
        'One family tree',
        'Community support',
      ],
      featured: false,
    },
    {
      key: 'heritage',
      name: 'Heritage',
      description: 'For families ready to preserve their full story — photographs, voices, and all.',
      price: '$7.99',
      period: '/month',
      annualPrice: 76.70,
      ctaPrimary: true,
      ctaLabel: 'Start with Heritage',
      ctaHref: '/signup',
      storage: '50 GB storage',
      storageNote: 'Room for thousands of family photographs',
      features: [
        'Everything in Remembrance',
        'Full photo galleries per profile',
        'Audio uploads — voice recordings and oral histories',
        'Up to 3 family trees',
        'Invite up to 10 family collaborators',
        'Export family tree as PDF',
        'Priority email support',
      ],
      featured: true,
    },
    {
      key: 'legacy',
      name: 'Legacy',
      description: 'For the dedicated family historian. Everything, unlimited, forever.',
      price: '$14.99',
      period: '/month',
      annualPrice: 143.90,
      ctaPrimary: false,
      ctaLabel: 'Start with Legacy',
      ctaHref: '/signup',
      storage: 'Unlimited storage',
      storageNote: 'No limits — every photo, video, and voice, kept forever',
      features: [
        'Everything in Heritage',
        'Video uploads — family films and recordings',
        'Unlimited family trees',
        'Unlimited collaborators',
        'Advanced export — PDF, GEDCOM, full archive download',
        'Early access to new features',
        'Dedicated support',
      ],
      featured: false,
    },
  ]
</script>

<svelte:head>
  <title>Prosapiam — Your family's story, beautifully told</title>
  <meta name="description" content="Build a visual family tree, preserve memories, and share your heritage with the people who matter most." />
</svelte:head>

<!-- ── Global Nav ── -->
<header class="nav">
  <a href="/" class="wordmark" aria-label="Prosapiam home">PROSAPIAM</a>
  <div class="nav-right">
    <a href="/login" class="nav-ghost">Sign in</a>
    <a href="/signup" class="nav-cta">Create account</a>
  </div>
</header>

<!-- ── Section 01: Hero ── -->
<section class="hero">
  <div class="noise" aria-hidden="true">
    <svg aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;opacity:0.05;pointer-events:none;mix-blend-mode:screen">
      <defs>
        <filter id="lp-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.97  0 0 0 0 0.96  0 0 0 0 0.93  0 0 0 0.8 0" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#lp-noise)" />
    </svg>
  </div>

  <div class="hero-inner">
    <div class="hero-left">
      <h1 class="hero-h1">Preserve, protect and remember your family's legacy.</h1>
      <p class="hero-sub">Gather your family's stories. Preserve the people behind your name. Celebrate the lives that made you — and make sure they're never forgotten.</p>
      <p class="hero-trust">Every memory, beautifully kept.</p>
    </div>

    <div class="hero-right">
      <div class="auth-panel">
        <div class="auth-panel-head">
          <span class="auth-wordmark">PROSAPIAM</span>
          <p class="auth-tagline">A place for the people who made you.</p>
        </div>
        <hr class="auth-divider" />

        <div class="auth-tabs" role="tablist" aria-label="Account access">
          <button
            role="tab"
            type="button"
            aria-selected={activeTab === 'signup'}
            class="auth-tab"
            class:auth-tab-active={activeTab === 'signup'}
            onclick={() => switchTab('signup')}
          >Create account</button>
          <button
            role="tab"
            type="button"
            aria-selected={activeTab === 'login'}
            class="auth-tab"
            class:auth-tab-active={activeTab === 'login'}
            onclick={() => switchTab('login')}
          >Sign in</button>
        </div>

        {#if form?.error && errorVisible}
          <div class="auth-alert" role="alert">{form.error}</div>
        {/if}

        {#if activeTab === 'signup'}
          <form
            method="POST"
            action="?/signup"
            use:enhance={() => {
              loading = true
              return async ({ update }) => { await update(); loading = false }
            }}
            class="auth-form"
          >
            <div class="auth-fields">
              <div class="auth-field">
                <label for="signup-name" class="auth-label">Given name</label>
                <input id="signup-name" class="auth-input" type="text" name="displayName" autocomplete="given-name" required placeholder="Sarah" />
              </div>
              <div class="auth-field">
                <label for="signup-email" class="auth-label">Email</label>
                <input id="signup-email" class="auth-input" type="email" name="email" autocomplete="email" required placeholder="you@example.com" />
              </div>
              <div class="auth-field">
                <label for="signup-password" class="auth-label">Password</label>
                <input id="signup-password" class="auth-input" type="password" name="password" autocomplete="new-password" required placeholder="At least 8 characters" />
              </div>
              <button type="submit" class="auth-submit" disabled={loading}>
                {loading ? 'Creating account…' : 'Create your account'}
              </button>
              <p class="auth-consent">By creating an account you agree to keep family stories with the care they deserve.</p>
            </div>
          </form>
        {:else}
          <form
            method="POST"
            action="?/login"
            use:enhance={() => {
              loading = true
              return async ({ update }) => { await update(); loading = false }
            }}
            class="auth-form"
          >
            <div class="auth-fields">
              <div class="auth-field">
                <label for="login-email" class="auth-label">Email</label>
                <input id="login-email" class="auth-input" type="email" name="email" autocomplete="email" required placeholder="you@example.com" />
              </div>
              <div class="auth-field">
                <label for="login-password" class="auth-label">Password</label>
                <input id="login-password" class="auth-input" type="password" name="password" autocomplete="current-password" required placeholder="Your password" />
                <a href="/forgot-password" class="auth-forgot">Forgotten password?</a>
              </div>
              <button type="submit" class="auth-submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>
        {/if}

        <div class="auth-or" aria-hidden="true"><span>or</span></div>

        <form
          method="POST"
          action="?/oauth"
          use:enhance={() => {
            oauthLoading = true
            return async ({ update }) => { await update(); oauthLoading = false }
          }}
        >
          <button type="submit" class="auth-google" disabled={oauthLoading}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {oauthLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>
        </form>

        <p class="auth-footnote">No subscription required to begin.</p>
      </div>
    </div>
  </div>
</section>

<!-- ── Section 02: Product Moment ── -->
<section class="product">
  <div class="section-inner">
    <p class="section-eyebrow">The Product</p>
    <h2 class="section-h2">Hold onto your family's memory.</h2>
    <p class="section-body">A living family tree that grows with every story you add — connecting generations, preserving faces, and keeping the people you love close forever.</p>

    <div class="tree-frame">
      <svg viewBox="0 0 960 480" width="100%" style="display:block" aria-label="Family tree illustration" role="img">
        <defs>
          <pattern id="dotgrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="#C4B9A8" opacity="0.5" />
          </pattern>
          <filter id="tree-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/>
            <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0 0.1  0 0 0 0.2 0"/>
          </filter>
        </defs>
        <rect width="960" height="480" fill="#F7F4EE"/>
        <rect width="960" height="480" fill="url(#dotgrid)"/>
        <!-- Spouse lines -->
        <line x1="346" y1="90" x2="414" y2="90" stroke="#BFA882" stroke-width="2" stroke-linecap="round"/>
        <line x1="646" y1="240" x2="714" y2="240" stroke="#BFA882" stroke-width="2" stroke-linecap="round"/>
        <!-- Family connectors -->
        <g stroke="#C4B9A8" stroke-width="1" fill="none" stroke-linecap="round">
          <line x1="380" y1="125" x2="380" y2="165"/><line x1="147" y1="165" x2="447" y2="165"/>
          <line x1="147" y1="165" x2="147" y2="205"/><line x1="313" y1="165" x2="313" y2="205"/><line x1="447" y1="165" x2="447" y2="205"/>
        </g>
        <g stroke="#C4B9A8" stroke-width="1" fill="none" stroke-linecap="round">
          <line x1="680" y1="275" x2="680" y2="320"/><line x1="443" y1="320" x2="603" y2="320"/>
          <line x1="443" y1="320" x2="443" y2="355"/><line x1="603" y1="320" x2="603" y2="355"/>
        </g>
        <g stroke="#C4B9A8" stroke-width="1" fill="none" stroke-linecap="round">
          <line x1="147" y1="275" x2="147" y2="320"/><line x1="97" y1="320" x2="247" y2="320"/>
          <line x1="97" y1="320" x2="97" y2="355"/><line x1="247" y1="320" x2="247" y2="355"/>
        </g>
        <!-- Gen 1 nodes -->
        <g>
          <rect x="214" y="55" width="132" height="70" rx="10" fill="#EDE8E0" stroke="#D6CFC4" stroke-width="0.5"/>
          <circle cx="280" cy="77" r="14" fill="#E5DDD2" stroke="#D6CFC4" stroke-width="0.5"/>
          <text x="280" y="81" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="9" fill="#7A6F63">PW</text>
          <text x="280" y="107" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="10" fill="#1C1A17">Patrick Walsh</text>
          <text x="280" y="119" text-anchor="middle" font-family="var(--font-ui)" font-weight="400" font-size="8.5" fill="#7A6F63">1908 – 1982</text>
          <circle cx="280" cy="129" r="2.5" fill="#C4B9A8"/>
        </g>
        <g>
          <rect x="414" y="55" width="132" height="70" rx="10" fill="#EDE8E0" stroke="#D6CFC4" stroke-width="0.5"/>
          <circle cx="480" cy="77" r="14" fill="#E5DDD2" stroke="#D6CFC4" stroke-width="0.5"/>
          <text x="480" y="81" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="9" fill="#7A6F63">MW</text>
          <text x="480" y="107" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="10" fill="#1C1A17">Margaret Walsh</text>
          <text x="480" y="119" text-anchor="middle" font-family="var(--font-ui)" font-weight="400" font-size="8.5" fill="#7A6F63">1912 – 1998</text>
          <circle cx="480" cy="129" r="2.5" fill="#C4B9A8"/>
        </g>
        <!-- Gen 2 nodes -->
        <g>
          <rect x="81" y="205" width="132" height="70" rx="10" fill="#EDE8E0" stroke="#D6CFC4" stroke-width="0.5"/>
          <circle cx="147" cy="227" r="14" fill="#E5DDD2" stroke="#D6CFC4" stroke-width="0.5"/>
          <text x="147" y="231" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="9" fill="#7A6F63">SW</text>
          <text x="147" y="257" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="10" fill="#1C1A17">Sean Walsh</text>
          <text x="147" y="269" text-anchor="middle" font-family="var(--font-ui)" font-weight="400" font-size="8.5" fill="#7A6F63">1938 – 2019</text>
          <circle cx="147" cy="279" r="2.5" fill="#C4B9A8"/>
        </g>
        <g>
          <rect x="247" y="205" width="132" height="70" rx="10" fill="#EDE8E0" stroke="#D6CFC4" stroke-width="0.5"/>
          <circle cx="313" cy="227" r="14" fill="#E5DDD2" stroke="#D6CFC4" stroke-width="0.5"/>
          <text x="313" y="231" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="9" fill="#7A6F63">MW</text>
          <text x="313" y="257" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="10" fill="#1C1A17">Mary Walsh</text>
          <text x="313" y="269" text-anchor="middle" font-family="var(--font-ui)" font-weight="400" font-size="8.5" fill="#7A6F63">1942</text>
          <circle cx="313" cy="279" r="2.5" fill="#7C8B7E"/>
        </g>
        <g>
          <rect x="381" y="205" width="132" height="70" rx="10" fill="#EDE8E0" stroke="#D6CFC4" stroke-width="0.5"/>
          <circle cx="447" cy="227" r="14" fill="#E5DDD2" stroke="#D6CFC4" stroke-width="0.5"/>
          <text x="447" y="231" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="9" fill="#7A6F63">BW</text>
          <text x="447" y="257" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="10" fill="#1C1A17">Brian Walsh</text>
          <text x="447" y="269" text-anchor="middle" font-family="var(--font-ui)" font-weight="400" font-size="8.5" fill="#7A6F63">1946 – 2011</text>
          <circle cx="447" cy="279" r="2.5" fill="#C4B9A8"/>
        </g>
        <g>
          <rect x="581" y="205" width="132" height="70" rx="10" fill="#EDE8E0" stroke="#D6CFC4" stroke-width="0.5"/>
          <circle cx="647" cy="227" r="14" fill="#E5DDD2" stroke="#D6CFC4" stroke-width="0.5"/>
          <text x="647" y="231" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="9" fill="#7A6F63">NW</text>
          <text x="647" y="257" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="10" fill="#1C1A17">Niamh Walsh</text>
          <text x="647" y="269" text-anchor="middle" font-family="var(--font-ui)" font-weight="400" font-size="8.5" fill="#7A6F63">1950</text>
          <circle cx="647" cy="279" r="2.5" fill="#7C8B7E"/>
        </g>
        <!-- Gen 3 nodes — focused/viewing node in gold border -->
        <g>
          <rect x="31" y="355" width="132" height="70" rx="10" fill="#E5DDD2" stroke="#8C7355" stroke-width="1"/>
          <circle cx="97" cy="377" r="14" fill="#D9D0C4" stroke="#D6CFC4" stroke-width="0.5"/>
          <text x="97" y="381" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="9" fill="#7A6F63">MW</text>
          <text x="97" y="407" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="10" fill="#1C1A17">Margaret W.</text>
          <text x="97" y="419" text-anchor="middle" font-family="var(--font-ui)" font-weight="400" font-size="8.5" fill="#7A6F63">1972</text>
          <circle cx="97" cy="429" r="2.5" fill="#7C8B7E"/>
        </g>
        <g>
          <rect x="181" y="355" width="132" height="70" rx="10" fill="#EDE8E0" stroke="#D6CFC4" stroke-width="0.5"/>
          <circle cx="247" cy="377" r="14" fill="#E5DDD2" stroke="#D6CFC4" stroke-width="0.5"/>
          <text x="247" y="381" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="9" fill="#7A6F63">DW</text>
          <text x="247" y="407" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="10" fill="#1C1A17">Daniel Walsh</text>
          <text x="247" y="419" text-anchor="middle" font-family="var(--font-ui)" font-weight="400" font-size="8.5" fill="#7A6F63">1975</text>
          <circle cx="247" cy="429" r="2.5" fill="#7C8B7E"/>
        </g>
        <g>
          <rect x="379" y="355" width="132" height="70" rx="10" fill="#EDE8E0" stroke="#D6CFC4" stroke-width="0.5"/>
          <circle cx="445" cy="377" r="14" fill="#E5DDD2" stroke="#D6CFC4" stroke-width="0.5"/>
          <text x="445" y="381" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="9" fill="#7A6F63">AW</text>
          <text x="445" y="407" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="10" fill="#1C1A17">Aoife Walsh</text>
          <text x="445" y="419" text-anchor="middle" font-family="var(--font-ui)" font-weight="400" font-size="8.5" fill="#7A6F63">1980</text>
          <circle cx="445" cy="429" r="2.5" fill="#7C8B7E"/>
        </g>
        <g>
          <rect x="539" y="355" width="132" height="70" rx="10" fill="#EDE8E0" stroke="#D6CFC4" stroke-width="0.5"/>
          <circle cx="605" cy="377" r="14" fill="#E5DDD2" stroke="#D6CFC4" stroke-width="0.5"/>
          <text x="605" y="381" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="9" fill="#7A6F63">CW</text>
          <text x="605" y="407" text-anchor="middle" font-family="var(--font-ui)" font-weight="500" font-size="10" fill="#1C1A17">Conor Walsh</text>
          <text x="605" y="419" text-anchor="middle" font-family="var(--font-ui)" font-weight="400" font-size="8.5" fill="#7A6F63">1983</text>
          <circle cx="605" cy="429" r="2.5" fill="#7C8B7E"/>
        </g>
      </svg>
    </div>

    <div class="chip-row">
      {#each ['Family Tree Canvas', 'Person Profiles', 'Memory Archive'] as chip}
        <span class="chip">{chip}</span>
      {/each}
    </div>
  </div>
</section>

<!-- ── Section 03: Features ── -->
<section class="features">
  <div class="section-inner">
    <p class="section-eyebrow">Why PROSAPIAM</p>
    <h2 class="section-h2 section-h2--left">Everything your family deserves.</h2>

    <div class="features-grid">
      <div class="feature-col">
        <div class="feature-icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M24 44 L24 30 M24 30 L14 22 M24 30 L34 22 M24 24 L18 18 M24 24 L30 18" stroke="#1C1A17" stroke-width="1.25" stroke-linecap="round"/>
            <circle cx="14" cy="22" r="3" fill="#D9D0C4" stroke="#1C1A17" stroke-width="1.25"/>
            <circle cx="34" cy="22" r="3" fill="#D9D0C4" stroke="#1C1A17" stroke-width="1.25"/>
            <circle cx="18" cy="18" r="2.5" fill="#BFA882" stroke="#1C1A17" stroke-width="1.25"/>
            <circle cx="30" cy="18" r="2.5" fill="#D9D0C4" stroke="#1C1A17" stroke-width="1.25"/>
            <circle cx="24" cy="13" r="3.5" fill="#D9D0C4" stroke="#1C1A17" stroke-width="1.25"/>
            <path d="M24 44 L18 46 M24 44 L30 46" stroke="#7A6F63" stroke-width="1" stroke-linecap="round"/>
          </svg>
        </div>
        <h3 class="feature-title">Gather every story</h3>
        <p class="feature-body">Add memories, photographs, and moments for every person in your family. A childhood summer. A wedding day. A recipe passed down three generations. Nothing is too small to keep.</p>
      </div>

      <div class="feature-col">
        <div class="feature-icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="9" y="6" width="30" height="36" rx="15" fill="#D9D0C4" stroke="#1C1A17" stroke-width="1.25"/>
            <rect x="11.5" y="8.5" width="25" height="31" rx="12.5" fill="none" stroke="#BFA882" stroke-width="0.75"/>
            <path d="M14.5 36 C 16 28, 19 26, 24 26 C 29 26, 32 28, 33.5 36" fill="#1C1A17" stroke="none"/>
            <circle cx="24" cy="20.5" r="5" fill="#1C1A17"/>
            <circle cx="24" cy="3.5" r="1.25" fill="#7A6F63"/>
            <path d="M24 4.5 L18 6 M24 4.5 L30 6" stroke="#7A6F63" stroke-width="0.75"/>
          </svg>
        </div>
        <h3 class="feature-title">Connect across generations</h3>
        <p class="feature-body">Build a living family tree that grows with you — linking people, places, and times across your entire family history. See where you came from. Understand who you are.</p>
      </div>

      <div class="feature-col">
        <div class="feature-icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M6 12 C 12 11, 20 12, 24 16 C 28 12, 36 11, 42 12 L42 38 C 36 37, 28 38, 24 42 C 20 38, 12 37, 6 38 Z" fill="#D9D0C4" stroke="#1C1A17" stroke-width="1.25" stroke-linejoin="round"/>
            <path d="M24 16 L24 42" stroke="#1C1A17" stroke-width="1.25" stroke-linecap="round"/>
            <path d="M10 19 L20 19.5 M10 23 L20 23 M10 27 L18 27" stroke="#7A6F63" stroke-width="0.75" stroke-linecap="round"/>
            <path d="M28 19.5 L38 19 M28 23 L38 23 M28 27 L36 27" stroke="#7A6F63" stroke-width="0.75" stroke-linecap="round"/>
            <path d="M32 16 L32 28 L34.5 26 L37 28 L37 16" fill="#BFA882" stroke="#1C1A17" stroke-width="1"/>
          </svg>
        </div>
        <h3 class="feature-title">Celebrate who they were</h3>
        <p class="feature-body">Every person in your tree gets a beautiful, dedicated profile — a space for their life, their character, and everything that made them themselves. A biography worthy of them.</p>
      </div>
    </div>
  </div>
</section>

<!-- ── Section 04: Plans ── -->
<section class="plans">
  <div class="noise" aria-hidden="true">
    <svg aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;opacity:0.05;pointer-events:none;mix-blend-mode:screen">
      <use href="#lp-noise-def"/>
      <rect width="100%" height="100%" filter="url(#lp-noise)"/>
    </svg>
  </div>
  <div class="section-inner plans-inner">
    <p class="section-eyebrow eyebrow-light">Plans</p>
    <h2 class="section-h2 section-h2--light">Find the right plan for your family.</h2>
    <p class="plans-sub">Start for free and build at your own pace. Upgrade when your family's story is ready to grow.</p>

    <div class="billing-toggle" role="group" aria-label="Billing period">
      <button
        class="billing-tab"
        class:billing-active={billing === 'monthly'}
        onclick={() => (billing = 'monthly')}
      >Monthly</button>
      <button
        class="billing-tab"
        class:billing-active={billing === 'annual'}
        onclick={() => (billing = 'annual')}
      >Annual</button>
    </div>

    {#if billing === 'annual'}
      <div class="save-badge">Save up to 20%</div>
    {/if}

    <div class="plans-grid">
      {#each plans as plan (plan.key)}
        {@const showAnnual = billing === 'annual' && plan.annualPrice != null}
        {@const monthlyEquiv = plan.annualPrice != null ? (plan.annualPrice / 12).toFixed(2) : null}
        {@const displayPrice = showAnnual && monthlyEquiv ? `$${monthlyEquiv}` : plan.price}

        <article class="plan-card" class:plan-featured={plan.featured}>
          {#if plan.featured}
            <span class="plan-badge">Most popular</span>
          {/if}

          <h3 class="plan-name">{plan.name}</h3>
          <p class="plan-desc">{plan.description}</p>
          <hr class="plan-divider"/>

          <div class="plan-price-row">
            <span class="plan-price">{displayPrice}</span>
            <span class="plan-period">{plan.period}</span>
          </div>
          {#if showAnnual && plan.annualPrice}
            <p class="plan-annual-note">Billed ${plan.annualPrice.toFixed(2)} annually</p>
          {/if}

          <a href={plan.ctaHref} class:plan-cta-primary={plan.ctaPrimary} class:plan-cta-secondary={!plan.ctaPrimary} class="plan-cta">
            {plan.ctaLabel}
          </a>

          <hr class="plan-divider"/>

          <div class="plan-storage-block">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <ellipse cx="8" cy="4" rx="5.25" ry="1.75" stroke="#7A6F63" stroke-width="1.25"/>
              <path d="M2.75 4 V8 C 2.75 8.97, 5.1 9.75, 8 9.75 C 10.9 9.75, 13.25 8.97, 13.25 8 V4" stroke="#7A6F63" stroke-width="1.25" stroke-linecap="round"/>
              <path d="M2.75 8 V12 C 2.75 12.97, 5.1 13.75, 8 13.75 C 10.9 13.75, 13.25 12.97, 13.25 12 V8" stroke="#7A6F63" stroke-width="1.25" stroke-linecap="round"/>
            </svg>
            <div>
              <p class="plan-storage-label">{plan.storage}</p>
              <p class="plan-storage-note">{plan.storageNote}</p>
            </div>
          </div>

          <ul class="plan-features">
            {#each plan.features as feat}
              <li class="plan-feature-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3.25 8.25 L6.5 11.25 L12.75 4.75" stroke={plan.featured ? '#5A6B5C' : '#5A6B5C'} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{feat}</span>
              </li>
            {/each}
          </ul>
        </article>
      {/each}
    </div>

    <p class="plans-footnote">All plans include end-to-end encryption and full data ownership. Your family's stories are yours, always.</p>
  </div>
</section>

<!-- ── Section 05: Human Moment ── -->
<section class="human-moment">
  <div class="section-inner human-inner">
    <div class="human-left">
      <p class="section-eyebrow">A memory, kept</p>
      <h2 class="section-h2 section-h2--left">She deserved more than a photograph in a drawer.</h2>
      <p class="human-body">PROSAPIAM gives every person in your family the space they deserve — a living record of who they were, told in their own stories, photographs, and memories.</p>
      <a href="/signup" class="ghost-cta">See how profiles work →</a>
    </div>

    <div class="human-right">
      <article class="memory-card-sample">
        <div class="photo-placeholder" aria-label="Walsh family · Cork · 1974">
          <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%">
            <defs>
              <filter id="photo-grain">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
                <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0 0.1  0 0 0 0.35 0"/>
              </filter>
            </defs>
            <rect width="400" height="240" fill="#C7A98A"/>
            <rect width="400" height="240" fill="#B89472" opacity="0.35"/>
            <rect x="240" y="40" width="90" height="80" fill="#E0C9A8" opacity="0.85"/>
            <line x1="285" y1="40" x2="285" y2="120" stroke="#7A5A3D" stroke-width="1.2" opacity="0.55"/>
            <line x1="240" y1="80" x2="330" y2="80" stroke="#7A5A3D" stroke-width="1.2" opacity="0.55"/>
            <rect x="0" y="170" width="400" height="70" fill="#9B7651" opacity="0.55"/>
            <rect x="50" y="155" width="160" height="14" fill="#7A5A3D" opacity="0.7"/>
            <g fill="#4A382A" opacity="0.85"><circle cx="105" cy="95" r="14"/><path d="M85 165 C 85 130, 125 130, 125 165 L 125 175 L 85 175 Z"/></g>
            <g fill="#4A382A" opacity="0.85"><circle cx="170" cy="100" r="13"/><path d="M153 165 C 153 133, 187 133, 187 165 L 187 175 L 153 175 Z"/></g>
            <g fill="#3A2A1E" opacity="0.85"><circle cx="138" cy="135" r="10"/><path d="M125 160 C 125 145, 151 145, 151 160 L 151 168 L 125 168 Z"/></g>
            <rect width="400" height="240" filter="url(#photo-grain)" opacity="0.55"/>
          </svg>
          <span class="photo-caption">Walsh family · Cork · 1974</span>
        </div>

        <div class="memory-body">
          <p class="memory-date-label">August 1974</p>
          <h3 class="memory-title">The summer we moved to Cork.</h3>
          <p class="memory-excerpt">We arrived in Cork on a Sunday in late June, all our things in two trunks and a hatbox that had belonged to my mother. Margaret stood at the door of the new house and said nothing for a long time.</p>

          <div class="memory-footer">
            <div class="memory-author">
              <span class="author-avatar">MW</span>
              <span class="author-name">Margaret Walsh</span>
            </div>
            <span class="memory-timestamp">Added April 2024</span>
          </div>

          <div class="memory-tags">
            <span class="memory-tag">Migration</span>
          </div>
        </div>
      </article>
    </div>
  </div>
</section>

<!-- ── Section 06: Final CTA ── -->
<section class="final-cta">
  <div class="noise" aria-hidden="true">
    <svg aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;opacity:0.05;pointer-events:none;mix-blend-mode:screen">
      <rect width="100%" height="100%" filter="url(#lp-noise)"/>
    </svg>
  </div>
  <div class="final-inner">
    <p class="section-eyebrow eyebrow-light">Begin</p>
    <h2 class="final-h2">Your family's story is waiting.</h2>
    <p class="final-sub">Gather your family's stories. Preserve the people behind your name. Celebrate the lives that made you — and make sure they're never forgotten.</p>
    <div class="final-buttons">
      <a href="/signup" class="btn-parchment">Create your account</a>
      <a href="/login" class="btn-ghost-light">Sign in</a>
    </div>
    <p class="final-note">No subscription required to begin. Your family's stories are yours, always.</p>
  </div>
</section>

<!-- ── Footer ── -->
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-left">
      <span class="footer-wordmark">PROSAPIAM</span>
      <p class="footer-tagline">For the people who made you.</p>
    </div>
    <nav class="footer-links" aria-label="Footer navigation">
      <a href="/about" class="footer-link">About</a>
      <a href="/privacy" class="footer-link">Privacy</a>
      <a href="/terms" class="footer-link">Terms</a>
      <a href="/contact" class="footer-link">Contact</a>
    </nav>
    <div class="footer-right">
      <p class="footer-copy">© 2026 PROSAPIAM. All rights reserved.</p>
      <p class="footer-copy-sub">Made with care for families everywhere.</p>
    </div>
  </div>
</footer>

<style>
  /* ── Base ── */
  :global(body) {
    margin: 0;
    background: var(--color-parchment);
    -webkit-font-smoothing: antialiased;
  }

  /* ── Nav ── */
  .nav {
    height: 64px;
    background: var(--color-parchment);
    border-bottom: 0.5px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 48px;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .wordmark {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 16px;
    letter-spacing: 0.06em;
    color: var(--color-ink);
    text-decoration: none;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .nav-ghost {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 13px;
    letter-spacing: 0.02em;
    color: var(--color-ink);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
    transition: opacity 150ms;
  }
  .nav-ghost:hover { opacity: 0.7; }

  .nav-cta {
    display: inline-flex;
    align-items: center;
    height: 36px;
    padding: 0 20px;
    background: var(--color-ink);
    color: var(--color-parchment);
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 13px;
    letter-spacing: 0.02em;
    border-radius: 4px;
    text-decoration: none;
    transition: opacity 150ms;
  }
  .nav-cta:hover { opacity: 0.88; }

  /* ── Shared section primitives ── */
  .section-inner {
    max-width: 1040px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .section-eyebrow {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-gold);
    text-align: center;
    margin: 0;
  }

  .eyebrow-light { color: var(--color-gold-light); }

  .section-h2 {
    font-family: var(--font-display);
    font-weight: var(--font-weight-medium);
    font-size: clamp(32px, 4vw, 52px);
    line-height: 1.1;
    letter-spacing: -0.01em;
    color: var(--color-ink);
    text-align: center;
    margin: 16px 0 0 0;
    text-wrap: balance;
  }

  .section-h2--left { text-align: left; }
  .section-h2--light { color: var(--color-parchment); }

  .section-body {
    font-family: var(--font-body);
    font-size: 19px;
    line-height: 1.65;
    color: var(--color-warm-mid);
    max-width: 580px;
    margin: 24px auto 0;
    text-align: center;
    text-wrap: pretty;
  }

  .noise {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  /* ── Hero ── */
  .hero {
    position: relative;
    background: var(--color-ink);
    overflow: hidden;
  }

  .hero-inner {
    position: relative;
    display: grid;
    grid-template-columns: 53fr 47fr;
    min-height: 720px;
  }

  .hero-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 80px 60px 80px 80px;
    box-sizing: border-box;
  }

  .hero-h1 {
    font-family: var(--font-display);
    font-weight: 200;
    font-size: clamp(40px, 5.5vw, 84px);
    line-height: 0.9;
    letter-spacing: -0.02em;
    color: var(--color-parchment);
    margin: 0;
    text-wrap: balance;
  }

  .hero-sub {
    font-family: var(--font-body);
    font-size: 19px;
    line-height: 1.65;
    color: var(--color-warm-light);
    max-width: 520px;
    margin: 28px 0 0;
    text-wrap: pretty;
  }

  .hero-trust {
    font-family: var(--font-ui);
    font-size: 12px;
    letter-spacing: 0.04em;
    color: var(--color-warm-light);
    margin: 48px 0 0;
  }

  .hero-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 80px 80px 40px;
    box-sizing: border-box;
  }

  .auth-panel {
    background: var(--color-surface-1);
    border: 0.5px solid var(--color-border);
    border-radius: 10px;
    padding: 32px;
    width: 100%;
    max-width: 400px;
  }

  .auth-panel-head { text-align: center; }

  .auth-wordmark {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 18px;
    letter-spacing: 0.06em;
    color: var(--color-ink);
    display: block;
  }

  .auth-tagline {
    font-family: var(--font-body);
    font-style: italic;
    font-size: 14px;
    color: var(--color-warm-mid);
    line-height: 1.5;
    margin: 6px 0 0;
  }

  .auth-divider {
    border: none;
    border-top: 0.5px solid var(--color-border);
    margin: 16px 0;
  }

  .auth-tabs {
    display: flex;
    border-bottom: 0.5px solid var(--color-border);
    margin-bottom: 20px;
  }

  .auth-tab {
    flex: 1;
    height: 38px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -0.5px;
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 13px;
    letter-spacing: 0.02em;
    color: var(--color-warm-mid);
    cursor: pointer;
    transition: color 150ms, border-color 150ms;
  }
  .auth-tab:hover:not(.auth-tab-active) { color: var(--color-ink-soft); }

  .auth-tab-active {
    color: var(--color-ink);
    border-bottom-color: var(--color-gold);
  }

  .auth-alert {
    background: var(--color-terra-tint);
    border: 0.5px solid var(--color-terra);
    border-radius: 4px;
    color: var(--color-terra);
    font-family: var(--font-ui);
    font-size: 13px;
    line-height: 1.5;
    padding: 10px 14px;
    margin-bottom: 16px;
  }

  .auth-form { margin: 0; }

  .auth-fields {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .auth-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .auth-label {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 12px;
    letter-spacing: 0.02em;
    color: var(--color-ink-soft);
  }

  .auth-input {
    height: 40px;
    padding: 0 12px;
    background: var(--color-surface-2);
    border: 0.5px solid var(--color-border);
    border-radius: 4px;
    font-family: var(--font-ui);
    font-size: 14px;
    color: var(--color-ink);
    outline: none;
    transition: border-color 150ms;
    box-sizing: border-box;
    width: 100%;
  }
  .auth-input::placeholder { color: var(--color-warm-mid); }
  .auth-input:focus { border-color: var(--color-gold); }

  .auth-forgot {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-warm-mid);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
    align-self: flex-end;
    transition: color 150ms;
  }
  .auth-forgot:hover { color: var(--color-ink); }

  .auth-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 48px;
    background: var(--color-ink);
    color: var(--color-parchment);
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 15px;
    letter-spacing: 0.02em;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 4px;
    transition: opacity 150ms;
  }
  .auth-submit:hover:not(:disabled) { opacity: 0.88; }
  .auth-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .auth-consent {
    font-family: var(--font-ui);
    font-size: 11px;
    color: var(--color-warm-mid);
    text-align: center;
    margin: 0;
    line-height: 1.55;
  }

  .auth-or {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0 16px;
    font-family: var(--font-ui);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-warm-mid);
  }
  .auth-or::before, .auth-or::after {
    content: '';
    flex: 1;
    height: 0.5px;
    background: var(--color-border);
  }

  .auth-google {
    width: 100%;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: transparent;
    border: 0.5px solid var(--color-border);
    border-radius: 4px;
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 14px;
    letter-spacing: 0.02em;
    color: var(--color-ink);
    cursor: pointer;
    transition: background 150ms, border-color 150ms;
  }
  .auth-google:hover:not(:disabled) { background: var(--color-surface-2); }
  .auth-google:disabled { opacity: 0.5; cursor: not-allowed; }

  .auth-footnote {
    font-family: var(--font-ui);
    font-size: 11px;
    color: var(--color-warm-mid);
    text-align: center;
    margin: 20px 0 0;
    line-height: 1.5;
  }

  /* ── Product Moment ── */
  .product {
    background: var(--color-parchment);
    padding: 96px 0;
  }

  .tree-frame {
    margin-top: 56px;
    border: 0.5px solid var(--color-border);
    border-radius: 16px;
    overflow: hidden;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    margin-top: 32px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 16px;
    background: var(--color-surface-1);
    border: 0.5px solid var(--color-border);
    border-radius: 10px;
    font-family: var(--font-ui);
    font-size: 12px;
    letter-spacing: 0.02em;
    color: var(--color-warm-mid);
  }

  /* ── Features ── */
  .features {
    background: var(--color-surface-1);
    padding: 96px 0;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
    margin-top: 64px;
  }

  .feature-col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .feature-icon { margin-bottom: 20px; }

  .feature-title {
    font-family: var(--font-display);
    font-weight: var(--font-weight-medium);
    font-size: 24px;
    line-height: 1.2;
    letter-spacing: -0.005em;
    color: var(--color-ink);
    margin: 0;
  }

  .feature-body {
    font-family: var(--font-body);
    font-size: 17px;
    line-height: 1.75;
    color: var(--color-ink-soft);
    margin: 12px 0 0;
    text-wrap: pretty;
  }

  /* ── Plans ── */
  .plans {
    position: relative;
    background: var(--color-ink);
    padding: 96px 0;
    overflow: hidden;
  }

  .plans-inner { text-align: center; }

  .plans-sub {
    font-family: var(--font-body);
    font-size: 19px;
    line-height: 1.65;
    color: var(--color-warm-light);
    max-width: 560px;
    margin: 16px auto 0;
    text-wrap: pretty;
  }

  .billing-toggle {
    display: inline-flex;
    align-items: center;
    padding: 4px;
    background: rgba(247,244,238,0.06);
    border: 0.5px solid var(--color-border-inverse);
    border-radius: 999px;
    margin-top: 24px;
  }

  .billing-tab {
    height: 32px;
    padding: 0 16px;
    background: transparent;
    color: var(--color-warm-light);
    border: none;
    border-radius: 999px;
    font-family: var(--font-ui);
    font-weight: var(--font-weight-regular);
    font-size: 13px;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: background 150ms, color 150ms;
  }

  .billing-active {
    background: var(--color-surface-2);
    color: var(--color-parchment);
    font-weight: var(--font-weight-medium);
  }

  .save-badge {
    display: inline-flex;
    align-items: center;
    margin-top: 12px;
    padding: 4px 10px;
    background: var(--color-sage-tint);
    color: var(--color-sage);
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    border-radius: 2px;
  }

  .plans-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 48px;
    align-items: stretch;
  }

  .plan-card {
    position: relative;
    background: var(--color-surface-1);
    border: 0.5px solid var(--color-border);
    border-radius: 10px;
    padding: 32px;
    display: flex;
    flex-direction: column;
    text-align: left;
    margin: 4px 0;
  }

  .plan-featured {
    border: 1px solid var(--color-gold);
    margin: 0;
  }

  .plan-badge {
    position: absolute;
    top: -1px;
    right: 16px;
    transform: translateY(-50%);
    background: var(--color-gold);
    color: var(--color-parchment);
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 2px;
    white-space: nowrap;
  }

  .plan-name {
    font-family: var(--font-display);
    font-weight: var(--font-weight-medium);
    font-size: 24px;
    line-height: 1.2;
    letter-spacing: -0.005em;
    color: var(--color-ink);
    margin: 0;
  }

  .plan-desc {
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 1.6;
    color: var(--color-warm-mid);
    margin: 8px 0 0;
    text-wrap: pretty;
  }

  .plan-divider {
    border: none;
    border-top: 0.5px solid var(--color-border);
    margin: 16px 0;
  }

  .plan-price-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
  }

  .plan-price {
    font-family: var(--font-display);
    font-weight: var(--font-weight-light);
    font-size: 48px;
    line-height: 1;
    letter-spacing: -0.01em;
    color: var(--color-ink);
  }

  .plan-period {
    font-family: var(--font-ui);
    font-size: 13px;
    letter-spacing: 0.02em;
    color: var(--color-warm-mid);
  }

  .plan-annual-note {
    font-family: var(--font-ui);
    font-size: 11px;
    letter-spacing: 0.04em;
    color: var(--color-sage);
    margin: 6px 0 0;
  }

  .plan-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 48px;
    border-radius: 4px;
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 15px;
    letter-spacing: 0.02em;
    text-decoration: none;
    margin-top: 16px;
    transition: opacity 150ms, background 150ms;
    box-sizing: border-box;
  }

  .plan-cta-primary {
    background: var(--color-ink);
    color: var(--color-parchment);
    border: none;
  }
  .plan-cta-primary:hover { opacity: 0.88; }

  .plan-cta-secondary {
    background: transparent;
    color: var(--color-ink);
    border: 0.5px solid var(--color-border);
  }
  .plan-cta-secondary:hover { background: var(--color-surface-2); }

  .plan-storage-block {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: var(--color-surface-2);
    border-radius: 6px;
    padding: 12px;
  }

  .plan-storage-label {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 13px;
    color: var(--color-ink);
    margin: 0;
    line-height: 1.3;
  }

  .plan-storage-note {
    font-family: var(--font-ui);
    font-size: 11px;
    letter-spacing: 0.02em;
    color: var(--color-warm-mid);
    margin: 4px 0 0;
    line-height: 1.45;
  }

  .plan-features {
    list-style: none;
    margin: 16px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .plan-feature-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-family: var(--font-ui);
    font-size: 13px;
    letter-spacing: 0.01em;
    color: var(--color-ink-soft);
    line-height: 1.5;
  }
  .plan-feature-item svg { flex-shrink: 0; margin-top: 1px; }

  .plans-footnote {
    font-family: var(--font-ui);
    font-size: 12px;
    letter-spacing: 0.02em;
    color: var(--color-warm-light);
    max-width: 560px;
    margin: 32px auto 0;
    text-wrap: pretty;
    line-height: 1.6;
    opacity: 0.85;
  }

  /* ── Human Moment ── */
  .human-moment {
    background: var(--color-parchment);
    padding: 96px 0;
  }

  .human-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }

  .human-left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .human-body {
    font-family: var(--font-body);
    font-size: 17px;
    line-height: 1.75;
    color: var(--color-warm-mid);
    max-width: 420px;
    margin: 24px 0 0;
    text-wrap: pretty;
  }

  .ghost-cta {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 13px;
    letter-spacing: 0.02em;
    color: var(--color-ink);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
    margin-top: 32px;
    transition: opacity 150ms;
  }
  .ghost-cta:hover { opacity: 0.7; }

  /* Memory card sample */
  .memory-card-sample {
    background: var(--color-surface-1);
    border: 0.5px solid var(--color-border);
    border-radius: 10px;
    overflow: hidden;
  }

  .photo-placeholder {
    position: relative;
    width: 100%;
    padding-top: 60%;
    background: #C7A98A;
    overflow: hidden;
    border-bottom: 0.5px solid var(--color-border);
  }

  .photo-caption {
    position: absolute;
    left: 14px;
    bottom: 10px;
    font-family: var(--font-ui);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(247,244,238,0.85);
  }

  .memory-body { padding: 24px; }

  .memory-date-label {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-warm-mid);
    margin: 0;
  }

  .memory-title {
    font-family: var(--font-display);
    font-weight: var(--font-weight-medium);
    font-size: 22px;
    line-height: 1.25;
    letter-spacing: -0.005em;
    color: var(--color-ink);
    margin: 6px 0 0;
  }

  .memory-excerpt {
    font-family: var(--font-body);
    font-style: italic;
    font-size: 17px;
    line-height: 1.75;
    color: var(--color-ink-soft);
    margin: 14px 0 0;
    text-wrap: pretty;
  }

  .memory-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 0.5px solid var(--color-border);
  }

  .memory-author {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .author-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--color-surface-3);
    border: 0.5px solid var(--color-border);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 11px;
    color: var(--color-warm-mid);
  }

  .author-name {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-warm-mid);
  }

  .memory-timestamp {
    font-family: var(--font-ui);
    font-size: 11px;
    color: var(--color-warm-mid);
  }

  .memory-tags {
    display: flex;
    gap: 8px;
    margin-top: 14px;
  }

  .memory-tag {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 8px;
    background: var(--color-surface-2);
    border: 0.5px solid var(--color-border);
    border-radius: 2px;
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--color-ink-soft);
  }

  /* ── Final CTA ── */
  .final-cta {
    position: relative;
    background: var(--color-ink);
    padding: 120px 0;
    overflow: hidden;
  }

  .final-inner {
    position: relative;
    max-width: 680px;
    margin: 0 auto;
    text-align: center;
    padding: 0 40px;
  }

  .final-h2 {
    font-family: var(--font-display);
    font-weight: var(--font-weight-light);
    font-size: clamp(36px, 5vw, 64px);
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--color-parchment);
    margin: 16px 0 0;
    text-wrap: balance;
  }

  .final-sub {
    font-family: var(--font-body);
    font-size: 19px;
    line-height: 1.65;
    color: var(--color-warm-light);
    max-width: 560px;
    margin: 24px auto 0;
    text-wrap: pretty;
  }

  .final-buttons {
    display: inline-flex;
    gap: 16px;
    justify-content: center;
    margin-top: 40px;
  }

  .btn-parchment {
    display: inline-flex;
    align-items: center;
    height: 48px;
    padding: 0 24px;
    background: var(--color-parchment);
    color: var(--color-ink);
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 15px;
    letter-spacing: 0.02em;
    border-radius: 4px;
    text-decoration: none;
    transition: opacity 150ms;
  }
  .btn-parchment:hover { opacity: 0.88; }

  .btn-ghost-light {
    display: inline-flex;
    align-items: center;
    height: 48px;
    padding: 0 20px;
    color: var(--color-parchment);
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 15px;
    letter-spacing: 0.02em;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
    border: none;
    background: none;
    transition: opacity 150ms;
    cursor: pointer;
  }
  .btn-ghost-light:hover { opacity: 0.7; }

  .final-note {
    font-family: var(--font-ui);
    font-size: 12px;
    letter-spacing: 0.02em;
    color: var(--color-warm-light);
    opacity: 0.85;
    margin: 32px 0 0;
  }

  /* ── Footer ── */
  .footer {
    background: var(--color-ink);
    border-top: 0.5px solid var(--color-border-inverse);
    padding: 48px 0;
  }

  .footer-inner {
    max-width: 1040px;
    margin: 0 auto;
    padding: 0 40px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 32px;
    align-items: flex-start;
  }

  .footer-wordmark {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: 14px;
    letter-spacing: 0.06em;
    color: var(--color-parchment);
    display: block;
  }

  .footer-tagline {
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--color-warm-light);
    line-height: 1.55;
    margin: 10px 0 0;
  }

  .footer-links {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }

  .footer-link {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-warm-light);
    text-decoration: none;
    transition: color 150ms;
  }
  .footer-link:hover { color: var(--color-parchment); }

  .footer-right { text-align: right; }

  .footer-copy {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-warm-light);
    line-height: 1.6;
    margin: 0;
  }

  .footer-copy-sub {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-warm-light);
    opacity: 0.75;
    line-height: 1.6;
    margin: 8px 0 0;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .nav { padding: 0 20px; height: 52px; }
    .wordmark { font-size: 14px; }

    .hero-inner { grid-template-columns: 1fr; min-height: auto; }
    .hero-left { padding: 40px 24px 32px; }
    .hero-h1 { font-size: 40px; line-height: 1.05; }
    .hero-sub { font-size: 17px; margin-top: 16px; }
    .hero-trust { margin-top: 24px; display: none; }
    .hero-right { padding: 0 24px 48px; }
    .auth-panel { max-width: none; }

    .product { padding: 64px 0; }
    .section-inner { padding: 0 24px; }
    .tree-frame { border-radius: 10px; }
    .section-body { font-size: 17px; }

    .features { padding: 64px 0; }
    .features-grid { grid-template-columns: 1fr; gap: 40px; margin-top: 40px; }
    .feature-col { align-items: center; text-align: center; }
    .feature-body { text-align: center; }

    .plans { padding: 64px 0; }
    .plans-grid { grid-template-columns: 1fr; }
    .plan-card { margin: 0; }

    .human-moment { padding: 64px 0; }
    .human-inner { grid-template-columns: 1fr; gap: 40px; }
    .human-body { max-width: none; }
    .human-left { align-items: center; text-align: center; }
    .section-h2--left { text-align: center; }
    .human-body { text-align: center; }

    .final-cta { padding: 64px 0; }
    .final-buttons { flex-direction: column; width: 100%; }
    .btn-parchment, .btn-ghost-light { width: 100%; justify-content: center; }
    .final-inner { padding: 0 24px; }

    .footer-inner { grid-template-columns: 1fr; text-align: center; padding: 0 24px; }
    .footer-right { text-align: center; }
    .footer-links { flex-direction: row; flex-wrap: wrap; justify-content: center; }
  }
</style>
