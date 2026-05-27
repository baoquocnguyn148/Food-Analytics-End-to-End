# NutriHub — Smart Nutrition Marketplace

NutriHub is a Next.js-based nutrition marketplace prototype that helps users explore foods, compare nutrients, and visualize macro breakdowns.

## Overview

- Built with **Next.js 16.2.6** and **React 19**
- Uses **Tailwind CSS v4** and custom UI components in `components/ui`
- Demo content includes:
  - searchable food list
  - category browsing
  - nutrition score cards
  - macro charts and comparison
  - favorites and compare toggles
- Includes starter app structure for a nutrition analytics experience

## Features

- Food search and filtering
- Category selection
- Protein range slider filtering
- Food comparison and favorites toggles
- Recharts visualization for nutrition data
- Responsive modern UI design

## Folder structure

- `app/`: Next.js app routes and pages
- `components/`: reusable UI components and theme provider
- `hooks/`: custom React hooks
- `lib/`: utility helpers
- `public/`: static assets
- `styles/`: global styles

## Requirements

- Node.js 18 or newer
- npm

## Quick start

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Build for production

```bash
npm run build
npm start
```

## Notes

- The project uses the `next/font` Google font loader and Vercel analytics in production.
- If you want to update the repo remote, change the origin URL with `git remote set-url origin <url>`.
