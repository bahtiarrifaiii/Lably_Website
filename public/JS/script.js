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
  const methodButtons = document.querySelectorAll(".method-btn");

  methodButtons.forEach((button) => {
    button.addEventListener("click", function () {
      methodButtons.forEach((btn) => {
        btn.classList.remove("active");
      });
      this.classList.add("active");
      const selectedMethod = this.textContent.trim();
      console.log("Metode pembayaran dipilih:", selectedMethod);
    });
  });
});

// Pagination Order
document.addEventListener("DOMContentLoaded", () => {
  const rowsPerPage = 5;
  const maxPageButtons = 3;
  const cardListContainer = document.querySelector(".order-card-list");

  if (!cardListContainer) {
    console.error("Container '.order-card-list' tidak ditemukan.");
    return;
  }

  const allCards = Array.from(
    cardListContainer.querySelectorAll(".order-card")
  );
  const totalRows = allCards.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const paginationContainer = document.querySelector(".pagination");
  let currentPage = 1;

  function displayCards(page) {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    allCards.forEach((card, index) => {
      if (index >= startIndex && index < endIndex) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  }

  function renderPaginationButtons() {
    paginationContainer.innerHTML = "";
    const startWindow =
      Math.floor((currentPage - 1) / maxPageButtons) * maxPageButtons + 1;
    const endWindow = Math.min(startWindow + maxPageButtons - 1, totalPages);

    if (currentPage > maxPageButtons && startWindow > 1) {
      const prevGroupPage = startWindow - 1;
      const prevButton = createButton("PREV", "&#x276E; PREV", prevGroupPage);
      prevButton.classList.add("page-arrow");
      paginationContainer.appendChild(prevButton);
    }

    for (let i = startWindow; i <= endWindow; i++) {
      const button = createButton(i, i, i);
      if (i === currentPage) {
        button.classList.add("active");
      }
      button.classList.add("page-number");
      paginationContainer.appendChild(button);
    }

    if (endWindow < totalPages) {
      const nextGroupPage = endWindow + 1;
      const nextButton = createButton("NEXT", `NEXT &#x276F;`);
      nextButton.classList.add("page-next");
      paginationContainer.appendChild(nextButton);
    }
  }

  function createButton(value, innerHTML, targetPage) {
    const button = document.createElement("button");
    button.innerHTML = innerHTML;
    button.classList.add("page-item");

    button.addEventListener("click", () => {
      if (targetPage >= 1 && targetPage <= totalPages) {
        currentPage = targetPage;
        displayCards(currentPage);
        renderPaginationButtons();
      }
    });
    return button;
  }

  if (totalPages > 0) {
    displayCards(currentPage);
    renderPaginationButtons();
  }
});

// Filter Order
document.addEventListener("DOMContentLoaded", () => {
  // Selektor utama
  const filterButtons = document.querySelectorAll(".filter-btn");
  const orderCards = document.querySelectorAll(".order-card");
  const mainContent = document.getElementById("main-content");

  // Status yang valid untuk setiap filter (harus sesuai dengan data-status di HTML)
  const filterMap = {
    all: ["paid", "in-use", "overdue", "complete"],
    loaned: ["in-use", "overdue"],
    completed: ["complete"], // Menggunakan 'complete' sesuai ID tombol
  };

  /**
   * Fungsi utama untuk menerapkan filter dan mengganti tampilan kolom.
   * @param {string} filterName - Nama filter: 'all', 'loaned', atau 'completed'.
   */
  function applyFilter(filterName) {
    const validStatuses = filterMap[filterName];

    // LOGIKA 1: Mengganti Tampilan Kolom (CSS)
    if (filterName === "all") {
      // Tampilan All Orders (Total Product & Loan Date gabungan)
      mainContent.classList.remove("view-loaned");
    } else {
      // Tampilan Loaned/Complete (Loan From & Loan Until terpisah)
      mainContent.classList.add("view-loaned");
    }

    // LOGIKA 2: Menampilkan/Menyembunyikan Kartu (Filtering)
    orderCards.forEach((card) => {
      const cardStatus = card.getAttribute("data-status");
      let shouldDisplay = false;

      // Jika filter 'all', tampilkan semua kartu.
      // Jika filter spesifik, cek apakah status kartu ada di array validStatuses.
      if (filterName === "all" || validStatuses.includes(cardStatus)) {
        shouldDisplay = true;
      }

      // Terapkan display: flex (terlihat) atau display: none (tersembunyi)
      card.style.display = shouldDisplay ? "flex" : "none";
    });

    // Catatan: Jika Anda mengintegrasikan paginasi, fungsi paginasi harus
    // dipanggil ulang di sini, bekerja pada subset kartu yang terlihat.
  }

  // Event Listener untuk tombol filter
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // 1. Kelola Kelas Active pada tombol
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // 2. Terapkan Filter
      // Ambil nama filter dari ID tombol (misalnya, 'filter-loaned' -> 'loaned')
      const filterName = this.id.split("-")[1];
      applyFilter(filterName);
    });
  });

  // Inisialisasi: Pastikan tampilan awal sesuai 'ALL ORDERS'
  applyFilter("all");
});
