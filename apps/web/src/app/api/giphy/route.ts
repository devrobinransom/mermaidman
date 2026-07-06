import { NextResponse } from 'next/server';

// Server-side Giphy proxy. Keeps GIPHY_API_KEY off the client.
// Set GIPHY_API_KEY in the environment (see apps/web/.env.example).
// Without a key the route returns an empty result + a hint, so the rest of the
// media panel (paste-a-URL) still works.

export const runtime = 'nodejs';

type GiphyImage = { url?: string };
type GiphyItem = {
    id: string;
    title?: string;
    images?: {
        original?: GiphyImage;
        fixed_width?: GiphyImage;
        fixed_width_small?: GiphyImage;
        preview_gif?: GiphyImage;
    };
};

export async function GET(request: Request) {
    const key = process.env.GIPHY_API_KEY;
    if (!key) {
        return NextResponse.json(
            { data: [], error: 'GIPHY_API_KEY not configured' },
            { status: 200 }
        );
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') ?? '').trim();
    const params = new URLSearchParams({ api_key: key, limit: '24', rating: 'pg' });
    if (q) params.set('q', q);
    const endpoint = q ? 'search' : 'trending';

    try {
        const res = await fetch(`https://api.giphy.com/v1/gifs/${endpoint}?${params}`, {
            // Cache trending/search briefly to be polite to the API.
            next: { revalidate: 60 },
        });
        if (!res.ok) {
            return NextResponse.json({ data: [], error: `giphy ${res.status}` }, { status: 200 });
        }
        const json = (await res.json()) as { data?: GiphyItem[] };
        const data = (json.data ?? []).map((g) => ({
            id: g.id,
            title: g.title ?? 'GIF',
            preview:
                g.images?.fixed_width_small?.url ??
                g.images?.fixed_width?.url ??
                g.images?.preview_gif?.url,
            full: g.images?.original?.url,
        }));
        return NextResponse.json({ data });
    } catch {
        return NextResponse.json({ data: [], error: 'giphy request failed' }, { status: 200 });
    }
}
