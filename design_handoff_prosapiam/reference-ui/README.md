# Prosapiam — App UI Kit

Hi-fi recreation of the four core surfaces of Prosapiam, built against `Prosapiam_DesignSpec_v1.1` and `Prosapiam_ComponentBrief`.

## Surfaces

1. **Auth** — single page with toggled Sign in / Create account modes
2. **Dashboard** — recent activity, tree-state-at-a-glance, fast paths to common actions
3. **Family Tree** — pan/zoom canvas with nodes and connectors
4. **Person Profile** — header + tabs (About · Memories · Media · Relationships)

## Files

```
index.html              — interactive click-thru of all four surfaces
components.jsx          — atoms (Button, Input, Avatar, Badge, Tag, Card, Tabs, Icon)
AuthScreen.jsx          — sign in / create account
Dashboard.jsx           — home base after sign-in
TreeView.jsx            — family tree canvas + connectors
ProfileView.jsx         — person profile w/ tabs
data.jsx                — fake family data (Walsh family)
```

The kit is cosmetic-fidelity — components mimic the look but don't implement real persistence. Click-thru works: log in → tree → click a node → see profile → switch tabs → navigate back.
