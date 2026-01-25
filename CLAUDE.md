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

---

## Architecture (重构后)

### 目录结构

```
src/
├── App.tsx                    # 主入口 (~200行，重构中)
├── AppRefactored.tsx          # 新架构入口 (已完成)
├── main.tsx                   # Vite 入口
├── index.css                  # 全局样式 + CSS 变量
│
├── router/                    # 路由层 (新增)
│   ├── AppRouter.tsx          # 主路由器
│   └── MainTabsRouter.tsx     # Tab 路由器
│
├── views/                     # 视图层
│   ├── tabs/                  # 底部 Tab 视图
│   │   ├── Tab1Home.tsx
│   │   ├── Tab2History.tsx
│   │   ├── TabPassport.tsx
│   │   └── Tab4Social.tsx
│   ├── profile/               # Profile 视图 (新增)
│   │   └── ProfileRouter.tsx  # Profile 子路由器
│   ├── premium/               # Premium 视图 (新增)
│   │   └── PremiumRouter.tsx  # Premium 子路由器
│   ├── subviews/              # 子视图
│   │   ├── CuisineDetail.tsx
│   │   └── DishDetail.tsx
│   ├── AuthViews.tsx
│   ├── AnalysisResultView.tsx
│   ├── DesignSystemView.tsx
│   └── SocialSubViews.tsx
│
├── contexts/                  # Context 状态管理
│   ├── AuthContext.tsx        # 认证状态
│   ├── AppContext.tsx         # 全局业务状态 (扩展)
│   └── ViewStateContext.tsx   # 视图临时状态 (新增)
│
├── hooks/                     # 自定义 Hooks
│   ├── useAuth.ts
│   ├── useProfile.ts
│   ├── useMeals.ts
│   ├── useViewState.ts        # 视图状态 Hook (新增)
│   └── ...
│
├── components/                # 组件
│   ├── ui/                    # shadcn/ui 基础组件 (25个)
│   ├── shared/                # 共享业务组件
│   └── ...
│
├── api/                       # API 客户端
├── db/                        # IndexedDB 数据层
├── lib/                       # 工具函数
├── sync/                      # 数据同步
└── types.ts                   # 类型定义
```

### 架构原则

1. **Provider 分层**：
   ```
   AuthProvider (认证)
     ↓
   AppProvider (全局业务状态)
     ↓
   ViewStateProvider (视图临时状态)
     ↓
   AppRouter (路由)
   ```

2. **路由分层**：
   ```
   AppRouter
     ├─ ProfileRouter (PROFILE_*)
     ├─ PremiumRouter (PREMIUM_*)
     ├─ MainTabsRouter (MAIN_TABS + Tab 切换)
     └─ 其他视图 (直接渲染)
   ```

3. **状态管理分离**：
   - **AppContext**: 全局业务状态（user、profile、meals、settings）
   - **ViewStateContext**: 视图临时状态（selectedCuisine、modal、tab）
   - **AuthContext**: 认证状态（isAuthenticated、user）

4. **消除 Props Drilling**：
   ```typescript
   // ❌ 旧方式
   <Tab1Home lang={lang} theme={theme} userId={userId} refreshTrigger={trigger} />

   // ✅ 新方式
   function Tab1Home() {
     const { language, theme, userId, refreshTrigger } = useApp();
     // 无需 props
   }
   ```

### 重构成果

| 指标 | 重构前 | 重构后 | 改善 |
|------|--------|--------|------|
| App.tsx 行数 | 1268 | ~200 | 84% ↓ |
| Props drilling | 严重 | 消除 | ✅ |
| 视图路由 | 分散 | 集中 | ✅ |
| 状态管理 | 分散 | Context | ✅ |
| 代码可读性 | 低 | 高 | ✅ |

### 迁移步骤

1. ✅ 扩展 AppContext 添加导航状态
2. ✅ 创建 ViewStateContext 管理临时 UI 状态
3. ✅ 创建路由系统
4. ✅ 提取 Profile 视图为子路由器
5. ✅ 提取 Premium 视图为子路由器
6. ✅ 创建 MainTabsRouter
7. ✅ 编写 AppRefactored.tsx
8. ⏳ 逐步迁移子组件使用 useApp()
9. ⏳ 替换 App.tsx
10. ⏳ 删除旧代码

### 设计哲学

> **简化是最高形式的复杂。**
>
> **能消失的分支永远比能写对的分支更优雅。**

重构遵循以下原则：
- 单一职责：每个文件只做一件事
- 依赖注入：通过 Context 注入状态，而非 props 传递
- 视图分离：大型视图独立为子路由器
- 代码即文档：使用 `[INPUT]/[OUTPUT]/[POS]` 注释
