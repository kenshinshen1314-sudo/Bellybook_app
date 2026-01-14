# 胃之书 (Bellybook) App - 产品需求文档 (PRD)

## 1. Introduction

胃之书是一款智能食物记录与分析App，通过拍照或上传菜品图片，调用AI模型进行智能分析，解析菜品构成、营养成分，并提供个性化的健康建议和数据分析。

**当前状态：** 项目已有基础UI框架和vibe设计系统，但业务逻辑需要重构，移动端适配需要优化。

**本PRD目标：** 在现有代码基础上逐步优化移动端适配，实现PWA离线功能，重写业务逻辑以支持完整的数据持久化和同步。

---

## 2. Goals

- [ ] 实现完整的PWA功能（manifest.json, Service Worker, 离线支持）
- [ ] 使用IndexedDB实现本地数据持久化
- [ ] 支持主流移动浏览器（iOS Safari, Android Chrome, 微信内置浏览器）
- [ ] 重构业务逻辑，实现完整的数据流（拍照 → 分析 → 存储 → 统计）
- [ ] 优化移动端触摸交互和手势支持
- [ ] 实现数据同步机制（本地 ↔ 后端）

---

## 3. User Stories

### Phase 1: PWA基础设施

### US-001: 添加PWA Manifest配置
**描述：** 作为开发者，我需要配置PWA manifest文件，使App可以被添加到主屏幕。

**验收标准：**
- [ ] 创建 `/public/manifest.json` 文件
- [ ] 配置应用名称、图标、主题色
- [ ] 在 `index.html` 中添加manifest链接
- [ ] 配置standalone显示模式
- [ ] 使用Lighthouse验证PWA安装性
- [ ] 在移动浏览器中测试"添加到主屏幕"功能

### US-002: 创建Service Worker基础框架
**描述：** 作为开发者，我需要创建Service Worker来实现离线缓存和资源管理。

**验收标准：**
- [ ] 创建 `/public/sw.js` 文件
- [ ] 实现install事件（缓存核心资源）
- [ ] 实现fetch事件（网络优先策略）
- [ ] 在 `index.tsx` 中注册Service Worker
- [ ] 实现Service Worker更新机制
- [ ] 在DevTools Application中验证SW注册

### US-003: 配置Vite PWA插件
**描述：** 作为开发者，我需要配置vite-plugin-pwa来自动生成和管理Service Worker。

**验收标准：**
- [ ] 安装 `vite-plugin-pwa` 依赖
- [ ] 在 `vite.config.ts` 中配置PWA插件
- [ ] 配置workbox缓存策略
- [ ] 配置图标生成（多种尺寸）
- [ ] 测试构建后的PWA功能
- [ ] 验证更新提示机制

### US-004: 实现离线检测和UI提示
**描述：** 作为用户，我需要知道当前网络状态，以便了解数据是否已同步。

**验收标准：**
- [ ] 创建 `useOnline` hook检测网络状态
- [ ] 在顶部显示离线状态提示条
- [ ] 离线时禁用需要网络的操作（拍照分析）
- [ ] 恢复网络时自动同步待上传数据
- [ ] 测试离线/在线切换场景

---

### Phase 2: 数据持久化 (IndexedDB)

### US-005: 设计IndexedDB数据模型
**描述：** 作为开发者，我需要设计适合食物记录的数据库schema。

**验收标准：**
- [ ] 设计stores: `meals`, `users`, `syncQueue`
- [ ] 定义indexes: `meals.date`, `meals.userId`, `syncQueue.createdAt`
- [ ] 创建类型定义文件 `src/db/schema.ts`
- [ ] 定义数据迁移策略
- [ ] 通过TypeScript类型检查

### US-006: 创建IndexedDB封装层
**描述：** 作为开发者，我需要创建一个易用的IndexedDB操作封装。

