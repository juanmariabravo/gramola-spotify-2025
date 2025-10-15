import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private client: HttpClient) { }

  prepay(): Observable<any> {
    console.log("prepay service");
    // la siguiente URL no debería estar "hardcodeada", debería venir de una variable de entorno
//  return this.client.post(`${environment.apiUrl}/payments/prepay`, {}, { 
    return this.client.post('http://localhost:8080/payments/prepay', {}, {
      withCredentials: true, // para enviar cookies
      observe: 'response', // queremos observar la respuesta completa
      responseType: 'text' // el cuerpo de la respuesta es texto
    });
  }

  confirm(response: any, transactionId: string, token: string): Observable<any> {
    response.transactionId = transactionId;
    response.token = token;
    return this.client.post('http://localhost:8080/payments/confirm', response, { 
      withCredentials: true, observe: 'response', responseType: 'text' 
    });
  }
}
