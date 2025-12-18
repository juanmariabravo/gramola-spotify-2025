export interface Playlist {
  id?: string;
  name?: string;
  description?: string;
  images?: { url: string; height?: number; width?: number }[];
  tracks?: {
    href: string;
    total: number;
  };
  owner?: {
    display_name: string;
    id: string;
  };
  public?: boolean;
  collaborative?: boolean;
  uri?: string;
}