**验收标准：**
- [ ] 安装 `idb` 依赖
- [ ] 创建 `src/db/index.ts` 初始化DB
- [ ] 实现 `db.meals.getAll()`, `db.meals.add()`, `db.meals.update()`
- [ ] 实现 `db.syncQueue.add()`, `db.syncQueue.process()`
- [ ] 添加错误处理和重试逻辑
- [ ] 编写单元测试验证CRUD操作

### US-007: 实现用户数据存储
**描述：** 作为用户，我的个人资料和设置需要本地持久化保存。

**验收标准：**
- [ ] 扩展 `users` store包含profile和settings
- [ ] 创建 `useProfile` hook读取/更新用户数据
- [ ] 实现 `saveProfile()` 和 `loadProfile()` 函数
- [ ] 主题设置（dark/light）持久化
- [ ] 语言设置持久化
- [ ] 刷新页面后设置保持

### US-008: 实现meal记录存储
**描述：** 作为用户，我拍摄的食物记录需要保存到本地数据库。

**验收标准：**
- [ ] 创建 `Meal` 类型（包含图片、分析结果、营养信息）
- [ ] 实现 `saveMeal(meal)` 函数保存到IndexedDB
- [ ] 实现 `getMealsByDateRange(startDate, endDate)` 查询
- [ ] 图片作为Blob存储（支持离线查看）
- [ ] 保存成功后显示Toast提示
- [ ] 验证数据在关闭/重开App后仍然存在

---

### Phase 3: 业务逻辑重构

### US-009: 创建状态管理Context
**描述：** 作为开发者，我需要创建统一的状态管理来管理App数据。

**验收标准：**
- [ ] 创建 `AppContext` 包含user, meals, settings状态
- [ ] 实现 `useApp` hook访问全局状态
- [ ] 实现actions: `addMeal`, `updateMeal`, `deleteMeal`
- [ ] 实现selectors: `getDailyStats`, `getWeeklyStats`
- [ ] 添加状态持久化逻辑
- [ ] 使用React DevTools验证状态更新

### US-010: 重构拍照分析流程
**描述：** 作为用户，拍照后应该看到加载状态，然后显示分析结果，最后自动保存。

**验收标准：**
- [ ] 创建 `useAnalyzeMeal` hook封装分析逻辑
- [ ] 显示加载中的Skeleton/Spinner组件
- [ ] 分析结果使用新的Card组件展示
- [ ] 自动保存分析结果到IndexedDB
- [ ] 保存成功后导航到历史记录Tab
- [ ] 错误处理：显示友好的错误信息

### US-011: 实现历史记录列表
**描述：** 作为用户，我需要查看我所有的食物记录，按时间倒序排列。

**验收标准：**
- [ ] 创建 `MealList` 组件
- [ ] 从IndexedDB加载meal记录
- [ ] 按日期分组显示（今天、昨天、更早）
- [ ] 使用 `motion.div` 实现列表动画
- [ ] 点击记录查看详情
- [ ] 下拉刷新功能
- [ ] 空状态提示

### US-012: 实现数据统计卡片
**描述：** 作为用户，我需要查看今日/本周的营养摄入统计。

**验收标准：**
- [ ] 创建 `NutritionCard` 组件
- [ ] 计算今日热量、蛋白质、脂肪、碳水
- [ ] 与目标值对比（如有）显示进度条
- [ ] 本周趋势使用 recharts 图表展示
- [ ] 使用 motion 动画展示数字变化
- [ ] 数据为空时显示提示

---

### Phase 4: 移动端交互优化

### US-013: 实现手势导航
**描述：** 作为用户，我希望可以通过左右滑动切换Tab。

**验收标准：**
- [ ] 安装 `react-swipeable` 依赖
- [ ] 创建 `useSwipeNavigation` hook
- [ ] 左滑切换到下一个Tab
- [ ] 右滑切换到上一个Tab
- [ ] 配合动画使用（spring transition）
- [ ] 在iOS/Android真机测试

