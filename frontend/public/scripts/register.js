import { registerUser } from "../services/auth.js";

const qs = (s) => document.querySelector(s);

const showRegisterMsg = (txt, type = "error") => {
  const el = qs("#register-msg");
  el.textContent = txt;
  el.className = "msg show " + (type === "error" ? "error" : "success");
  setTimeout(() => (el.className = "msg"), 3000);
};

const form = qs("#register-form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      dni: qs("#doc-number").value.trim(),
      nombres: qs("#reg-nombres").value.trim(),
      apellidos: qs("#reg-apellidos").value.trim(),
      celular: qs("#phone-prefix").value + qs("#phone-number").value.trim(),
      correo: qs("#reg-email").value.trim().toLowerCase(),
      contrasena: qs("#reg-pass").value,
    };

    // Validaciones
    if (!data.nombres || !data.apellidos) {
      return showRegisterMsg("Completa tus nombres y apellidos");
    }
    if (data.contrasena.length < 8) {
      return showRegisterMsg("La contraseña debe tener al menos 8 caracteres");
    }

    try {
      const res = await registerUser(data);
      showRegisterMsg("Registro exitoso. Redirigiendo...", "success");

      setTimeout(() => (window.location.href = "/login"), 1200);
    } catch (err) {
      showRegisterMsg(err.message, "error");
    }
  });
}
