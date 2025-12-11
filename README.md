# 🧪 Plataforma de Experimento - Run Visualizer

Este proyecto es una aplicación web desarrollada con **React + Vite** diseñada para realizar encuestas de validación para la herramienta _Run Visualizer_. Utiliza **Google Sheets** como base de datos persistente mediante Google Apps Script.

## 🚀 Inicio Rápido

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```
2.  **Correr servidor de desarrollo:**
    ```bash
    npm run dev
    ```
3.  **Construir para producción:**
    ```bash
    npm run build
    ```

---

## ⚙️ Configuración del Experimento

El flujo del experimento, los escenarios y las preguntas son totalmente configurables sin tocar el código de React.

### 1\. Definir Preguntas (`src/data/questions.yml`)

La estructura se define en un archivo YAML. Cada entrada representa un "Escenario" (una pantalla con imagen/GIF y sus preguntas asociadas).

**Estructura del archivo:**

```yaml
- id: "escenario_1" # ID único del escenario
  title: "Fallo de Integración" # Título visible
  description: "Analiza la imagen..."
  mediaSrc: "/assets/demo1.gif" # Ruta a la imagen (ver sección imágenes)
  questions:
    - id: "s1_causa" # ID único de la pregunta (será la columna en Excel)
      text: "¿Cuál es la causa?"
      type: "text" # Opciones: 'text' o 'scale'

    - id: "s1_confianza"
      text: "Nivel de confianza (1-5)"
      type: "scale"
      min: 1
      max: 5
```

### 2\. Gestión de Imágenes y GIFs

Para asegurar que las imágenes se carguen correctamente tanto en local como en producción:

1.  Guarda tus archivos (PNG, JPG, GIF HD) en la carpeta pública:  
    `public/assets/`
2.  En el archivo YAML, referéncialas comenzando con `/assets/`:
    `mediaSrc: "/assets/mi-imagen.png"`

> **Nota:** El sistema soporta GIFs de alta resolución nativamente. Asegúrate de que los archivos no sean excesivamente pesados para no afectar la experiencia del usuario.

---

## 📊 Integración con Google Sheets

Las respuestas se almacenan en una hoja de cálculo de Google. No se requiere un backend tradicional; la comunicación se realiza vía `fetch` a un script desplegado en Google Apps Script.

## 🛠️ Tecnologías

- **Frontend:** React, Vite
- **Routing:** React Router DOM
- **Estado:** Zustand
- **Data:** YAML (`@rollup/plugin-yaml`)
- **Persistencia:** Google Sheets API (vía Apps Script)
