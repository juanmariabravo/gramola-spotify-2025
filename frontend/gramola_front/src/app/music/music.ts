import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Song {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumCover: string;
  duration: string;
  adding?: boolean;
}

@Component({
  selector: 'app-music',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './music.html',
  styleUrls: ['./music.css']
})
export class Music implements OnInit {
  barName: string = 'Bar La Esquina';
  searchQuery: string = '';
  price: number = 1.50;
  currentSong: Song | null = null;
  
  searchResults: Song[] = [];
  queue: Song[] = [];

  ngOnInit() {
    // Simular datos iniciales
    this.loadInitialData();
  }

  loadInitialData() {
    // Simular canción actual reproduciéndose
    this.currentSong = {
      id: '1',
      name: 'Una noche sin ti',
      artist: 'Los Rumberos',
      album: 'Noches de Verano',
      albumCover: 'https://via.placeholder.com/60',
      duration: '3:45'
    };

    // Simular cola inicial
    this.queue = [
      {
        id: '2',
        name: 'Mucho mejor',
        artist: 'La Banda',
        album: 'Éxitos',
        albumCover: 'https://via.placeholder.com/60',
        duration: '4:20'
      }
    ];
  }

  searchSongs() {
    if (!this.searchQuery.trim()) return;

    // Simular búsqueda en API de Spotify
    console.log('Buscando:', this.searchQuery);
    
    // Datos de ejemplo para demostración
    this.searchResults = [
      {
        id: '3',
        name: 'Whole lotta love',
        artist: 'Led Zeppelin',
        album: 'Led Zeppelin II',
        albumCover: 'https://via.placeholder.com/60/FF6B6B/FFFFFF',
        duration: '5:34'
      },
      {
        id: '4',
        name: 'Creep',
        artist: 'Radiohead',
        album: 'Pablo Honey',
        albumCover: 'https://via.placeholder.com/60/4ECDC4/FFFFFF',
        duration: '3:58'
      },
      {
        id: '5',
        name: this.searchQuery,
        artist: 'Artista Ejemplo',
        album: 'Álbum Demo',
        albumCover: 'https://via.placeholder.com/60/45B7D1/FFFFFF',
        duration: '4:12'
      }
    ];
  }

  addToQueue(song: Song) {
    // Simular proceso de pago y añadir a cola
    song.adding = true;
    
    setTimeout(() => {
      this.queue.push({...song});
      song.adding = false;
      
      // En una implementación real, aquí se procesaría el pago
      console.log(`Canción "${song.name}" añadida a la cola. Pago de ${this.price}€ procesado.`);
      
      // Limpiar resultados de búsqueda después de añadir
      this.searchResults = [];
      this.searchQuery = '';
    }, 1500);
  }
}