# Gramola de esipotify - Permite a tus clientes elegir la música de tu bar

<div align="center">
  <img width="1050" height="709" alt="Gramola Platform" src="https://github.com/user-attachments/assets/f4280c32-469d-46cc-81fd-a1e14348738c" />
  
  ![Status](https://img.shields.io/badge/status-en%20desarrollo-yellow)
  ![Java](https://img.shields.io/badge/Java-17+-orange)
  ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green)
  ![Angular](https://img.shields.io/badge/Angular-Latest-red)
  ![License](https://img.shields.io/badge/license-MIT-blue)
</div>

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Licencia](#licencia)

---

## Descripción

**Gramola de esipotify** es una aplicación web de gestión de la reproducción musical para bares, desarrollada como proyecto para la asignatura de **Tecnologías y Sistemas Web**. La aplicación permite a los usuarios, que son los dueños de bares, tener una reproducción musical continua en su establecimiento, permitiendo a los clientes del bar añadir canciones a la cola de reproducción a cambio de un pequeño pago o de forma gratuita.

---

## Características

### Funcionalidades Principales

- **Autenticación y Autorización**: Sistema completo de registro, confirmación de cuenta, login, recuperación de contraseña, y modificación de información de usuario.
- **Integración con Spotify**: Conexión con la API de Spotify para acceso al catálogo musical
- **Reproducción de Música**: Permite buscar canciones y añadirlas a la cola de reproducción, pagando por canción si el dueño del bar lo desea
- **Reproducción de Playlists**: Permite la reproducción de playlists propias y públicas
- **Sistema de Pagos**: Procesamiento de pagos integrado con Stripe
- **Geolocalización**: Funcionalidades basadas en ubicación
- **Gestión de Dispositivos**: Control de dispositivos de reproducción
- **Notificaciones por Email**: Sistema de correos de confirmación y recuperación

### Características Técnicas

- Arquitectura REST API
- Autenticación JWT
- Interceptores HTTP
- Responsive Design

---

## Tecnologías

### Backend

| Tecnología                                                                                                   | Descripción                        |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| ![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=flat&logo=openjdk&logoColor=white)                | Lenguaje de programación principal |
| ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat&logo=spring&logoColor=white) | Framework para el backend          |
| ![Maven](https://img.shields.io/badge/Maven-C71A36?style=flat&logo=apache-maven&logoColor=white)             | Gestor de dependencias             |

### Frontend

| Tecnología                                                                                               | Descripción              |
| -------------------------------------------------------------------------------------------------------- | ------------------------ |
| ![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)          | Framework frontend       |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) | Lenguaje de programación |
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)                | Maquetación              |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)                   | Estilos                  |

### Integraciones

- **Spotify API**: Para catálogo y reproducción de música
- **Sistema de Emails**: Para notificaciones y recuperación de contraseña

---

## Estructura del Proyecto

```
gramola_juanmaria/
│
├── backend/                      # Aplicación Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/edu/esi/     # Código fuente Java
│   │   │   └── resources/        # Recursos (config, templates)
│   │   └── test/                 # Tests unitarios
│   └── pom.xml                   # Dependencias Maven
│
├── frontend/gramola_front/       # Aplicación Angular
│   ├── src/
│   │   ├── app/                  # Componentes y servicios
│   │   │   ├── account/          # Gestión de cuenta
│   │   │   ├── login/            # Autenticación
│   │   │   ├── music/            # Reproducción de música
│   │   │   ├── payments/         # Sistema de pagos
│   │   │   └── ...
│   │   └── environments/         # Configuración de entornos
│   ├── angular.json
│   └── package.json              # Dependencias npm
│
└── README.md                     # Este archivo
```

---

## Requisitos Previos

Asegúrate de tener instalado:

- **Java JDK 17** o superior
- **Maven 3.6** o superior
- **Node.js 18** o superior
- **npm**
- **Git**

---

## Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/juanmariabravo/gramola-spotify-2025
cd gramola-spotify-2025
```

### 2. Configurar el Backend

```bash
cd backend
mvn clean install
```

### 3. Configurar el Frontend

```bash
cd frontend/gramola_front
npm install
```

---

## Configuración

### Backend Configuration

#### `application.properties`
Edita el archivo `backend/src/main/resources/application.properties` y configura la conexión a tu base de datos MySQL, las credenciales de seguridad y el servidor de correo electrónico. 
> Es importante que crees previamente la base de datos `gramola` en tu servidor MySQL.
> Por favor, lee los comentarios en el archivo `application.properties` para saber qué valores debes cambiar antes de ejecutar la aplicación.

```properties
# Configuración del servidor
server.port=8080

# ========================================
# CONFIGURACIÓN DE BASE DE DATOS
# ========================================
# URL de conexión a MySQL. Debes crear previamente la base de datos 'gramola' en tu servidor MySQL.
spring.datasource.url=jdbc:mysql://localhost:3306/gramola?serverTimezone=UTC&autoReconnect=true&useSSL=false&allowPublicKeyRetrieval=true&maxAllowedPacket=134217728
# Usuario de la base de datos
spring.datasource.username=tysweb2025
# Contraseña del usuario
spring.datasource.password=tysweb2025
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update

