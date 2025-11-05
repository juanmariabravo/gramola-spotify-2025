package edu.esi.uclm.gramola_juanmaria.services;

import java.util.Optional;

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
import edu.esi.uclm.gramola_juanmaria.model.User;


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

    @Autowired
    private UserService userService;

    public StripeTransaction prepay(Long amount) throws StripeException {
        PaymentIntentCreateParams createParams = new PaymentIntentCreateParams.Builder()
                    .setCurrency("eur")
                    .setAmount(amount)
                    .build();
        PaymentIntent intent = PaymentIntent.create(createParams);
        JSONObject transactionDetails = new JSONObject(intent.toJson()); // esta línea no convierte correctamente a JSON
        StripeTransaction st = new StripeTransaction();
        st.setData(transactionDetails);
        this.dao.save(st);
        return st;
    }

    public void confirmTransaction(StripeTransaction transactionDetails, String userToken) {
        // Marcar la transacción como completada
        JSONObject jso = new JSONObject(transactionDetails.getData());
        jso.put("status", "completed");
        transactionDetails.setData(jso);
        
        // Si se proporciona un token de usuario (pago de registro), confirmar el usuario
        if (userToken != null && !userToken.isEmpty()) {
            Optional<User> optUser = this.userDao.findByCreationTokenId(userToken);
            if (optUser.isEmpty()) {
                throw new IllegalArgumentException("Token de usuario no válido");
            }
            
            User user = optUser.get();
            transactionDetails.setEmail(user.getEmail()); // Asociar la transacción con el usuario
            
            // Confirmar el token del usuario (marcarlo como usado y confirmar cuenta)
            this.userService.confirmToken(user.getEmail(), userToken);
            System.out.println("Pago confirmado y usuario " + user.getEmail() + " activado correctamente");
        } else {
            // Pago de canción u otro tipo - solo marcar la transacción como completada
            System.out.println("Pago de canción confirmado - transacción ID: " + transactionDetails.getId());
        }
        
        this.dao.save(transactionDetails);
    }
}

    

