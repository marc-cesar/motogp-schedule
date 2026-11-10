// Proxy to the official MotoGP API (pulselive).
// The API rejects browser requests coming from other domains, so the site calls
// /api/motogp/... and this function fetches the data server-side.

const UPSTREAM = 'https://api.motogp.pulselive.com/motogp/v1';
const PREFIX = '/api/motogp/';

// Only forward the endpoints the site uses, so this isn't an open proxy.
const ALLOWED = [/^results\/seasons$/, /^results\/categories$/, /^results\/events$/, /^results\/sessions$/,
    /^results\/standings$/, /^results\/session\/[\w-]+\/classification$/, /^events$/, /^categories$/, /^teams$/];

export default async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const path = url.pathname.slice(PREFIX.length).replace(/\/$/, '');

    if (!ALLOWED.some((re) => re.test(path))) {
        return new Response('Not found', { status: 404 });
    }

    const upstream = await fetch(`${UPSTREAM}/${path}${url.search}`, {
        headers: { Accept: 'application/json' },
    });

    if (!upstream.ok) {
        return new Response(await upstream.text(), { status: upstream.status });
    }

    // Results change during a race weekend; everything else rarely changes.
    const maxAge = path.startsWith('results/') ? 300 : 3600;

    return new Response(await upstream.text(), {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60',
            // Cached on Netlify's CDN, so most visits never reach this function.
            'Netlify-CDN-Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}, durable`,
        },
    });
};

export const config = { path: '/api/motogp/*' };
