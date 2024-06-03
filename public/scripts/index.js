const navContent = document.getElementById('navContent');
let opened = false;

function toggleMenu(element, nav) {
  element.classList.toggle("change");
  if (opened) {
    nav.style.right = "-100";
  } else {
    nav.style.right = "0";
  }
  opened = !opened;
}

function navigate(route) {
  window.location.href = `http://localhost:3000/${route}`;
}
