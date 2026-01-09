# Tests de la aplicación Gramola de esipotify
### Test 1: Buscar y añadir una canción a la cola de reproducción
- #### Escenario:
    Un cliente intenta pagar una canción con una tarjeta rechazada. Se debe mostrar el mensaje de error adecuado en el frontend y no debe registrarse ninguna transacción en el backend.
- #### Precondiciones:
  * El usuario debe tener una cuenta en la aplicación Gramola con correo {CORREO} y contraseña {CONTRASENA}
  * El usuario debe haber obtenido el {SPOTIFY_TOKEN} en otro navegador antes de ejecutar el test, y debe poner este token en el código del test para que se almacene en sessionStorage.
- #### Pasos que realiza el test:
1. Abrir la aplicación Gramola en http://127.0.0.1:4200
2. Clic en "Iniciar sesión" (<a _ngcontent-ng-c2585738336="" onclick="location.href='/login'" class="btn secondary">Iniciar sesión</a>)
3. Escribir correo {CORREO} (<input _ngcontent-ng-c2578765774="" type="email" id="email" formcontrolname="email" required="" class="form-control ng-pristine ng-invalid ng-touched">)
4. Clic en campo contraseña (<input _ngcontent-ng-c2578765774="" type="password" id="password" formcontrolname="password" required="" class="form-control ng-pristine ng-invalid ng-touched">)
5. Escribir contraseña {CONTRASENA}
6. Clic iniciar sesión (<button _ngcontent-ng-c2578765774="" type="submit" class="btn btn-primary"> Iniciar sesión </button>)
7. Seleccionar en el slide de precios el valor 050 (<input _ngcontent-ng-c2346573742="" type="range" id="songPrice" step="10" aria-label="Precio por canción en céntimos" class="price-slider ng-valid ng-dirty ng-touched" min="0" max="500">)
8. Clic en el primer dispositivo que aparece, por ejemplo <h6 >Web Player (Chrome)</h6></div>
9. Clic en "Continuar" (<button _ngcontent-ng-c2346573742="" class="confirm-btn"> Continuar a la Gramola </button>)
10. Clic en "Aceptar" del `dialogservice.confirm()` para continuar sin seleccionar una playlist por defecto
<img src="AlertaContinuarSinPlaylist.png" alt="AlertPagoCancion" style="max-width: 300px; width: 100%;"/>
1.  Clic en barra de búsqueda (<input _ngcontent-ng-c3026623009="" type="text" placeholder="Buscar canciones, artistas, álbumes..." class="search-input ng-pristine ng-valid ng-touched">)
2.  Escribir en barra de búsqueda una canción con el nombre completo y exacto de Spotify (p.ej."Africa")
3.  Clic en buscar (<button _ngcontent-ng-c3026623009="" class="search-btn">Buscar</button>)
4.  Tomar el primer elemento de los resultados: <div _ngcontent-ng-c3026623009="" class="tracks-list"><div _ngcontent-ng-c3026623009="" class="track-card"><div _ngcontent-ng-c3026623009="" class="track-info"><img _ngcontent-ng-c3026623009="" class="track-album-cover" src="https://i.scdn.co/image/ab67616d00004851ebd6d20c0082524244ef83df" alt="Toto IV"><div _ngcontent-ng-c3026623009="" class="track-details"><h4 _ngcontent-ng-c3026623009="" class="track-title">Africa</h4><p _ngcontent-ng-c3026623009="" class="track-artist">TOTO</p><p _ngcontent-ng-c3026623009="" class="track-album">Toto IV</p></div></div><button _ngcontent-ng-c3026623009="" class="add-to-queue-btn">Añadir a Cola</button></div></div>
15. Clic en "Añadir a la cola" (<button _ngcontent-ng-c3026623009="" class="add-to-queue-btn">Añadir a Cola</button>)

16. Intro o clic en Aceptar del `dialogservice.confirm()` 
<img src="AlertPagoCancion.png" alt="AlertPagoCancion" style="max-width: 300px; width: 100%;"/>