### US-014: 优化触摸反馈
**描述：** 作为用户，点击按钮时应该有即时的视觉反馈。

**验收标准：**
- [ ] 所有按钮添加 `whileTap={{ scale: 0.96 }}`
- [ ] Card组件添加hover和tap效果
- [ ] 长按Card显示删除选项
- [ ] 滚动时隐藏导航栏
- [ ] 使用 `-webkit-tap-highlight-color: transparent`
- [ ] 测试触摸响应延迟

### US-015: 实现下拉刷新
**描述：** 作为用户，我希望在列表顶部下拉来刷新数据。

**验收标准：**
- [ ] 安装 `react-pull-to-refresh` 依赖
- [ ] 配置刷新动画和提示文本
- [ ] 刷新时重新加载数据
- [ ] 刷新完成后显示"更新于X秒前"
- [ ] 测试不同刷新位置
- [ ] 与手势导航不冲突

### US-016: 优化Safe Area适配
**描述：** 作为用户，App内容应该正确适配刘海屏和底部指示器。

**验收标准：**
- [ ] 使用 `env(safe-area-inset-top/bottom)`
- [ ] 创建 `SafeAreaView` 组件
- [ ] 测试iPhone X及以上机型
- [ ] 测试Android不同屏幕比例
- [ ] 固定定位元素正确偏移
- [ ] 横屏模式适配

---

### Phase 5: 数据同步

### US-017: 实现同步队列机制
**描述：** 作为系统，离线时的操作需要排队，在线时自动同步。

**验收标准：**
- [ ] 创建 `SyncQueue` 类管理待同步操作
- [ ] 操作类型: CREATE_MEAL, UPDATE_PROFILE, etc.
- [ ] 离线时将操作添加到队列
- [ ] 在线时自动处理队列
- [ ] 失败操作指数退避重试
- [ ] 同步状态显示在设置中

### US-018: 实现后端API集成
**描述：** 作为系统，需要与后端API同步数据。

**验收标准：**
- [ ] 创建 `api/` 目录组织API调用
- [ ] 实现 `api.meals.create()` 上传meal数据
- [ ] 实现 `api.meals.list()` 获取服务器数据
- [ ] 实现 `api.sync.pull()` 拉取远程更新
- [ ] JWT token管理
- [ ] 请求/响应拦截器

### US-019: 实现冲突解决策略
**描述：** 作为系统，当本地和远程数据冲突时需要解决。

**验收标准：**
- [ ] 定义冲突类型（同时修改同一记录）
- [ ] 实现"最后写入胜"策略（简单）
- [ ] 或实现"服务器胜"策略
- [ ] 冲突记录标记并通知用户
- [ ] 提供手动解决冲突UI
- [ ] 测试各种冲突场景

---

### Phase 6: 细节优化

### US-020: 优化图片加载和缓存
**描述：** 作为用户，历史记录中的图片应该快速加载。

**验收标准：**
- [ ] 实现图片懒加载（IntersectionObserver）
- [ ] 使用Service Worker缓存图片
- [ ] 缩略图生成（用于列表）
- [ ] 渐进式加载（模糊→清晰）
- [ ] 加载失败时显示占位符
- [ ] 图片压缩后上传

### US-021: 添加加载骨架屏
**描述：** 作为用户，数据加载时应该看到骨架屏而不是空白。

**验收标准：**
- [ ] 创建 `Skeleton` 组件
- [ ] MealList加载时显示骨架
- [ ] 统计卡片加载时显示骨架
- [ ] 使用shimmer动画效果
- [ ] 骨架布局与真实内容一致
- [ ] 加载时间<300ms时跳过骨架

### US-022: 实现Toast通知系统
**描述：** 作为用户，重要操作需要成功/失败的反馈。

**验收标准：**
- [ ] 创建 `Toast` 组件和 `useToast` hook
- [ ] 支持success, error, info类型
- [ ] 自动消失（3秒）
- [ ] 可手动关闭
- [ ] 支持多个Toast堆叠
- [ ] 使用spring动画

