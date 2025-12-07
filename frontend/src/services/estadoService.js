// frontend/src/services/estadoService.js

const API_BASE_URL = "http://localhost:4000/api";

export async function getEstados() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const res = await fetch(`${API_BASE_URL}/estados`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error(response.message || "Error al obtener estados");
    }

    return response;
  } catch (err) {
    console.error("Error en getEstados:", err);
    throw err;
  }
}
