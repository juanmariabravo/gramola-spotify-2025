import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SpotiService } from '../spoti-service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

interface Device {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
}

interface Playlist {
  id: string;
  name: string;
  images?: { url: string }[];
}

@Component({
  selector: 'app-playlist-and-devices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './playlist-and-devices.html',
  styleUrls: ['./playlist-and-devices.css']
})
export class PlaylistAndDevices implements OnInit {
  devices: Device[] = [];
  myPlaylists: Playlist[] = [];
  searchedPlaylists: Playlist[] = [];
  selectedDeviceId?: string;
  selectedPlaylistId?: string;
  playlistSearchQuery: string = '';
  private searchSubject = new Subject<string>();
  songPrice: number = 50; // precio por canción en céntimos (0.50€ por defecto)
  minPrice = 10;   // 0.10€
  maxPrice = 500;  // 5.00€
  userSignature?: string; // firma del usuario en base64
  barName?: string; // nombre del bar

  deviceError?: string;
  playlistError?: string;
  loading = true;

  constructor(private spotiService: SpotiService, private router: Router) {}

  ngOnInit(): void {
    // Leer firma del usuario desde sessionStorage
    this.userSignature = sessionStorage.getItem('userSignature') || undefined;
    this.barName = sessionStorage.getItem('barName') || undefined;

    this.loadDevicesAndPlaylists();
    // suscribirse a cambios en la búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        const trimmed = (query || '').trim();
        if (!trimmed) {
          // limpiar resultados de búsqueda pública
          this.searchedPlaylists = [];
          return [];
        }
        return this.spotiService.searchPlaylists(trimmed);
      })
    ).subscribe({
      next: (res: any) => {
        if (res && res.playlists && res.playlists.items) {
          this.searchedPlaylists = res.playlists.items;
        } else {
          this.searchedPlaylists = [];
        }
      },
      error: (err) => {
        this.playlistError = err?.message || 'Error al buscar playlists públicas';
        this.searchedPlaylists = [];
      }
    });
  }

  loadDevicesAndPlaylists() {
    this.loading = true;
    this.deviceError = undefined;
    this.playlistError = undefined;

    // cargar dispositivos
    this.spotiService.getDevices().subscribe({
      next: (res) => {
        this.devices = res.devices || [];
        const active = this.devices.find(d => d.is_active);
        if (active) {
          this.selectedDeviceId = active.id;
        }
      },
      error: (err) => {
        this.deviceError = err?.message || 'No se pudieron cargar los dispositivos';
      }
    });

    // cargar playlists del usuario
    this.spotiService.getPlaylists().subscribe({
      next: (res) => {
        this.myPlaylists = res.items || [];
        this.loading = false;
      },
      error: (err) => {
        this.playlistError = err?.message || 'No se pudieron cargar las playlists';
        this.loading = false;
      }
    });
  }

  selectDevice(deviceId: string) {
    if (this.selectedDeviceId === deviceId) return;
    this.deviceError = undefined;

    this.spotiService.setCurrentDevice(deviceId).subscribe({
      next: () => {
        this.selectedDeviceId = deviceId;
        // actualizar lista de dispositivos para reflejar cambio
        this.spotiService.getDevices().subscribe({
          next: (res) => {
            this.devices = res.devices || [];
          },
          error: () => {}
        });
      },
      error: (err) => {
        this.deviceError = err?.message || 'Error al seleccionar dispositivo';
      }
    });
  }

  selectPlaylist(playlistId: string) {
    this.selectedPlaylistId = playlistId;
  }

  getDeviceIcon(type: string): string {
    const icons: { [key: string]: string } = {
      computer: '💻',
      smartphone: '📱',
      tablet: '📟',
      speaker: '🔊',
      tv: '📺'
    };
    return icons[type.toLowerCase()] || '📱';
  }

  // Filtrar playlists según la búsqueda
  filteredPlaylists(): Playlist[] {
    const query = (this.playlistSearchQuery || '').trim().toLowerCase();
    if (!query) {
      // si no hay búsqueda, mostrar solo las playlists del usuario
      return this.myPlaylists;
    }
    // combinar: primero las del usuario que coincidan, luego las públicas encontradas
    const myFiltered = this.myPlaylists.filter(p => p.name.toLowerCase().includes(query));
    // evitar duplicados (por si una playlist pública ya está en myPlaylists)
    // filtrar elementos nulos/sin id antes de comparar para evitar "Cannot read properties of null"
    const publicFiltered = this.searchedPlaylists
      .filter(sp => sp && sp.id) // validar que sp existe y tiene id
      .filter(sp => !this.myPlaylists.some(mp => mp && mp.id === sp.id));
    return [...myFiltered, ...publicFiltered];
  }

  // llamar cuando el usuario escribe en la barra de búsqueda
  onSearchChange(query: string) {
    this.playlistSearchQuery = query;
    this.searchSubject.next(query);
  }

  // Formatear el precio para mostrarlo al usuario
  getFormattedSongPrice(): string {
    return (this.songPrice / 100).toFixed(2);
  }

  confirmSelection() {
    // validar que haya seleccionado al menos un dispositivo
    if (!this.selectedDeviceId) {
      alert('Por favor selecciona un dispositivo de reproducción');
      return;
    }
    // validar precio
    if (this.songPrice < this.minPrice || this.songPrice > this.maxPrice) {
      alert(`El precio por canción debe estar entre ${this.minPrice / 100}€ y ${this.maxPrice / 100}€`);
      return;
    }
    // opcional: validar playlist (permitir continuar sin playlist)
    if (!this.selectedPlaylistId) {
      const proceed = confirm('No has seleccionado una playlist por defecto. Se reanudará la reproducción actual. ¿Continuar?');
      if (!proceed) return;
    }

    // guardar selección en sessionStorage
    sessionStorage.setItem('defaultDeviceId', this.selectedDeviceId);
    if (this.selectedPlaylistId) {
      sessionStorage.setItem('defaultPlaylistId', this.selectedPlaylistId);
    }
    // guardar precio por canción en sessionStorage
    sessionStorage.setItem('songPrice', String(this.songPrice));

    // construir playlistUri si se seleccionó una playlist (formato: spotify:playlist:ID)
    const playlistUri = this.selectedPlaylistId ? `spotify:playlist:${this.selectedPlaylistId}` : undefined;

    // iniciar reproducción en el dispositivo seleccionado
    this.spotiService.startPlayback(this.selectedDeviceId, playlistUri).subscribe({
      next: () => {
        console.info('Reproducción iniciada correctamente');
        // redirigir a /music tras iniciar reproducción
        this.router.navigate(['/music']);
      },
      error: (err) => {
        console.warn('No se pudo iniciar la reproducción:', err);
        // informar al usuario pero permitir continuar (puede que la reproducción ya estuviera activa)
        const msg = err?.error?.error?.message || err?.message || 'Error al iniciar reproducción';
        alert(`Aviso: ${msg}\nPuedes continuar pero verifica que el dispositivo esté disponible.`);
        // redirigir de todas formas
        this.router.navigate(['/music']);
      }
    });
  }
}
