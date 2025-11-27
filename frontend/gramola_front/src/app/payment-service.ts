import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private client: HttpClient) { }

  prepay(amount?: number): Observable<any> {
    return this.client.get(`${environment.url_api}/payments/prepay/${amount ? amount : ''}`, {
      withCredentials: true, // para enviar cookies
      observe: 'response', // queremos observar la respuesta completa
      responseType: 'text' // el cuerpo de la respuesta es texto
    });
  }

  confirm(response: any, transactionId: string, token: string): Observable<any> {
    response.transactionId = transactionId;
    //console.log('Confirming payment with token:', token, 'and response:', response);
    response.token = token;
    return this.client.post(`${environment.url_api}/payments/confirm`, response, {
      withCredentials: true, observe: 'response', responseType: 'text' 
    });
  }

  getPublicKey(): Observable<any> {
    return this.client.get(`${environment.url_api}/payments/getPublicKey`, {
      withCredentials: true,
      observe: 'response',
      responseType: 'text'
    });
  }
}
