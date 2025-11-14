// frontend/src/services/auth.js

const API = "http://localhost:4000/api/auth";

export async function registerUser(data) {
  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error(response.message || "Error en el registro");
    }

    return response;
  } catch (err) {
    console.error("Error en registerUser:", err);
    throw err;
  }
}

export async function loginUser(correo, contrasena) {
  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contrasena }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");

    // Guarda token y usuario en localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.usuario));

    return data;
  } catch (err) {
    console.error("Error en loginUser:", err);
    throw err;
  }
}
