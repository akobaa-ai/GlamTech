// ====================================
// Configuración
// ====================================
const PASSWORD = "miTienda123"; // Cambia aquí tu contraseña
const sheetPedidosCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-GX-Ejy091EIj5FIxhbDXgEhH-SpFSKP6vVoqSlKDN1WxMbVonJMxj0ZexG78wF-K-gmjoUdPUSrZ/pub?output=csv";

// Elementos del DOM
const loginContainer = document.getElementById("login-container");
const panelAdmin = document.getElementById("panel-admin");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const cerrarPanel = document.getElementById("cerrar-panel");
const pedidosBody = document.getElementById("pedidos-body");

// ====================================
// Login
// ====================================
loginBtn.addEventListener("click", () => {
  const input = document.getElementById("admin-pass").value;
  if (input === PASSWORD) {
    loginContainer.style.display = "none";
    panelAdmin.style.display = "block";
    cargarPedidos();
  } else {
    loginError.style.display = "block";
  }
});

cerrarPanel.addEventListener("click", () => {
  panelAdmin.style.display = "none";
  loginContainer.style.display = "block";
  document.getElementById("admin-pass").value = "";
  loginError.style.display = "none";
});

// ====================================
// Cargar pedidos desde CSV
// ====================================
async function cargarPedidos() {
  try {
    const response = await fetch(sheetPedidosCSV);
    if (!response.ok) throw new Error("No se pudo cargar los pedidos.");
    const text = await response.text();
    mostrarPedidos(text);
  } catch (err) {
    console.error(err);
    pedidosBody.innerHTML = `<tr><td colspan="6" style="color:red;">Error al cargar pedidos</td></tr>`;
  }
}

// ====================================
// Mostrar pedidos en la tabla
// ====================================
function mostrarPedidos(csv) {
  const lines = csv.trim().split("\n");
  pedidosBody.innerHTML = "";

  // Si no hay datos
  if (lines.length <= 1) {
    pedidosBody.innerHTML = `<tr><td colspan="6">No hay pedidos aún</td></tr>`;
    return;
  }

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const tr = document.createElement("tr");

    cols.forEach((col, index) => {
      const td = document.createElement("td");
      td.innerText = col;
      tr.appendChild(td);
      
      // Ajustes de formato opcional
      if (index === 4) td.style.fontWeight = "bold"; // Total
    });

    pedidosBody.appendChild(tr);
  }
}
