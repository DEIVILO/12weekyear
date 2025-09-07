# 12 Week Year Planner

A comprehensive planning and execution system based on Brian P. Moran's "The 12 Week Year" methodology. This application helps individuals and teams achieve their most important goals by breaking them down into focused 12-week execution periods.

## 🎯 Project Overview

The 12 Week Year methodology transforms how you approach goal achievement by:
- **Compressing annual goals into 12-week periods** for increased urgency and focus
- **Eliminating the "someday" syndrome** by creating clear, time-bound objectives
- **Providing weekly accountability** through structured reviews and adjustments
- **Building execution discipline** through consistent daily and weekly actions

## 🏗️ Core Features

### 1. Vision & Goal Setting
- **Vision Statement Builder**: Create compelling 3-year vision statements
- **Annual Goal Setting**: Define 2-3 critical goals for the year
- **12-Week Goal Breakdown**: Convert annual goals into quarterly 12-week objectives
- **SMART Goal Templates**: Ensure goals are Specific, Measurable, Achievable, Relevant, and Time-bound

### 2. 12-Week Planning System
- **12-Week Plan Creation**: Set up new 12-week periods with clear start/end dates
- **Weekly Tactics**: Break down 12-week goals into specific weekly actions
- **Daily Actions**: Convert weekly tactics into daily execution items
- **Priority Matrix**: Categorize actions by importance and urgency

### 3. Execution & Tracking
- **Task Checker**: Simple checkmark interface for daily/weekly tasks
- **Success Threshold**: 80%+ completion rate marks weekly success
- **Daily Scorecard**: Track completion of daily actions with simple yes/no scoring
- **Weekly Score**: Calculate and display weekly execution percentage with visual indicators
- **12-Week Score**: Monitor overall progress toward 12-week goals
- **Habit Tracking**: Monitor key behaviors that drive results

### 4. Accountability & Reviews
- **Weekly Planning Sessions**: Dedicated time for planning the upcoming week
- **Weekly Accountability Sessions**: Review past week's performance and adjust
- **12-Week Review**: Comprehensive analysis at the end of each 12-week period
- **Annual Review**: Reflect on the year and plan for the next 12-week cycle

### 5. Analytics & Insights
- **Execution Trends**: Visualize performance over time
- **Goal Progress Tracking**: Monitor advancement toward 12-week objectives
- **Habit Formation Analysis**: Track consistency of key behaviors
- **Performance Reports**: Generate insights for continuous improvement

## 🛠️ Technical Architecture

### Frontend Stack
- **Next.js 15** with App Router for modern React development
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS** for responsive, utility-first styling
- **shadcn/ui** for beautiful, accessible UI components
- **Framer Motion** (via Aceternity) for smooth animations and micro-interactions
- **React Hook Form** for efficient form handling
- **Zustand** for lightweight state management
- **Recharts** for data visualization and analytics

### Backend & Data
- **Next.js API Routes** for local backend functionality
- **Prisma ORM** for type-safe database operations
- **SQLite** for local data persistence (no external database required)
- **Local Storage** for simple data persistence (alternative to database)
- **No authentication needed** - single user local app

### Additional Tools
- **shadcn/ui** for beautiful, accessible UI components
- **Lucide React** for consistent iconography
- **React Hot Toast** for user notifications
- **Date-fns** for date manipulation and formatting
- **Zod** for runtime type validation
- **React Query** for server state management and caching

## 📱 User Interface Design

### Design Principles
- **Clean & Minimal**: Focus on content, reduce cognitive load
- **Mobile-First**: Optimized for mobile devices with desktop enhancement
- **Accessibility**: WCAG 2.1 AA compliant design
- **Performance**: Fast loading and smooth interactions

### Key Pages & Components
- **Dashboard**: Overview of current 12-week period progress
- **Vision Board**: Visual representation of long-term vision and goals
- **12-Week Plan**: Detailed planning interface for current period
- **Weekly Planner**: Week-by-week tactical planning
- **Daily Scorecard**: Simple daily action tracking
- **Analytics**: Performance insights and trend analysis
- **Settings**: User preferences and account management

## 🚀 Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup and configuration
- [ ] Database schema design and implementation
- [ ] Authentication system setup
- [ ] Basic UI components and layout
- [ ] Core data models (User, Vision, Goals, 12WeekPlan)

