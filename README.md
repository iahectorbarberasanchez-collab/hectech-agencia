# Hectech Agency 🤖⚡

Modern AI Automation Agency website built with Next.js 15, Tailwind CSS, and Gemini AI.

![Hectech Hero](http://localhost:3000/hero-preview.png)

## Features

- **🎨 Modern Design**: Glassmorphism, Neon Green/Cyan accents, and scroll-triggered animations.
- **🧠 Smart Audit (AI)**: Generates automation strategies in real-time using Google's Gemini 1.5 Flash API.
- **📝 Lead Capture**: Contact form integrated with Supabase for secure data storage.
- **⚡ High Performance**: Built on Next.js 15 (Turbopack) for instant page loads.
- **📱 Fully Responsive**: Optimized for all devices.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **AI**: [Google Generative AI SDK](https://ai.google.dev/)
- **Database**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/hectech-agency.git
   cd hectech-agency
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run Development Server**:

   ```bash
   npm run dev
   ```

## Deployment (Vercel)

The easiest way to deploy is using [Vercel](https://vercel.com).

1. Push your code to GitHub.
2. Import the project in Vercel.
3. Add the **Environment Variables** (from step 3) in Vercel's dashboard.
4. Click **Deploy**.

## License

Private project for Hectech Agency.
