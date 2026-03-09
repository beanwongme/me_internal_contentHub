# ContentHub - Technical Specification

## Component Inventory

### shadcn/ui Components (Built-in)
| Component | Purpose | Customization |
|-----------|---------|---------------|
| Button | CTAs, actions | Amber accent variant |
| Card | Content containers | Dark theme styling |
| Input | Form fields | Dark background |
| Textarea | Long text input | Auto-resize |
| Select | Dropdowns | Dark theme |
| Tabs | Navigation | Custom indicator |
| Badge | Status labels | Color variants |
| Avatar | User profiles | Size variants |
| Dialog | Modals | Dark overlay |
| DropdownMenu | Context menus | - |
| Table | Data display | Row hover |
| Checkbox | Selection | - |
| Switch | Toggles | Amber active |
| Slider | Range inputs | - |
| Progress | Loading bars | - |
| Skeleton | Loading states | Shimmer effect |
| Tooltip | Help text | - |
| Separator | Dividers | - |
| ScrollArea | Custom scroll | - |
| Collapsible | Expand/collapse | - |
| Accordion | FAQ sections | - |
| Sheet | Side panels | - |
| Toast | Notifications | - |

### Custom Components

#### Layout Components
| Component | Props | Description |
|-----------|-------|-------------|
| `AppShell` | `children, sidebarCollapsed` | Main layout wrapper |
| `Sidebar` | `collapsed, onToggle` | Navigation sidebar |
| `Header` | `title, actions` | Page header |
| `Breadcrumbs` | `items[]` | Navigation trail |

#### Dashboard Components
| Component | Props | Description |
|-----------|-------|-------------|
| `StatCard` | `label, value, trend, icon` | KPI display |
| `PipelineBoard` | `stages[], items[]` | Kanban board |
| `PipelineCard` | `content, status` | Draggable card |
| `ActivityFeed` | `activities[]` | Recent actions |
| `QuickActions` | `actions[]` | Shortcut buttons |

#### Content Components
| Component | Props | Description |
|-----------|-------|-------------|
| `IdeaCard` | `idea, onConvert, onSave` | Research idea |
| `ContentTable` | `contents[], onAction` | Content list |
| `BriefEditor` | `brief, onChange` | Brief form |
| `DraftViewer` | `draft, onEdit` | AI output |
| `ChannelTabs` | `channels[], active` | Platform tabs |
| `ReviewPanel` | `content, onDecision` | Approval UI |

#### Form Components
| Component | Props | Description |
|-----------|-------|-------------|
| `KeywordInput` | `keywords, onChange` | Tag input |
| `ToneSelector` | `value, onChange` | Tone sliders |
| `RichEditor` | `content, onChange` | WYSIWYG |
| `ImageUploader` | `images, onUpload` | Drag-drop upload |

### Animation Components
| Component | Props | Description |
|-----------|-------|-------------|
| `FadeIn` | `delay, duration` | Fade entrance |
| `SlideIn` | `direction, delay` | Slide entrance |
| `StaggerContainer` | `staggerDelay` | Child stagger |
| `Counter` | `value, duration` | Number animation |
| `Shimmer` | - | Skeleton effect |

---

## Animation Implementation Table

| Animation | Library | Implementation | Complexity |
|-----------|---------|----------------|------------|
| Page transitions | Framer Motion | `AnimatePresence` + variants | Medium |
| Sidebar collapse | Framer Motion | `animate` width/opacity | Low |
| Stats counter | Custom hook | `useCountUp` with RAF | Low |
| Card hover lift | Tailwind | `hover:translate-y` + shadow | Low |
| Button press | Tailwind | `active:translate-y` | Low |
| Skeleton shimmer | CSS | `animate-shimmer` keyframes | Low |
| Pipeline drag | @dnd-kit | Sortable context | High |
| Stagger children | Framer Motion | `staggerChildren` variant | Medium |
| Modal enter/exit | Framer Motion | Scale + fade variants | Medium |
| Toast notifications | Sonner | Built-in animations | Low |
| Tab indicator | Framer Motion | `layoutId` shared element | Medium |
| Accordion expand | Framer Motion | `AnimatePresence` height | Medium |
| Dropdown menu | Framer Motion | Scale + opacity | Low |
| Loading spinner | CSS | `animate-spin` | Low |
| Progress bar | Framer Motion | Width animation | Low |

---

## Project File Structure

```
src/
├── components/
│   ├── ui/                    # shadcn components
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Breadcrumbs.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── PipelineBoard.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── QuickActions.tsx
│   ├── content/
│   │   ├── IdeaCard.tsx
│   │   ├── ContentTable.tsx
│   │   ├── BriefEditor.tsx
│   │   ├── DraftViewer.tsx
│   │   └── ReviewPanel.tsx
│   ├── forms/
│   │   ├── KeywordInput.tsx
│   │   └── ToneSelector.tsx
│   └── animations/
│       ├── FadeIn.tsx
│       ├── SlideIn.tsx
│       └── StaggerContainer.tsx
├── hooks/
│   ├── useCountUp.ts
│   ├── useLocalStorage.ts
│   └── useMediaQuery.ts
├── lib/
│   ├── utils.ts
│   └── constants.ts
├── pages/
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── IdeasPage.tsx
│   ├── SocialContentPage.tsx
│   ├── ContentStudioPage.tsx
│   ├── CompanyContentPage.tsx
│   ├── MediaLibraryPage.tsx
│   ├── TeamPage.tsx
│   └── SettingsPage.tsx
├── types/
│   └── index.ts
├── data/
│   └── mockData.ts
├── App.tsx
├── index.css
└── main.tsx
```

---

## Dependencies

### Core
- `react` ^18.2.0
- `react-dom` ^18.2.0
- `react-router-dom` ^6.20.0

### UI
- `@radix-ui/*` (via shadcn)
- `lucide-react` ^0.294.0
- `class-variance-authority` ^0.7.0
- `clsx` ^2.0.0
- `tailwind-merge` ^2.0.0

### Animation
- `framer-motion` ^10.16.0

### Forms
- `react-hook-form` ^7.48.0
- `zod` ^3.22.0
- `@hookform/resolvers` ^3.3.0

### Utilities
- `date-fns` ^2.30.0
- `uuid` ^9.0.0

---

## Route Structure

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | LandingPage | Marketing site |
| `/login` | LoginPage | Authentication |
| `/dashboard` | DashboardPage | Command center |
| `/ideas` | IdeasPage | AI research hub |
| `/social-content` | SocialContentPage | Content library |
| `/social-content/:id` | ContentStudioPage | Content editor |
| `/company-content` | CompanyContentPage | Knowledge base |
| `/media` | MediaLibraryPage | Asset library |
| `/team` | TeamPage | Team management |
| `/settings` | SettingsPage | Configuration |

---

## State Management

### Local State (useState)
- Form inputs
- UI toggles
- Modal open/close
- Selected items

### Context (React Context)
- Auth state
- Sidebar collapsed state
- Theme preferences

### Mock Data
- All content data (for prototype)
- User data
- Activity logs
