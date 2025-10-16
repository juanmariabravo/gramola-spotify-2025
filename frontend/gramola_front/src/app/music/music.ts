import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpotiService } from '../spoti-service';


interface TrackObject {
  id?: string;
  name?: string;
  uri?: string;
  album?: { name: string; images: { url: string }[] };
  artists?: { name: string }[];
  // add other fields you use (artists, album, duration_ms, etc.)
}

interface PlayList {
  id?: string;
  name?: string;
  // add other playlist fields you need
}

@Component({
  selector: 'app-music',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './music.html',
  styleUrls: ['./music.css']
})

export class Music implements OnInit {

  devices: any[] = [];
  currentDevice: any;
  playlists : PlayList[] = [];
  queue : TrackObject[] = [];
  tracks : TrackObject[] = [];

  currentTrack? : TrackObject

  deviceError? : string
  playlistError? : string
  currentPlaylistError? : string
  songError? : string
barName: any;

  constructor(private spotiService : SpotiService) {}

  ngOnInit(): void {
    this.getDevices()
    this.getPlaylists()
    this.getCurrentPlayList()
  }

  getDevices() {
    this.resetErrors()
    this.spotiService.getDevices().subscribe({
      next: (result) => {
        this.devices = result.devices;
        this.currentDevice = this.devices.find(d => d.is_active);
        if (!this.currentDevice)
          this.deviceError = "No hay ningún dispositivo conectado"
      },
      error: (err) => {
        this.deviceError = err.message;
      }
    });
  }

  getPlaylists() {
    this.resetErrors();
    this.spotiService.getPlaylists().subscribe({
      next: (result) => {
        this.playlists = result.items;
      },
      error: (err) => {
        this.playlistError = err.message;
      }
    });
  }

  getCurrentPlayList() {
    this.resetErrors();
    this.spotiService.getCurrentlyPlaying().subscribe({
      next: (result) => {
        if (result && result.item) {
          this.currentTrack = result.item;
        }
      },
      error: (err) => {
        this.currentPlaylistError = err.message;
      }
    });

  }

  resetErrors() {
    this.deviceError = undefined;
    this.playlistError = undefined;
    this.currentPlaylistError = undefined;
    this.songError = undefined;
  }

  // Añade estas propiedades
searchQuery: string = '';

// Métodos adicionales
getArtists(track: TrackObject): string {
  return track.artists?.map(artist => artist.name).join(', ') || 'Artista desconocido';
}

getDeviceIcon(deviceType: string): string {
  const icons: { [key: string]: string } = {
    'computer': '💻',
    'smartphone': '📱',
    'tablet': '📟',
    'speaker': '🔊',
    'tv': '📺'
  };
  return icons[deviceType.toLowerCase()] || '📱';
}

searchTracks() {
  if (!this.searchQuery.trim()) return;
  
  this.resetErrors();
  this.spotiService.searchTracks(this.searchQuery).subscribe({
    next: (result) => {
      this.tracks = result.tracks.items;
    },
    error: (err) => {
      this.songError = err.message;
    }
  });
}

addToQueue(track: TrackObject) {
  this.resetErrors();
  this.spotiService.addToQueue(track.uri!).subscribe({
    next: () => {
      this.queue.unshift(track);
      // Opcional: mostrar mensaje de éxito
    },
    error: (err) => {
      this.songError = err.message;
    }
  });
}

  clearQueue() {
    this.queue = [];
  }

}