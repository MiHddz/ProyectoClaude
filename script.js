// Número de WhatsApp de la clínica (formato internacional, sin "+" ni espacios).
// Reemplázalo por el número real.
const WHATSAPP_NUMBER = "5210000000000";

// Caritas de niños sonriendo (ilustraciones SVG).
const HAIR = {
  corto: '<path class="hair" d="M20 62 Q20 20 60 20 Q100 20 100 62 Q92 40 60 38 Q28 40 20 62Z"/>',
  coletas: '<circle class="hair" cx="16" cy="56" r="13"/><circle class="hair" cx="104" cy="56" r="13"/>' +
    '<path class="hair" d="M20 62 Q20 20 60 20 Q100 20 100 62 Q96 44 74 40 Q66 50 60 40 Q40 38 20 62Z"/>',
  rizos: [28, 40, 52, 64, 76, 88].map((x, i) => `<circle class="hair" cx="${x + 2}" cy="${i % 2 ? 28 : 33}" r="13"/>`).join("") +
    '<circle class="hair" cx="22" cy="46" r="11"/><circle class="hair" cx="98" cy="46" r="11"/>',
  chongo: '<circle class="hair" cx="60" cy="16" r="14"/>' +
    '<path class="hair" d="M20 62 Q20 22 60 22 Q100 22 100 62 Q90 42 60 40 Q30 42 20 62Z"/>',
};

const KIDS = [
  { bg: "var(--sun)", skin: "#f2c39b", hair: "#4a2c1a", style: "corto" },
  { bg: "var(--coral)", skin: "#8d5a3b", hair: "#1f1410", style: "rizos" },
  { bg: "var(--mint)", skin: "#ffd9b8", hair: "#e0a43a", style: "coletas" },
  { bg: "var(--lilac)", skin: "#c68a5e", hair: "#2b1b14", style: "chongo" },
];

function faceSVG(kid) {
  return `<svg viewBox="0 0 120 120">
    <circle class="skin" cx="21" cy="68" r="8"/><circle class="skin" cx="99" cy="68" r="8"/>
    <circle class="skin" cx="60" cy="66" r="40"/>
    ${HAIR[kid.style]}
    <ellipse class="eye" cx="46" cy="62" rx="4" ry="5.5"/><ellipse class="eye" cx="74" cy="62" rx="4" ry="5.5"/>
    <circle class="cheek" cx="36" cy="78" r="6"/><circle class="cheek" cx="84" cy="78" r="6"/>
    <path class="mouth" d="M42 77 Q60 104 78 77 Q60 81 42 77Z"/>
    <path class="teeth" d="M44.5 78.6 Q60 82 75.5 78.6 L74 84 Q60 87.5 46 84Z"/>
    <path class="spark" d="M82 82 L84 87 L89 89 L84 91 L82 96 L80 91 L75 89 L80 87Z"/>
  </svg>`;
}

const facesEl = document.getElementById("faces");
facesEl.innerHTML = KIDS.map((kid, i) =>
  `<div class="face" style="background:${kid.bg};--skin:${kid.skin};--hair:${kid.hair};--delay:${i * -0.9}s;--blink:${i * 1.3}s">${faceSVG(kid)}</div>`
).join("");

function celebrate() {
  facesEl.querySelectorAll(".face").forEach((face, i) => {
    face.classList.remove("jump");
    void face.offsetWidth;
    setTimeout(() => face.classList.add("jump"), i * 90);
    face.addEventListener("animationend", () => face.classList.remove("jump"), { once: true });
  });
}

// Formulario de cita.
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
  celebrate();
});

form.addEventListener("input", (event) => {
  if (event.target.value.trim()) event.target.classList.remove("invalid");
});
