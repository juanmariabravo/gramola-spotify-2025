package edu.esi.uclm.gramola_juanmaria;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.AfterEach;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import edu.esi.uclm.gramola_juanmaria.dao.AddedSongDao;
import edu.esi.uclm.gramola_juanmaria.dao.StripeTransactionDao;
import edu.esi.uclm.gramola_juanmaria.dao.UserDao;
import edu.esi.uclm.gramola_juanmaria.model.AddedSong;
import edu.esi.uclm.gramola_juanmaria.model.StripeTransaction;
import edu.esi.uclm.gramola_juanmaria.model.User;

@SpringBootTest
@TestInstance(Lifecycle.PER_CLASS)
class GramolaJuanmariaApplicationTests {

    private WebDriver driver;
    private JavascriptExecutor js;

    @Autowired
    private StripeTransactionDao stripeTransactionDao;

    @Autowired
    private AddedSongDao addedSongDao;

    @Autowired
    private UserDao userDao;

    private static final String SPOTIFY_TOKEN = "BQA5e-z6xDlBPeloKX5CE6NydbGc0qNfIyx1TP12sQlBbaLl5LOJqGO5mk7uazV9TDiHVqcjhrr-EtUy2sUUcJyoLy87SRmrmHOgsSnUnWhpZkz_nthSS8hLWsSeYtgwZXe4BPdf2fHKP2XgRqpfgdBovhZ7V2L8t89qNwW6Xkvtfzcl2XdlYMYiAvlN6ayz1jIa6pZac4STyJ3YauiV0XyWOuPP1QqecmMjvSu-x5ji4e_pOGvuxbbTspIQZ-UaStytGftTxwimP1BsJyF0Gtqjw3Xwo_E6IQkc1qUxSEO0I-OxfzxS";
    private static final String URL_BASE = "http://127.0.0.1:4200/";
    private static final String CORREO = "juanmariabravo12@gmail.com";
    private static final String CONTRASENA = "mellamo12";
    private static final String CANCION = "Clair de Lune"; // * Importante escribir el nombre exacto de la canción tal cual aparece en Spotify
    private static final String NUM_TARJETA = "4242 4242 4242 4242";
    private static final String CADUCIDAD_TARJETA = "0330";
    private static final String CVC_TARJETA = "123";
    private static final String NUM_TARJETA_RECHAZADA = "4000 0000 0000 0002"; // Tarjeta que siempre es rechazada por Stripe (Tu tarjeta ha sido rechazada.)
    private static final String NUM_TARJETA_INVALIDO = "1231 2312 3123 2131"; // Tarjeta inválida (El número de tu tarjeta no es válido.)
    private static final String NUM_TARJETA_INCOMPLETO = "4242 4242 4242"; // Número de tarjeta incompleto (El número de tu tarjeta está incompleto.)
    private static final String CADUCIDAD_TARJETA_PASADA = "0120"; // Fecha de caducidad pasada (El año de caducidad de tu tarjeta ya ha pasado.)
    private static final String CADUCIDAD_TARJETA_INVALIDA = "1299"; // Fecha de caducidad demasiado lejana, rechazada por Stripe (El año de caducidad de la tarjeta no es válido.)

    @BeforeEach
    public void setUp() {
        this.driver = new ChromeDriver();
        this.js = (JavascriptExecutor) driver;

        this.driver.get(URL_BASE);
        this.addSpotifyToken();
        this.driver.navigate().refresh();
        this.setFullScreen();
    }

    private void addSpotifyToken() {
        // Añadir el token de Spotify al sessionStorage
        ((JavascriptExecutor) driver).executeScript(
                String.format("window.sessionStorage.setItem('accessToken', '%s');", SPOTIFY_TOKEN));
    }

    private void setFullScreen() {
        // Configurar el navegador en pantalla completa
        this.driver.manage().window().maximize();
    }

    /*
     * Desde la página principal, navegar a /music, realizando todo el proceso de login y seleccionar dispositivo
     */
    private void fromHomeToMusic() {
        // Clic en "Iniciar sesión"
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.elementToBeClickable(
                        By.xpath("//a[contains(text(),'Iniciar sesión')]")))
                .click();

