// Client for the official MotoGP API, reached through our Netlify proxy
// (netlify/functions/motogp.mts). In `astro dev` the Vite proxy in astro.config.mjs plays that role.

const API = '/api/motogp';
const MOTOGP_LEGACY_ID = 3;

export interface Rider {
    number: string;
    name: string;
    team: string;
    points: number;
    color: string | null;
    time: string;
    gap_to_leader: string;
    best_lap: string;
    position: number | null;
}

export interface RaceEvent {
    id: string;
    name: string;
    shortname: string;
    date_start: string;
}

export interface UpcomingEvent {
    name: string;
    start_date: string;
    end_date: string;
    // MotoGP session start times keyed by short name (FP1, PR, FP2, Q1, Q2, SPR, WUP, RAC).
    sessions: Record<string, string>;
}

const get = async (path: string): Promise<any> => {
    const response = await fetch(`${API}/${path}`);
    if (!response.ok) {
        throw new Error(`MotoGP API ${path}: ${response.status} ${response.statusText}`);
    }
    return response.json();
};

// The API returns offsets like "+0000", which some browsers can't parse.
const normalizeDate = (date: string) => date.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');

const memo = <T>(fn: () => Promise<T>) => {
    let promise: Promise<T> | undefined;
    return () => (promise ??= fn().catch((e) => { promise = undefined; throw e; }));
};

const getContext = memo(async () => {
    const seasons: any[] = await get('results/seasons');
    const season = seasons.find((s) => s.current) ?? seasons[0];
    const categories: any[] = await get(`results/categories?seasonUuid=${season.id}`);
    const category = categories.find((c) => c.legacy_id === MOTOGP_LEGACY_ID);
    return { seasonId: season.id as string, year: season.year as number, categoryId: category.id as string };
});

// Team colours by rider number (the results endpoints don't include them).
const getRiderColors = memo(async () => {
    const { year } = await getContext();
    const colors = new Map<string, string>();
    try {
        const categories: any[] = await get(`categories?seasonYear=${year}`);
        const category = categories.find((c) => c.legacy_id === MOTOGP_LEGACY_ID);
        const teams: any[] = await get(`teams?categoryUuid=${category.id}&seasonYear=${year}`);
        for (const team of teams) {
            for (const rider of team.riders ?? []) {
                const number = rider.current_career_step?.number;
                if (number != null) colors.set(String(number), team.color);
            }
        }
    } catch (error) {
        console.error('Error fetching team colours:', error);
    }
    return colors;
});

export const fetchUpcomingEvent = async (): Promise<UpcomingEvent | null> => {
    const { year } = await getContext();
    const events: any[] = await get(`events?seasonYear=${year}`);
    const event = events
        .filter((e) => e.kind === 'GP' && e.status !== 'FINISHED')
        .sort((a, b) => a.date_start.localeCompare(b.date_start))[0];
    if (!event) return null;

    const sessions: Record<string, string> = {};
    for (const b of event.broadcasts ?? []) {
        if (b.type === 'SESSION' && b.category?.acronym === 'MGP') {
            sessions[b.shortname] = normalizeDate(b.date_start);
        }
    }

    return {
        name: event.name.trim(),
        start_date: normalizeDate(event.date_start),
        end_date: normalizeDate(event.date_end),
        sessions,
    };
};

export const fetchStandings = async (): Promise<Rider[]> => {
    const { seasonId, categoryId } = await getContext();
    const [data, colors] = await Promise.all([
        get(`results/standings?seasonUuid=${seasonId}&categoryUuid=${categoryId}`),
        getRiderColors(),
    ]);
    return data.classification.map((r: any) => ({
        number: String(r.rider.number),
        name: r.rider.full_name,
        team: r.team?.name ?? '',
        points: r.points,
        color: colors.get(String(r.rider.number)) ?? null,
        time: '',
        gap_to_leader: '',
        best_lap: '',
        position: r.position,
    }));
};

// Finished Grands Prix of the current season, most recent first.
export const fetchFinishedEvents = async (): Promise<RaceEvent[]> => {
    const { seasonId } = await getContext();
    const events: any[] = await get(`results/events?seasonUuid=${seasonId}&isFinished=true`);
    return events
        .filter((e) => !e.test)
        .sort((a, b) => b.date_start.localeCompare(a.date_start))
        .map((e) => ({ id: e.id, name: e.name.trim(), shortname: e.short_name, date_start: e.date_start }));
};

// sessionCode is one of RAC, SPR, WUP, Q2, Q1, FP2, PR, FP1.
export const fetchSessionResults = async (eventId: string, sessionCode: string): Promise<Rider[]> => {
    const { categoryId } = await getContext();
    const [sessions, colors]: [any[], Map<string, string>] = await Promise.all([
        get(`results/sessions?eventUuid=${eventId}&categoryUuid=${categoryId}`),
        getRiderColors(),
    ]);
    const session = sessions.find((s) => `${s.type}${s.number ?? ''}` === sessionCode);
    if (!session) return [];

    const data = await get(`results/session/${session.id}/classification?test=false`);
    return data.classification.map((r: any) => ({
        number: String(r.rider.number),
        name: r.rider.full_name,
        team: r.team?.name ?? '',
        points: r.points ?? 0,
        color: colors.get(String(r.rider.number)) ?? null,
        time: r.time ?? '',
        gap_to_leader: r.gap?.first ?? '',
        best_lap: r.best_lap?.time ?? '',
        position: r.position,
    }));
};
