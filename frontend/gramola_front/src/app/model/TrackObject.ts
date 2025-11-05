class Artist {
  constructor(
    public external_urls: ExternalUrls,
    public href: string,
    public id: string,
    public name: string,
    public type: string,
    public uri: string
  ) {}

  static fromJSON(json: any): Artist {
    return new Artist(
      ExternalUrls.fromJSON(json.external_urls),
      json.href,
      json.id,
      json.name,
      json.type,
      json.uri
    );
  }
}

class Restrictions {
  constructor(public reason: string) {}

  static fromJSON(json: any): Restrictions {
    return new Restrictions(json.reason);
  }
}

class Album {
  constructor(
    public album_type: string,
    public total_tracks: number,
    public available_markets: string[],
    public external_urls: ExternalUrls,
    public href: string,
    public id: string,
    public images: Imagen[],
    public name: string,
    public release_date: string,
    public release_date_precision: string,
    public restrictions: Restrictions,
    public type: string,
    public uri: string,
    public artists: Artist[]
  ) {}

  static fromJSON(json: any): Album {
    return new Album(
      json.album_type,
      json.total_tracks,
      json.available_markets,
      ExternalUrls.fromJSON(json.external_urls),
      json.href,
      json.id,
      json.images.map((img: any) => Imagen.fromJSON(img)),
      json.name,
      json.release_date,
      json.release_date_precision,
      Restrictions.fromJSON(json.restrictions),
      json.type,
      json.uri,
      json.artists.map((artist: any) => Artist.fromJSON(artist))
    );
  }
}

class ExternalIds {
  constructor(
    public isrc: string,
    public ean: string,
    public upc: string
  ) {}

  static fromJSON(json: any): ExternalIds {
    return new ExternalIds(json.isrc, json.ean, json.upc);
  }
}

class TrackObject {
  constructor(
    public album: Album,
    public artists: Artist[],
    public available_markets: string[],
    public disc_number: number,
    public duration_ms: number,
    public explicit: boolean,
    public external_ids: ExternalIds,
    public external_urls: ExternalUrls,
    public href: string,
    public id: string,
    public is_playable: boolean,
    public linked_from: any,
    public restrictions: Restrictions,
    public name: string,
    public popularity: number,
    public preview_url: string,
    public track_number: number,
    public type: string,
    public uri: string,
    public is_local: boolean
  ) {}

  static fromJSON(json: any): TrackObject {
    return new TrackObject(
      Album.fromJSON(json.album),
      json.artists.map((a: any) => Artist.fromJSON(a)),
      json.available_markets,
      json.disc_number,
      json.duration_ms,
      json.explicit,
      ExternalIds.fromJSON(json.external_ids),
      ExternalUrls.fromJSON(json.external_urls),
      json.href,
      json.id,
      json.is_playable,
      json.linked_from, // Puedes crear una clase si se define su estructura
      Restrictions.fromJSON(json.restrictions),
      json.name,
      json.popularity,
      json.preview_url,
      json.track_number,
      json.type,
      json.uri,
      json.is_local
    );
  }
}