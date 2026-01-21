# Bellybook App - Project Documentation

## L1: Design System Constraints

### Design System: Amethyst Haze (OKLCH)

All UI components MUST use the design system colors defined in `src/index.css`. The design system uses the **OKLCH color space** for perceptually accurate colors.

#### Color Variables (via CSS Custom Properties)

```css
/* Semantic Colors */
--background           /* Main background */
--foreground           /* Main text color */
--primary              /* Primary brand color (green-based) */
--primary-foreground   /* Text on primary background */
--secondary            /* Secondary color */
--secondary-foreground /* Text on secondary background */
--accent               /* Accent color */
--accent-foreground    /* Text on accent background */
--muted                /* Muted/gray background */
--muted-foreground     /* Text on muted background */
--destructive          /* Error/danger color */
--destructive-foreground /* Text on destructive background */
--border               /* Border color */
--input                /* Input field border */
--ring                 /* Focus ring color */

/* Component Colors */
--card                 /* Card background */
--card-foreground      /* Text on card background */
--popover              /* Popover/dropdown background */
--popover-foreground   /* Text on popover background */
```

#### Border Radius System

```css
--radius: 20px; /* Base radius */
--radius-sm: calc(var(--radius) - 4px);  /* 16px */
--radius-md: calc(var(--radius) - 2px);  /* 18px */
--radius-lg: var(--radius);               /* 20px */
--radius-xl: calc(var(--radius) + 4px);  /* 24px */
--radius-2xl: calc(var(--radius) + 8px); /* 28px */
--radius-3xl: calc(var(--radius) + 12px);/* 32px */
```

### Component Library: shadcn/ui

All UI components are based on [shadcn/ui](https://ui.shadcn.com/). Component source files are located in `src/components/ui/`.

#### Available Components (25 total)

| Component | Description |
|-----------|-------------|
| `alert` | Alert banners for info/warning/error messages |
| `accordion` | Collapsible content sections |
| `avatar` | User avatar with image/fallback |
| `badge` | Small status/label badges |
| `button` | Neumorphic styled buttons with multiple variants |
| `card` | Card container with header/content/footer |
| `checkbox` | Checkbox input |
| `dialog` | Modal dialogs |
| `dropdown-menu` | Dropdown menu component |
| `input` | Text input field |
| `label` | Form label |
| `navigation-menu` | Navigation menu |
| `popover` | Popover/tooltip |
| `progress` | Progress bar |
| `scroll-area` | Custom scrollable area |
| `select` | Select dropdown |
| `separator` | Visual separator |
| `skeleton` | Loading placeholder |
| `slider` | Range slider |
| `switch` | Toggle switch |
| `tabs` | Tabbed content |
| `toast` | Toast notifications |
| `tooltip` | Hover tooltip |
| `collapsible` | Collapsible wrapper |

### Theme System

The app supports light and dark themes via the `.dark` class on `document.documentElement`.

#### Theme Toggle Logic

```typescript
// Apply dark mode class to document
useEffect(() => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [theme]);
```

### Typography

- **Font Family**: Inter (system stack)
- **Font Scales**: Uses Tailwind CSS defaults (text-xs to text-4xl)
- **Text Colors**: Always use semantic CSS variables (`--foreground`, `--muted-foreground`)

### Utility Classes

- **cn() function**: Located in `src/lib/utils.ts`, combines `clsx` and `tailwind-merge`
- **Motion animations**: Uses `framer-motion` for page transitions and micro-interactions

### File Import Aliases

```json
{
  "@/*": "./src/*"
}
```

Usage: `import { Button } from '@/components/ui/button'`

---

## L2: Component Documentation

See `src/components/ui/CLAUDE.md` for detailed component API documentation.

## L3: Implementation Notes

- All new components should include `[INPUT]/[OUTPUT]/[POS]` comments in file headers
- Design system is accessible via Profile > Design System menu item
