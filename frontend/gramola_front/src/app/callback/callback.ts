import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotiService } from '../spoti-service';

@Component({
  selector: 'app-callback',
  imports: [],
  templateUrl: './callback.html',
  styleUrl: './callback.css'
})
export class Callback {
  constructor(private route: ActivatedRoute, private router: Router, private spotiService: SpotiService) {}

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

    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      alert('State mismatch.');
      this.router.navigateByUrl('/');
      return;
    }

    history.replaceState({}, '', '/callback');

    const clientId = sessionStorage.getItem('clientId');
    console.log("clientId:", clientId);
    if (!clientId) {
      alert('Missing clientId in session storage');
      this.router.navigateByUrl('/');
      return;
    }

    // Ask the backend for the Authorization Token
    this.spotiService.getAuthorizationToken(code, clientId).subscribe({
      next: (data) => {
        console.log('Authorization token received:', data);
        this.spotiService.spotiToken = data.access_token;
        this.router.navigateByUrl('/music');
      },
      error: (error) => {
        console.error('Error fetching authorization token:', error);
      }
    });
  }
}
