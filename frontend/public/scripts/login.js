import { loginUser } from "../services/auth.js";

const form = document.querySelector("#login-form");
const msg = document.querySelector("#login-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.querySelector("#login-email").value;
  const contrasena = document.querySelector("#login-pass").value;

  try {
    const data = await loginUser(correo, contrasena);

    const rol = data.usuario.rol;

    if (rol === 1) window.location.href = "/admin";
    else if (rol === 2) window.location.href = "/docente";
    else window.location.href = "/cursos";

  } catch (err) {
    msg.textContent = err.message;
    msg.classList.add("error");
  }
});

// Manejar el clic en el botón "Crear cuenta"
const toRegisterBtn = document.querySelector("#to-register");
if (toRegisterBtn) {
  toRegisterBtn.addEventListener("click", () => {
    window.location.href = "/register";
  });
}