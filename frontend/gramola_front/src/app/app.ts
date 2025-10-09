import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Register } from './register/register';
import { Login } from './login/login';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Register, Login],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'gramola_front';
}
