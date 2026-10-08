// Número de WhatsApp de la clínica (formato internacional, sin "+" ni espacios).
// Reemplázalo por el número real.
const WHATSAPP_NUMBER = "5210000000000";

const form = document.getElementById("booking-form");
const statusEl = document.getElementById("form-status");
const dateInput = form.elements.fecha;

document.getElementById("year").textContent = new Date().getFullYear();

// No permitir fechas pasadas.
const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
dateInput.min = today.toISOString().split("T")[0];

form.addEventListener("submit", (event) => {
  event.preventDefault();

  let valid = true;
  for (const field of form.querySelectorAll("[required]")) {
    const empty = !field.value.trim();
    field.classList.toggle("invalid", empty);
    if (empty) valid = false;
  }

  if (!valid) {
    statusEl.textContent = "Por favor completa los campos requeridos.";
    statusEl.className = "form-status error";
    return;
  }

  const { nombre, telefono, fecha, hora, motivo } = form.elements;
  const lines = [
    "Hola, quisiera agendar una cita en Sonrisa Imperial.",
    `Nombre: ${nombre.value.trim()}`,
    `Teléfono: ${telefono.value.trim()}`,
    `Fecha: ${fecha.value}`,
    `Hora: ${hora.value}`,
  ];
  if (motivo.value.trim()) lines.push(`Motivo: ${motivo.value.trim()}`);

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  window.open(url, "_blank", "noopener");

  statusEl.textContent = "¡Gracias! Te redirigimos a WhatsApp para confirmar tu cita.";
  statusEl.className = "form-status ok";
  form.reset();
});

form.addEventListener("input", (event) => {
  if (event.target.value.trim()) event.target.classList.remove("invalid");
});
