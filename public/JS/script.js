document.addEventListener("DOMContentLoaded", function () {

  /* =========================================================
      NAVBAR SCROLL
  ========================================================= */
  const header = document.querySelector(".main-header");
  const footer = document.querySelector(".main-footer");

  if (header && footer) {
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
  }

  /* =========================================================
      BURGER MENU
  ========================================================= */
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
          const navMarginBottom = parseFloat(getComputedStyle(navMenu).marginBottom);
          const iconsMarginTop = parseFloat(getComputedStyle(navIcons).marginTop);
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

  /* =========================================================
      CHECKOUT METHOD
  ========================================================= */
  const methodButtons = document.querySelectorAll(".method-btn");

  methodButtons.forEach((button) => {
    button.addEventListener("click", function () {
      methodButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      console.log("Metode pembayaran dipilih:", this.textContent.trim());
    });
  });

  /* =========================================================
      PAGINATION ORDER
  ========================================================= */
  const rowsPerPage = 5;
  const maxPageButtons = 3;
  const cardListContainer = document.querySelector(".order-card-list");

  if (cardListContainer) {
    const allCards = Array.from(cardListContainer.querySelectorAll(".order-card"));
    const totalRows = allCards.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const paginationContainer = document.querySelector(".pagination");
    let currentPage = 1;

    function displayCards(page) {
      const startIndex = (page - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;

      allCards.forEach((card, index) => {
        card.style.display = index >= startIndex && index < endIndex ? "flex" : "none";
      });
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

    function renderPaginationButtons() {
      paginationContainer.innerHTML = "";
      const startWindow = Math.floor((currentPage - 1) / maxPageButtons) * maxPageButtons + 1;
      const endWindow = Math.min(startWindow + maxPageButtons - 1, totalPages);

      if (currentPage > maxPageButtons && startWindow > 1) {
        const prevGroupPage = startWindow - 1;
        const prevButton = createButton("PREV", "&#x276E; PREV", prevGroupPage);
        prevButton.classList.add("page-arrow");
        paginationContainer.appendChild(prevButton);
      }

      for (let i = startWindow; i <= endWindow; i++) {
        const button = createButton(i, i, i);
        if (i === currentPage) button.classList.add("active");
        button.classList.add("page-number");
        paginationContainer.appendChild(button);
      }

      if (endWindow < totalPages) {
        const nextGroupPage = endWindow + 1;
        const nextButton = createButton("NEXT", `NEXT &#x276F;`, nextGroupPage);
        nextButton.classList.add("page-next");
        paginationContainer.appendChild(nextButton);
      }
    }

    if (totalPages > 0) {
      displayCards(currentPage);
      renderPaginationButtons();
    }
  }

  /* =========================================================
      FILTER ORDER
  ========================================================= */
  const filterButtons = document.querySelectorAll(".filter-btn");
  const orderCards = document.querySelectorAll(".order-card");
  const mainContent = document.getElementById("main-content");

  const filterMap = {
    all: ["paid", "in-use", "overdue", "complete"],
    loaned: ["in-use", "overdue"],
    completed: ["complete"],
  };

  function applyFilter(filterName) {
    const validStatuses = filterMap[filterName];

    if (mainContent) {
      if (filterName === "all") {
        mainContent.classList.remove("view-loaned");
      } else {
        mainContent.classList.add("view-loaned");
      }
    }

    orderCards.forEach((card) => {
      const cardStatus = card.getAttribute("data-status");
      const shouldDisplay = filterName === "all" || validStatuses.includes(cardStatus);
      card.style.display = shouldDisplay ? "flex" : "none";
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      const filterName = this.id.split("-")[1];
      applyFilter(filterName);
    });
  });

  applyFilter("all");

  /* =========================================================
      PRODUCT PAGE — QTY INPUT
  ========================================================= */
  const qtyDisplay = document.querySelector(".qty-display");
  const qtyHidden = document.querySelector(".qty-hidden");
  const plus = document.querySelector(".plus-btn");
  const minus = document.querySelector(".minus-btn");
  const form = document.getElementById("productForm");

  if (qtyDisplay && plus && minus && form) {
    plus.addEventListener("click", () => {
      qtyDisplay.value = parseInt(qtyDisplay.value) + 1;
    });

    minus.addEventListener("click", () => {
      if (parseInt(qtyDisplay.value) > 1) {
        qtyDisplay.value = parseInt(qtyDisplay.value) - 1;
      }
    });

    form.addEventListener("submit", () => {
      qtyHidden.value = qtyDisplay.value;
    });
  }

  /* =========================================================
      FORM PAGE — AUTO TOTAL HARGA
  ========================================================= */
  const borrowDate = document.getElementById("borrowDate");
  const returnDate = document.getElementById("returnDate");
  const allTotal = document.getElementById("allTotal");

  if (borrowDate && returnDate && allTotal) {
    const price = Number(document.getElementById("price").dataset.price);
    const qty = Number(document.getElementById("qty").value);

    function hitungTotal() {
      if (!borrowDate.value || !returnDate.value) return;

      const start = new Date(borrowDate.value);
      const end = new Date(returnDate.value);

      const msPerDay = 1000 * 60 * 60 * 24;
      const selisih = Math.ceil((end - start) / msPerDay);

      if (selisih <= 0) {
        allTotal.value = "Tanggal salah";
        return;
      }

      const total = price * qty * selisih;
      allTotal.value = "Rp" + total.toLocaleString("id-ID");
    }

    borrowDate.addEventListener("change", hitungTotal);
    returnDate.addEventListener("change", hitungTotal);
  }

});