# ========================================
# CONFIGURACIÓN DE SEGURIDAD
# ========================================
spring.security.user.name=admin
spring.security.user.password=Administrador1234

# ========================================
# CONFIGURACIÓN GENERAL
# ========================================
spring.application.name=gramola
server.error.include-message=always

# ========================================
# CONFIGURACIÓN DE CORREO ELECTRÓNICO
# ========================================
# Esta configuración permite enviar correos de confirmación y recuperación de contraseña.
# Ejemplo usando Gmail (puedes usar otro proveedor SMTP cambiando host y puerto)

# Para usar Gmail, necesitas generar una "Contraseña de Aplicación":
# 1. Ve a tu cuenta de Google: https://myaccount.google.com/security
# 2. Asegúrate de que la Verificación en dos pasos esté ACTIVADA
# 3. Busca "Contraseñas de aplicaciones" (usa el buscador si no la ves)
# 4. Crea una nueva contraseña de aplicación (nómbrala "Gramola")
# 5. Google te dará una contraseña de 16 caracteres
# 6. Esa contraseña es la que debes poner en spring.mail.password (NO tu contraseña normal)

spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=tuCorreo@gmail.com
spring.mail.password=tu_contraseña_de_aplicacion_16_caracteres
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# NOTA: Con esta configuración, TODOS los correos saldrán desde tu cuenta (spring.mail.username).
# Los usuarios pueden registrarse con CUALQUIER correo (Gmail, Hotmail, Yahoo, Outlook, etc.).
```

#### `config.json`

Configura las credenciales y precios de Stripe y las urls de Spotify en `backend/src/main/resources/config.json`:

```json
{
    "stripe" : {
        "secret_key": "sk_test_123abcdef...",
        "public_key": "pk_test_123abcdef...",
        "suscription_price": "1000"
    },
    "urls": {
        "token_spotify": "https://accounts.spotify.com/api/token",
        "redirect_uri": "http://127.0.0.1:4200/callback",
        "backend_base": "http://127.0.0.1:8080",
        "frontend_base": "http://127.0.0.1:4200"
    }
}
```
- El precio por usar el servicio (`suscription_price`) está en céntimos (1000 = 10.00 euros).

### Frontend Configuration

Edita `frontend/gramola_front/src/environments/environment.ts`:

```typescript
export const environment = {
    url_api: 'http://127.0.0.1:8080',
    spotiV1Url: 'https://api.spotify.com/v1',
    spoti_authUrl: 'https://accounts.spotify.com/authorize',
    redirectUri: 'http://127.0.0.1:4200/callback',
    production: false
};
```

---

## Ejecución

### Iniciar el Backend

```bash
cd backend
mvn spring-boot:run
```

El servidor estará disponible en `http://127.0.0.1:8080`

### Iniciar el Frontend

```bash
cd frontend/gramola_front
ng serve
```

La aplicación estará disponible en `http://127.0.0.1:4200`

---

## API Documentation

### Endpoints Principales

#### Autenticación

- `POST /users/register` - Registro de usuario
- `POST /users/login` - Inicio de sesión
- `POST /users/logout` - Cierre de sesión
- `DELETE /users/delete` - Eliminación de cuenta
- `POST /users/recover-password` - Recuperación de contraseña
- `GET /users/validate-reset-token` - Validar token de recuperación
- `GET /users/me` - Obtener información del usuario autenticado
- `POST /users/reset-password` - Restablecer contraseña
- `GET /users/confirm/{email}` - Confirmar dirección de email
- `PUT /users/update-barname` - Actualizar nombre del bar
- `PUT /users/update-songprice` - Actualizar precio por canción
- `PUT /users/change-password` - Cambiar contraseña

#### Música y Spotify

- `GET /spoti/getClientId` - Obtener Client ID de Spotify
- `GET /spoti/getAuthorizationToken` - Obtener token de autorización de Spotify
- `POST /spoti/notifySongAdded` - Notificar canción añadida

#### Pagos

- `GET /payments/prepay/{amount}` - Iniciar proceso de pago
- `POST /payments/confirm` - Confirmar pago
- `GET /payments/getPublicKey` - Obtener clave pública para pagos

---

## Testing
> TODO: Añadir instrucciones para ejecutar tests con selenium



---

## Contribución

Este es un proyecto académico para la asignatura de Tecnologías y Sistemas Web.

---

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## Contacto

**Proyecto desarrollado por**: Juan María Bravo López

**Universidad**: Universidad de Castilla-La Mancha (UCLM)

**Asignatura**: Tecnologías y Sistemas Web

---

<div align="center">
  <sub>Proyecto en desarrollo - 2025</sub>
</div>
