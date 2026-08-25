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

## Deploying: the host must fall back to `index.html`

This is a single-page app with real client-side routes (`/tour/...`), so any
URL that is not a file on disk has to be answered with `index.html` and a
`200`. Get this wrong and the app works perfectly right up until somebody
refreshes a page or opens a shared link.

- **nginx / the Docker image**: already handled by `try_files $uri $uri/
  /index.html;` in `nginx.conf`.
- **S3 + CloudFront**: the distribution needs custom error responses mapping
  `403` **and** `404` to `/index.html` with response code `200`. An S3 REST
  origin answers a missing key with `403` when the origin identity lacks
  `s3:ListBucket` and `404` when it has it, so map both rather than guessing
  which one this distribution produces.

  This is a one-time change per distribution. Either run:

  ```bash
  # AWS_PROFILE is optional; without it the CLI resolves credentials as usual
  DISTRIBUTION_ID=E2QWERTY123ABC AWS_PROFILE=personal make cloudfront-spa
  ```

  which is idempotent, keeps any other error responses already configured,
  and takes `DRY_RUN=1` to show the change without applying it. Or do it in
  the console: **CloudFront → your distribution → Error pages → Create
  custom error response**, once for each code, with response page
  `/index.html`, HTTP response code `200`, and a minimum TTL of `10` so a
  genuine origin problem is not cached for the default five minutes.

  The tradeoff: CloudFront can then no longer distinguish a mistyped route
  from a genuinely missing asset, so an absent `/static/js/typo.js` also
  returns `index.html` with a `200`. That is the normal SPA arrangement — the
  app owns its own 404 page. Swap in a CloudFront Function rewriting only
  extensionless paths if that ever becomes a problem.

Verify after any hosting change by requesting a deep route directly rather
than clicking through to it — clicking never leaves the SPA and so never
exercises the fallback.

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