        // Escribir correo
        WebElement emailInput = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.visibilityOfElementLocated(By.id("email")));
        emailInput.sendKeys(
                CORREO);

        // Clic en campo contraseña y escribir contraseña
        WebElement passwordInput = driver.findElement(By.id("password"));

        passwordInput.click();

        passwordInput.sendKeys(
                CONTRASENA);

        // Clic iniciar sesión
        driver.findElement(By.xpath("//button[contains(text(),'Iniciar sesión')]")).click();

        // Por defecto, el slider de precio por canción está en 0.50€ así que no hay que
        // moverlo
        // Scroll down para ver los dispositivos
        js.executeScript("window.scrollTo(0, 600);");
        // Clic en el primer dispositivo que aparece
        WebElement firstDevice = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions
                        .elementToBeClickable(By.cssSelector(".devices-list .device-item")));

        firstDevice.click();

        // Clic en "Continuar"
        driver.findElement(By.cssSelector(".confirm-btn")).click();

        // Clic en "Aceptar" del diálogo personalizado para continuar sin seleccionar playlist
        WebElement aceptarDialogBtn = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.elementToBeClickable(
                        By.cssSelector(".dialog-btn.dialog-btn-confirm")));
        aceptarDialogBtn.click();

        // Wait hasta que cargue la página de /music
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.urlContains("/music"));

        // Hacemos scroll hacia arriba para ver la barra de búsqueda
        js.executeScript("window.scrollTo(0, 0);");
    }

    private void addSongToQueue() {
        // Esperar a que esté disponible la barra de búsqueda
        WebElement searchInput = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.elementToBeClickable(By.cssSelector(".search-input")));

        // Hacer click para asegurarnos de que está activa
        searchInput.click();

        // Escribir en barra de búsqueda la canción
        searchInput.sendKeys(
                CANCION);

        // Clic en buscar
        WebElement searchBtn = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.elementToBeClickable(By.cssSelector(".search-btn")));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", searchBtn);

        // Scroll down para ver los resultados
        js.executeScript("window.scrollTo(0, 300);");

        // Esperar a que aparezcan los resultados de búsqueda
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(".tracks-list")));

        // Tomar el primer elemento de los resultados y clic en "Añadir a Cola"
        WebElement firstTrackAddBtn = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.elementToBeClickable(
                        By.cssSelector(".tracks-list .track-card .add-to-queue-btn")));

        firstTrackAddBtn.click();

        // Esperar a que aparezca el botón "Aceptar" para confirmar la compra de la canción
        WebElement aceptarDialogBtn = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.elementToBeClickable(
                        By.cssSelector(".dialog-btn.dialog-btn-confirm")));
        aceptarDialogBtn.click();
    }

    private void payForSong(String numeroTarjeta, String caducidadTarjeta, String cvcTarjeta) {
        // Hacemos scroll down para ver el formulario de pago
        js.executeScript("window.scrollTo(0, screen.height);");

        // Esperar a que aparezca el formulario de pago (Stripe)
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.frameToBeAvailableAndSwitchToIt(
                        By.cssSelector("iframe[name^='__privateStripeFrame']")));

        // Escribir número de tarjeta
        WebElement cardNumberInput = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.elementToBeClickable(By.name("cardnumber")));

        cardNumberInput.sendKeys(
                numeroTarjeta);

        // Escribir fecha de caducidad
        WebElement expDateInput = driver.findElement(By.name("exp-date"));

        expDateInput.sendKeys(
                caducidadTarjeta);

        // Escribir CVC
        WebElement cvcInput = driver.findElement(By.name("cvc"));

        cvcInput.sendKeys(
                cvcTarjeta);

        // Salir del iframe de Stripe
        driver.switchTo()
                .defaultContent();

        // Clic en "Completar pago..."
        driver.findElement(By.id("submit")).click();
    }

    @Test
    public void testBuscarYPagarCancion() {
        // Contar transacciones y canciones añadidas antes del test
        long transaccionesAntes = stripeTransactionDao.count();
        long cancionesAntes = addedSongDao.count();

        fromHomeToMusic();
        addSongToQueue();
        payForSong(NUM_TARJETA, CADUCIDAD_TARJETA, CVC_TARJETA);

        // Esperamos a que cargue de nuevo la página de /music
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.urlContains("/music"));

        // Scroll down para ver la cola
        js.executeScript("window.scrollTo(0, 600);");

        // Comprobar que la canción está en la cola (puede estar en cualquier posición)
        java.util.List<WebElement> queueItems = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.visibilityOfAllElementsLocatedBy(
                        By.cssSelector(".queue-list .queue-item .queue-track-info .track-title")));

        // Iterar sobre los elementos para ver si alguno coincide con el nombre de la canción
        boolean found = false;
        for (int i = 0; i < queueItems.size(); i++) {
            String trackTitle = queueItems.get(i).getAttribute("textContent");
            if (trackTitle != null && trackTitle.equalsIgnoreCase(CANCION)) {
                found = true;
                break;
            }
        }

        // Verificar que se ha encontrado la canción en la cola
        assertTrue(found, "La canción no se encuentra en la cola");

        // Esperar un momento para que se complete la transacción en el backend
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Verificar que hay una nueva transacción
        long transaccionesDespues = stripeTransactionDao.count();
        assertTrue(transaccionesDespues > transaccionesAntes,
                "Debería haber al menos una nueva transacción en la base de datos");

        // Obtener todas las transacciones y verificar que al menos una tiene status "completed"
        List<StripeTransaction> todasTransacciones = stripeTransactionDao.findAll();
        // Obtener la última transacción añadida
        StripeTransaction ultimaTransaccion = todasTransacciones.get(todasTransacciones.size()
                - 1);

        // Verificar que la última transacción no es null
        assertNotNull(ultimaTransaccion, "La última transacción no debería ser null");

        // Verificar que el estado de la transacción es "completed"
        Map<String, Object> transactionData = ultimaTransaccion.getData();
        assertTrue("completed".equals(transactionData.get("status")),
                "La última transacción debería tener el estado 'completed'");
        // Verificar que la transacción pertenece al usuario correcto
        assertTrue(ultimaTransaccion.getEmail().equalsIgnoreCase(CORREO),
                "La transacción debería pertenecer al usuario que realizó la compra");

        // Verificar que la canción se ha añadido al backend
        long cancionesDespues = addedSongDao.count();
        assertTrue(cancionesDespues - cancionesAntes >= 1,
                "Debería haber al menos una nueva canción añadida en la base de datos");

        // Verificar que la canción añadida pertenece al usuario correcto
        User usuario = userDao.findById(CORREO).orElse(null);
        assertNotNull(usuario, "El usuario debería existir en la base de datos");

        List<AddedSong> cancionesAñadidas = addedSongDao.findAll();
        AddedSong ultimaCancionAñadida = cancionesAñadidas.get(cancionesAñadidas.size() - 1);

        // Verificar que la última canción añadida no es null y pertenece al usuario correcto
        assertNotNull(ultimaCancionAñadida, "La última canción añadida no debería ser null");
        assertTrue(ultimaCancionAñadida.getUser().getEmail().equalsIgnoreCase(CORREO),
                "La canción añadida debería pertenecer al usuario que realizó la compra");
    }

    @Test
    public void testPagoTarjetaRechazada() {
        fromHomeToMusic();
        addSongToQueue();
        payForSong(NUM_TARJETA_RECHAZADA, CADUCIDAD_TARJETA, CVC_TARJETA);

        // Esperar a que aparezca el mensaje de error en el frontend
        WebElement errorMessage = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.visibilityOfElementLocated(
                        By.cssSelector(".card-error-message")));

        // Verificar que el mensaje de error es el esperado
        String expectedMessage = "Tu tarjeta ha sido rechazada.";
        // Esperar unos segundos extra para que el mensaje de error aparezca completamente
        new WebDriverWait(driver, Duration.ofSeconds(5))
                .until(d -> !errorMessage.getText().isEmpty());
        String actualMessage = errorMessage.getText();
        assertTrue(actualMessage.contains(expectedMessage),
                "El mensaje de error debería indicar que la tarjeta ha sido rechazada");
    }

    @Test
    public void testPagoTarjetaInvalida() {
        fromHomeToMusic();
        addSongToQueue();
        payForSong(NUM_TARJETA_INVALIDO, CADUCIDAD_TARJETA, CVC_TARJETA);

        // Esperar a que aparezca el mensaje de error en el frontend
        WebElement errorMessage = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.visibilityOfElementLocated(
                        By.cssSelector(".card-error-message")));

        // Verificar que el mensaje de error es el esperado
        String expectedMessage = "El número de tu tarjeta no es válido.";
        // Esperar unos segundos extra para que el mensaje de error aparezca completamente
        new WebDriverWait(driver, Duration.ofSeconds(5))
                .until(d -> !errorMessage.getText().isEmpty());
        String actualMessage = errorMessage.getText();
        assertTrue(actualMessage.contains(expectedMessage),
                "El mensaje de error debería indicar que la tarjeta es inválida");
    }

    @Test
    public void testPagoTarjetaIncompleta() {
        fromHomeToMusic();
        addSongToQueue();
        payForSong(NUM_TARJETA_INCOMPLETO, CADUCIDAD_TARJETA, CVC_TARJETA);

        // Esperar a que aparezca el mensaje de error en el frontend
        WebElement errorMessage = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.visibilityOfElementLocated(
                        By.cssSelector(".card-error-message")));

        // Verificar que el mensaje de error es el esperado
        String expectedMessage = "El número de tu tarjeta está incompleto.";
        // Esperar unos segundos extra para que el mensaje de error aparezca completamente
        new WebDriverWait(driver, Duration.ofSeconds(5))
                .until(d -> !errorMessage.getText().isEmpty());
        String actualMessage = errorMessage.getText();
        assertTrue(actualMessage.contains(expectedMessage),
                "El mensaje de error debería indicar que el número de la tarjeta está incompleto");
    }

    @Test
    public void testPagoCaducidadPasada() {
        fromHomeToMusic();
        addSongToQueue();
        payForSong(NUM_TARJETA, CADUCIDAD_TARJETA_PASADA, CVC_TARJETA);

        // Esperar a que aparezca el mensaje de error en el frontend
        WebElement errorMessage = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.visibilityOfElementLocated(
                        By.cssSelector(".card-error-message")));

        // Verificar que el mensaje de error es el esperado
        String expectedMessage = "El año de caducidad de tu tarjeta ya ha pasado.";
        // Esperar unos segundos extra para que el mensaje de error aparezca completamente
        new WebDriverWait(driver, Duration.ofSeconds(5))
                .until(d -> !errorMessage.getText().isEmpty());
        String actualMessage = errorMessage.getText();
        assertTrue(actualMessage.contains(expectedMessage),
                "El mensaje de error debería indicar que el año de caducidad de la tarjeta ya ha pasado");
    }

    @Test
    public void testPagoCaducidadInvalida() {
        fromHomeToMusic();
        addSongToQueue();
        payForSong(NUM_TARJETA, CADUCIDAD_TARJETA_INVALIDA, CVC_TARJETA);

        // Esperar a que aparezca el mensaje de error en el frontend
        WebElement errorMessage = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.visibilityOfElementLocated(
                        By.cssSelector(".card-error-message")));

        // Verificar que el mensaje de error es el esperado
        String expectedMessage = "El año de caducidad de la tarjeta no es válido.";
        // Esperar unos segundos extra para que el mensaje de error aparezca completamente
        new WebDriverWait(driver, Duration.ofSeconds(5))
                .until(d -> !errorMessage.getText().isEmpty());
        String actualMessage = errorMessage.getText();
        assertTrue(actualMessage.contains(expectedMessage),
                "El mensaje de error debería indicar que el año de caducidad de la tarjeta no es válido");
    }

    @AfterEach
    public void tearDown() {
        if (this.driver != null) {
            this.driver.quit();
        }
    }
}
