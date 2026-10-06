# DESIGN SYSTEM SPECIFICATION
## Professional Project Management System (ERP & Engineering Quality)

---

### 1. Aesthetic Direction
* **Philosophy**: Modern Engineering Operational Tool meets High-Density Business Software (inspired by the disciplined utility of GitHub Projects, Linear, Vercel, and modern ERP modules).
* **Anti-AI-Slop Manifesto**:
  - NO purple/violet SaaS gradients.
  - NO floating glassmorphism blobs or backdrop-blur gimmicks.
  - NO 3-column generic marketing cards.
  - NO "rounded-2xl" bubbly widgets or oversized cartoon icons.
  - NO fake emojis or "✨ AI magic" placeholders.
  - NO vague copy like "Manage your projects seamlessly".
  - High information density, high scannability, clear visual hierarchy, crisp 1px borders, subtle surface contrast.

---

### 2. Typography System
* **Primary Sans-Serif**: `IBM Plex Sans`, `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - Usage: Interface headings, labels, body text, form controls, dialogues.
  - Weights: `400` (Regular), `500` (Medium), `600` (Semi-bold).
* **Technical Monospace**: `IBM Plex Mono`, `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
  - Usage: Project keys (`PROJ-101`), Task IDs, numeric counters, status tags, ISO timestamps, keyboard shortcuts (`⌘K`), pagination indicators.
* **Scale & Rhythm**:
  - `Display / Page Title`: 20px / 1.25rem (Font-weight 600, tracking -0.02em)
  - `Section Heading / Modal Title`: 16px / 1.0rem (Font-weight 600, tracking -0.01em)
  - `Table Header / Meta Label`: 12px / 0.75rem (Font-weight 500, uppercase, tracking +0.05em, text-muted)
  - `Body / Cell Text`: 13px / 0.8125rem (Font-weight 400, leading 1.4)
  - `Badge / Mono Meta`: 11px / 0.6875rem (Font-weight 500, tracking +0.02em)

---

### 3. Color System
* **Single Primary Accent**: Deep Burnt Amber / Rust Ochre (`#C2410C` / `#B45309`, hsl(24 95% 40%))
  - Purpose: Active states, primary actions, accent borders, selected item indicators.
  - Avoids the generic blue/purple SaaS palette entirely.
* **Surfaces & Backgrounds**:
  - Page Background: Warm White / Crisp Ivory (`#FAF9F5` / `#F8F8F6`)
  - Card / Panel Surface: Pure White (`#FFFFFF`) with crisp border
  - Sub-surface / Table Headers / Striping: Subtle warm tint (`#F4F3EF` / `#F1EFEA`)
  - Sidebar Surface: Deep clean contrast or matching muted architectural surface (`#18191B` or `#1E2024` in dark contrast, or crisp `#FAFAF9` with distinct dividing border)
* **Text & Contrast**:
  - Primary Text: Deep Graphite / Near Black (`#18181B`)
  - Secondary Text: Warm Zinc / Steel (`#52525B`)
  - Muted Text / Placeholders: Ash Neutral (`#71717A`)
  - Borders: Crisp Neutral Gray (`#E4E4E7` / `#E2E0D8`)
* **Semantic Status Indicators (Muted & Functional)**:
  - `NOT_STARTED` / `PENDING`: Neutral Slate (`bg-zinc-100 text-zinc-700 border-zinc-200`)
  - `IN_PROGRESS`: Amber Ochre (`bg-amber-50 text-amber-800 border-amber-200`)
  - `COMPLETED`: Muted Sage Olive (`bg-emerald-50 text-emerald-800 border-emerald-200`)
  - Priority `HIGH`: Restrained Crimson Brick (`bg-rose-50 text-rose-800 border-rose-200`)
  - Priority `MEDIUM`: Warm Amber (`bg-amber-50 text-amber-800 border-amber-200`)
  - Priority `LOW`: Cool Slate (`bg-slate-50 text-slate-700 border-slate-200`)

---

### 4. Spacing & Border System
* **Grid**: Compact 4px base increment (`p-1`, `p-2`, `p-3`, `p-4`, `p-6`).
* **Corner Radius**: Restrained radii:
  - Buttons / Inputs: `rounded` (4px) or `rounded-md` (6px).
  - Cards / Tables: `rounded-md` (6px) or `rounded-lg` (8px max).
  - NEVER use `rounded-2xl` or `rounded-3xl`.
* **Borders & Shadows**:
  - `1px solid var(--border)` throughout all cards, tables, inputs, and dividers.
  - Shadows: Subtle, tactile elevation (`shadow-xs` / `shadow-sm`: `0 1px 2px rgba(0,0,0,0.05)`). No diffuse 30px blur shadows.

---

### 5. Component Rules
1. **Tables**:
   - Fixed or proportional column widths.
   - Distinct header row with uppercase mono labels.
   - Hover highlight on rows (`hover:bg-zinc-50/80`).
   - Sticky header support and pagination footer.
2. **Badges**:
   - Compact inline badges (`py-0.5 px-2 text-xs font-mono border`).
   - Clean, subdued contrast; no neon glow.
3. **Buttons**:
   - Primary: Amber/Rust accent background, white text, crisp hover state.
   - Secondary: White background, 1px border, graphite text.
   - Destructive: Subtle crimson text/border, avoiding loud red blocks.
4. **Forms**:
   - Label with clear asterisk for required fields.
   - Explicit inline validation error messages under the field.
   - Keyboard autofocus on primary modal input.
5. **Progress Bars**:
   - Thin, compact 6px bar with mono percentage label (`75% [========    ]`).

---

### 6. Interaction Rules
* Instant feedback on actions (TanStack Query optimistic invalidations or snappy transitions).
* Confirmations on destructive actions (custom `DeleteConfirmDialog` with the exact project/task name confirmation).
* Keyboard shortcuts (Search focus with `/` or `⌘K`, Escape closes modals).
* Row clicks navigate or open detail drawers without breaking nested actions.

---

### 7. Deliberate Anti-Slop Decisions
1. **Data Density**: Shows actionable information per square inch rather than huge empty whitespace cards.
2. **True State Differentiation**: Empty states explain *why* it is empty and provide a direct creation button. Error states explain *what failed* and provide a retry button.
3. **Enterprise Breadcrumbs**: Clear hierarchical context (`Projects / Modern ERP / Tasks / #12`).
4. **Real Domain Copy**: "12 tasks pending completion across 3 active sprints" instead of "Supercharge your team's workflow!".
