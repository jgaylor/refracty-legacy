⸻

Project status

This repository represents an early experiment while exploring ideas around relationship awareness, working styles, and personal knowledge capture.

It served as a learning ground for product direction, technical decisions, and UX patterns. Rather than continuing to evolve this codebase, I chose to start a new repository and re-approach the problem with the benefit of what I learned here.

This project is no longer under active development and is preserved for reference.

# Refracty

**Track relationships and working styles of the people you work with**

A personal CRM for professional relationships that helps you remember what matters about the people you collaborate with.

## Why Refracty?

### The Problem

As professionals—whether you're a manager, team lead, consultant, or work with many stakeholders—you interact with numerous people. It's challenging to remember:

- Individual communication preferences and styles
- What motivates different people
- How people prefer to collaborate
- When and how people work best
- Important context from past interactions

This relationship knowledge often gets lost over time, making it harder to work effectively with others.

### The Solution

Refracty is a private, secure tool for tracking structured insights and observations about the people you work with. Think of it as a personal CRM focused on understanding working relationships, not sales.

**Key Benefits:**

- **Private & Secure**: Your data is yours alone. Row-level security ensures complete privacy.
- **Structured Insights**: Track specific categories of information, not just random notes.
- **Easy to Use**: Simple interface for capturing and retrieving information when you need it.
- **Always Available**: Access your relationship insights anywhere, anytime.

## Features

### People Management

Add and organize the people you work with. Mark favorites for quick access to your most important relationships.

### Structured Insights

Track five key categories of information about each person:

- **What motivates them** - Understand their drivers and goals
- **Preferred communication style** - How they like to receive information
- **When they work best** - Their optimal working conditions
- **Collaboration style** - How they prefer to work with others
- **Feedback approach** - How they give and receive feedback

### Notes & Observations

Capture general notes and observations about interactions, meetings, or anything else worth remembering.

### Feed

View all your notes and insights in chronological order on the home feed, giving you a complete timeline of your relationship history.

### Theme Settings

Customize the appearance with light/dark mode and other appearance preferences.

### Secure & Private

All data is protected with Row Level Security (RLS). You can only access your own data, and no one else can see your insights.

## Tech Stack

- **Next.js 16** - App Router, TypeScript, React 19
- **Supabase** - Authentication, PostgreSQL database, Row Level Security
- **Tailwind CSS** - Styling with custom theme support
- **React Hot Toast** - User notifications
- **Vercel** - Hosting and deployment

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd refracty
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   You can find these values in your Supabase project settings under API.

4. **Set up the database**

   Run the migration files in your Supabase SQL editor (in order):

   - `migrations/create_people_table.sql`
   - `migrations/create_notes_table.sql`
   - `migrations/create_insights_table.sql`
   - `migrations/add_appearance_to_profiles.sql`
   - `migrations/add_favorite_to_people.sql`

   These migrations will create the necessary tables and set up Row Level Security policies.

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

7. **Create an account**

   Sign up with your email to get started. You'll receive a confirmation email to verify your account.

## Database Schema

The application uses the following main tables:

- **`profiles`** - User profile information and appearance settings
- **`people`** - People you track, with favorite status
- **`notes`** - General notes and observations linked to people
- **`insights`** - Structured insights in five categories, linked to people

All tables use Row Level Security (RLS) to ensure users can only access their own data.

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

   ```bash
   git push origin main
   ```

2. **Import your repository to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure environment variables**

   - In your Vercel project settings, add the same environment variables from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy**
   - Vercel will automatically deploy on every push to your main branch

Your app will be live at `https://your-project.vercel.app`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

This project is private and proprietary.
