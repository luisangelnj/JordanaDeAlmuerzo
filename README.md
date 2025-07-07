# Reto Técnico: Jornada de Almuerzo gratis

Este proyecto es la solución al reto técnico de la jornada de donación, que consiste en un sistema automatizado para gestionar la preparación de platos, el inventario de ingredientes y las compras externas, todo bajo una arquitectura de microservicios **robusta y escalable**.

**URL de la aplicación desplegada:** 
* [jornada-de-almuerzo.luisangelnj.com](https://jornada-de-almuerzo.luisangelnj.com/) (Dominio propio en propagación)
* [jornada-de-almuerzo.vercel.app](https://jornada-de-almuerzo.vercel.app/) (Dominio de Vercel)

## Índice
- [Reto Técnico: Jornada de Almuerzo gratis](#reto-técnico-jornada-de-almuerzo-gratis)
    - [Índice](#índice)
    - [Descripción del proyecto](#descripción-del-proyecto)
        - [Flujo Detallado de una Orden](#flujo-detallado-de-una-orden)
    - [Arquitectura del Sistema](#arquitectura-del-sistema)
        - [Microservicios en detalle:](#microservicios-en-detalle)
        - [Decisiones de Arquitectura y Trade-offs](#decisiones-de-arquitectura-y-trade-offs)
        - [Stack Tecnológico](#stack-tecnológico)
        - [Pruebas (Testing)](#pruebas-testing)
    - [Cómo Ejecutar en Desarrollo Local](#cómo-ejecutar-en-desarrollo-local)
        - [Prerrequisitos](#prerrequisitos)
        - [Instrucciones de Arranque](#instrucciones-de-arranque)
        - [Acceder a los Servicios](#acceder-a-los-servicios)
        - [Escalado de Servicios (Opcional)](#escalado-de-servicios-opcional)
    - [Futuras mejoras](#futuras-mejoras)


## Descripción del Proyecto

Este sistema automatiza el flujo operativo de un restaurante durante una jornada de donación de comida gratuita. Permite **procesar múltiples órdenes masivas de forma asíncrona y escalable**, gestionando desde la generación aleatoria de recetas, verificación de inventario, compras externas y preparación de platillos, hasta la finalización de las órdenes, sin intervención manual.

![Dashboard](https://i.postimg.cc/cHQhpQVq/Screenshot-1.png)
El dashboard muestra en tiempo real el estado completo del sistema, permitiendo al gerente monitorear cada orden a lo largo de su ciclo de vida: **EN COLA** → **COMPRANDO INGREDIENTES** → **PREPARANDO PLATILLOS** → **ORDEN COMPLETADA**.

Gracias a su arquitectura basada en *microservicios* y *procesamiento encolado*, el sistema puede manejar múltiples solicitudes simultáneas de hasta 999 platillos por orden (para la actual infraestructura sandbox del reto técnico), con posibilidad de escalar horizontalmente los workers para soportar una carga aún mayor sin comprometer el rendimiento.

### Flujo Detallado de una Orden
El sistema está diseñado como una línea de ensamblaje asíncrona para garantizar la robustez y escalabilidad. A continuación, se describe el viaje completo de una orden, desde la solicitud hasta la finalización. [Mirar diagrama.](#arquitectura-del-sistema)

1.  **Inicio de la Orden:**
    * El Gerente de la Jornada utiliza la interfaz de usuario para solicitar una cantidad `N` de platos.
    * El **Frontend** realiza una llamada API (`POST /api/orders`) al único punto de entrada del backend, el **Manager Service**.

2.  **Creación y Delegación de la Orden:**
    * El **Manager Service** recibe la petición.
    * Guarda un nuevo registro `OrderBatch` en su base de datos (`manager-db`) con estado `PENDING`.
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
    * Una instancia del Marketplace Service consume la orden de compra desde la cola `marketplace_purchase_queue`.
    * Intenta comprar todos los ingredientes solicitados usando una lógica de llamada controlada a la API Externa evitando así bloqueos por exceso de peticiones, haciendo una llamada a la API externa por cada ingrediente.
    * Inmediatamente después, publica un mensaje en `purchase_confirmation_queue` con los detalles de cualquier compra que haya sido exitosa, aunque sea parcial. Si ninguna compra tuvo éxito, re-encola la petición para un reintento automático.

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


## Arquitectura del Sistema

El sistema está diseñado siguiendo una **arquitectura de microservicios** desacoplados, donde toda la comunicación entre servicios se realiza de forma **asíncrona** a través de un bus de mensajería (RabbitMQ), cumpliendo con los requisitos excluyentes del reto.

![Diagrama de arquitectura](https://i.postimg.cc/PrQy4gGV/Presentaci-n1.gif)

### Microservicios en detalle:
* **Manager Service**: Actúa como **API Gateway** y orquestador principal. Recibe las peticiones del frontend, inicia los flujos de trabajo y centraliza el estado del sistema para el dashboard.
* **Kitchen Service**: Gestiona las recetas, selecciona los platos a preparar por orden y calcula los ingredientes necesarios.
* **Warehouse Service**: Mantiene el estado del inventario. Procesa las solicitudes de ingredientes, descuenta el stock y gestiona el ciclo de compras aumentando su stock por cada compra.
* **Marketplace Service**: Actúa como una **Capa Anticorrupción (ACL)**, aislando el sistema de la API externa de la plaza de mercado y manejando la lógica de compra y reintentos.
* **Frontend**: La interfaz de usuario intuitiva para que el gerente interactúe con el sistema.
* **3 Bases de Datos**: Cada servicio principal tiene su propia base de datos PostgreSQL independiente para garantizar un desacoplamiento total:
    - Manager-DB
    - Kitchen-DB
    - Warehouse-DB
* **Mensajería (RabbitMQ)**: Un bus de RabbitMQ gestionado que maneja toda la comunicación asíncrona.

### Decisiones de Arquitectura y Trade-offs
* **Arquitectura por Capas:** Cada microservicio sigue una arquitectura por capas para separar responsabilidades. La lógica de la API en el `manager-service` actúa como la capa de Controlador. La lógica de negocio principal reside en los `workers/consumidores` de cada servicio, que fungen como la capa de `Servicio/Caso de Uso`. Finalmente, el acceso a datos se abstrae a través del `Patrón de Repositorio`, facilitado por TypeORM.
* **Comunicación Asíncrona con RabbitMQ:** Se eligió este patrón para cumplir con el requisito de desacoplamiento y para construir un sistema resiliente y escalable capaz de absorber picos de carga ("pedidos masivos") mediante colas.
* **Bases de Datos Independientes:** Cada servicio con estado tiene su propia base de datos para asegurar una autonomía y desacoplamiento reales, un principio clave de los microservicios.
* **Escalabilidad de Workers:** Los servicios de fondo (`kitchen`, `warehouse`, `marketplace`)  están **diseñados para ser escalables horizontalmente**, permitiendo múltiples instancias en paralelo para mejorar el rendimiento y la capacidad de procesamiento, especialmente en escenarios de alta concurrencia. Se implementó un `prefetch(1)` para cada consumidor para garantizar la estabilidad individual de cada instancia bajo alta carga.
* **Gestión de Fallos Externos:** El `marketplace-service` implementa un patrón de reintentos con "Dead-Letter Queues" para manejar de forma robusta la indisponibilidad de ingredientes en la API externa, cumpliendo con el requisito de "esperar hasta que estén disponibles".
* **API Gateway:** El `manager-service` centraliza la información de estado de todo el sistema escuchando eventos de otros servicios. Esto permite que el frontend tenga un único punto de consulta (`/api/dashboard`) para obtener toda la información que necesita, haciendo la interfaz más eficiente.

### Stack Tecnológico
* **Backend:** Node.js, TypeScript
* **Frontend:** Vue.js, Vite, Axios, Tailwind CSS
* **Bases de Datos:** PostgreSQL
* **Mensajería:** RabbitMQ
* **Contenedores:** Docker & Docker Compose
* **Despliegue:** Render.com (para el backend), Vercel.com (para el frontend), CloudAMQP.com (para gestionado de mensajería)
* **Testing:** Jest, ts-jest

### Pruebas (Testing)
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


## Cómo Ejecutar en Desarrollo Local

Este proyecto está **100% desarrollado con contenedores Docker** para garantizar un entorno de desarrollo consistente y fácil de levantar. El **flujo de instalación y arranque** está **completamente automatizado** y con un solo comando, se iniciarán todos los microservicios, bases de datos, migraciones y el sistema de mensajería.

### Prerrequisitos
* Tener instalado **Docker** y **Docker Compose**.
* Tener instalado **Git**.

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
    # Levanta todos los servicios
    docker-compose up --build

    # O ejemplo levantando todos los servicios más 2 instancias de kitchen y 2 de warehouse para escalar
    docker-compose up --build --scale kitchen=2 --scale warehouse=2
    ```

4.  **¡Y listo!:**
    Permite que TODOS los servicios inicien y las migraciones hayan corrido por completo:
    Este único comando se encargará de todo:
    * **Construirá** las imágenes de Docker para cada microservicio.
    * **Iniciará** todos los contenedores en el orden correcto.
    * Cada servicio de backend ejecutará **automáticamente** sus migraciones de base de datos antes de arrancar. (Permite unos momentos a que todas las migraciones hayan corrido correctamente)

### Acceder a los Servicios
Una vez que todos los contenedores estén corriendo, podrás acceder a:
* **Frontend de la Aplicación:** `http://localhost:5173`
* **Panel de Administración de RabbitMQ:** `http://localhost:15672` (Usuario: `admin`, Contraseña: `admin`)

### Escalado de Servicios (Opcional)
Si deseas probar el comportamiento del sistema bajo una carga de trabajo más alta, puedes escalar los servicios "trabajadores" (`kitchen`, `warehouse`, `marketplace`).

Para hacerlo, simplemente añade el flag `--scale` al comando de arranque:
```bash
# Este ejemplo levanta 2 instancias de kitchen y 2 de warehouse
docker-compose up --build --scale kitchen=3 --scale warehouse=3
```


## Futuras Mejoras
* **Seguridad:** Implementar un sistema de autenticación y autorización con JWT para proteger el acceso al dashboard.
* **WebSockets:** Reemplazar el polling del frontend con una conexión WebSocket para actualizaciones del dashboard en tiempo real de forma más eficiente.
* **Inventario inteligente con IA:** Implementar un sistema de predicción que analice el historial de órdenes y movimientos para anticipar la demanda de ingredientes. Esto permitirá al `warehouse-service` hacer compras anticipadas de forma automática, reduciendo tiempos de espera y mejorando la eficiencia general del flujo.
