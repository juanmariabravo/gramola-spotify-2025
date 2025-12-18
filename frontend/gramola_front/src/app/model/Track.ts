export interface Track {
    id?: string;
    name?: string;
    uri?: string;
    album?: {
        name: string;
        images: { url: string; height?: number; width?: number }[];
    };
    artists?: { name: string }[];
    duration_ms?: number;
    explicit?: boolean;
    popularity?: number;
    preview_url?: string;
}
