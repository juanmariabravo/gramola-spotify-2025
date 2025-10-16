package edu.esi.uclm.gramola_juanmaria.services;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

import edu.esi.uclm.gramola_juanmaria.dao.StripeTransactionDao;
import edu.esi.uclm.gramola_juanmaria.dao.UserDao;
import edu.esi.uclm.gramola_juanmaria.model.StripeTransaction;


@Service
public class PaymentService {

    static {
        /* clave privada de stripe, debemos ponerla en una variable de entorno */
        Stripe.apiKey = "sk_test_51SIV2MCIboBkcLKy7XvN2wIgVdfcP3UVlAKLm43jsQA82UBsGBJ4t7G3P37I23fFcNg4vhZdMnKloS1yAr69UsLG00r6nw2DST";
        //Stripe.apiKey = System.getenv("STRIPE_API_KEY");
    }

    @Autowired
    private StripeTransactionDao dao;

    @Autowired
    private UserDao userDao;

    public StripeTransaction prepay() throws StripeException {
        PaymentIntentCreateParams createParams = new PaymentIntentCreateParams.Builder()
                    .setCurrency("eur")
                    .setAmount(1000L)
                    .build();
        PaymentIntent intent = PaymentIntent.create(createParams);
        JSONObject transactionDetails = new JSONObject(intent.toJson());
        StripeTransaction st = new StripeTransaction();
        st.setData(transactionDetails);
        this.dao.save(st);
        return st;
    }

    public void confirmTransaction(StripeTransaction transactionDetails, String userToken) {
        // verificar que el token es correcto
        if (this.userDao.findByCreationTokenId(userToken) == null) {
            throw new IllegalArgumentException("Token de usuario no válido");
        }
        // marcar la transacción como completada
        JSONObject jso = new JSONObject(transactionDetails.getData());
        jso.put("status", "completed");
        transactionDetails.setData(jso);
        this.dao.save(transactionDetails);
    }
}

    