### Phase 2: Core Planning (Weeks 3-4)
- [ ] Vision statement creation interface
- [ ] Annual goal setting functionality
- [ ] 12-week plan creation and management
- [ ] Weekly tactics planning system
- [ ] Daily actions breakdown

### Phase 3: Execution & Tracking (Weeks 5-6)
- [ ] Daily scorecard implementation
- [ ] Weekly and 12-week scoring system
- [ ] Progress tracking and visualization
- [ ] Habit tracking functionality
- [ ] Mobile-responsive design

### Phase 4: Analytics & Reviews (Weeks 7-8)
- [ ] Performance analytics dashboard
- [ ] Weekly review interface
- [ ] 12-week review system
- [ ] Data visualization components
- [ ] Export and reporting features

### Phase 5: Polish & Launch (Weeks 9-10)
- [ ] User testing and feedback integration
- [ ] Performance optimization
- [ ] Error handling and edge cases
- [ ] Documentation and help system
- [ ] Deployment and production setup

## 📊 Database Schema

### Core Entities
- **Users**: Authentication and profile information
- **Visions**: 3-year vision statements
- **AnnualGoals**: Yearly objectives
- **TwelveWeekPlans**: 12-week execution periods
- **WeeklyTactics**: Weekly action items
- **DailyActions**: Daily execution items
- **Scorecards**: Daily/weekly execution tracking
- **Habits**: Key behaviors for tracking

### Relationships
- Users have multiple Visions
- Visions have multiple AnnualGoals
- AnnualGoals have multiple TwelveWeekPlans
- TwelveWeekPlans have multiple WeeklyTactics
- WeeklyTactics have multiple DailyActions
- Users track DailyActions via Scorecards

## 🎨 Design System

### Color Palette
- **Primary**: Deep blue (#1e40af) for trust and focus
- **Secondary**: Emerald green (#10b981) for growth and progress
- **Accent**: Amber (#f59e0b) for warnings and highlights
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Headings**: Inter (bold, clear hierarchy)
- **Body**: Inter (readable, professional)
- **Monospace**: JetBrains Mono (for data/code)

### Components
- **Cards**: Elevated containers for content sections
- **Buttons**: Clear hierarchy with primary, secondary, and ghost variants
- **Forms**: Clean inputs with validation states
- **Charts**: Consistent data visualization styling
- **Navigation**: Intuitive menu and breadcrumb systems

## 🔧 Environment Setup

### Required Environment Variables
- `DATABASE_URL`: SQLite database file path (e.g., `file:./dev.db`)
- No authentication variables needed for local-only usage

### Development Commands
```bash
# Install dependencies
npm install

# Set up shadcn/ui
npx shadcn@latest init

# Set up database (SQLite)
npx prisma generate
npx prisma db push

# Run development server
npm run dev

# Run database studio (optional)
npx prisma studio

# Build for production
npm run build
```

## 📈 Success Metrics

### User Engagement
- Daily active users
- Weekly planning session completion rate
- 12-week plan completion rate
- Feature adoption rates

### Goal Achievement
- Average weekly execution score
- 12-week goal completion percentage
- User-reported goal achievement
- Retention rate after first 12-week period

### Product Performance
- Page load times
- Mobile responsiveness scores
- Accessibility compliance
- User satisfaction ratings

## 🎯 Future Enhancements

### Advanced Features
- **Team Collaboration**: Shared goals and accountability partners
- **Integration APIs**: Connect with calendar, task management, and productivity tools
- **AI Coaching**: Intelligent suggestions based on performance patterns
- **Gamification**: Achievement badges and progress celebrations
- **Mobile App**: Native iOS and Android applications

### Enterprise Features
- **Organization Management**: Multi-user team accounts
- **Custom Templates**: Industry-specific goal and planning templates
- **Advanced Analytics**: Team performance dashboards and insights
- **API Access**: Third-party integrations and custom workflows

## 📚 Resources

### The 12 Week Year Methodology
- [Official 12 Week Year Website](https://12weekyear.com/)
- [Brian P. Moran's Book](https://www.amazon.com/12-Week-Year-Others-Months-Execution/dp/1118509234)
- [12 Week Year Training Programs](https://12weekyear.com/training/)

### Development Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)

---

*This project implements the proven 12 Week Year methodology to help individuals and teams achieve extraordinary results through focused execution and consistent accountability.*