1.    Clic en campo de número de tarjeta (<input class="InputElement is-empty Input Input--empty" autocomplete="cc-number" autocorrect="off" spellcheck="false" type="text" name="cardnumber" data-elements-stable-field-name="cardNumber" aria-required="true" inputmode="numeric" aria-label="Número de la tarjeta de crédito o débito" placeholder="Número de tarjeta" aria-invalid="false" tabindex="0" value="">)
2.    Escribir 4242 4242 4242 4242 (automáticamente pasa a la fecha de caducidad)
3.    Escribir 03/30 y CVV 123
4.    Clic en "Completar pago..." (<button _ngcontent-ng-c766290412="" id="submit" type="submit" class="payment-submit-btn"><div _ngcontent-ng-c766290412="" id="spinner" class="spinner hidden"></div><span _ngcontent-ng-c766290412="" id="button-text">Completar pago de 0.50€</span></button>)
- #### Assertions:
- **1:** Comprobar desde el frontend que se ha añadido a la cola la canción "Africa". Puede estar en primera posición o no, porque pueden ahberse añadido otras antes. Por ello, se debe buscar en toda la cola. <div _ngcontent-ng-c3026623009="" class="queue-item next-up"><img _ngcontent-ng-c3026623009="" class="track-album-cover" src="https://i.scdn.co/image/ab67616d00004851ebd6d20c0082524244ef83df" alt="Toto IV"><div _ngcontent-ng-c3026623009="" class="queue-track-info"><h4 _ngcontent-ng-c3026623009="" class="track-title">Africa</h4><p _ngcontent-ng-c3026623009="" class="track-artist">TOTO</p></div><div _ngcontent-ng-c3026623009="" class="queue-status"></div></div>
- **2:** Comprobar desde el backend en la base de datos que se ha registrado la transacción de la compra de la canción, con estado `completed` y que esa transacción corresponde al usuario con el correo autenticado.
- **3:** Comprobar desde el backend en la base de datos que la última canción añadida a la cola de reproducción es del usuario con el correo autenticado.

### Test 2: Fallo en el pago por tarjeta inválida
- #### Escenario:
   Un cliente del bar busca una canción. Paga con una tarjeta inválida y se comprueba que el pago ha fallado y que se muestra el mensaje de error adecuado en el frontend.
- #### Precondiciones:
  * El usuario debe tener una cuenta en la aplicación Gramola con correo {CORREO} y contraseña {CONTRASENA}
   * El usuario debe haber obtenido el {SPOTIFY_TOKEN} en otro navegador antes de ejecutar el test, y debe poner este token en el código del test para que se almacene en sessionStorage.
- #### Pasos que realiza el test:
    Mismos pasos del Test 1, cambiando solo los valores de la tarjeta (pasos 18 y 19):
    Se utilizan los siguientes valores para cada resultado esperado:

    | Resultado esperado | Número de tarjeta   | Fecha de caducidad | CVC |
    | ------------------ | ------------------- | ------------------ | --- |
    | Tarjeta rechazada  | 4000 0000 0000 0002 | 03/30              | 123 |
    | Tarjeta inválida   | 1231 2312 3123 2131 | 03/30              | 123 |
    | Tarjeta incompleta | 4242 4242 4242      | 03/30              | 123 |
    | Caducidad pasada   | 4242 4242 4242 4242 | 01/20              | 123 |
    | Caducidad inválida | 4242 4242 4242 4242 | 12/99              | 123 |

- #### Assertions:
  En cada uno de los siguientes tests, se comprueba que el elemento `.card-error-message` contiene el mensaje esperado.

  **testPagoTarjetaRechazada:**
  - Verifica que aparece el mensaje de error: "Tu tarjeta ha sido rechazada."
  
  **testPagoTarjetaInvalida:**
  - Verifica que aparece el mensaje de error: "El número de tu tarjeta no es válido."
  
  **testPagoTarjetaIncompleta:**
  - Verifica que aparece el mensaje de error: "El número de tu tarjeta está incompleto."
  
  **testPagoCaducidadPasada:**
  - Verifica que aparece el mensaje de error: "El año de caducidad de tu tarjeta ya ha pasado."
  
  **testPagoCaducidadInvalida:**
  - Verifica que aparece el mensaje de error: "El año de caducidad de la tarjeta no es válido."
