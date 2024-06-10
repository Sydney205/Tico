const navContent = document.getElementById("navContent");
const roomInput = document.getElementById("roomInput");
let navOpened = false;

function toggleMenu(element, nav) {
  element.classList.toggle("change");
  if (navOpened) {
    nav.style.right = "-100%";
  } else {
    nav.style.right = "0px";
  }
  navOpened = !navOpened;
}

function navigate(route) {
  window.location.href = `http://localhost:3000/${route}`;
}