### US-023: 实现深色模式完整支持
**描述：** 作为用户，深色模式下所有界面都应该正确显示。

**验收标准：**
- [ ] 确保所有CSS变量有深色模式值
- [ ] 检查所有Card/Button/Input组件
- [ ] 图表颜色适配深色模式
- [ ] 图片保持原色（不变暗）
- [ ] 平滑过渡动画
- [ ] 遵循系统主题设置

### US-024: 性能优化
**描述：** 作为用户，App应该快速响应，不卡顿。

**验收标准：**
- [ ] 实现虚拟滚动（长列表）
- [ ] 图片使用WebP格式
- [ ] 代码分割（按路由）
- [ ] 分析bundle大小
- [ ] Lighthouse Performance >90
- [ ] 首屏加载 <2秒

---

## 4. Functional Requirements

**FR-1:** 系统必须在所有主流移动浏览器上运行（iOS Safari 14+, Android Chrome 90+, 微信内置浏览器）

**FR-2:** 系统必须支持离线使用已查看的数据

**FR-3:** 系统必须在网络恢复时自动同步离线期间的操作

**FR-4:** 系统必须适配刘海屏和圆角屏（safe-area-inset）

**FR-5:** 系统必须支持手势导航（左右滑动切换Tab）

**FR-6:** 系统必须将所有用户数据持久化到IndexedDB

**FR-7:** 系统必须在拍照分析后自动保存结果

**FR-8:** 系统必须显示今日/本周的营养统计

**FR-9:** 系统必须支持下拉刷新数据

**FR-10:** 系统必须支持深色/浅色主题切换

---

## 5. Non-Goals

**本版本不包括：**

- 原生App打包（React Native / Capacitor） - 留待后续版本
- 实时聊天功能
- 社交功能（评论、点赞）- 保持现有简单实现
- AI模型本地化部署 - 继续使用云端API
- 多语言国际化（i18n）- 仅支持中英文切换
- 复杂的营养目标设置
- 食物数据库管理
- 分享功能优化

---

## 6. Technical Considerations

**已知约束：**

- Google Gemini API有调用限制，需要合理缓存结果
- IndexedDB在iOS Safari上有存储限制（通常50MB）
- 微信浏览器对Service Worker支持有限，需要降级方案
- iOS Safari不支持background sync API

**依赖项：**

- `vite-plugin-pwa` - PWA功能
- `idb` - IndexedDB封装
- `react-swipeable` - 手势识别
- `recharts` - 图表组件
- `framer-motion` - 动画库（已集成）

**数据流：**

```
用户操作 → UI组件 → AppContext → IndexedDB（本地）
                            ↓
                        SyncQueue（待同步）
                            ↓
                        API调用（后端，在线时）
```

---

## 7. Success Metrics

- [ ] PWA安装率 >30%（月活用户中）
- [ ] 离线使用率 >20%
- [ ] 首屏加载时间 <2秒（3G网络）
- [ ] Lighthouse Performance >90
- [ ] Lighthouse PWA >90
- [ ] 数据同步成功率 >95%
- [ ] 用户留存（7日）>40%

---

## Story Execution Order

按依赖关系排序：

1. **Phase 1**: US-001 → US-002 → US-003 → US-004 (PWA基础)
2. **Phase 2**: US-005 → US-006 → US-007 → US-008 (数据层)
3. **Phase 3**: US-009 → US-010 → US-011 → US-012 (业务逻辑)
4. **Phase 4**: US-013 → US-014 → US-015 → US-016 (移动端)
5. **Phase 5**: US-017 → US-018 → US-019 (数据同步)
6. **Phase 6**: US-020 → US-021 → US-022 → US-023 → US-024 (优化)

每个story应该在一个Ralph迭代内完成（约15-30分钟）。
