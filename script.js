// =================================================
// 1. SELECTORES DE ELEMENTOS DEL DOM
// =================================================
const montoInput = document.getElementById("capital-real-monto");
const monedaInput = document.getElementById("capital-moneda");
const valorizacionDisplay = document.getElementById("valorizacion-display");
const btnActualizar = document.getElementById("btn-actualizar");

// =================================================
// 2. CONFIGURACIÓN INICIAL
// =================================================
const MONEDA_REFERENCIA = "ars";
const DEBOUNCE_DELAY = 500; // Milisegundos de espera antes de llamar a la API

// =================================================
// 3. FUNCIÓN DE UTILIDAD: DEBOUNCE
// =================================================
// Esta función evita que otra función se ejecute demasiadas veces seguidas.
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    // Si ya hay un temporizador, lo cancelamos
    clearTimeout(timeoutId);
    // Creamos un nuevo temporizador
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// =================================================
// 4. FUNCIÓN PRINCIPAL PARA OBTENER COTIZACIÓN
// =================================================
async function obtenerYMostrarValorizacion() {
  const monto = parseFloat(montoInput.value);
  const moneda = monedaInput.value.toLowerCase().trim();

  if (!monto || !moneda) {
    valorizacionDisplay.textContent = "---";
    return;
  }

  valorizacionDisplay.textContent = "Calculando...";

  const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${moneda}&vs_currencies=${MONEDA_REFERENCIA}`;

  try {
    const respuesta = await fetch(apiUrl);
    if (!respuesta.ok) {
      // Si la respuesta es un error (ej. 429 Too Many Requests), lo lanzamos
      throw new Error(`Error de red: ${respuesta.statusText}`);
    }

    const data = await respuesta.json();

    if (data[moneda] && data[moneda][MONEDA_REFERENCIA]) {
      const precio = data[moneda][MONEDA_REFERENCIA];
      const valorTotal = monto * precio;

      valorizacionDisplay.textContent = valorTotal.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
      });
    } else {
      valorizacionDisplay.textContent = "Moneda no encontrada";
    }
  } catch (error) {
    console.error("Error al obtener la cotización:", error);
    valorizacionDisplay.textContent = "Error";
  }
}

// =================================================
// 5. EVENT LISTENERS
// =================================================
// Creamos una versión "debounced" de nuestra función de API
const debouncedApiCall = debounce(obtenerYMostrarValorizacion, DEBOUNCE_DELAY);

// La llamada automática ahora es la versión debounced
montoInput.addEventListener("keyup", debouncedApiCall);
monedaInput.addEventListener("change", debouncedApiCall);

// El botón de actualizar llama a la función directamente, sin espera
btnActualizar.addEventListener("click", obtenerYMostrarValorizacion);

// =================================================
// 6. EJECUCIÓN INICIAL
// =================================================
document.addEventListener("DOMContentLoaded", obtenerYMostrarValorizacion);
