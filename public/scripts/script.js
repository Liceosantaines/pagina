// reveal.js
document.addEventListener("DOMContentLoaded", function () {
  const reveals = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    }
  );

  reveals.forEach((el) => observer.observe(el));
});

// search.js
document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".search-wrapper");
  const btn = wrapper.querySelector(".search-toggle");
  const box = wrapper.querySelector(".search-box");

  // Toggle show/hide
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    box.classList.toggle("open");
    if (box.classList.contains("open")) {
      box.querySelector("input").focus();
    }
  });

  // Clic dentro no cierra
  box.addEventListener("click", (e) => e.stopPropagation());

  // Clic fuera cierra
  document.addEventListener("click", () => {
    if (box.classList.contains("open")) {
      box.classList.remove("open");
    }
  });

  // Escape cierra
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && box.classList.contains("open")) {
      box.classList.remove("open");
    }
  });
});

// Espera a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  // 1) Seleccionamos todos los enlaces del menú
  const links = document.querySelectorAll(".nav-menu .letra-menu");

  // 2) Añadimos un listener de 'click' a cada enlace
  links.forEach((link) => {
    link.addEventListener("click", function (event) {
      // Si no quieres que al hacer click baje al ancla, descomenta la siguiente línea:
      // event.preventDefault();

      // 3) Quitamos la clase 'active' de todos los enlaces
      links.forEach((l) => l.classList.remove("active"));

      // 4) Añadimos la clase 'active' solo al enlace clicado
      this.classList.add("active");
    });
  });
});

// scripts/boletines.js
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("periodos-grid");

  fetch("boletines-data.json")
    .then((res) => res.json())
    .then((data) => {
      console.log("Datos cargados:", data); // <-- para depurar en consola

      const { periodos, niveles, boletines } = data;

      Object.entries(periodos).forEach(([pid, pName]) => {
        // Crear tarjeta de periodo
        const card = document.createElement("div");
        card.className = "periodo-card";
        card.innerHTML = `
          <h3>${pName}</h3>
          <ul class="niveles-list"></ul>
        `;
        const ul = card.querySelector(".niveles-list");

        // Para cada nivel
        Object.entries(niveles).forEach(([slug, label]) => {
          const li = document.createElement("li");
          const listaNivel = boletines[pid] && boletines[pid][slug];
          if (Array.isArray(listaNivel) && listaNivel.length > 0) {
            // Si hay al menos un boletín, creamos enlace
            li.innerHTML = `<a href="viewer.html?periodo=${pid}&nivel=${encodeURIComponent(
              slug
            )}"
                                class="niveles-link">${label}</a>`;
          } else {
            // Si no, lo marcamos deshabilitado
            li.innerHTML = `<span class="niveles-disabled">${label}</span>`;
          }
          ul.appendChild(li);
        });

        grid.appendChild(card);
      });
    })
    .catch((err) => {
      console.error("Error al leer JSON:", err);
      grid.innerHTML =
        '<p class="error">No se pudieron cargar los boletines.</p>';
    });
});

// scripts/viewer.js
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const periodo = params.get("periodo");
  const nivel = params.get("nivel");

  fetch("boletines-data.json")
    .then((res) => res.json())
    .then((data) => {
      const { periodos, niveles, boletines } = data;
      const lista = boletines[periodo]?.[nivel] || [];

      // Pone el título dinámico
      const title = document.getElementById("viewer-title");
      title.textContent = lista.length
        ? `Boletines ${niveles[nivel]} – ${periodos[periodo]}`
        : "No hay boletines disponibles";

      const grid = document.getElementById("boletines-grid");
      if (!lista.length) {
        grid.innerHTML =
          '<p class="error">No hay archivos para este nivel.</p>';
        return;
      }

      // lista.forEach(item => {
      //   const card = document.createElement('div');
      //   card.className = 'boletin-card';
      //   card.innerHTML = `
      //     <div class="icon-pdf">
      //       <img src="images/pdf-icon.png" alt="PDF" />
      //     </div>
      //     <h3 class="alumno-name">${item.nombre}</h3>
      //     <a href="${item.file}" class="btn-download" download>
      //       Descargar
      //     </a>
      //     <p class="file-info">${item.size}</p>
      //   `;
      //   grid.appendChild(card);
      // });

      lista.forEach((item) => {
        const card = document.createElement("div");
        card.className = "boletin-card";

        // Crear contenido HTML base sin el botón
        card.innerHTML = `
    <div class="icon-pdf">
      <img src="images/pdf-icon.png" alt="PDF" />
    </div>
    <h3 class="alumno-name">${item.nombre}</h3>
    <p class="file-info">${item.size}</p>
  `;

        // Crear el botón con evento que pide la clave
        const downloadBtn = document.createElement("button");
        downloadBtn.className = "btn-download";
        downloadBtn.textContent = "Descargar";

        downloadBtn.addEventListener("click", () => {
          const claveIngresada = prompt("🔒 Ingresa la clave del boletín:");
          if (claveIngresada === item.clave) {
            const tempLink = document.createElement("a");
            tempLink.href = item.file;
            tempLink.download = "";
            tempLink.target = "_blank";
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
          } else {
            alert("❌ Clave incorrecta. Intenta nuevamente.");
          }
        });

        // Agrega el botón a la tarjeta
        card.appendChild(downloadBtn);
        grid.appendChild(card);
      });
    })
    .catch((err) => console.error(err));
});

const slides = document.querySelectorAll(".slide");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
let currentSlide = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove("active");
  });
  slides[index].classList.add("active");
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
}

nextBtn.addEventListener("click", nextSlide);
prevBtn.addEventListener("click", prevSlide);

// Slide automático cada 6 segundos
setInterval(nextSlide, 6000);

document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".maestros-carousel");
  const cards = document.querySelectorAll(".maestro-card");
  const cardWidth = cards[0].offsetWidth + 32;
  let currentIndex = 0;
  let autoPlay;

  // Función simplificada
  const moveToCard = (index) => {
    currentIndex = Math.max(0, Math.min(index, cards.length - 1));
    carousel.scrollTo({
      left: currentIndex * cardWidth,
      behavior: "smooth",
    });
    resetAutoplay();
  };

  // Autoplay más rápido
  const startAutoplay = () => {
    autoPlay = setInterval(() => {
      moveToCard(currentIndex + 1);
    }, 15000); // 3 segundos
  };

  const resetAutoplay = () => {
    clearInterval(autoPlay);
    startAutoplay();
  };

  // Eventos básicos
  document
    .querySelector(".prev")
    .addEventListener("click", () => moveToCard(currentIndex - 1));
  document
    .querySelector(".next")
    .addEventListener("click", () => moveToCard(currentIndex + 1));

  // Iniciar
  startAutoplay();

  // Detener autoplay al interactuar
  carousel.addEventListener("mouseenter", () => clearInterval(autoPlay));
  carousel.addEventListener("mouseleave", startAutoplay);
});
