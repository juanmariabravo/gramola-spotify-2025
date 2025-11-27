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
import jakarta.servlet.http.HttpSession;


@RestController
@RequestMapping("payments")
public class PaymentsController {

    @Autowired
    private PaymentService service;

    @GetMapping("/prepay/{amount}")
    public StripeTransaction prepay(HttpSession session, @PathVariable("amount") Long amount) {
        try {
            StripeTransaction transactionDetails = this.service.prepay(amount);
            session.setAttribute("transactionDetails", transactionDetails);
            return transactionDetails;
        } catch (StripeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping("/confirm")
    public void confirm(HttpSession session, @RequestBody Map<String, Object> finalData) {
        // System.out.println("Confirmando pago..." + finalData);
        StripeTransaction transactionDetails = (StripeTransaction) session.getAttribute("transactionDetails");
        JSONObject jso = new JSONObject(transactionDetails.getData());

        String sentTransactionId = transactionDetails.getId();
        String sentClientSecret = jso.getString("client_secret");

        JSONObject finalDataJson = new JSONObject(finalData);
        String userToken = finalDataJson.getString("token");
        String receivedTransactionId = finalDataJson.getString("transactionId");
        String receivedClientSecret = finalDataJson.getJSONObject("paymentIntent").getString("client_secret");

        if (sentTransactionId.equals(receivedTransactionId) && sentClientSecret.equals(receivedClientSecret)) {
            this.service.confirmTransaction(transactionDetails, userToken);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Los detalles de la transacción no coinciden");
        }

        session.removeAttribute("transactionDetails");
    }

    @GetMapping("/getPublicKey")
    public String getPublicKey() {
        return ConfigurationLoader.get().getJsonConfig().getJSONObject("stripe").getString("public_key");
    }
}
