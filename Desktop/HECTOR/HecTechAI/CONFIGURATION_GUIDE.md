# Guía de Configuración Completa (14 Nodos)

Aquí tienes la configuración exacta para los 14 nodos de tu workflow, en orden de ejecución.

## 1. Stripe Trigger

* **Función**: Detecta el pago.
* **Configuración**:
  * **Credential for Stripe API**: Selecciona tu cuenta de Stripe.
  * **Event Name**: `checkout.session.completed`.
  * **Simplify**: Desactivado (o default).

## 2. Switch Tipo Pago

* **Función**: Separa pago inicial vs final.
* **Configuración**:
  * **Mode**: `Rules`.
  * **Data Type**: `String`.
  * **Value 1**: `={{$json.data.object.metadata.type}}` (Ya viene configurado).
  * **Rules**: "Contains" -> `final`.
  * **Fallback**: `initial`.
  * *Nota*: Si esto sale en rojo, es normal hasta que reciba datos, pero no requiere credenciales.

---

### RAMA SUPERIOR (Pago Inicial)

## 3. Generar Datos (Inicial)

* **Función**: Crea contraseña y extrae email.
* **Configuración**:
  * Es un nodo de **Código (JavaScript)**.
  * No requiere configuración ni credenciales. Ya tiene el código listo.

## 4. Supabase (Crear Cliente)

* **Función**: Crea el registro en base de datos.
* **Configuración**:
  * **Credential**: Tu cuenta Supabase (`service_role`).
  * **Resource**: `Row`.
  * **Operation**: `Create`.
  * **Table**: `automation_metrics`.
  * **Data to Send**: `Define Below`.
  * **Ui Field: Upsert**: [ACTIVADO/ON].
  * **Fields**:
    * `client_email`: `={{$node["Generar Datos (Inicial)"].json["email"]}}`
    * `client_name`: `={{$node["Generar Datos (Inicial)"].json["name"]}}`
    * `password`: `={{$node["Generar Datos (Inicial)"].json["password"]}}`
    * `status`: `ONBOARDING`

## 5. Notion (Buscar Cliente)

* **Función**: Busca si el cliente ya existe en Notion para no duplicar.
* **Configuración**:
  * **Credential**: Tu cuenta Notion.
  * **Resource**: `Database Page`.
  * **Operation**: `Get Many` (o `Search`).
  * **Database ID**: `2df8c4ece7a8800b9f22fd0848309577`.
  * **Filter**:
    * Property: `Email` | Condición: `Equals` | Texto: `={{$node["Generar Datos (Inicial)"].json["email"]}}`

## 6. Notion (Estado: Onboarding)

* **Función**: Actualiza el estado a "Onboarding".
* **Configuración**:
  * **Credential**: Tu cuenta Notion.
  * **Resource**: `Database Page`.
  * **Operation**: `Update`.
  * **Page ID**: `={{$json.id}}` (Coge el ID del nodo anterior).
  * **Properties**:
    * **Status**: Selecciona `Onboarding`.

## 7. Google Drive (Crear Carpeta)

* **Función**: Crea la carpeta del proyecto.
* **Configuración**:
  * **Credential**: Tu cuenta Google (OAuth2).
  * **Resource**: `Folder`.
  * **Operation**: `Create`.
  * **Name**: `[HecTechAi] {{$node["Generar Datos (Inicial)"].json["name"]}}`.
  * **Parent Folder**: `12SXVpFpQOAwTlvCCrdA09-oszPxebVni`.

## 8. Gmail (Bienvenida)

* **Función**: Envía credenciales.
* **Configuración**:
  * **Credential**: Tu cuenta Gmail (OAuth2).
  * **Resource**: `Message`.
  * **Operation**: `Send`.
  * **To Email**: `={{$node["Generar Datos (Inicial)"].json["email"]}}`.
  * **Subject**: `🚀 Bienvenido a HecTechAi - Tus Credenciales`.
  * **Message Type**: `HTML`.

## 9. Supabase (Guardar Drive)

* **Función**: Guarda el link de Drive en la DB.
* **Configuración**:
  * **Credential**: Tu cuenta Supabase.
  * **Resource**: `Row`.
  * **Operation**: `Create` (con Upsert) o `Update`.
  * **Table**: `automation_metrics`.
  * **Upsert**: [ACTIVADO].
  * **Fields**:
    * `client_email`: `={{$node["Generar Datos (Inicial)"].json["email"]}}`
    * `drive_folder_url`: `={{$json.webViewLink}}` (Viene del nodo Drive).

---

### RAMA INFERIOR (Pago Final)

## 10. Extraer Email (Final)

* **Función**: Prepara datos para el cierre.
* **Configuración**:
  * Nodo de **Código**. No tocar.

## 11. Supabase (Activar Cliente)

* **Función**: Cambia estado a ACTIVE en DB.
* **Configuración**:
  * **Credential**: Tu cuenta Supabase.
  * **Resource**: `Row`.
  * **Operation**: `Create` (Upsert).
  * **Upsert**: [ACTIVADO].
  * **Fields**:
    * `client_email`: `={{$node["Extraer Email (Final)"].json["email"]}}`
    * `status`: `ACTIVE`

## 12. Notion (Buscar Cliente Final)

* **Función**: Busca el cliente para actualizarlo.
* **Configuración**:
  * Igual que el nodo #5 pero conectado a la rama de abajo.
  * **Database ID**: `2df8c4ece7a8800b9f22fd0848309577`.
  * **Filter**: Email Equals `={{$json.email}}` (del nodo #10).

## 13. Notion (Estado: Activo)

* **Función**: Cambia estado a Active en Notion.
* **Configuración**:
  * **Resource**: `Database Page`.
  * **Operation**: `Update`.
  * **Page ID**: `={{$json.id}}`.
  * **Properties**:
    * **Status**: `Active`.

## 14. Gmail (Lanzamiento)

* **Función**: Email de despedida/lanzamiento.
* **Configuración**:
  * **Credential**: Gmail.
  * **To Email**: `={{$node["Extraer Email (Final)"].json["email"]}}`.
  * **Subject**: `🚀 ¡Tu Automatización está DESPLEGADA!`.
