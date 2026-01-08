import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CustomDialog } from './custom-dialog/custom-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, CustomDialog],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'gramola_front';
}
