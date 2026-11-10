# MotoGP Schedules

A one-page website with the MotoGP schedule and results:

- **Next Grand Prix**: dates and the start time of every MotoGP session (FP1, Practice, FP2, Q1, Q2, Sprint, Race), shown in the visitor's local time.
- **Standings**: the current riders' championship, with team colours and rider photos.
- **Results**: the classification of any session of any finished Grand Prix this season.

Built with [Astro](https://astro.build), React and Tailwind CSS, and deployed on Netlify.

## Data source

All data comes from the official MotoGP API (`https://api.motogp.pulselive.com/motogp/v1`), which is the API motogp.com uses. It is not publicly documented and may change without notice.

The API rejects requests sent by browsers from other websites, so the site never calls it directly. The browser calls `/api/motogp/...` on our own domain instead, and a proxy forwards the request:

```text
Browser ──> /api/motogp/results/standings?...
              │
              ├─ on Netlify:   netlify/functions/motogp.mts (Netlify Function)
              └─ in dev:       Vite proxy configured in astro.config.mjs
              │
              └──> api.motogp.pulselive.com/motogp/v1/results/standings?...
```

The Netlify function:

- only forwards the endpoints the site uses (anything else returns 404);
- caches responses on Netlify's CDN (5 minutes for results, 1 hour for everything else), so most visits never run the function.

The season is not hardcoded: the site always uses the season the API marks as current.

## Project structure

```text
/
├── netlify/functions/
│   └── motogp.mts              # Proxy to the MotoGP API (production)
├── public/
│   └── assets/riders/          # Rider photos, named by race number ({number}.png)
├── scripts/
│   └── update-rider-photos.mjs # Downloads rider photos (npm run photos)
├── src/
│   ├── components/
│   │   ├── NextEvent.jsx            # "Next Grand Prix" section
│   │   ├── StandingsAndResults.tsx  # Standings and results tables
│   │   └── LocalTime.jsx            # Formats dates in the visitor's time zone
│   ├── lib/
│   │   └── motogp.ts           # API client: fetches and reshapes the data
│   ├── layouts/Layout.astro
│   ├── sections/               # Title and footer
│   └── pages/index.astro       # The only page
└── astro.config.mjs            # Astro config + dev proxy to the MotoGP API
```

## Commands

All commands are run from the root of the project:

| Command                   | Action                                                   |
| :------------------------ | :------------------------------------------------------- |
| `npm install`             | Installs dependencies                                    |
| `npm run dev`             | Starts the local dev server at `localhost:4321`          |
| `npm run build`           | Type-checks and builds the site to `./dist/`             |
| `npm run preview`         | Previews the build locally                               |
| `npm run photos`          | Downloads photos for riders that don't have one yet      |
| `npm run photos -- --all` | Re-downloads every rider photo                           |

`npm run dev` works without Netlify: the dev proxy stands in for the Netlify function. `npm run preview` does not include the proxy, so it shows no data. To test the real function locally, use the [Netlify CLI](https://docs.netlify.com/cli/get-started/) (`netlify dev`).

## Rider photos

Rider photos live in `public/assets/riders/{number}.png` (200×300). If a rider has no photo, the table just leaves that cell empty.

`scripts/update-rider-photos.mjs` downloads the photos from the official API and resizes them, because the originals are about 4 MB each:

- `npm run photos` only downloads photos for current-season riders that don't have one yet. Run it when a new rider or substitute joins the grid, then commit the new images.
- `npm run photos -- --all` re-downloads every rider's photo, for example at the start of a season when there are new photos and leathers.

If a regular rider and a substitute share a number, the regular rider's photo and team colour are used.

## Deployment

The site is deployed on Netlify. Netlify picks up the function in `netlify/functions/` automatically, so no extra configuration, adapter or environment variables are needed. After a deploy, `https://<your-site>/api/motogp/results/seasons` should return a list of seasons in JSON.

## Credits

Data and rider photos belong to MotoGP / Dorna Sports. This is an unofficial, non-commercial fan project.
