import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
  getAuth,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyAk4u0LKlIGhsS1IJW1WVGyu8srvrql5u8",
  authDomain: "educafinanca-80003.firebaseapp.com",
  projectId: "educafinanca-80003",
  storageBucket: "educafinanca-80003.firebasestorage.app",
  messagingSenderId: "173436879467",
  appId: "1:173436879467:web:4f3566a46bdfe562cba72e",
  measurementId: "G-HKMDH116RK"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const logoutBtn = document.getElementById("logoutBtn");


logoutBtn.addEventListener("click", async () => {

  const confirmar = confirm(
    "Deseja realmente sair da sua conta?"
  );

  if (!confirmar) {
    return;
  }


  try {

    await signOut(auth);

    localStorage.removeItem("usuario");

    window.location.href = "../html/login.html";

  } catch (erro) {

    console.error("Erro ao sair:", erro);

    alert("Não foi possível sair da conta.");

  }

});