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

    private static final String SPOTIFY_TOKEN = "BQABuqCoOIRp6w6iqGMaAu1_kMa5CxWBAV2q9IPXtVYhkltKtBFM5wgQpPyJZ-VSfUyXYERbkUdDyA9V9J-pGk8QgLkNhGLC2e02kyQeyOxOSl0coCFLBP3HLVjysE1CBG5QlpJPBLhxzkSx4VzgvHHHUfQn4wMmZttuaVi6nPYuteQHGrvvNZYfMFJ6dkVsbjYPXXjwz3ZjNgbMSoJ39TWcG8S5kbRXu88RAw_LRnJp9qffCBqRnTBe3a09HCM42JtBL4e8gjkS3xoOi1sOewSd-HcvFWB8khy8ydswrlvryMveMV4Z";
    private static final String URL_BASE = "http://127.0.0.1:4200/";
    private static final String CORREO = "juanmariabravo12@gmail.com";
    private static final String CONTRASENA = "mellamo12";
    private static final String CANCION = "Afterglow"; // * Importante escribir el nombre exacto de la canción tal cual aparece en Spotify
    private static final String NUM_TARJETA = "4242 4242 4242 4242";
    private static final String CADUCIDAD_TARJETA = "0330";
    private static final String CVC_TARJETA = "123";

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

    @Test
    public void testBuscarYPagarCancion() {
        // Contar transacciones y canciones añadidas antes del test
        long transaccionesAntes = stripeTransactionDao.count();
        long cancionesAntes = addedSongDao.count();

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

        // Clic en "Aceptar" del alert de playlist no seleccionada (se pondrá una por
        // defecto)
        driver.switchTo().alert().accept();

        // Wait hasta que cargue la página de /music
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.urlContains("/music"));

        // Hacemos scroll hacia arriba para ver la barra de búsqueda
        js.executeScript("window.scrollTo(0, 0);");

        // Clic en barra de búsqueda
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

        // Aceptar alert() "¿Desea añadir la canción a la cola y proceder al pago?"
        driver.switchTo().alert().accept();

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
                NUM_TARJETA);

        // Escribir fecha de caducidad
        WebElement expDateInput = driver.findElement(By.name("exp-date"));

        expDateInput.sendKeys(
                CADUCIDAD_TARJETA);

        // Escribir CVC
        WebElement cvcInput = driver.findElement(By.name("cvc"));

        cvcInput.sendKeys(
                CVC_TARJETA);

        // Salir del iframe de Stripe
        driver.switchTo()
                .defaultContent();

        // Clic en "Completar pago..."
        driver.findElement(By.id("submit")).click();

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

        assertNotNull(ultimaTransaccion, "La última transacción no debería ser null");

       Map<String, Object> transactionData = ultimaTransaccion.getData();
        assertTrue("completed".equals(transactionData.get("status")),
                "La última transacción debería tener el estado 'completed'");
        // Verificar que la canción se ha añadido al backend
        long cancionesDespues = addedSongDao.count();
        assertTrue(cancionesDespues - cancionesAntes == 1,
                "Debería haber al menos una nueva canción añadida en la base de datos");

        // Verificar que la canción añadida pertenece al usuario correcto
        User usuario = userDao.findById(CORREO).orElse(null);
        assertNotNull(usuario, "El usuario debería existir en la base de datos");

        List<AddedSong> cancionesAñadidas = addedSongDao.findAll();
        AddedSong ultimaCancionAñadida = cancionesAñadidas.get(cancionesAñadidas.size() - 1);

        assertNotNull(ultimaCancionAñadida, "La última canción añadida no debería ser null");
        assertTrue(ultimaCancionAñadida.getUser().getEmail().equalsIgnoreCase(CORREO),
                "La canción añadida debería pertenecer al usuario que realizó la compra");
    }

    @AfterEach
    public void tearDown() {
        if (this.driver != null) {
            this.driver.quit();
        }
    }
}
