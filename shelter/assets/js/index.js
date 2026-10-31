document.addEventListener('DOMContentLoaded', function () {
  const header = document.getElementById('header');
  const homeSection = document.getElementById('home');
  const headerOffset = 120;
  const burger = document.querySelector('.header__burger');
  const body = document.querySelector('body');
  const overlay = document.querySelector('.overlay-navigation');

  // --- Меню ---
  if (burger) {
    burger.addEventListener('click', toggleMenu);
  }

  if (overlay) {
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        toggleMenu();
      }
    });
  }

  if (header) {
    const links = header.querySelectorAll('li a');
    links.forEach(link => {
      link.addEventListener('click', function () {
        if (body.classList.contains('menu_open')) {
          toggleMenu();
        }
      });
    });
  }

  function toggleMenu() {
    return body.classList.toggle('menu_open');
  }

  // --- Скролл хедера ---
  function checkScrollPosition() {
    if (!homeSection || !header) return;
    const scrollPosition = window.scrollY;
    const homeSectionTop = homeSection.offsetTop;
    const homeSectionHeight = homeSection.offsetHeight;

    if (scrollPosition >= homeSectionTop && scrollPosition < homeSectionTop + homeSectionHeight) {
      header.classList.add('navbar');
    } else {
      header.classList.remove('navbar');
    }
  }

  // --- Коррекция прокрутки по якорю ---
  function adjustAnchorScroll() {
    if (!window.location.hash) return;
    const targetId = window.location.hash.substring(1);
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

    // replaceState вместо pushState — не засоряем историю и сохраняем search
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  checkScrollPosition();
  adjustAnchorScroll();

  window.addEventListener('scroll', checkScrollPosition);
  window.addEventListener('hashchange', adjustAnchorScroll);
});

// =====================================================================
// Слайдеры и пагинация
// =====================================================================

const leftBtn = document.querySelector('#left');
const rightBtn = document.querySelector('#right');
const slider1 = document.querySelector('#slider1');
const slider2 = document.querySelector('#slider2');
const first = document.querySelector('#first');
const btnLeft = document.querySelector('#btnLeft');
const numList = document.querySelector('#numList');
const btnRight = document.querySelector('#btnRight');
const last = document.querySelector('#last');

// Единое состояние модуля
const state = {
  petsData: [],       // текущий порядок для slider1
  petsData2: [],      // «бесконечная» лента для slider2
  combination: [],
  currentPage: 1,
  maxPages: 1,
};

// --- Утилиты ---
function rotateArrayRight(arr, n) {
  if (!arr.length) return arr.slice();
  n = n % arr.length;
  if (n === 0) return arr.slice();
  return arr.slice(-n).concat(arr.slice(0, -n));
}

