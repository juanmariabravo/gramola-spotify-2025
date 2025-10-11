import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-callback',
  imports: [],
  templateUrl: './callback.html',
  styleUrl: './callback.css'
})
export class Callback {
  constructor(private route: ActivatedRoute, private router: Router) {};

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    const code = qp.get('code');
    const state = qp.get('state');
    const error = qp.get('error');

    if (error) {
      this.router.navigateByUrl('/');
      return;
    }
    if (!code || !state) {
      alert('Missing code or state in callback');
      this.router.navigateByUrl('/');
      return;
    }

    console.log('Authorization code:', code);
    console.log('State:', state);
  }
}
