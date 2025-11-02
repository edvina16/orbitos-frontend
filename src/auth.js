// src/auth.js
export function signOut(navigate) {
  localStorage.removeItem("jwt");
  navigate("/login");
}

