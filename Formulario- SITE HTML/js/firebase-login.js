import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup
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
const provider = new GoogleAuthProvider();

const botaoGoogle = document.getElementById("googleLogin");

console.log("Firebase carregou");
console.log("Botão encontrado:", botaoGoogle);

if (botaoGoogle) {

  botaoGoogle.addEventListener("click", async () => {

    console.log("Botão Google clicado");

    try {

      const resultado = await signInWithPopup(auth, provider);

      console.log("LOGIN OK");
      console.log(resultado.user);

      localStorage.setItem(
        "usuario",
        JSON.stringify({
          nome: resultado.user.displayName,
          email: resultado.user.email,
          foto: resultado.user.photoURL,
          uid: resultado.user.uid
        })
      );

      window.location.href = "../html/home.html";

    } catch (erro) {

      console.error("ERRO FIREBASE:", erro);
      console.error("Código:", erro.code);
      console.error("Mensagem:", erro.message);

      alert(
        "Erro no login: " +
        erro.code
      );
    }

  });

} else {

  console.error(
    "Não encontrei o botão com id googleLogin"
  );

}