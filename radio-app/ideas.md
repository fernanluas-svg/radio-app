# Radio App Brasil - Design Philosophy

## Chosen Design Approach: Modern Minimalist with Warm Accents

### Design Movement
**Contemporary Minimalism with Organic Warmth** — A clean, uncluttered interface inspired by modern music streaming apps (Spotify, Apple Music) but with a distinctly Brazilian warmth. Emphasizes clarity, ease of use, and emotional connection to music.

### Core Principles
1. **Clarity First** — Every element serves a purpose; no decorative noise. The user's focus remains on discovering and playing radio stations.
2. **Warm Minimalism** — While minimal, the interface uses warm, inviting colors (coral, amber, warm orange) to feel approachable and human, not cold or corporate.
3. **Playful Micro-interactions** — Subtle animations on play buttons, station cards, and transitions create delight without distraction.
4. **Responsive Hierarchy** — Typography and spacing guide the user's eye naturally from search → station list → player.

### Color Philosophy
- **Primary Accent**: Warm coral/orange (`oklch(0.65 0.2 35)`) — energetic, Brazilian, inviting
- **Secondary**: Deep navy/charcoal (`oklch(0.2 0.05 260)`) — grounding, professional
- **Background**: Off-white with subtle warmth (`oklch(0.98 0.002 80)`) — clean but not sterile
- **Dark Mode**: Deep charcoal with warm orange accents — maintains warmth even in low light
- **Reasoning**: Warm tones evoke the energy and passion of Brazilian culture; navy grounds the design professionally.

### Layout Paradigm
- **Hero Section**: Large, bold search bar at the top with featured/trending stations below
- **Card Grid**: Stations displayed as responsive cards (2 cols mobile, 3-4 cols desktop) with album art, station name, and quick-play button
- **Floating Player**: Sticky player at bottom (mobile) or side panel (desktop) that doesn't obstruct content
- **Asymmetric Spacing**: Use varied spacing rhythms to create visual interest — not uniform grid padding

### Signature Elements
1. **Warm Gradient Overlays** — Subtle coral-to-orange gradients on hover states and featured sections
2. **Rounded Play Buttons** — Large, tactile play/pause buttons with smooth scale animations
3. **Station Cards with Blur Effect** — Album art with semi-transparent overlay blur for text legibility
4. **Animated Wave Visualizer** — Simple animated bars in the player reflecting audio frequency (optional enhancement)

### Interaction Philosophy
- **Instant Feedback**: Play button responds immediately with scale animation and color shift
- **Smooth Transitions**: All state changes (search, station selection, play/pause) use 200-300ms ease-out animations
- **Gesture-Friendly**: Large touch targets (44px minimum) for mobile; hover states for desktop
- **Progressive Disclosure**: Search filters appear on demand, not cluttering the main view

### Animation Guidelines
- **Play/Pause Button**: Scale from 1 to 0.95 on press (100ms ease-out), then back to 1 on release
- **Station Card Hover**: Subtle lift with shadow increase (150ms ease-out), slight scale (1 to 1.02)
- **Search Results**: Cards fade in with staggered timing (30-50ms between each)
- **Player Transitions**: Smooth fade between track info updates (200ms)
- **Respect prefers-reduced-motion**: Disable animations for users who prefer reduced motion

### Typography System
- **Display Font**: "Poppins" (bold, 700) for headers and station names — modern, friendly, energetic
- **Body Font**: "Inter" (regular, 400-500) for descriptions and UI text — clean, highly legible
- **Hierarchy**:
  - H1 (Hero Title): Poppins 700, 36px (desktop) / 28px (mobile)
  - H2 (Section Headers): Poppins 600, 24px
  - Station Name (Card): Poppins 600, 16px
  - Body Text: Inter 400, 14px
  - Small Text (Metadata): Inter 400, 12px

### Brand Essence
**One-liner**: *A vibrant, accessible gateway to Brazil's diverse radio landscape—where discovery meets simplicity.*

**Personality Adjectives**: Warm, Energetic, Accessible

### Brand Voice
- **Headlines**: Direct, inviting, action-oriented
  - Example: "Descubra rádios incríveis" (Discover amazing radio)
  - Example: "Sua música, agora ao vivo" (Your music, live now)
- **CTAs**: Conversational, never corporate
  - Example: "Toca aí" (Play it) instead of "Click to play"
  - Example: "Salva nos favoritos" (Save to favorites) instead of "Add to favorites"
- **Microcopy**: Warm, helpful, never condescending
  - Example: "Nenhuma rádio encontrada. Tenta outro termo?" (No stations found. Try another term?)

### Wordmark & Logo
**Logo Concept**: A stylized radio wave forming a play button shape, rendered in warm coral. The wave curves upward and rightward, suggesting motion and energy. No text in the mark itself—pure symbol.
- **Style**: Modern, geometric, scalable to any size
- **Color**: Primary warm coral (`oklch(0.65 0.2 35)`)
- **Usage**: Header logo (40px), favicon (32px), social media (256px)

### Signature Brand Color
**Warm Coral** (`oklch(0.65 0.2 35)`) — This is the unmistakable, ownable color of Radio App Brasil. Used for:
- Primary buttons and CTAs
- Active/hover states
- Accent highlights
- Player progress bar
- Featured station badges

---

## Implementation Notes
- Generate a high-quality logo (radio wave + play button) as a PNG with transparent background
- Use Google Fonts: Poppins (700, 600) + Inter (400, 500)
- Implement dark mode toggle in settings (optional future feature)
- Ensure all interactive elements have clear focus states for keyboard navigation
- Test on mobile (375px) and desktop (1280px) viewports
