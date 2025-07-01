# Reto Técnico: Jornada de Almuerzo gratis

Este proyecto es la solución al reto técnico de la jornada de donación, que consiste en un sistema automatizado para gestionar la preparación de platos, el inventario de ingredientes y las compras externas, todo bajo una arquitectura de microservicios **robusta y escalable**.

**URL de la aplicación desplegada:** 
`https://jornada-de-almuerzo-front-end.vercel.app/` 
o 
`https://jornada-de-almuerzo.luisangelnj.com/` (Dominio propagandose)

## Descripción del Proyecto

El sistema automatiza el flujo de un restaurante durante una jornada de donación de comida gratis. El objetivo es **gestionar una alta concurrencia de pedidos de platos**, seleccionando recetas al azar, verificando el inventario de ingredientes, realizando compras en una plaza de mercado externa si es necesario, y finalmente preparando y completando las órdenes, todo de forma asíncrona y sin intervención manual.

![Diagrama de arquitectura](https://i.postimg.cc/KjnFd81n/Screenshot-1.png)
El dashboard proporciona una visualización centralizada y en tiempo real del estado completo del sistema. Permite al gerente monitorear las estadísticas clave de la jornada y seguir el progreso de cada orden individual a través de todo su ciclo de vida: desde PENDIENTE, pasando por COMPRANDO INGREDIENTES y PREPARANDO PLATILLOS, hasta su entrega final como COMPLETADA.

El sistema está diseñado para soportar el envío de múltiples órdenes masivas de forma simultánea. Estas solicitudes son encoladas y procesadas eficientemente por los workers del backend. Para fines del reto, la interfaz limita cada orden a un máximo de 999 platillos, sin embargo, la arquitectura subyacente está diseñada para escalar de forma segura. Los servicios de "workers" (kitchen, warehouse y marketplace) pueden incrementar sus instancias para aumentar la capacidad de procesamiento y soportar una carga de trabajo aún mayor si fuera necesario, garantizando la agilidad del proceso.


## Cómo Ejecutar en Desarrollo Local

Este proyecto está **100% desarrollado con contenedores Docker** para garantizar un entorno de desarrollo consistente y fácil de levantar. El **flujo de instalación y arranque** está **completamente automatizado** y con un solo comando, se iniciarán todos los microservicios, bases de datos, y el sistema de mensajería.

### Instrucciones de Arranque

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/luisangelnj/JordanaDeAlmuerzo
    ```

2.  **Navega a la raíz del proyecto:**
    ```bash
    cd JordanaDeAlmuerzo
    ```

3.  **Levanta todo el entorno:**
    ```bash
    docker-compose up --build
    ```

4.  **Permite que TODOS los servicios inicien y las migraciones hayan corrido por completo:**
    ¡Y listo! Este único comando se encargará de todo:
    * **Construirá** las imágenes de Docker para cada microservicio.
    * **Iniciará** todos los contenedores en el orden correcto.
    * Cada servicio de backend ejecutará **automáticamente** sus migraciones de base de datos antes de arrancar. (Permite unos momentos a que todas las migraciones hayan corrido correctamente)
    * Los servicios se iniciarán en modo de desarrollo con **"hot-reloading"**, por lo que cualquier cambio que hagas en el código se reflejará al instante.

### Acceder a los Servicios
Una vez que todos los contenedores estén corriendo, podrás acceder a:
* **Frontend de la Aplicación:** `http://localhost:5173`
* **Panel de Administración de RabbitMQ:** `http://localhost:15672` (Usuario: `admin`, Contraseña: `admin`)

### Escalado de Servicios (Opcional)
Si deseas probar el comportamiento del sistema bajo una carga de trabajo más alta, puedes escalar los servicios "trabajadores" (`kitchen`, `warehouse`, `marketplace`).

Para hacerlo, simplemente añade el flag `--scale` al comando de arranque:
```bash
# Este ejemplo levanta 2 instancias de kitchen y 2 de warehouse
docker-compose up --build --scale kitchen-service=2 --scale warehouse-service=2
```

## Arquitectura del Sistema

El sistema está diseñado siguiendo una **arquitectura de microservicios** desacoplados, donde toda la comunicación entre servicios se realiza de forma **asíncrona** a través de un bus de mensajería (RabbitMQ), cumpliendo con los requisitos excluyentes del reto.

![Diagrama de arquitectura](https://i.postimg.cc/Y9RPZbT1/Diagrama-sin-t-tulo-drawio.png)


### Microservicios:
* **Manager Service**: Actúa como **API Gateway** y orquestador principal. Recibe las peticiones del frontend, inicia los flujos de trabajo y centraliza el estado del sistema para el dashboard.
* **Kitchen Service**: Gestiona las recetas, selecciona los platos a preparar por orden y calcula los ingredientes necesarios.
* **Warehouse Service**: Mantiene el estado del inventario. Procesa las solicitudes de ingredientes, descuenta el stock y gestiona el ciclo de compras aumentando su stock por cada compra.
* **Marketplace Service**: Actúa como una **Capa Anticorrupción (ACL)**, aislando el sistema de la API externa de la plaza de mercado y manejando la lógica de compra y reintentos.
* **Frontend (Vercel)**: La interfaz de usuario intuitiva para que el gerente interactúe con el sistema.
* **3 Bases de Datos (PostgreSQL)**: Cada servicio principal tiene su propia base de datos PostgreSQL independiente para garantizar un desacoplamiento total.
    - Manager-DB
    - Kitchen-DB
    - Warehouse-DB
* **Mensajería (CloudAMQP)**: Un bus de RabbitMQ gestionado que maneja toda la comunicación asíncrona.


## Flujo Detallado de una Orden

El sistema está diseñado como una línea de ensamblaje asíncrona para garantizar la robustez y escalabilidad. A continuación, se describe el viaje completo de una orden, desde la solicitud hasta la finalización.

1.  **Inicio de la Orden:**
    * El **Gerente** utiliza la interfaz de usuario para solicitar una cantidad `N` de platos.
    * El **Frontend** (desplegado en Vercel) realiza una llamada API (`POST /api/orders`) al único punto de entrada del backend, el `manager-service`.

2.  **Creación y Delegación de la Orden:**
    * El **Manager Service** (en Render) recibe la petición.
    * Guarda un nuevo registro `OrderBatch` en su base de datos (`manager-db` en Render) con estado `PENDING`.
    * Publica un mensaje con `{ batchId, quantity }` en la cola `order_requests_queue` de RabbitMQ (CloudAMQP).

3.  **Selección y Planificación de la Cocina:**
    * Una instancia del **Kitchen Service** consume el mensaje de la cola.
    * Selecciona las `N` recetas al azar de su lista de recetas.
    * Guarda un registro por cada plato seleccionado en su base de datos (`kitchen-db`) con el estado inicial `PENDING_INGREDIENTS`.
    * Calcula la suma total de todos los ingredientes necesarios y publica un mensaje con la lista completa en la cola `ingredient_requests_queue`.

4.  **Verificación de Inventario en la Bodega:**
    * Una instancia del **Warehouse Service** consume la solicitud de ingredientes.
    * Consulta su base de datos de inventario (`warehouse-db`).
    * **Si tiene stock suficiente**, descuenta los ingredientes y salta directamente al **Paso 8**.
    * **Si no tiene stock suficiente**, continúa al **Paso 5**.

5.  **Creación de Orden de Compra:**
    * El **Warehouse Service** guarda el estado de la solicitud en su base de datos como `PENDING_PURCHASE`.
    * Publica un evento en `order_status_update_queue` para que el dashboard muestre el estado "Comprando Ingredientes".
    * Publica un mensaje con solo los ingredientes faltantes en la cola `marketplace_purchase_queue`.

6.  **Compra en el Mercado Externo:**
    * Una instancia del **Marketplace Service** consume la orden de compra.
    * Utiliza su lógica de "Compra Agresiva", haciendo llamadas repetidas a la **API Externa** hasta conseguir la cantidad total de cada ingrediente.
    * Una vez que ha comprado todo, publica un único mensaje de confirmación en la cola `purchase_confirmation_queue`.

7.  **Recepción y Re-evaluación en Bodega:**
    * El **Warehouse Service** (a través de su consumidor de compras) recibe la confirmación.
    * Actualiza su inventario en la `warehouse-db` con los nuevos ingredientes.
    * Publica un evento con el nuevo estado del inventario para que el dashboard se actualice.
    * Re-evalúa la solicitud original y, al confirmar que el stock ya es suficiente, procede al siguiente paso.

8.  **Despacho de Ingredientes a la Cocina:**
    * El **Warehouse Service** descuenta de su inventario todos los ingredientes para la orden completa.
    * Publica una última actualización de inventario.
    * Envía el mensaje final de "listo" a la cola `ingredient_ready_queue`.

9.  **Preparación de Platillos:**
    * El **Kitchen Service** recibe el mensaje de "listo".
    * Publica un evento para que el dashboard muestre el estado "Preparando Platillos".
    * Se simulan 6 segundos de preparación en cocina.
    * Actualiza el estado de los platos en su `kitchen-db` a `PREPARING` y luego a `COMPLETED` tras simular el tiempo de cocción.

10. **Finalización del Ciclo:**
    * Una vez todos los platos están listos, el **Kitchen Service** publica un último evento con el estado `COMPLETED` y la lista de platos preparados.
    * El **Manager Service** consume este evento final y actualiza el estado de la `OrderBatch` en su `manager-db` a `COMPLETED`, dejando toda la información lista para ser consultada por el frontend.


## Stack Tecnológico
* **Backend:** Node.js, TypeScript
* **Frontend:** Vue.js, Vite, Axios, TailwindCSS
* **Bases de Datos:** PostgreSQL
* **Mensajería:** RabbitMQ (gestionado en CloudAMQP)
* **Contenedores:** Docker & Docker Compose
* **Despliegue:** Render (para el backend) y Vercel (para el frontend)
* **Testing:** Jest, ts-jest


### Prerrequisitos
* Tener instalado **Docker** y **Docker Compose**.
* Tener instalado **Git**.

## Pruebas (Testing)

El proyecto incluye pruebas unitarias para validar la lógica de negocio crítica.  Para ejecutar las pruebas de un servicio:
```bash
# Navegar a la carpeta del servicio, ej:
cd services/kitchen-service
cd services/marketplace-service

# Instalar dependencias
npm install

# Correr las pruebas
npm test
```

## Decisiones de Arquitectura y Trade-offs

* **Comunicación Asíncrona con RabbitMQ:** Se eligió este patrón para cumplir con el requisito de desacoplamiento y para construir un sistema resiliente y escalable capaz de absorber picos de carga ("pedidos masivos") mediante colas.
* **Bases de Datos Independientes:** Cada servicio con estado tiene su propia base de datos para asegurar una autonomía y desacoplamiento reales, un principio clave de los microservicios.
* **Escalabilidad de Workers:** Los servicios de fondo (`kitchen`, `warehouse`, `marketplace`)  están **diseñados para ser escalables horizontalmente**, permitiendo múltiples instancias en paralelo para mejorar el rendimiento y la capacidad de procesamiento, especialmente en escenarios de alta concurrencia. Se implementó un `prefetch(1)` para cada consumidor para garantizar la estabilidad individual de cada instancia bajo alta carga.
* **Gestión de Fallos Externos:** El `marketplace-service` implementa un patrón de reintentos con "Dead-Letter Queues" para manejar de forma robusta la indisponibilidad de ingredientes en la API externa, cumpliendo con el requisito de "esperar hasta que estén disponibles".
* **API Gateway:** El `manager-service` centraliza la información de estado de todo el sistema escuchando eventos de otros servicios. Esto permite que el frontend tenga un único punto de consulta (`/api/dashboard`) para obtener toda la información que necesita, haciendo la interfaz más eficiente.

## Futuras Mejoras
* **Seguridad:** Implementar un sistema de autenticación y autorización con JWT para proteger el acceso al dashboard.
* **WebSockets:** Reemplazar el polling del frontend con una conexión WebSocket para actualizaciones del dashboard en tiempo real de forma más eficiente.
- **Inventario inteligente con IA:** Implementar un sistema de predicción que analice el historial de órdenes y movimientos para anticipar la demanda de ingredientes. Esto permitirá al `warehouse-service` hacer compras anticipadas de forma automática, reduciendo tiempos de espera y mejorando la eficiencia general del flujo.
