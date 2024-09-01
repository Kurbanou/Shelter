
document.addEventListener('DOMContentLoaded', function() {
  const header = document.getElementById('header');
  const homeSection = document.getElementById('home');
  const headerOffset = 120; // Смещение на 100px
  const burger = document.querySelector('.header__burger');
  const body = document.querySelector('body');
  const links = header.querySelectorAll('li a'); // Изменено на 'a', предполагая, что ссылки находятся в 'li'
  const overlay = document.querySelector('.overlay-navigation');

  function toggleMenu() {
    return body.classList.toggle('menu_open');
  }

  // Добавляем обработчики событий для открытия/закрытия меню
  burger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', function(event) {
    if (event.target === overlay) {
      toggleMenu();
    }
  });

  // Добавляем обработчики событий для всех ссылок меню
  links.forEach(link => {
    link.addEventListener('click', function(event) {
      if (body.classList.contains('menu_open')) {
        toggleMenu();
      }
    });
  });

  // Функция для проверки положения прокрутки и добавления/удаления класса
  function checkScrollPosition() {
    if (homeSection){
      const scrollPosition = window.scrollY;
      const homeSectionTop = homeSection.offsetTop;
      const homeSectionHeight = homeSection.offsetHeight;
  
      if (scrollPosition >= homeSectionTop && scrollPosition < homeSectionTop + homeSectionHeight) {
        header.classList.add('navbar');
      } else {
        header.classList.remove('navbar');
      }

    }
   
  }

  // Функция для коррекции прокрутки на высоту header
  function adjustAnchorScroll() {
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Удаляем хеш из URL после прокрутки, чтобы избежать смещения при повторном клике
        history.pushState(null, null, window.location.pathname);
      }
    }
  }

  // Вызываем функции при загрузке страницы и при прокрутке
  checkScrollPosition(); // Проверяем положение при загрузке страницы
  adjustAnchorScroll(); // Корректируем прокрутку при загрузке страницы

  window.addEventListener('scroll', checkScrollPosition); // Отслеживаем прокрутку
  window.addEventListener('hashchange', adjustAnchorScroll); // Корректируем прокрутку при смене якоря
});
//+++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++
const leftBtn = document.querySelector('#left');
const rightBtn = document.querySelector('#right');
const slider1 = document.querySelector('#slider1');
const slider2 = document.querySelector('#slider2');
const first = document.querySelector('#first');
const btnLeft = document.querySelector('#btnLeft');
const numList = document.querySelector('#numList');
const btnRight = document.querySelector('#btnRight');
const last = document.querySelector('#last');
let numberPage = 1;
let combination = [];

// Функция для перемещения первых n элементов массива в конец
function rotateArrayRight(arr, n) { 
  const rotatedPart = arr.slice(0, n);
  const remainingPart = arr.slice(n);  
  return remainingPart.concat(rotatedPart);
}

// Функция для перемещения последних n элементов массива в начало
function rotateArrayLeft(arr, n) { 
  const rotatedPart = arr.slice(-n);
  const remainingPart = arr.slice(0, -n);  
  return rotatedPart.concat(remainingPart);
}

// Функция для перемешивания массива
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Функция для создания массива второго слайдера
function createPetsData2(petsData) {
  const petsData2 = [];
  let currentPetsData = [...petsData]; // Копируем исходный массив

  for (let i = 0; i < 6; i++) {
    // Копируем текущий массив в petsData2
    petsData2.push(...currentPetsData);
    // Ротируем массив
    currentPetsData = rotateArrayRight(currentPetsData, 3);
  }

  return petsData2;
}


// Функция для определения количества карточек на первом слайдере
function getNumPetsForSlider(slider) {
  const screenWidth = window.innerWidth;
  if (slider === slider1) {
    if (screenWidth <= 767) {
      return 1;
    } else if (screenWidth <= 1279) {
      return 2;
    } else {
      return 3;
    }  
  }
  if (slider === slider2) {
    if (screenWidth <= 767) {
      return 3;
    } else if (screenWidth <= 1279) {
      return 6;
    } else {
      return 8;
    }  
  }
}

// Функция создания карточки питомца
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

