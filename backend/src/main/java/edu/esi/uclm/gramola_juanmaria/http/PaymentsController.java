package edu.esi.uclm.gramola_juanmaria.http;

import java.util.Map;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.stripe.exception.StripeException;

import edu.esi.uclm.gramola_juanmaria.model.StripeTransaction;
import edu.esi.uclm.gramola_juanmaria.services.PaymentService;



@RestController
@RequestMapping("payments")
public class PaymentsController {

    @Autowired
    private PaymentService service;

    @GetMapping("/prepay/{amount}")
    public StripeTransaction prepay(@PathVariable("amount") Long amount) {

        if (amount < 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La cantidad mínima para un pago de Stripe es de 50 céntimos (0.50 EUR). Recibido: " + amount);
        }

        try {
            StripeTransaction transactionDetails = this.service.prepay(amount);
            return transactionDetails;
        } catch (StripeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Error al iniciar el pago: " + e.getMessage());
        }
    }

    @PostMapping("/confirm")
    public void confirm(@RequestBody Map<String, Object> finalData) {
        JSONObject finalDataJson = new JSONObject(finalData);
        String receivedTransactionId = finalDataJson.getString("transactionId");

        // Recuperar la transacción de la base de datos en lugar de la sesión
        StripeTransaction transactionDetails = this.service.getTransactionById(receivedTransactionId);

        if (transactionDetails == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Transacción no encontrada");
        }

        JSONObject jso = new JSONObject(transactionDetails.getData());
        String sentClientSecret = jso.getString("client_secret");
        String receivedClientSecret = finalDataJson.getJSONObject("paymentIntent").getString("client_secret");
        String userToken = finalDataJson.optString("token", null); // Usar optString para evitar error si no existe

        if (sentClientSecret.equals(receivedClientSecret)) {
            this.service.confirmTransaction(transactionDetails, userToken);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Los detalles de la transacción no coinciden");
        }
    }

    @GetMapping("/getPublicKey")
    public String getPublicKey() {
        return ConfigurationLoader.get().getJsonConfig().getJSONObject("stripe").getString("public_key");
    }
}
