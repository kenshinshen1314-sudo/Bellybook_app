import { Language, Theme } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Switch } from '../components/ui/switch';
import { Slider } from '../components/ui/slider';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { Skeleton } from '../components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { ChevronLeft, Palette, Layers, Box, Check, X, Info, AlertCircle, Settings, User, Mail, Search, Calendar, Plus, Minus, ZoomIn, Eye } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

interface DesignSystemViewProps {
  language: Language;
  theme: Theme;
  onBack: () => void;
}

// [INPUT] Props: language, theme, onBack handler
// [OUTPUT] A comprehensive design system showcase page
// [POS] src/views/DesignSystemView.tsx
export function DesignSystemView({ language, theme, onBack }: DesignSystemViewProps) {
  const [sliderValue, setSliderValue] = useState([50]);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [progress, setProgress] = useState(66);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectValue, setSelectValue] = useState('option1');

  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const mutedColor = isDark ? 'text-gray-400' : 'text-gray-600';

  // Color palette based on src/index.css Amethyst Haze theme
  const colorPalette = {
    primary: isDark ? 'oklch(0.6762 0.0567 132.4479)' : 'oklch(0.6657 0.1050 118.9078)',
    secondary: isDark ? 'oklch(0.4448 0.0239 84.5498)' : 'oklch(0.8532 0.0631 91.1493)',
    accent: isDark ? 'oklch(0.6540 0.0723 90.7629)' : 'oklch(0.8361 0.0713 90.3269)',
    muted: isDark ? 'oklch(0.4448 0.0239 84.5498)' : 'oklch(0.8532 0.0631 91.1493)',
    destructive: isDark ? 'oklch(0.6136 0.1481 29.9827)' : 'oklch(0.7136 0.0981 29.9827)',
    background: isDark ? 'oklch(0.3303 0.0214 88.0737)' : '#ffffff',
    foreground: isDark ? 'oklch(0.9217 0.0235 82.1191)' : 'oklch(0.4265 0.0310 59.2153)',
    card: isDark ? 'oklch(0.3803 0.0214 88.0737)' : 'oklch(0.9882 0.0069 88.6415)',
    border: isDark ? 'oklch(0.4448 0.0239 84.5498)' : 'oklch(0.6918 0.0440 59.8448)',
  };

  return (
    <div className={cn('min-h-screen bg-background text-foreground')}>
      {/* Header */}
      <div className={cn('sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border')}>
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className={cn('w-10 h-10 rounded-full flex items-center justify-center transition-colors', isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10')}
          >
            <ChevronLeft size={24} className={textColor} />
          </button>
          <h1 className={cn('text-lg font-bold', textColor)}>
            {language === Language.ZH ? '设计系统' : 'Design System'}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-60px)]">
        <div className="p-4 space-y-8 pb-20">
          {/* Hero Section */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-2">
              <Palette className="text-primary" size={32} />
            </div>
            <h2 className={cn('text-3xl font-bold', textColor)}>
              {language === Language.ZH ? 'Amethyst Haze' : 'Design System'}
            </h2>
            <p className={cn('text-sm', mutedColor)}>
              {language === Language.ZH ? '基于 shadcn/ui 的组件库' : 'Component library built on shadcn/ui'}
            </p>
          </div>

          <Separator />

          {/* Colors Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette size={20} className="text-primary" />
              <h3 className={cn('text-xl font-bold', textColor)}>
                {language === Language.ZH ? '色彩' : 'Colors'}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ColorSwatch name="Primary" color="var(--primary)" textColor="var(--primary-foreground)" />
              <ColorSwatch name="Secondary" color="var(--secondary)" textColor="var(--secondary-foreground)" />
              <ColorSwatch name="Accent" color="var(--accent)" textColor="var(--accent-foreground)" />
              <ColorSwatch name="Muted" color="var(--muted)" textColor="var(--muted-foreground)" />
              <ColorSwatch name="Destructive" color="var(--destructive)" textColor="var(--destructive-foreground)" />
              <ColorSwatch name="Background" color="var(--background)" textColor="var(--foreground)" />
              <ColorSwatch name="Card" color="var(--card)" textColor="var(--card-foreground)" />
              <ColorSwatch name="Border" color="var(--border)" textColor="var(--foreground)" />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>
                {language === Language.ZH ? '使用 OKLCH 色彩空间' : 'Using OKLCH Color Space'}
              </AlertTitle>
              <AlertDescription>
                {language === Language.ZH
                  ? '所有颜色使用 OKLCH 色彩空间定义，提供更一致和感知准确的色彩体验。'
                  : 'All colors are defined using OKLCH color space for more consistent and perceptually accurate color experience.'}
              </AlertDescription>
            </Alert>
          </section>

          <Separator />

          {/* Buttons Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers size={20} className="text-primary" />
              <h3 className={cn('text-xl font-bold', textColor)}>
                {language === Language.ZH ? '按钮' : 'Buttons'}
              </h3>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>
                  {language === Language.ZH ? '不同的按钮样式变体' : 'Different button style variants'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="accent">Accent</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="gold">Gold</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button Sizes</CardTitle>
                <CardDescription>
                  {language === Language.ZH ? '不同的按钮尺寸' : 'Different button sizes'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button with Icons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button><Plus size={16} /> Add</Button>
                  <Button variant="outline"><Search size={16} /> Search</Button>
                  <Button variant="secondary"><Calendar size={16} /> Calendar</Button>
                  <Button variant="ghost" className="text-destructive hover:text-destructive"><X size={16} /> Delete</Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Form Components */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Box size={20} className="text-primary" />
              <h3 className={cn('text-xl font-bold', textColor)}>
                {language === Language.ZH ? '表单组件' : 'Form Components'}
              </h3>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Input & Label</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Checkbox & Switch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" checked={checkboxChecked} onCheckedChange={setCheckboxChecked} />
                  <label htmlFor="terms" className={cn('text-sm cursor-pointer', mutedColor)}>
                    {language === Language.ZH ? '同意条款和条件' : 'Agree to terms and conditions'}
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">
                    {language === Language.ZH ? '启用通知' : 'Enable notifications'}
                  </Label>
                  <Switch id="notifications" checked={switchChecked} onCheckedChange={setSwitchChecked} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Slider & Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Slider: {sliderValue[0]}%</Label>
                  <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
                </div>
                <div className="space-y-2">
                  <Label>Progress</Label>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectValue} onValueChange={setSelectValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Data Display */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers size={20} className="text-primary" />
              <h3 className={cn('text-xl font-bold', textColor)}>
                {language === Language.ZH ? '数据展示' : 'Data Display'}
              </h3>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Card Component</CardTitle>
                <CardDescription>A versatile card container</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={cn('text-sm', mutedColor)}>
                  {language === Language.ZH
                    ? '卡片组件用于将相关内容分组在一起，提供清晰的视觉层次。'
                    : 'Card components are used to group related content together, providing clear visual hierarchy.'}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  {language === Language.ZH ? '了解更多' : 'Learn More'}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avatar & Badge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                    <AvatarFallback>FX</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className={cn('font-medium', textColor)}>Felix</p>
                    <p className={cn('text-sm', mutedColor)}>@felix</p>
                  </div>
                  <Badge>Pro</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tabs</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tab1">
                  <TabsList className="w-full">
                    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1" className="mt-4">
                    <p className={cn('text-sm', mutedColor)}>Content for Tab 1</p>
                  </TabsContent>
                  <TabsContent value="tab2" className="mt-4">
                    <p className={cn('text-sm', mutedColor)}>Content for Tab 2</p>
                  </TabsContent>
                  <TabsContent value="tab3" className="mt-4">
                    <p className={cn('text-sm', mutedColor)}>Content for Tab 3</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accordion</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      {language === Language.ZH ? '什么是设计系统？' : 'What is a Design System?'}
                    </AccordionTrigger>
                    <AccordionContent>
                      {language === Language.ZH
                        ? '设计系统是一套完整的标准、文档和组件，用于指导和统一产品设计。'
                        : 'A design system is a complete set of standards, documentation, and components that guide and unify product design.'}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      {language === Language.ZH ? '为什么使用 OKLCH？' : 'Why use OKLCH?'}
                    </AccordionTrigger>
                    <AccordionContent>
                      {language === Language.ZH
                        ? 'OKLCH 提供更一致的感知均匀性，使颜色过渡更平滑，色彩选择更直观。'
                        : 'OKLCH provides more consistent perceptual uniformity, making color transitions smoother and color selection more intuitive.'}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Feedback Components */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} className="text-primary" />
              <h3 className={cn('text-xl font-bold', textColor)}>
                {language === Language.ZH ? '反馈组件' : 'Feedback Components'}
              </h3>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Info</AlertTitle>
              <AlertDescription>This is an informational alert message.</AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Something went wrong. Please try again.</AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Tooltip</CardTitle>
              </CardHeader>
              <CardContent>
                <TooltipProvider>
                  <div className="flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline"><Eye size={16} /></Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{language === Language.ZH ? '查看详情' : 'View details'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dialog</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>{language === Language.ZH ? '打开对话框' : 'Open Dialog'}</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {language === Language.ZH ? '确认操作' : 'Confirm Action'}
                      </DialogTitle>
                      <DialogDescription>
                        {language === Language.ZH
                          ? '此操作无法撤销。您确定要继续吗？'
                          : 'This action cannot be undone. Are you sure you want to continue?'}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        {language === Language.ZH ? '取消' : 'Cancel'}
                      </Button>
                      <Button onClick={() => setDialogOpen(false)}>
                        {language === Language.ZH ? '确认' : 'Confirm'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dropdown Menu</CardTitle>
              </CardHeader>
              <CardContent>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Settings size={16} className="mr-2" />
                      {language === Language.ZH ? '设置' : 'Settings'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem><User size={16} className="mr-2" /> Profile</DropdownMenuItem>
                    <DropdownMenuItem><Mail size={16} className="mr-2" /> Messages</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem><ZoomIn size={16} className="mr-2" /> Zoom</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Loading States */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Loader2 size={20} className="text-primary animate-spin" />
              <h3 className={cn('text-xl font-bold', textColor)}>
                {language === Language.ZH ? '加载状态' : 'Loading States'}
              </h3>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Skeleton</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-24 w-full rounded-lg" />
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Typography */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers size={20} className="text-primary" />
              <h3 className={cn('text-xl font-bold', textColor)}>
                {language === Language.ZH ? '排版' : 'Typography'}
              </h3>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h1 className={cn('text-4xl font-bold', textColor)}>Heading 1</h1>
                </div>
                <div>
                  <h2 className={cn('text-3xl font-bold', textColor)}>Heading 2</h2>
                </div>
                <div>
                  <h3 className={cn('text-2xl font-bold', textColor)}>Heading 3</h3>
                </div>
                <div>
                  <p className={cn('text-base', textColor)}>
                    {language === Language.ZH
                      ? '这是正文文本。Inter 字体提供了清晰易读的排版效果，适合各种屏幕尺寸。'
                      : 'This is body text. The Inter font provides clear, readable typography suitable for all screen sizes.'}
                  </p>
                </div>
                <div>
                  <p className={cn('text-sm', mutedColor)}>
                    {language === Language.ZH
                      ? '这是辅助文本，使用较淡的颜色显示次要信息。'
                      : 'This is muted text using lighter colors for secondary information.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}

// Color Swatch Component
function ColorSwatch({ name, color, textColor }: { name: string; color: string; textColor: string }) {
  return (
    <div className="space-y-1">
      <div
        className="h-20 rounded-xl shadow-sm transition-transform hover:scale-105"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{name}</span>
      </div>
    </div>
  );
}

// Import Loader2 for loading states
import { Loader2 } from 'lucide-react';
