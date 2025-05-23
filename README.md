# Ad Injection Dashboard

A simple web-based dashboard that allows users to:

- Log in and manage their properties (websites)
- Add pages under each property
- Define ad containers on each page
- Upload banner ads to display within containers
- Auto-generate an embeddable script to rotate ads on client websites

## Features

- Property-based website management
- Page and container hierarchy under each property
- Upload and rotate banner ads
- Auto-generated JavaScript snippet to inject ads on any external page

## Tech Stack

- **Frontend**: Next.js (App Router, single page), React, TailwindCSS, ShadCN UI
- **Backend**: Node.js/Express or Django (to be implemented)
- **Auth**: JWT or Firebase (planned)
- **Storage**: Cloudinary/S3 for image uploads

## Project Structure

```
/ (root)
├── README.md
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── public/
│   └── favicon.ico
└── src/
    ├── app/
    │   └── page.tsx
    ├── components/
    │   └── index.tsx
    ├── styles/
    │   └── globals.css
    └── types/
        └── index.ts
```

## Getting Started

1. **Create a new Next.js app (with TypeScript):**
   ```bash
   npx create-next-app@latest . --ts --app --eslint --tailwind --src-dir
   ```

2. **Install ShadCN UI:**
   ```bash
   npx shadcn-ui@latest init
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Upcoming Features

- Backend integration with API
- Ad statistics and performance tracking
- Role-based user access

## License

MIT
