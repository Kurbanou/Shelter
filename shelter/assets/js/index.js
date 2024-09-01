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
    const scrollPosition = window.scrollY;
    const homeSectionTop = homeSection.offsetTop;
    const homeSectionHeight = homeSection.offsetHeight;

    if (scrollPosition >= homeSectionTop && scrollPosition < homeSectionTop + homeSectionHeight) {
      header.classList.add('navbar');
    } else {
      header.classList.remove('navbar');
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
