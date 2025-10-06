import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Register } from './register/register';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Register],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'gramola_front';
}