function rotateArrayLeft(arr, n) {
  if (!arr.length) return arr.slice();
  n = n % arr.length;
  if (n === 0) return arr.slice();
  return arr.slice(n).concat(arr.slice(0, n));
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function createPetsData2(petsData) {
  const petsData2 = [];
  let currentPetsData = [...petsData];
  for (let i = 0; i < 6; i++) {
    petsData2.push(...currentPetsData);
    currentPetsData = rotateArrayRight(currentPetsData, 3);
  }
  return petsData2;
}

function getNumPetsForSlider(slider) {
  const screenWidth = window.innerWidth;
  if (slider === slider1) {
    if (screenWidth <= 767) return 1;
    if (screenWidth <= 1279) return 2;
    return 3;
  }
  if (slider === slider2) {
    if (screenWidth <= 767) return 3;
    if (screenWidth <= 1279) return 6;
    return 8;
  }
  return 0;
}

function createCart(pet) {
  return `
    <div class="pets_cart">
      <div class="foto_pet">
        <img src="${pet.img}" alt="foto pet">
      </div>
      <div class="name_pet">
        ${pet.name}
      </div>
      <button>Learn more</button>
    </div>
  `;
}

// --- Попап ---
function popupCreate(pet) {
  // не даём открыть второй попап
  const existing = document.querySelector('.popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.className = 'popup';
  popup.innerHTML = `
    <div class="popup_inner">
      <button id="close" class="round">x</button>
      <div class="popup_inner_img"><img src="${pet.img}" alt=""></div>
      <div class="popup_inner_content">
        <div class="popup_inner_content_name">${pet.name}</div>
        <div class="popup_inner_content_poroda">${pet.type} - ${pet.breed}</div>
        <div class="popup_inner_content_opisanie">${pet.description}</div>
        <div class="popup_inner_content_list">
          <li>Age: <span>${pet.age}</span></li>
          <li>Inoculations: <span>${pet.inoculations.join(', ')}</span></li>
          <li>Diseases: <span>${pet.diseases.join(', ')}</span></li>
          <li>Parasites: <span>${pet.parasites.join(', ')}</span></li>
        </div>
      </div>
    </div>`;

  document.body.classList.add('no-scroll');

  // fallback: если footer нет — в body
  const container = document.querySelector('footer') || document.body;
  container.appendChild(popup);

  popup.querySelector('#close').addEventListener('click', () => closePopup(popup));
  popup.addEventListener('click', (event) => {
    if (event.target === popup) closePopup(popup);
  });
}

function closePopup(popup) {
  document.body.classList.remove('no-scroll');
  popup.remove();
}

// --- Загрузка данных ---
async function loadPetsData() {
  try {
    const response = await fetch('/assets/js/petsBase.json');
    const data = await response.json();
    shuffleArray(data);
    return data;
  } catch (error) {
    console.error('Ошибка загрузки питомцев:', error);
    return [];
  }
}

// --- Рендер карточек ---
function displayPets(slider, petsData, numPets) {
  if (!slider) return;
  slider.innerHTML = '';
  const count = Math.min(numPets, petsData.length);
  for (let i = 0; i < count; i++) {
    const pet = petsData[i];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = createCart(pet);
    const cartElement = tempDiv.firstElementChild;
    cartElement.addEventListener('click', () => popupCreate(pet));
    slider.appendChild(cartElement);
  }
}

// --- Пересчёт страниц ---
function recalcMaxPages() {
  const perPage = getNumPetsForSlider(slider2);
  state.maxPages = perPage > 0 ? Math.max(1, Math.ceil(state.petsData2.length / perPage)) : 1;
  if (state.currentPage > state.maxPages) state.currentPage = state.maxPages;
}

// --- Обновление обоих слайдеров ---
function updatePetsDisplay() {
  const numPets1 = getNumPetsForSlider(slider1);
  const numPets2 = getNumPetsForSlider(slider2);

  if (slider1) displayPets(slider1, state.petsData, numPets1);

  if (slider2) {
    recalcMaxPages();
    const start = numPets2 * (state.currentPage - 1);
    const pageData = state.petsData2.slice(start, start + numPets2);
    displayPets(slider2, pageData, numPets2);
  }
}

// --- Пересборка petsData2 (после шаффла petsData) ---
function rebuildPetsData2() {
  state.petsData2 = createPetsData2(state.petsData);
  recalcMaxPages();
}

// --- Проверка комбинации l/r ---
function checkCombinationForShuffle() {
  if (state.combination.slice(-4).join('') === 'llrr') {
    shuffleArray(state.petsData);
    rebuildPetsData2();
    state.combination.length = 0;
    state.currentPage = 1;
    updatePetsDisplay();
  }
}

// --- Пагинация ---
function updatePaginationButtons() {
  if (!first || !btnLeft || !btnRight || !last) return;

  const isFirst = state.currentPage === 1;
  const isLast = state.currentPage === state.maxPages;

  first.classList.toggle('inactive', isFirst);
  btnLeft.classList.toggle('inactive', isFirst);
  btnRight.classList.toggle('inactive', isLast);
  last.classList.toggle('inactive', isLast);

  if (numList) numList.textContent = String(state.currentPage);
}

function goToPage(page) {
  const target = Math.min(Math.max(1, page), state.maxPages);
  if (target === state.currentPage) return;
  state.currentPage = target;
  updatePetsDisplay();
  updatePaginationButtons();
}

function goToFirstPage() {
  goToPage(1);
}

function goToLastPage() {
  goToPage(state.maxPages);
}

function goToPreviousPage() {
  goToPage(state.currentPage - 1);
}

function goToNextPage() {
  goToPage(state.currentPage + 1);
}

function initializePagination() {
  if (!first || !btnLeft || !numList || !btnRight || !last) return;

  state.currentPage = 1;
  recalcMaxPages();
  updatePaginationButtons();

  // снимаем возможные старые обработчики (на случай повторной инициализации)
  btnRight.removeEventListener('click', goToNextPage);
  last.removeEventListener('click', goToLastPage);
  first.removeEventListener('click', goToFirstPage);
  btnLeft.removeEventListener('click', goToPreviousPage);

  btnRight.addEventListener('click', goToNextPage);
  last.addEventListener('click', goToLastPage);
  first.addEventListener('click', goToFirstPage);
  btnLeft.addEventListener('click', goToPreviousPage);
}

// --- Ресайз ---
let resizeTimer = null;
function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    recalcMaxPages();
    updatePetsDisplay();
    updatePaginationButtons();
  }, 150);
}

// --- Точка входа ---
loadPetsData().then(petsData => {
  if (!petsData || !petsData.length) {
    console.warn('Список питомцев пуст или не загрузился');
    return;
  }

  state.petsData = petsData;
  state.petsData2 = createPetsData2(petsData);
  state.currentPage = 1;

  updatePetsDisplay();

  // стрелки slider1
  if (leftBtn && rightBtn) {
    leftBtn.addEventListener('click', () => {
      state.combination.push('l');
      state.petsData = rotateArrayLeft(state.petsData, getNumPetsForSlider(slider1));
      updatePetsDisplay();
      checkCombinationForShuffle();
    });

    rightBtn.addEventListener('click', () => {
      state.combination.push('r');
      state.petsData = rotateArrayRight(state.petsData, getNumPetsForSlider(slider1));
      updatePetsDisplay();
      checkCombinationForShuffle();
    });
  }

  // пагинация — сразу, не ждём window.load
  initializePagination();
  updatePetsDisplay();

  window.addEventListener('resize', handleResize);
}).catch(err => {
  console.error('Инициализация слайдеров не удалась:', err);
});
