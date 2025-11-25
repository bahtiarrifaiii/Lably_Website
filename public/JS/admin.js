document.addEventListener("DOMContentLoaded", function () {
  const menuLinks = document.querySelectorAll(".left-menu .menu a");
  const currentPath = window.location.pathname;

  menuLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.closest(".menu").classList.add("active");
    }
  });
});
