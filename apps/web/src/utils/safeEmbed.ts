export type SafeEmbed = {
    src: string;
    provider: 'youtube' | 'vimeo' | 'figma';
};

const YOUTUBE_ID = /^[A-Za-z0-9_-]{6,20}$/;
const VIMEO_ID = /^\d+$/;

function cleanHost(hostname: string): string {
    return hostname.toLowerCase().replace(/^www\./, '');
}

function youtubeEmbed(url: URL): SafeEmbed | null {
    const host = cleanHost(url.hostname);
    let id: string | null = null;

    if (host === 'youtu.be') {
        id = url.pathname.split('/').filter(Boolean)[0] ?? null;
    } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        if (url.pathname === '/watch') {
            id = url.searchParams.get('v');
        } else {
            const parts = url.pathname.split('/').filter(Boolean);
            if (parts[0] === 'embed' || parts[0] === 'shorts') {
                id = parts[1] ?? null;
            }
        }
    }

    if (!id || !YOUTUBE_ID.test(id)) return null;

    return {
        provider: 'youtube',
        src: `https://www.youtube-nocookie.com/embed/${id}`,
    };
}

function vimeoEmbed(url: URL): SafeEmbed | null {
    const host = cleanHost(url.hostname);
    if (host !== 'vimeo.com' && host !== 'player.vimeo.com') return null;

    const parts = url.pathname.split('/').filter(Boolean);
    const candidate = host === 'player.vimeo.com' && parts[0] === 'video' ? parts[1] : parts.at(-1);
    if (!candidate || !VIMEO_ID.test(candidate)) return null;

    return {
        provider: 'vimeo',
        src: `https://player.vimeo.com/video/${candidate}`,
    };
}

function figmaEmbed(url: URL): SafeEmbed | null {
    const host = cleanHost(url.hostname);
    if (host !== 'figma.com') return null;

    if (url.pathname === '/embed') {
        return { provider: 'figma', src: url.toString() };
    }

    const allowedPrefixes = ['/file/', '/design/', '/proto/', '/board/'];
    if (!allowedPrefixes.some((prefix) => url.pathname.startsWith(prefix))) return null;

    const shareUrl = url.toString();
    return {
        provider: 'figma',
        src: `https://www.figma.com/embed?embed_host=mermaidman&url=${encodeURIComponent(shareUrl)}`,
    };
}

/**
 * Convert supported third-party share URLs into constrained HTTPS embed URLs.
 * Arbitrary iframe URLs and non-HTTP(S) schemes are rejected.
 */
export function normalizeEmbedUrl(raw: string): SafeEmbed | null {
    const input = raw.trim();
    if (!input) return null;

    let url: URL;
    try {
        url = new URL(input);
    } catch {
        return null;
    }

    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (url.username || url.password) return null;

    return youtubeEmbed(url) ?? vimeoEmbed(url) ?? figmaEmbed(url);
}
