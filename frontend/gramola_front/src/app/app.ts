import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Payments } from "./payments/payments";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, Payments],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'gramola_front';
}
