class ExternalUrls {
  constructor(public spotify: string) {}

  static fromJSON(json: any): ExternalUrls {
    return new ExternalUrls(json.spotify);
  }
}

class Imagen {
  constructor(
    public url: string,
    public height: number,
    public width: number
  ) {}

  static fromJSON(json: any): Imagen {
    return new Imagen(json.url, json.height, json.width);
  }
}

class Owner {
  constructor(
    public external_urls: ExternalUrls,
    public href: string,
    public id: string,
    public type: string,
    public uri: string,
    public display_name: string
  ) {}

  static fromJSON(json: any): Owner {
    return new Owner(
      ExternalUrls.fromJSON(json.external_urls),
      json.href,
      json.id,
      json.type,
      json.uri,
      json.display_name
    );
  }
}

class Tracks {
  constructor(public href: string, public total: number) {}

  static fromJSON(json: any): Tracks {
    return new Tracks(json.href, json.total);
  }
}

class Playlist {
  constructor(
    public collaborative: boolean,
    public description: string,
    public external_urls: ExternalUrls,
    public href: string,
    public id: string,
    public images: Imagen[],
    public name: string,
    public owner: Owner,
    public publica: boolean,
    public snapshot_id: string,
    public tracks: Tracks,
    public type: string,
    public uri: string
  ) {}

  static fromJSON(json: any): Playlist {
    return new Playlist(
      json.collaborative,
      json.description,
      ExternalUrls.fromJSON(json.external_urls),
      json.href,
      json.id,
      json.images.map((img: any) => Imagen.fromJSON(img)),
      json.name,
      Owner.fromJSON(json.owner),
      json.publica,
      json.snapshot_id,
      Tracks.fromJSON(json.tracks),
      json.type,
      json.uri
    );
  }
}