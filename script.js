// ====================================
// Configuración
// ====================================
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7Yrz8-vvHRk6sJKBfDkqkv5XMOS5fFBBzqSMVKhmQzBIptwBQAy56JiNO23s7KixBQnFN41uh7DIe/pub?output=csv";
const whatsappNumber = "34643640757";   // Tu número de WhatsApp

// Variables
let productos = [];
let carrito = [];

// ====================================
// Convertir CSV a JSON
// ====================================
function csvToJSON(csv) {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",");
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Maneja comas dentro de comillas
    if (currentline.length === headers.length) {
      const obj = {};
      headers.forEach((header, j) => {
        obj[header.trim()] = currentline[j].replace(/^"|"$/g,'').trim();
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
    const data = await response.text();
    productos = csvToJSON(data);
    mostrarProductos();
  } catch (err) {
    console.error(err);
    alert("Error al cargar los productos. Comprueba el enlace CSV.");
  }
}

// ====================================
// Mostrar productos
// ====================================
function mostrarProductos() {
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";
  productos.forEach(prod => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${prod.Imagen}" alt="${prod.Nombre}">
      <h3>${prod.Nombre}</h3>
      <p>${prod.Descripción}</p>
      <p>€${parseFloat(prod.Precio).toFixed(2)}</p>
      <button onclick="agregarAlCarrito('${prod.Nombre}')">Añadir al carrito</button>
    `;
    contenedor.appendChild(div);
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

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
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
        <button onclick="eliminarDelCarrito(${i})" style="margin-left:10px;color:red;">X</button>
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
// Enviar pedido por WhatsApp
// ====================================
document.getElementById("pedido-whatsapp").addEventListener("click", () => {
  if (carrito.length === 0) return alert("El carrito está vacío.");
  let mensaje = "Hola, quiero hacer el siguiente pedido:\n\n";
  carrito.forEach(p => {
    mensaje += `${p.Nombre} - €${parseFloat(p.Precio).toFixed(2)}\n`;
  });
  const total = carrito.reduce((sum, p) => sum + parseFloat(p.Precio), 0).toFixed(2);
  mensaje += `\nTotal: €${total}\n\n`;
  mensaje += "Mi nombre: \nDirección: \nTeléfono: ";
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`);
});

// ====================================
// Inicializar
// ====================================
cargarProductos();
