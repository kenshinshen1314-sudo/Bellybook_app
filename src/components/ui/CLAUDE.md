# UI Components Documentation

## L2: Component Catalog

This directory contains 25 shadcn/ui components customized for the Bellybook app.

---

## Component Index

### Alert (`alert.tsx`)

Display banners for important messages.

**Variants**: `default`, `destructive`

**Usage**:
```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>
```

---

### Accordion (`accordion.tsx`)

Vertically stacked collapsible sections.

**Props**: `type` (`single` | `multiple`), `collapsible`

**Usage**:
```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
  </AccordionItem>
</Accordion>
```

---

### Avatar (`avatar.tsx`)

User image component with fallback.

**Usage**:
```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
```

---

### Badge (`badge.tsx`)

Small status or label indicator.

**Variants**: `default`, `secondary`, `destructive`, `outline`

**Usage**:
```tsx
import { Badge } from '@/components/ui/badge'

<Badge>Badge</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
```

---

### Button (`button.tsx`)

**Custom Neumorphic Design** - Enhanced with framer-motion animations and gradient styles.

**Variants**: `default`, `primary`, `secondary`, `accent`, `outline`, `ghost`, `link`, `destructive`, `gold`

**Sizes**: `sm`, `default`, `lg`, `xl`

**Usage**:
```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">Default</Button>
<Button variant="primary" size="lg">Large Primary</Button>
<Button variant="gold" fullWidth>Gold Button</Button>
```

**Note**: This component uses custom neumorphic styles defined in `BUTTON_STYLES`.

---

### Card (`card.tsx`)

Container component for grouped content.

**Sub-components**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

**Usage**:
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>Card content</CardContent>
</Card>
```

---

### Checkbox (`checkbox.tsx`)

Checkbox form input.

**Usage**:
```tsx
import { Checkbox } from '@/components/ui/checkbox'

<Checkbox id="terms" />
<label htmlFor="terms">Accept terms</label>
```

---

### Dialog (`dialog.tsx`)

Modal dialog overlay.

**Usage**:
```tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button>Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Dropdown Menu (`dropdown-menu.tsx`)

Dropdown menu with items.

**Usage**:
```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### Input (`input.tsx`)

Text input field.

**Usage**:
```tsx
import { Input } from '@/components/ui/input'

<Input placeholder="Email" type="email" />
```

---

### Label (`label.tsx`)

Form label for inputs.

**Usage**:
```tsx
import { Label } from '@/components/ui/label'

<Label htmlFor="email">Email</Label>
<Input id="email" />
```

---

### Navigation Menu (`navigation-menu.tsx`)

Horizontal navigation with dropdowns.

---

### Popover (`popover.tsx`)

Floating content container.

**Usage**:
```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>Content</PopoverContent>
</Popover>
```

---

### Progress (`progress.tsx`)

Progress bar indicator.

**Usage**:
```tsx
import { Progress } from '@/components/ui/progress'

<Progress value={66} />
```

---

### Scroll Area (`scroll-area.tsx`)

Custom scrollable container.

**Usage**:
```tsx
import { ScrollArea } from '@/components/ui/scroll-area'

<ScrollArea className="h-96">
  <div>Content...</div>
</ScrollArea>
```

---

### Select (`select.tsx`)

Dropdown select input.

**Usage**:
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

---

### Separator (`separator.tsx`)

Visual divider line.

**Usage**:
```tsx
import { Separator } from '@/components/ui/separator'

<Separator />
```

---

### Skeleton (`skeleton.tsx`)

Loading placeholder animation.

**Usage**:
```tsx
import { Skeleton } from '@/components/ui/skeleton'

<Skeleton className="h-12 w-12 rounded-full" />
```

---

### Slider (`slider.tsx`)

Range slider input.

**Usage**:
```tsx
import { Slider } from '@/components/ui/slider'

<Slider defaultValue={[50]} max={100} step={1} />
```

---

### Switch (`switch.tsx`)

Toggle switch.

**Usage**:
```tsx
import { Switch } from '@/components/ui/switch'

<Switch checked={checked} onCheckedChange={setChecked} />
```

---

### Tabs (`tabs.tsx`)

Tabbed content container.

**Usage**:
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

---

### Toast (`toast.tsx`)

Notification toast messages.

---

### Tooltip (`tooltip.tsx`)

Hover tooltip.

**Usage**:
```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover</TooltipTrigger>
    <TooltipContent>Tooltip content</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### Collapsible (`collapsible.tsx`)

Collapsible content wrapper.

---

## Design Tokens

All components use these CSS variables from `src/index.css`:

- Colors: `--primary`, `--secondary`, `--accent`, `--muted`, `--destructive`, `--background`, `--foreground`
- Border: `--border`, `--input`, `--ring`
- Radius: `--radius` (20px base)

## Customization Notes

1. **Button**: Uses custom neumorphic gradients - not standard shadcn button
2. **Theme**: All components respond to `.dark` class on html element
3. **Animations**: Many components use framer-motion for enhanced interactions
