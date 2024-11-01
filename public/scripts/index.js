const navContent = document.getElementById("navContent");

let navOpened = false;
let theme = "green";

function toggleMenu(element, nav) {
  element.classList.toggle("change");
  if (navOpened) {
    nav.style.right = "-100%";
    navHeader.classList.remove("shadow-xl");
  } else {
    nav.style.right = "0px";
    navHeader.classList.add("shadow-xl");
  }
  navOpened = !navOpened;
}

function navigate(route) {
  window.location.href = `${PORT}${route}`; // usage: navigate("/route")
}

window.addEventListener("load", () => {
  if (localStorage.tico_theme) {
    theme = localStorage.tico_theme;
  }
})