// Функция попапа
function popupCreate(pet) {
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

  // Блокируем скролл страницы при открытии попапа
  document.body.classList.add('no-scroll');

  document.querySelector('footer').appendChild(popup);

  // Закрытие по клику на кнопку "x"
  document.querySelector('#close').addEventListener('click', () => {
    closePopup(popup);
  });

  // Закрытие по клику вне области popup_inner
  popup.addEventListener('click', (event) => {
    if (event.target === popup) {
      closePopup(popup);
    }
  });
}

function closePopup(popup) {
  // Убираем блокировку скролла при закрытии попапа
  document.body.classList.remove('no-scroll');
  popup.remove();
}

async function loadPetsData() {
  try {
    const response = await fetch('../shelter/assets/js/petsBase.json');
    const data = await response.json();
    shuffleArray(data);    
    return data;
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

function displayPets(slider, petsData, numPets) {
  slider.innerHTML = '';
  for (let i = 0; i < numPets; i++) {
    const pet = petsData[i];
    const cartHTML = createCart(pet);
    
    // Создаем временный контейнер для карточки
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cartHTML;
    
    const cartElement = tempDiv.firstElementChild;

    // Добавляем обработчик клика на карточку
    cartElement.addEventListener('click', () => {
      popupCreate(pet);
    });

    // Добавляем карточку в слайдер
    slider.appendChild(cartElement);
  }
}


// Функция для обновления отображения питомцев на слайдерах
function updatePetsDisplay(petsData, petsData2) {
  const numPets1 = getNumPetsForSlider(slider1);
  const numPets2 = getNumPetsForSlider(slider2);

  if (slider1) {
    displayPets(slider1, petsData, numPets1);
  }
  if (slider2) {  
    displayPets(slider2, petsData2, numPets2);
  }
}

function checkCombinationForShuffle(combination) {
  if (combination.slice(-4).join('') === 'llrr') {
    shuffleArray(window.petsData);
    console.log('получили новый набор карточек');
    combination.length = 0; // Очистка комбинации
  }
}


// Загрузка данных и обновление отображения
loadPetsData().then(petsData => {
  if (petsData) {
    window.petsData = petsData;

    // Создаем массив petsData2 на основе перемешивания petsData
    const petsData2 = createPetsData2(petsData);

    // Обновляем отображение слайдеров
    updatePetsDisplay(petsData, petsData2);

    // Добавляем обработчик для изменения размера окна
    window.addEventListener('resize', () => updatePetsDisplay(petsData, petsData2));



  // Добавляем обработчики событий для кнопок
  if (leftBtn && rightBtn) {
    leftBtn.addEventListener('click', () => {
      combination.push('l');
      checkCombinationForShuffle(combination);
      window.petsData = rotateArrayLeft(window.petsData, getNumPetsForSlider(slider1));
      updatePetsDisplay(window.petsData);
    });

    rightBtn.addEventListener('click', () => {
      combination.push('r');
      checkCombinationForShuffle(combination);
      window.petsData = rotateArrayRight(window.petsData, getNumPetsForSlider(slider1));
      updatePetsDisplay(window.petsData);
    });
  }

  const first = document.querySelector('#first');
  const btnLeft = document.querySelector('#btnLeft');
  const numList = document.querySelector('#numList');
  const btnRight = document.querySelector('#btnRight');
  const last = document.querySelector('#last');
  maxPages = petsData2.length/getNumPetsForSlider(slider2); 
  window.addEventListener('resize', ()=>{
    maxPages = petsData2.length/getNumPetsForSlider(slider2);   
  })


  if (first && btnLeft && numList && btnRight &&last) {
    // Функция, которая будет выполнять настройку элементов при загрузке страницы
  function initializePagination() {
    console.log(petsData2)
    // Устанавливаем класс 'inactive' для кнопок first и btnLeft
    first.classList.add('inactive');
    btnLeft.classList.add('inactive');  

    // Устанавливаем значение текущей страницы в numList
    numList.textContent = '1';

    // Делаем кнопки btnRight и last активными, так как мы на первой странице
    btnRight.classList.remove('inactive');
    last.classList.remove('inactive');

    // Назначаем обработчики событий на кнопки
    btnRight.addEventListener('click', goToNextPage);
    last.addEventListener('click', goToLastPage);
    first.addEventListener('click', goToFirstPage);
    btnLeft.addEventListener('click', goToPreviousPage);

  }

  // Функция для перехода на предыдущую страницу
  function goToPreviousPage() {
    let currentPage = parseInt(numList.textContent);
 

    if (currentPage > 1) {
        currentPage--;
        numList.textContent = currentPage;
        updatePetsDisplay(petsData, petsData2.slice(getNumPetsForSlider(slider2)*(currentPage-1)))      

        // Если мы на первой странице, делаем first и btnLeft неактивными
        if (currentPage === 1) {
            first.classList.add('inactive');
            btnLeft.classList.add('inactive');
            updatePetsDisplay(petsData, petsData2)
        }

        // Если мы перешли с последней страницы, делаем btnRight и last активными
        if (currentPage < maxPages) {
            btnRight.classList.remove('inactive');
            last.classList.remove('inactive');
        }
    }
  }

  // Функция для перехода на следующую страницу
  function goToNextPage() {
    let currentPage = parseInt(numList.textContent);

    if(!btnRight.classList.contains('inactive')){
      updatePetsDisplay(petsData, petsData2.slice(getNumPetsForSlider(slider2)*(currentPage)));  
    }

    if (currentPage < maxPages) {
        currentPage++;
        numList.textContent = currentPage;


        // Если мы на последней странице, делаем btnRight и last неактивными
        if (currentPage === maxPages) {
            btnRight.classList.add('inactive');
            last.classList.add('inactive');
        }

        // Если мы перешли со страницы 1, делаем first и btnLeft активными
        if (currentPage > 1) {
            first.classList.remove('inactive');
            btnLeft.classList.remove('inactive');
        }
    }
    
  }

  // Функция для перехода на последнюю страницу
  function goToLastPage() {
    if(!last.classList.contains('inactive')){
      updatePetsDisplay(petsData, petsData2.slice(-petsData2.length/maxPages));      
    } 
    numList.textContent = maxPages;

      // Делаем btnRight и last неактивными, так как мы на последней странице
    btnRight.classList.add('inactive');
    last.classList.add('inactive');

    // Делаем first и btnLeft активными
    first.classList.remove('inactive');
    btnLeft.classList.remove('inactive');
  }

  // Функция для перехода на первую страницу
  function goToFirstPage() {

    if(!first.classList.contains('inactive')){
      updatePetsDisplay(petsData, petsData2);      
    }  
    numList.textContent = '1';  

    // Делаем first и btnLeft неактивными, так как мы на первой странице
    first.classList.add('inactive');
    btnLeft.classList.add('inactive');

    // Делаем btnRight и last активными
    btnRight.classList.remove('inactive');
    last.classList.remove('inactive');
     
  }
  
    // Вызываем функцию initializePagination при загрузке страницы
    window.addEventListener('load', initializePagination);   
    
    window.addEventListener('resize', () => {
      maxPages = Math.ceil(petsData2.length / getNumPetsForSlider(slider2));  
      const currentPage = parseInt(numList.textContent);
    
      // Если текущая страница больше новой максимальной страницы, переходим на последнюю доступную
      if (currentPage > maxPages) {
        goToLastPage();
      } else {
        // Обновляем отображение текущей страницы
        updatePetsDisplay(petsData, petsData2.slice(getNumPetsForSlider(slider2) * (currentPage - 1)));
      }
    
      // Обновляем состояние кнопок пагинации
      if (currentPage === 1) {
        first.classList.add('inactive');
        btnLeft.classList.add('inactive');
        btnRight.classList.remove('inactive');
        last.classList.remove('inactive');
      } else if (currentPage === maxPages) {
        first.classList.remove('inactive');
        btnLeft.classList.remove('inactive');
        btnRight.classList.add('inactive');
        last.classList.add('inactive');
      } else {
        first.classList.remove('inactive');
        btnLeft.classList.remove('inactive');
        btnRight.classList.remove('inactive');
        last.classList.remove('inactive');
      }
    });
    
  }
      
}})