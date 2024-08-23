const motionElem = document.querySelectorAll("[motion-element]");
const navHeader = document.querySelector("[motion-header]");

window.addEventListener("scroll", () => {
  window.scrollY > 150 ? navHeader.classList.add("fixed", "shadow-xl")
    : navHeader.classList.remove("fixed", "shadow-xl");
});

const motionContent = function() {
  for (let i = 0, len = motionElem.length; i < len; i++) {
    if (motionElem[i].getBoundingClientRect().top < window.innerHeight / 1.2) {
      motionElem[i].classList.add("visible");
    }
  }
}; 

window.addEventListener("load", motionContent)
window.addEventListener("scroll", motionContent)
