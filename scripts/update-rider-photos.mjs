// Downloads MotoGP rider photos from the official API into public/assets/riders/{number}.png,
// resized to 200x300 (the originals are ~4 MB each).
//
//   npm run photos          -> only riders without a photo
//   npm run photos -- --all -> re-download every rider of the current season

import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const API = 'https://api.motogp.pulselive.com/motogp/v1';
const OUT_DIR = fileURLToPath(new URL('../public/assets/riders/', import.meta.url));
const MOTOGP_LEGACY_ID = 3;
const refreshAll = process.argv.includes('--all');

const get = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: ${response.status}`);
    return response;
};

const seasons = await (await get(`${API}/results/seasons`)).json();
const year = (seasons.find((s) => s.current) ?? seasons[0]).year;
const categories = await (await get(`${API}/categories?seasonYear=${year}`)).json();
const category = categories.find((c) => c.legacy_id === MOTOGP_LEGACY_ID);
const teams = await (await get(`${API}/teams?categoryUuid=${category.id}&seasonYear=${year}`)).json();

// One photo per number; a substitute never replaces the regular rider using that number.
const riders = new Map();
for (const team of teams) {
    for (const rider of team.riders ?? []) {
        const step = rider.current_career_step;
        // Some URLs come with a double slash ("https://host//riders/..."), which 404s.
        const photo = step?.pictures?.profile?.main?.replace(/([^:]\/)\/+/g, '$1');
        if (step?.number == null || !photo) continue;
        if (step.type === 'Substitute' && riders.has(step.number)) continue;
        riders.set(step.number, { name: `${rider.name} ${rider.surname}`.trim(), photo });
    }
}

mkdirSync(OUT_DIR, { recursive: true });
let downloaded = 0;
for (const [number, { name, photo }] of [...riders].sort((a, b) => a[0] - b[0])) {
    const file = `${OUT_DIR}${number}.png`;
    if (!refreshAll && existsSync(file)) continue;
    try {
        const image = Buffer.from(await (await get(photo)).arrayBuffer());
        await sharp(image).resize(200, 300, { fit: 'cover', position: 'top' }).png({ palette: true }).toFile(file);
        console.log(`✓ ${number} ${name}`);
        downloaded++;
    } catch (error) {
        console.error(`✗ ${number} ${name}: ${error.message}`);
    }
}
console.log(`${downloaded} photo(s) downloaded for the ${year} season.`);
