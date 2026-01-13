
export enum Language {
  ZH = 'zh',
  EN = 'en'
}

export type Theme = 'light' | 'dark' | 'system';

export interface UserProfile {
  name: string;
  id: string;
  avatar: string;
  bio: string;
  height: string;
  weight: string;
  age: string;
  gender: 'male' | 'female' | 'secret';
}

export interface AnalysisResult {
  foodName: string;
  calories: number;
  macros: {
    protein: string;
    fat: string;
    carbs: string;
  };
  suggestions: string[];
  description: string;
  plating: string;
  sensory: string;
  container: string;
  imageUrl: string;
}

export enum AppView {
  MAIN_TABS = 'MAIN_TABS',
  PROFILE_HOME = 'PROFILE_HOME',
  PROFILE_EDIT = 'PROFILE_EDIT',
  PROFILE_APPEARANCE = 'PROFILE_APPEARANCE',
  PROFILE_PRIVACY = 'PROFILE_PRIVACY',
  PROFILE_NOTIFICATIONS = 'PROFILE_NOTIFICATIONS',
  PROFILE_LANGUAGE = 'PROFILE_LANGUAGE',
  PREMIUM_LANDING = 'PREMIUM_LANDING',
  PAYMENT_GATEWAY = 'PAYMENT_GATEWAY',
  ANALYSIS_RESULT = 'ANALYSIS_RESULT',
  CAMERA_CAPTURE = 'CAMERA_CAPTURE',
  // Social Views
  SOCIAL_EXPERTS_LIST = 'SOCIAL_EXPERTS_LIST',
  SOCIAL_RANKING_LIST = 'SOCIAL_RANKING_LIST',
  SOCIAL_USER_DETAIL = 'SOCIAL_USER_DETAIL'
}

