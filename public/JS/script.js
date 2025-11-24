// Navbar Scroll
document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".main-header");
  const footer = document.querySelector(".main-footer");

  const viewportHeight = window.innerHeight;
  const threshold = viewportHeight * 0.25;

  function checkFooterVisibility() {
    const footerTop = footer.getBoundingClientRect().top;

    if (footerTop <= threshold) {
      header.classList.add("header-hidden");
    } else {
      header.classList.remove("header-hidden");
    }
  }

  checkFooterVisibility();

  window.addEventListener("scroll", checkFooterVisibility);

  window.addEventListener("resize", checkFooterVisibility);
});

// Burger Menu
document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("main-nav");
  const navIcons = document.querySelector(".nav-icons");

  if (toggleButton && navMenu && navIcons) {
    toggleButton.addEventListener("click", function () {
      navMenu.classList.toggle("active");
      navIcons.classList.toggle("active");

      const icon = toggleButton.querySelector("i");

      if (navMenu.classList.contains("active")) {
        icon.classList.remove("bi-list");
        icon.classList.add("bi-x-lg");

        setTimeout(() => {
          const navHeight = navMenu.offsetHeight;

          const navMarginBottom = parseFloat(
            getComputedStyle(navMenu).marginBottom
          );

          const iconsMarginTop = parseFloat(
            getComputedStyle(navIcons).marginTop
          );

          const totalOffset = navHeight + navMarginBottom + iconsMarginTop;

          navIcons.style.top = `calc(100% + ${totalOffset}px)`;
        }, 0);
      } else {
        icon.classList.remove("bi-x-lg");
        icon.classList.add("bi-list");
        navIcons.style.top = "";
      }
    });
  }
});

// Checkout Method
document.addEventListener("DOMContentLoaded", function () {
  // 1. Dapatkan semua tombol metode pembayaran
  const methodButtons = document.querySelectorAll(".method-btn");

  // 2. Tambahkan event listener ke setiap tombol
  methodButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // 3. Hapus class 'active' dari SEMUA tombol
      methodButtons.forEach((btn) => {
        btn.classList.remove("active");
      });

      // 4. Tambahkan class 'active' ke tombol yang baru saja diklik (this)
      this.classList.add("active");

      // Opsional: Lakukan sesuatu yang lain di sini (misalnya, menyimpan metode pembayaran yang dipilih ke database/state)
      const selectedMethod = this.textContent.trim();
      console.log("Metode pembayaran dipilih:", selectedMethod);
    });
  });
});
