# Resume + Chatbot (Next.js)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` in the project root:

```
OPENAI_API_KEY=your_openai_key_here
```

3. Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Customize your resume

Edit `data/resume.js` to update personal info, links, skills, experience, education, internships, and projects. The chat automatically uses this data for context.

## Deploy

- Vercel recommended. Add `OPENAI_API_KEY` as an env variable in your deployment platform.