export const TEXT = {
  [Language.ZH]: {
    tab_home: '首页',
    tab_passport: '护照',
    tab_data: '数据',
    tab_explore: '探索',
    tab_social: '社区',
    premium: '高级',
    unlock_title: '升级解锁数据分析',
    unlock_btn: '升级',
    analysis_title: '分析营养',
    identifying: '识别图像',
    suggestions: '生成建议',
    unknown_food: '未知食物',
    no_record: '暂无餐饮记录',
    start_record: '记录餐饮，AI会自动识别菜系和菜名，填满你的美食护照。',
    subscribe_monthly: '月度会员',
    subscribe_yearly: '年度会员',
    subscribe_btn: '立即订阅',
    pay_confirm: '确认支付',
    settings_title: '通用',
    appearance: '外观',
    language: '语言',
    notifications: '通知设置',
    privacy: '隐私设置',
    edit_profile: '编辑个人信息',
    save: '保存',
    // New sections
    cuisine_explorer: '菜系探索',
    nutrient_trends: '营养趋势',
    meal_regularity: '用餐规律',
    food_diversity: '食物多样性',
    todays_meals: '今日餐食',
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐',
    // Macros
    macro_carbs: '碳水',
    macro_fat: '脂肪',
    macro_protein: '蛋白质',
    macro_vitamin: '维生素',
    // Social New
    cuisine_experts: '菜系专家',
    gourmet_ranking: '美食家榜',
    details: '详情',
    this_week: '本周',
    this_month: '本月',
    this_year: '本年',
    all_time: '总榜',
    dishes_count: '菜品',
    cuisine_count: '菜系',
    // Passport
    passport_empty_title: '护照还是空白的',
    passport_empty_desc: '记录餐饮，AI会自动识别菜系和菜名，填满你的美食护照。',
    // Missing Translations
    follow: '关注',
    likes: '获赞',
    recent_collection: '最近记录',
    healthy: '健康',
    bio_mock: '美食爱好者，正在探索世界美食。',
    points: '分',
    food_items_count: '种食材',
    this_week_increase: '本周新增',
    fruits: '水果',
    vegetables: '蔬菜',
    grains: '谷物',
    protein: '蛋白质',
    cuisine_cantonese: '粤菜',
    cuisine_japanese: '日料',
    cuisine_italian: '意大利菜',
    cuisine_french: '法餐',
    cuisine_korean: '韩餐',
    cuisine_new_world: '新世界',
    cuisine_chinese: '中餐',
    cuisine_bakery: '烘焙',
    unit_dishes: '道',
    unit_cuisines: '种',
    // Analysis Details
    analysis_plating: '摆盘',
    analysis_sensory: '色香味',
    analysis_container: '容器',
    // Home Tab Specific
    recent_unlocks: '近期解锁',
    no_unlocked_dishes: '暂无解锁菜品',
    recent_meals: '近期饮食',
    // Profile Specific
    meals: '餐',
    cuisines: '菜系',
    unlocked: '解锁',
    account_title: '帐号',
    // Notification & Privacy (Detailed)
    notify_header: '通知设置',
    notify_sub: '设置用餐提醒时间',
    notify_toggle_title: '用餐提醒',
    notify_toggle_desc: '每日定时提醒你记录饮食',
    notify_footer_title: '关于通知',
    notify_footer_desc: '胃之书会在你设定的时间发送本地通知，提醒你记录每一餐。通知不会收集任何个人数据。',
    privacy_header: '隐私设置',
    privacy_sub: '管理你的隐私偏好',
    privacy_toggle_title: '不参与排行榜',
    privacy_toggle_desc: '开启后，你将不会出现在任何公开排行榜中',
    // Premium Page (Detailed)
    premium_title: '极速响应的Agent通道，尽情撰写胃之书',
    premium_subtitle: '解锁所有服务的限制，享受会员服务',
    feat_1_title: '解除限制',
    feat_1_desc: '每天可分析5餐，每餐最多4张图片',
    feat_2_title: '高级模型',
    feat_2_desc: '采用最先进的模型为您服务',
    feat_3_title: '专业美食家',
    feat_3_desc: '无限解锁全部菜系，完整保留美食生涯',
    feat_4_title: '数据洞察',
    feat_4_desc: '查看完整营养报告，了解自己的饮食习惯',
    plan_monthly_price: '$9.99',
    plan_monthly_desc: '一杯咖啡的价格\n即刻开启你的美食家生涯',
    plan_yearly_price: '$99.99',
    plan_yearly_desc: '节省19.89%\n最受欢迎的选择，美食家之旅',
    restore: '恢复购买',
    redeem: '兑换',
    cancel: '取消',
    confirm: '确认',
  },
  [Language.EN]: {
    tab_home: 'Home',
    tab_passport: 'Passport',
    tab_data: 'Data',
    tab_explore: 'Explore',
    tab_social: 'Social',
    premium: 'Premium',
    unlock_title: 'Unlock Advanced Analytics',
    unlock_btn: 'Upgrade',
    analysis_title: 'Nutrition Analysis',
    identifying: 'Image Identification',
    suggestions: 'Dietary Suggestions',
    unknown_food: 'Unknown Food',
    no_record: 'No Records Yet',
    start_record: 'Record your meals. AI will identify cuisine and names to fill your food passport.',
    subscribe_monthly: 'Monthly Plan',
    subscribe_yearly: 'Yearly Plan',
    subscribe_btn: 'Subscribe Now',
    pay_confirm: 'Confirm Payment',
    settings_title: 'General',
    appearance: 'Appearance',
    language: 'Language',
    notifications: 'Notifications',
    privacy: 'Privacy',
    edit_profile: 'Edit Profile',
    save: 'Save',
    // New sections
    cuisine_explorer: 'Cuisine Explorer',
    nutrient_trends: 'Nutrient Trends',
    meal_regularity: 'Meal Regularity',
    food_diversity: 'Food Diversity',
    todays_meals: 'Today\'s Meals',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    // Macros
    macro_carbs: 'Carbs',
    macro_fat: 'Fat',
    macro_protein: 'Protein',
    macro_vitamin: 'Vitamin',
    // Social New
    cuisine_experts: 'Cuisine Experts',
    gourmet_ranking: 'Gourmet Ranking',
    details: 'Details',
    this_week: 'This Week',
    this_month: 'This Month',
    this_year: 'This Year',
    all_time: 'All Time',
    dishes_count: 'Dishes',
    cuisine_count: 'Cuisines',
    // Passport
    passport_empty_title: 'Passport is empty',
    passport_empty_desc: 'Record meals, AI will identify cuisine and names to fill your food passport.',
    // Missing Translations
    follow: 'Follow',
    likes: 'Likes',
    recent_collection: 'Recent Collection',
    healthy: 'Healthy',
    bio_mock: 'Food lover, exploring the world one bite at a time.',
    points: 'Points',
    food_items_count: 'Food Items',
    this_week_increase: 'this week',
    fruits: 'Fruits',
    vegetables: 'Veg',
    grains: 'Grains',
    protein: 'Protein',
    cuisine_cantonese: 'Cantonese',
    cuisine_japanese: 'Japanese',
    cuisine_italian: 'Italian',
    cuisine_french: 'French',
    cuisine_korean: 'Korean',
    cuisine_new_world: 'New World',
    cuisine_chinese: 'Chinese',
    cuisine_bakery: 'Bakery',
    unit_dishes: 'dishes',
    unit_cuisines: 'cuisines',
    // Analysis Details
    analysis_plating: 'Plating',
    analysis_sensory: 'Sensory',
    analysis_container: 'Container',
    // Home Tab Specific
    recent_unlocks: 'Recent Unlocks',
    no_unlocked_dishes: 'No unlocked dishes yet',
    recent_meals: 'Recent Meals',
    // Profile Specific
    meals: 'Meals',
    cuisines: 'Cuisines',
    unlocked: 'Unlocked',
    account_title: 'Account',
    // Notification & Privacy
    notify_header: 'Notification Settings',
    notify_sub: 'Set meal reminder times',
    notify_toggle_title: 'Meal Reminders',
    notify_toggle_desc: 'Remind you to record meals daily',
    notify_footer_title: 'About Notifications',
    notify_footer_desc: 'Bellybook will send local notifications at your set times. No personal data is collected.',
    privacy_header: 'Privacy Settings',
    privacy_sub: 'Manage your privacy preferences',
    privacy_toggle_title: 'Hide from Leaderboard',
    privacy_toggle_desc: 'When enabled, you will not appear in any public leaderboards.',
    // Premium Page
    premium_title: 'High-speed Agent Access, Write Your Bellybook',
    premium_subtitle: 'Unlock all limits and enjoy premium services',
    feat_1_title: 'Remove Limits',
    feat_1_desc: 'Analyze 5 meals/day, up to 4 images per meal',
    feat_2_title: 'Advanced AI',
    feat_2_desc: 'Powered by state-of-the-art models',
    feat_3_title: 'Pro Gourmet',
    feat_3_desc: 'Unlock all cuisines, preserve your history',
    feat_4_title: 'Data Insights',
    feat_4_desc: 'View full nutrition reports and habits',
    plan_monthly_price: '$9.99',
    plan_monthly_desc: 'Price of a coffee\nStart your gourmet career',
    plan_yearly_price: '$99.99',
    plan_yearly_desc: 'Save 19.89%\nMost popular choice',
    restore: 'Restore Purchase',
    redeem: 'Redeem',
    cancel: 'Cancel',
    confirm: 'Confirm',
  }
};
