# Brainrot Webpage

A small React + TypeScript + Tailwind single-page application for the **Brainrot** programming language docs.

## Features

- **React + TS**: TypeScript for type safety, React for the UI.
- **Tailwind**: For a modern and responsive UI.
- **Brainrot Logo**: Showcases the brand with an imported image.

## Requirements

- Node.js v18+ (or similar)
- Yarn or npm
- TypeScript dev dependencies

## Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/Brainrotlang/brainrot-webpage.git
   cd brainrot-webpage
   ```

2. Install dependencies:

   ```bash
   yarn install
   # or npm install
   ```

3. (Optional) If you see ESLint or TS parser issues:

   ```bash
   yarn add -D typescript @typescript-eslint/parser
   ```

## Running the Development Server

```bash
yarn start
```

- Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Building for Production

```bash
yarn build
```

- Outputs a production-ready build in the `build/` folder.

## Project Structure

```
brainrot-webpage/
├─ public/
│  └─ favicon.ico
├─ src/
│  ├─ App.tsx
│  ├─ index.css
│  ├─ brainrot-logo.png
│  └─ ...other components...
├─ package.json
├─ yarn.lock
└─ tsconfig.json
```

## License

This project is distributed under the MIT license. See the LICENSE file for more information.
