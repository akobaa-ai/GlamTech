// ====================================
// Configuración
// ====================================
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Yrz8-vvHRk6sJKBfDkqkv5XMOS5fFBBzqSMVKhmQzBIptwBQAy56JiNO23s7KixBQnFN41uh7DIe/pub?output=csv";
const webhookURL = "https://script.google.com/macros/s/AKfycbxbm0rLAyNE-X8_MDhf_ikCeRwBSlMX7GacjLOUX1fBbFwdehg6x8BmfJOSfJ4uxFis/exec";
const whatsappNumber = "34643640757"; // Tu número de WhatsApp

let productos = [];
let carrito = [];

// ====================================
// Convertir CSV a JSON y normalizar columnas
// ====================================
function csvToJSON(csv) {
  const lines = csv.trim().split("\n");
  const headersRaw = lines[0].split(",");
  const headers = headersRaw.map(h => h.trim().toLowerCase());

  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (currentline.length === headers.length) {
      const obj = {};
      headers.forEach((header, j) => {
        const value = currentline[j].replace(/^"|"$/g,'').trim();
        if(header.includes("nombre")) obj.Nombre = value;
        else if(header.includes("precio")) obj.Precio = value;
        else if(header.includes("imagen")) obj.Imagen = value;
        else if(header.includes("descrip")) obj.Descripción = value;
      });
      result.push(obj);
    }
  }
  return result;
}

// ====================================
// Cargar productos desde Google Sheets
// ====================================
async function cargarProductos() {
  try {
    const response = await fetch(sheetURL);
    if (!response.ok) throw new Error("No se pudo cargar la hoja de productos.");
    const text = await response.text();
    productos = csvToJSON(text);
    mostrarProductos();
  } catch (err) {
    console.error(err);
    alert("Error al cargar productos. Revisa el enlace CSV de Google Sheets.");
  }
}

// ====================================
// Mostrar productos en HTML
// ====================================
function mostrarProductos() {
  const cont = document.getElementById("productos");
  cont.innerHTML = "";
  productos.forEach(prod => {
    const card = document.createElement("div");
    card.className = "producto";
    card.innerHTML = `
      <img src="${prod.Imagen}" alt="${prod.Nombre}">
      <h3>${prod.Nombre}</h3>
      <p>${prod.Descripción}</p>
      <p>€${parseFloat(prod.Precio).toFixed(2)}</p>
      <button onclick="agregarAlCarrito('${prod.Nombre}')">Añadir al carrito</button>
    `;
    cont.appendChild(card);
  });
}

// ====================================
// Carrito
// ====================================
function agregarAlCarrito(nombre) {
  const prod = productos.find(p => p.Nombre === nombre);
  if (!prod) return alert("Producto no encontrado.");
  carrito.push(prod);
  actualizarCarrito();
  alert(`${prod.Nombre} agregado al carrito.`);
}

function eliminarDelCarrito(i) {
  carrito.splice(i, 1);
  actualizarCarrito();
}

function actualizarCarrito() {
  const lista = document.getElementById("lista-carrito");
  lista.innerHTML = "";
  let total = 0;
  carrito.forEach((p, i) => {
    total += parseFloat(p.Precio);
    lista.innerHTML += `
      <p>
        ${p.Nombre} - €${parseFloat(p.Precio).toFixed(2)}
        <button onclick="eliminarDelCarrito(${i})" class="btn-eliminar">X</button>
      </p>
    `;
  });
  document.getElementById("total").innerText = total.toFixed(2);
  document.getElementById("ver-carrito").innerText = `🛒 Carrito (${carrito.length})`;
}

// ====================================
// Modal carrito
// ====================================
const modal = document.getElementById("modal-carrito");
document.getElementById("ver-carrito").addEventListener("click", () => {
  modal.classList.add("show");
});
document.getElementById("cerrar-carrito").addEventListener("click", () => {
  modal.classList.remove("show");
});

// ====================================
// Enviar pedido (Web App + WhatsApp)
// ====================================
document.getElementById("pedido-whatsapp").addEventListener("click", async () => {
  if (carrito.length === 0) return alert("El carrito está vacío.");

  const cliente = {
    nombre: prompt("Tu nombre:"),
    direccion: prompt("Tu dirección:"),
    telefono: prompt("Tu teléfono:")
  };
  if (!cliente.nombre || !cliente.direccion || !cliente.telefono) {
    return alert("Debes completar todos los datos.");
  }

  const total = carrito.reduce((sum, p) => sum + parseFloat(p.Precio), 0).toFixed(2);
  const pedidoObj = { cliente, items: carrito, total };

  // Guardar pedido en Google Sheets via Web App
  try {
    const res = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedidoObj)
    });
    const json = await res.json();
    if (json.status !== "ok") throw new Error("No se guardó en la hoja.");
  } catch (err) {
    console.error(err);
    alert("Error al guardar pedido en Google Sheets.");
    return;
  }

  // Crear mensaje WhatsApp
  let mensaje = "Hola, quiero hacer el siguiente pedido:\n\n";
  carrito.forEach(p => {
    mensaje += `${p.Nombre} - €${parseFloat(p.Precio).toFixed(2)}\n`;
  });
  mensaje += `\nTotal: €${total}\n\n`;
  mensaje += `Nombre: ${cliente.nombre}\nDirección: ${cliente.direccion}\nTeléfono: ${cliente.telefono}`;

  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`);

  carrito = [];
  actualizarCarrito();
});

// ====================================
// Inicializador
// ====================================
cargarProductos();
