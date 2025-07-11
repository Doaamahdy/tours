import "@babel/polyfill";
import { login, logout } from "./login";
import { updateSettings } from "./updateSettings";
const loginForm = document.querySelector(".form--login");
const updateForm = document.querySelector(".form-user-data");
const updatePassForm = document.querySelector(".form-user-password");
const logoutBtn = document.querySelector(".nav__el--logout");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}

if (updateForm) {
  updateForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);
    console.log(form);
    updateSettings(form, "data");
  });
}

if (updatePassForm) {
  updatePassForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.querySelector(".btn--save-password");
    btn.innerHTML = "Updating...."; // Update button text
    console.log(btn);
    const passwordCurrent = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      "password"
    );
    //  Clear Form
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
    btn.innerHTML = "Save Password"; // Update button text
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}
