import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const brandName = "NŪRA";
const brandEmail = "hello@nura.restaurant";
const fontsHref =
  "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Prata&display=swap";
const overrideHref = "/city/assets/nura-media/brand/nura-overrides.css";
const faviconHref = "/city/assets/nura-media/brand/nura-favicon.svg";

const remoteImages = [
  "https://images.unsplash.com/photo-1745761320291-9fedcc9cf1c0?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1666633097112-3aa2c11ce34f?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1769515376350-bcff86d49499?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1642165515377-d70233b83b00?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1765341448915-856e14ffa1e6?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1768836180164-070b4c1a8f94?auto=format&fit=crop&w=1600&q=80",
];

const localVideos = [
  "/city/assets/nura-media/videos/restaurant-canal.mp4",
  "/city/assets/nura-media/videos/terrace-cafe.mp4",
  "/city/assets/nura-media/videos/bartender-shaking.mp4",
  "/city/assets/nura-media/videos/bartender-shaker.mp4",
  "/city/assets/nura-media/videos/chef-cooking.mp4",
  "/city/assets/nura-media/videos/dinner-party.mp4",
  "/city/assets/nura-media/videos/tasty-pizza.mp4",
];

const experiencePriceMap = new Map([
  ["/experiences/walk-in-the-footsteps-of-emily", "4 000 сом"],
  ["/experiences/croissant-making-workshop", "4 800 сом"],
  ["/experiences/macaron-making-workshop", "3 900 сом"],
  ["/experiences/champagne-seine-cruise", "4 900 сом"],
  ["/experiences/food-tour", "7 500 сом"],
  ["/experiences/montmartre-tour", "5 500 сом"],
  ["/experiences/wine-cheese-tasting", "12 000 сом"],
]);

const commonReplacements = [
  ["Paris by Emily", brandName],
  ["Emily in Paris", brandName],
  ["Official travel brand of Emily in Paris", "Авторский ресторан с камерной атмосферой"],
  ["Seek Dharma Limited", brandName],
  ["bonjour@parisbyemily.com", brandEmail],
  ["Menu", "Меню"],
  ["Shuffle", "Сменить"],
  ["Use promo code LOVEFOOD for 20% off!", "Шефский стол открыт по предварительному бронированию."],
  ["View Experiences", "Смотреть форматы"],
  ["Book Now", "Забронировать"],
  ["Discover Cities", "Разделы"],
  ["Home", "Главная"],
  ["Experiences", "Форматы"],
  ["Prive", "Ужин"],
  ["Gift Cards", "Подарок"],
  ["Blog", "Журнал"],
  ["Contact", "Контакты"],
  ["Privacy Policy", "Конфиденциальность"],
  ["Discover Paris", brandName],
  ["Hello world", "Новый гастрономический сезон"],
  ["Explore More", "Подробнее"],
  ["Explore at your own pace", "Откройте вечер в своём ритме"],
  ["Discover experiences", "Выберите формат"],
  ["WALL OF LOVE", "ОТЗЫВЫ"],
  ["WALLOFLOVE", "ГОСТИ О НАС"],
  ["What guests are saying", "Отзывы гостей"],
  ["Other experiences", "Другие форматы"],
  ["ARTICLE", "СТАТЬЯ"],
  ["ARTICLES", "ИСТОРИИ"],
  ["Article", "Статья"],
  ["DISCOVER", "ФОРМАТЫ"],
  ["IN PARIS", "В NŪRA"],
  ["Designed for you, by Emily", "Под ваш вечер"],
  ["Navigation", "Навигация"],
  ["City", "Пространство"],
  ["Social", "Соцсети"],
  ["We respect your", "Мы уважаем вашу"],
  ["privacy", "конфиденциальность"],
  ["January 2026", "Апрель 2026"],
  ["March 2026", "Май 2026"],
  ["From", "От"],
  ["Hours", "ч"],
  ["Boat Cruise", "Терраса"],
  ["Tours", "Ужин"],
  ["Workshops", "Сет"],
  ["United Kingdom", "Великобритания"],
  ["United States", "США"],
  ["Netherlands", "Нидерланды"],
  ["France", "Франция"],
  ["Walk in the footsteps of Emily", "Ужин у открытой кухни"],
  ["Croissant-Making Workshop", "Поздний бранч"],
  ["Macaron-Making Workshop", "Десертный сет"],
  ["Champagne Seine Cruise", "Коктейли на террасе"],
  ["Food Tour", "Шефский стол"],
  ["Montmartre Tour", "Винный ужин"],
  ["Wine, Cheese & Butter Tasting", "Приватный ужин"],
  [
    "Valentine’s Day in Paris: Live Your Emily in Paris Love Story",
    "Романтический вечер в NŪRA: как забронировать лучший стол",
  ],
  [
    "The Ultimate Emily in Paris Itinerary: What to Do in Paris in 1, 2, or 3 Days",
    "Первый визит в NŪRA: что заказывать из кухни и бара",
  ],
  [
    "Where Was Emily in Paris Filmed? Your Guide to Iconic Locations You Can Visit",
    "Как мы собираем дегустационный сет: сезон, текстуры, подача",
  ],
  [
    "Why This Tour is a Must-Do for Fans of Emily, Paris, or Just a Really Good Time",
    "Почему гости возвращаются на шефский стол снова",
  ],
];

const globalFaq = [
  [
    "Нужно ли бронировать заранее?",
    `<p>Да, мы советуем бронировать стол минимум за 24 часа. Для шефского стола и приватных ужинов лучше оставлять заявку за 2-3 дня.</p>`,
  ],
  [
    "Есть ли вегетарианские и безалкогольные опции?",
    `<p>Да, команда ${brandName} подбирает альтернативы по запросу. Сообщите о предпочтениях при бронировании, и мы подготовим комфортный сет.</p>`,
  ],
  [
    "Можно ли изменить время бронирования?",
    `<p>Да. Напишите нам на <a href="mailto:${brandEmail}">${brandEmail}</a>, и мы предложим ближайшие доступные слоты.</p>`,
  ],
  [
    "Подходит ли формат для небольших праздников?",
    `<p>Да, камерные дни рождения, ужины с друзьями и деловые встречи мы собираем в отдельный сценарий с персональной подачей и сервисом.</p>`,
  ],
  [
    "Есть ли дресс-код?",
    `<p>Строгого дресс-кода нет. Мы рекомендуем smart casual, чтобы атмосфера вечера ощущалась цельно и расслабленно.</p>`,
  ],
  [
    "Как с вами связаться?",
    `<p>Напишите нам на <a href="mailto:${brandEmail}">${brandEmail}</a>. Мы ответим по бронированию, меню и приватным запросам.</p>`,
  ],
];

const detailTestimonials = [
  ["Это был редкий случай, когда сервис, свет и еда работают как одно целое. Очень камерно и очень вкусно.", "Айгерим, Бишкек"],
  ["Шефский комментарий к подаче и спокойный темп вечера сделали ужин действительно особенным.", "Мария, Алматы"],
  ["Пришли на один формат, а в итоге захотели вернуться ещё и на бранч. У места очень сильный характер.", "Илья, Москва"],
];

const homeTestimonials = [
  ["Очень красивый ритм вечера: сначала коктейль, потом сет, потом десерт и музыка. Всё на своём месте.", "Асель, Бишкек"],
  ["Редкое место, где интерьер не спорит с кухней, а усиливает её. Вернёмся на винный ужин.", "Динара, Алматы"],
  ["Забронировали поздний бранч, а в итоге остались почти до закрытия. Атмосфера действительно цепляет.", "Руслан, Астана"],
];

const experiencePages = {
  "experiences/food-tour/index.html": {
    title: "Шефский стол",
    category: "Дегустация",
    summary:
      "Интимный дегустационный ужин у сервиса с комментариями команды кухни и персональной подачей каждого курса.",
    pills: ["Дегустация", "2.5 ч", "От 7 500", "7 подач", "Пейринг", "Личный сервис"],
    bodyHeading: "Ужин, который разворачивается у вас на глазах",
    body: `
      <h2>Шефский стол</h2>
      <p>Это самый близкий к кухне формат ${brandName}. Вы оказываетесь у сервиса, наблюдаете за финальной сборкой блюд и слышите короткие комментарии команды о продукте, технике и логике курса.</p>
      <p>Темп ужина намеренно неспешный: каждая подача успевает раскрыться, а pairing подчёркивает текстуры и кислотность, не перегружая вкус.</p>
      <ul>
        <li>7 курсов с акцентом на сезонные продукты и чистую подачу</li>
        <li>Личный контакт с командой кухни и сервиса</li>
        <li>Возможность адаптировать сет под ограничения по питанию</li>
      </ul>
    `,
    metaDescription:
      "Шефский стол в NŪRA Restaurant: авторский дегустационный ужин, 7 подач, pairing и близкий контакт с кухней.",
  },
  "experiences/walk-in-the-footsteps-of-emily/index.html": {
    title: "Ужин у открытой кухни",
    category: "Ужин",
    summary:
      "Наблюдайте за работой команды, пробуйте сезонные закуски и завершайте вечер авторским десертом в сердце NŪRA.",
    pills: ["Ужин", "2 ч", "От 5 900", "5 подач", "Приветственный коктейль", "Открытая кухня"],
    bodyHeading: "Неспешный гастрономический сценарий",
    body: `
      <h2>Ужин у открытой кухни</h2>
      <p>Формат для тех, кто любит видеть движение кухни, но хочет сохранить спокойный ритм зала. Вы сидите близко к сервису, а команда ведёт вечер мягко и без лишней театральности.</p>
      <p>В меню входят небольшие сезонные курсы, тёплые закуски, один основной акцент и финальный десерт с мягким цитрусовым профилем.</p>
      <ul>
        <li>Посадка у открытой кухни</li>
        <li>Сезонные курсы с акцентом на локальный продукт</li>
        <li>Фирменный welcome drink в начале ужина</li>
      </ul>
    `,
    metaDescription:
      "Ужин у открытой кухни в NŪRA Restaurant: сезонные подачии, авторский десерт и спокойная камерная атмосфера.",
  },
  "experiences/croissant-making-workshop/index.html": {
    title: "Поздний бранч",
    category: "Бранч",
    summary:
      "Неспешный формат выходного дня с свежей выпечкой, фермерскими продуктами и живой музыкой по выходным.",
    pills: ["Бранч", "2 ч", "От 4 800", "6 подач", "Фильтр-кофе", "Живая музыка"],
    bodyHeading: "Позднее утро в ритме NŪRA",
    body: `
      <h2>Поздний бранч</h2>
      <p>Этот формат мы собирали как мягкое продолжение выходного дня: аромат свежей выпечки, яичные блюда, фермерские сыры и аккуратная кофейная карта без спешки.</p>
      <p>Бранч подходит и для встреч с друзьями, и для спокойного соло-визита, когда хочется провести пару часов в красивом, тихом ритме.</p>
      <ul>
        <li>6 подач с акцентом на выпечку и сезонные продукты</li>
        <li>Фильтр-кофе или чайная пара включены</li>
        <li>В выходные вечера формат сопровождается живой музыкой</li>
      </ul>
    `,
    metaDescription:
      "Поздний бранч в NŪRA Restaurant: выпечка, кофе, сезонные продукты и спокойная атмосфера выходного дня.",
  },
  "experiences/macaron-making-workshop/index.html": {
    title: "Десертный сет",
    category: "Десерт",
    summary:
      "Шесть мини-подач с текстурами карамели, цитруса и шоколада, собранные как финальный аккорд большого ужина.",
    pills: ["Десерт", "1.5 ч", "От 3 900", "6 мини-подач", "Чайная пара", "Сладкий бокс"],
    bodyHeading: "Сладкий финал без банальности",
    body: `
      <h2>Десертный сет</h2>
      <p>Мы собрали этот формат для гостей, которые приходят именно за тонкой работой с текстурами. Воздух, карамель, кислинка, шоколад и лёгкая горечь здесь развиваются последовательно, без перегруза.</p>
      <p>Десертный сет хорош как самостоятельный визит поздним вечером или как мягкое продолжение ужина в барной зоне.</p>
      <ul>
        <li>6 мини-подач с авторской подачей</li>
        <li>Чайная пара или безалкогольный pairing</li>
        <li>Небольшой сладкий gift box в конце вечера</li>
      </ul>
    `,
    metaDescription:
      "Десертный сет в NŪRA Restaurant: шесть мини-подач, чайное сопровождение и тонкая работа с текстурами.",
  },
  "experiences/champagne-seine-cruise/index.html": {
    title: "Коктейли на террасе",
    category: "Терраса",
    summary:
      "Золотой час, сезонные миксы и лёгкие закуски на открытой террасе с видом на городские огни.",
    pills: ["Терраса", "2 ч", "От 4 900", "4 коктейля", "Барные снеки", "Sunset-сет"],
    bodyHeading: "Вечерний свет, бар и лёгкий шум города",
    body: `
      <h2>Коктейли на террасе</h2>
      <p>Этот формат построен вокруг золотого часа: сначала один яркий приветственный микс, затем два сезонных коктейля и лёгкие тарелки, которые не отвлекают от разговора.</p>
      <p>Терраса открыта для неспешных встреч, предужинных аперитивов и длинных вечеров, когда хочется остаться в ритме города, но чуть выше его шума.</p>
      <ul>
        <li>4 коктейля с сезонными ингредиентами</li>
        <li>Сет лёгких барных закусок</li>
        <li>Лучший формат для закатного бронирования</li>
      </ul>
    `,
    metaDescription:
      "Коктейли на террасе в NŪRA Restaurant: сезонные миксы, sunset-сет и лёгкие закуски на открытом воздухе.",
  },
  "experiences/montmartre-tour/index.html": {
    title: "Винный ужин",
    category: "Вино",
    summary:
      "Пять авторских блюд и продуманное pairing-меню с акцентом на натуральные и классические вина.",
    pills: ["Вино", "2 ч", "От 5 500", "5 курсов", "Сомелье", "Пейринг"],
    bodyHeading: "Вино как ритм всего ужина",
    body: `
      <h2>Винный ужин</h2>
      <p>Формат, где каждая подача строится вокруг бокала: кислотность, температура и фактура блюда считываются через pairing, а не спорят с ним.</p>
      <p>Команда работает как единый сервис: сомелье задаёт темп, кухня отвечает текстурами, а зал удерживает камерность без формального напряжения.</p>
      <ul>
        <li>5 авторских блюд</li>
        <li>Pairing-меню с натуральными и классическими винами</li>
        <li>Короткие комментарии сомелье по каждому бокалу</li>
      </ul>
    `,
    metaDescription:
      "Винный ужин в NŪRA Restaurant: пять курсов, pairing-меню и комментарии сомелье к каждому бокалу.",
  },
  "experiences/wine-cheese-tasting/index.html": {
    title: "Приватный ужин",
    category: "Приватно",
    summary:
      "Закрытый зал для камерных ужинов, праздников и деловых встреч с персональным сценарием вечера.",
    pills: ["Приватно", "3 ч", "От 12 000", "Отдельный зал", "Персональное меню", "Команда сервиса"],
    bodyHeading: "Когда нужен свой темп и свой зал",
    body: `
      <h2>Приватный ужин</h2>
      <p>Мы открываем отдельное пространство для дней рождения, камерных праздников, приватных дегустаций и деловых ужинов. Сценарий вечера подстраивается под повод: от welcome-зоны до финального десерта.</p>
      <p>Команда заранее собирает меню, ритм подач и музыкальный фон, чтобы пространство ощущалось цельным именно для вашей компании.</p>
      <ul>
        <li>Отдельный зал и персональный сервис</li>
        <li>Индивидуальное меню и сценарий вечера</li>
        <li>Подходит для праздников, деловых встреч и камерных событий</li>
      </ul>
    `,
    metaDescription:
      "Приватный ужин в NŪRA Restaurant: отдельный зал, персональное меню и камерный формат для событий и встреч.",
  },
};

const blogPages = {
  "blog/valentines-day-in-paris-live-your-emily-in-paris-love-story/index.html": {
    title: "Романтический вечер в NŪRA: как забронировать лучший стол",
    summary:
      "Как выбрать время, зону и формат, если вы планируете вечер на двоих в NŪRA Restaurant.",
    metaDescription:
      "Романтический вечер в NŪRA Restaurant: лучшие слоты, формат ужина и атмосфера для бронирования на двоих.",
    body: `
      <p>У романтического ужина в <strong>${brandName}</strong> есть три главных элемента: правильное время, спокойный стол и сценарий вечера без суеты. Мы советуем бронировать ранний вечер, если хотите мягкий свет и размеренный темп, и поздний слот, если важнее бар и длинный after-dinner разговор.</p>
      <h3>1. Выберите зону под настроение</h3>
      <p>Для камерного разговора лучше подходят столы ближе к залу. Если хочется динамики и ощущения, что вечер разворачивается прямо перед вами, берите посадку ближе к сервису или формату шефского стола.</p>
      <h3>2. Не перегружайте заказ</h3>
      <p>Лучше взять два-три курса и хороший десерт, чем пытаться попробовать всё сразу. Важнее ритм и баланс, а не количество тарелок.</p>
      <h3>3. Сообщите о поводе заранее</h3>
      <p>Если вы празднуете дату, делаете сюрприз или хотите особую подачу десерта, напишите нам при бронировании. Мы аккуратно встроим это в сервис, не нарушая атмосферу вечера.</p>
    `,
  },
  "blog/the-ultimate-emily-in-paris-itinerary-what-to-do-in-paris-in-1-2-or-3-days/index.html": {
    title: "Первый визит в NŪRA: что заказывать из кухни и бара",
    summary:
      "Короткий гид по первому визиту: с чего начать, как собрать ужин и какие форматы выбрать в зависимости от настроения.",
    metaDescription:
      "Первый визит в NŪRA Restaurant: что попробовать из кухни, бара и десертов, чтобы почувствовать характер места.",
    body: `
      <p>Если вы приходите в <strong>${brandName}</strong> впервые, начните с формата, который раскрывает характер места без перегруза: один стартовый коктейль, две контрастные подачи и десерт в финале. Так лучше всего считываются кухня, сервис и темп зала.</p>
      <h3>1. Начните с бара</h3>
      <p>Сезонные коктейли в NŪRA собраны так, чтобы подготовить вкус к кухне, а не спорить с ней. Лучше взять один напиток на входе и перейти к еде уже после него.</p>
      <h3>2. Возьмите одну подачу с теплом и одну с кислотностью</h3>
      <p>Контраст делает впечатление ярче. Тёплое блюдо задаёт тело ужина, а более лёгкая подача освежает и удерживает баланс.</p>
      <h3>3. Не пропускайте десерт</h3>
      <p>Десерты в NŪRA работают как отдельная история, а не как обязательный пункт. Именно они часто становятся финальной нотой, из-за которой хочется вернуться.</p>
    `,
  },
  "blog/where-was-emily-in-paris-filmed-your-guide-to-iconic-locations-you-can-visit/index.html": {
    title: "Как мы собираем дегустационный сет: сезон, текстуры, подача",
    summary:
      "Почему дегустационный ужин в NŪRA меняется по сезону и как команда строит последовательность вкусов.",
    metaDescription:
      "Как NŪRA Restaurant собирает дегустационный сет: сезонный продукт, текстуры, подача и логика последовательности курсов.",
    body: `
      <p>Дегустационный сет в <strong>${brandName}</strong> начинается не с списка блюд, а с логики вечера. Сначала мы понимаем, какой ритм нужен гостю: лёгкий и искристый, плотный и винный или тонкий, почти десертный по ощущениям.</p>
      <h3>1. Сезон определяет ядро</h3>
      <p>Мы не подгоняем продукты под заранее зафиксированную карту. Наоборот, сет перестраивается вокруг того, что сейчас звучит честно и убедительно.</p>
      <h3>2. Текстуры важнее количества</h3>
      <p>Хруст, кремовая фактура, дым, тёплый соус, кислота и сладость распределяются так, чтобы курс не повторял предыдущий по ощущению.</p>
      <h3>3. Подача должна быть точной</h3>
      <p>Если визуальный образ забирает слишком много внимания, вкус теряется. Поэтому мы ищем баланс между красотой, чистотой тарелки и понятным центром блюда.</p>
      <h2>Почему гости замечают это сразу</h2>
      <p>Потому что хороший сет ощущается как цельная композиция. В нём нет лишнего, но есть развитие. Именно это и делает шефский стол в NŪRA запоминающимся.</p>
    `,
  },
  "blog/why-this-tour-is-a-must-do-for-fans-of-emily-paris-or-just-a-really-good-time/index.html": {
    title: "Почему гости возвращаются на шефский стол снова",
    summary:
      "Шефский стол в NŪRA работает не только за счёт кухни. Рассказываем, почему этот формат хочется повторить.",
    metaDescription:
      "Почему гости возвращаются на шефский стол в NŪRA Restaurant: ритм подачи, близость к кухне и сильная работа сервиса.",
    body: `
      <p>Возвращение на шефский стол почти всегда связано не только с едой. Этот формат даёт редкое ощущение включённости: вы видите движение кухни, чувствуете темп сервиса и воспринимаете вечер как живой процесс.</p>
      <h3>1. Здесь есть ощущение участия</h3>
      <p>Гость не просто получает тарелки, а буквально оказывается рядом с моментом их финальной сборки. Это создаёт более глубокую связь с ужином.</p>
      <h3>2. Ритм вечера отличается от обычной посадки</h3>
      <p>На шефском столе паузы, комментарии и порядок курсов ощущаются иначе. Вечер становится плотнее по впечатлению, даже если длится те же два с половиной часа.</p>
      <h3>3. Каждый визит немного меняется</h3>
      <p>Сет, продукты и сопровождение обновляются по сезону, поэтому даже знакомый формат звучит по-новому и даёт повод возвращаться.</p>
    `,
  },
};

async function walkHtmlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "cloudflare-dist" || entry.name === ".git") {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkHtmlFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }

  return files;
}

function replaceInString(value, replacements) {
  let output = value;

  for (const [from, to] of replacements) {
    output = output.split(from).join(to);
  }

  return output;
}

function replaceTextAndAttrs(node, replacements) {
  if (node.type === "text") {
    node.data = replaceInString(node.data, replacements);
    return;
  }

  if (node.type !== "root" && node.type !== "tag") {
    return;
  }

  if (node.attribs) {
    for (const key of ["alt", "title", "aria-label", "placeholder", "content"]) {
      if (node.attribs[key]) {
        node.attribs[key] = replaceInString(node.attribs[key], replacements);
      }
    }
  }

  if (node.name === "script" || node.name === "style") {
    return;
  }

  for (const child of node.children || []) {
    replaceTextAndAttrs(child, replacements);
  }
}

function ensureHeadLink($, selector, html) {
  if (!$(selector).length) {
    $("head").append(html);
  }
}

function setMeta($, title, description, image = remoteImages[0]) {
  $("title").text(title);
  $('meta[name="description"]').attr("content", description);
  $('meta[property="og:title"]').attr("content", title);
  $('meta[property="og:description"]').attr("content", description);
  $('meta[property="og:image"]').attr("content", image);
  $('meta[property="twitter:title"]').attr("content", title);
  $('meta[property="twitter:description"]').attr("content", description);
  $('meta[property="twitter:image"]').attr("content", image);
}

function ensureHeadMarkup($, id, html) {
  if (!$(id).length) {
    $("head").append(html);
  }
}

function ensureBodyMarkup($, id, html, position = "prepend") {
  if ($(id).length) {
    return;
  }

  if (position === "prepend") {
    $("body").prepend(html);
  } else {
    $("body").append(html);
  }
}

function buildPriceMarkup(price) {
  return `<span>От&nbsp;${price}</span>`;
}

function normalizeExperienceHref(href = "") {
  return href.replace(/^\/city/, "").replace(/\/+$/, "");
}

function setPricePill($, pill, price) {
  const label = $(pill).find(".u-text-style-label1, .u-text-style-label2").first();
  if (label.length) {
    label.html(buildPriceMarkup(price));
    return;
  }

  $(pill).html(buildPriceMarkup(price));
}

function updateExperiencePrices($) {
  $('a[href*="/experiences/"]').each((_, link) => {
    const normalizedHref = normalizeExperienceHref($(link).attr("href"));
    const price = experiencePriceMap.get(normalizedHref);

    if (!price) {
      return;
    }

    $(link)
      .find(".info_pill")
      .each((__, pill) => {
        const pillText = $(pill).text().replace(/\s+/g, " ").trim();
        if (/€/.test(pillText) || /^От\s*\d/.test(pillText)) {
          setPricePill($, pill, price);
        }
      });
  });
}

function installLoader($) {
  ensureHeadMarkup(
    $,
    "#nura-loader-boot",
    `<script id="nura-loader-boot">document.documentElement.classList.add("nura-is-loading");</script>`
  );

  ensureBodyMarkup(
    $,
    "#nura-loader",
    `<div id="nura-loader" aria-live="polite" aria-label="Нура загружается"><div class="nura-loading-mark">НУРА</div></div>`
  );

  ensureBodyMarkup(
    $,
    "#nura-loader-script",
    `<script id="nura-loader-script">
(() => {
  const root = document.documentElement;
  const finish = () => {
    if (!root.classList.contains("nura-is-loading")) return;
    root.classList.remove("nura-is-loading");
    root.classList.add("nura-is-ready");
  };

  const waitForImage = (img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => resolve();
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    });
  };

  const waitForVideo = (video) => {
    if (video.readyState >= 2) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => resolve();
      video.addEventListener("loadeddata", done, { once: true });
      video.addEventListener("canplay", done, { once: true });
      video.addEventListener("error", done, { once: true });
    });
  };

  const waitForMedia = () => {
    const images = Array.from(document.images);
    const videos = Array.from(document.querySelectorAll("video"));
    return [
      ...images.map(waitForImage),
      ...videos.map(waitForVideo),
      document.fonts ? document.fonts.ready.catch(() => undefined) : Promise.resolve(),
    ];
  };

  const start = () => {
    const tasks = waitForMedia();
    window.setTimeout(finish, 4500);
    Promise.allSettled(tasks).then(() => {
      window.requestAnimationFrame(finish);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
</script>`,
    "append"
  );
}

function applyCommonDomChanges($) {
  $("html").attr("lang", "ru");

  ensureHeadLink($, 'link[href*="fonts.googleapis.com/css2?family=Manrope"]', `<link rel="preconnect" href="https://fonts.googleapis.com">`);
  ensureHeadLink($, 'link[href*="fonts.gstatic.com"]', `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`);
  ensureHeadLink($, 'link[href*="fonts.googleapis.com/css2?family=Manrope"]', `<link href="${fontsHref}" rel="stylesheet">`);
  ensureHeadLink($, `link[href="${overrideHref}"]`, `<link href="${overrideHref}" rel="stylesheet" type="text/css">`);
  installLoader($);

  $('link[rel="shortcut icon"], link[rel="apple-touch-icon"]').attr("href", faviconHref);

  const wordmark = `<span class="nura-wordmark">NŪRA</span>`;
  $(".nav_logo_row").each((_, el) => {
    $(el).attr("aria-label", brandName).html(wordmark);
  });
  $(".footer_bottom_title").each((_, el) => {
    $(el).html(wordmark);
  });
  $(".nav_btn_text .u-text-style-main").text("Меню");

  $(".menu_link .u-text-style-menu").each((_, el) => {
    const text = $(el).text().trim();
    if (text === "Приватный ужин") {
      $(el).text("Ужин");
    }
    if (text === "Подарочные карты") {
      $(el).text("Подарок");
    }
  });

  $(".footer_nav_link .u-heading-style-h5").each((_, el) => {
    const text = $(el).text().trim();
    if (text === "Приватный ужин") {
      $(el).text("Ужин");
    }
    if (text === "Подарочные карты") {
      $(el).text("Подарок");
    }
  });

  $(".nav_city_ul a").each((index, el) => {
    const text = index === 0 ? "Ресторан" : "Форматы";
    const href = index === 0 ? "/city" : "/city/experiences";
    $(el).attr("href", href);
    $(el).find(".u-heading-style-h5").text(text);
  });

  $(".footer_nav_wrap").each((_, wrap) => {
    const label = $(wrap).find(".u-text-style-label2").first().text().trim();
    if (label === "Пространство") {
      $(wrap)
        .find(".footer_nav_link")
        .each((index, el) => {
          const text = index === 0 ? "Ресторан" : "Форматы";
          const href = index === 0 ? "/city" : "/city/experiences";
          $(el).attr("href", href);
          $(el).find(".u-heading-style-h5").text(text);
        });
    }

    if (label === "Соцсети") {
      $(wrap).find(".footer_nav_link").attr("href", "https://www.instagram.com/").attr("target", "_blank");
    }
  });

  $('a[href="/rome"]').attr("href", "/city/experiences");
  $('a[href="/prive"]').attr("href", "/city/experiences/wine-cheese-tasting");
  $('a[href="/gift-cards"]').attr("href", "/city/blog");
  $('a[href="/privacy-policy"]').attr("href", "/city/blog");
  $(".menu_social_link").attr("href", "https://www.instagram.com/").attr("target", "_blank");

  $(".cta_text").text(
    "От позднего бранча и шефского стола до винных ужинов и коктейлей на террасе — выбирайте свой сценарий вечера в NŪRA."
  );
  $(".marquee-css__item-p").text("Бронь на новые форматы открыта уже сейчас.");

  $(".footer_bottom_rights .u-text-style-small").text(`© ${brandName} 2026`);
  $('.footer_bottom_details .u-text-style-small a[href="/privacy-policy"]').text("конфиденциальность");
  $(".absolute-menu .u-heading-style-h5")
    .filter((_, el) => $(el).text().trim() === "NŪRA Restaurant")
    .text(brandName);
  $(".menu_logo-item").html(
    `<div class="nura-wordmark">NŪRA</div><div class="footer_top_text u-mt-4"><div class="u-text-style-small">Авторская кухня и вечерний сервис</div></div>`
  );

  updateExperiencePrices($);
}

function applyHomePage($) {
  setMeta(
    $,
    `${brandName} | Авторская кухня, коктейли и гастроужины`,
    "NŪRA Restaurant — авторская кухня, коктейли, винные ужины и камерные гастрономические форматы в современном ресторанном пространстве.",
    remoteImages[0]
  );

  $(".hero_wrapper h1").first().text(brandName);
  $(".loading_logo_wrap").html(`<div class="nura-transition-mark" aria-hidden="true">NŪRA</div>`);
  $(".hero_subheader")
    .first()
    .text("Авторская кухня, вечерний свет и ритм большого города. Место для длинных ужинов, коктейлей у бара и камерных встреч.");
  $(".u-heading-style-h1.u-heading-style-h2").first().text("Форматы NŪRA");
  $(".u-text-style-label2")
    .filter((_, el) => $(el).text().trim() === "Откройте вечер в своём ритме")
    .text("Вечер в своём ритме");

  $(".marquee_p_l").each((index, el) => {
    const words = ["ШЕФ", "КОКТЕЙЛИ", "ВИНО", "ТЕРРАСА", "БРАНЧ", "ДЕСЕРТ"];
    if (words[index]) {
      $(el).text(words[index]);
    }
  });

  const quotes = $(".testimonial_card .u-text-style-quote1");
  const labels = $(".testimonial_card .u-text-style-label2");
  homeTestimonials.forEach(([quote, author], index) => {
    $(quotes[index]).text(quote);
    $(labels[index]).text(author);
  });

  $(".testimonial_content_inner .u-text-style-label2").first().text("Danielle, Нидерланды");
  $(".testimonial_content_inner .u-text-style-quote1")
    .first()
    .text(
      "Очень тёплый и цельный опыт. Команда вела вечер спокойно и красиво, а формат оказался намного глубже, чем мы ожидали. С удовольствием рекомендуем."
    );
  $(".walloflove_title h2").html("ОТЗЫВЫ");
}

function applyExperienceIndex($) {
  setMeta(
    $,
    `${brandName} | Форматы и гастрономические вечера`,
    "Откройте форматы NŪRA Restaurant: шефский стол, поздний бранч, винный ужин, коктейли на террасе и приватные вечера.",
    remoteImages[1]
  );

  $("h1").first().text("Форматы");
  $(".u-heading-style-h4.u-weight-bold").first().text("ФОРМАТЫ");
  $(".u-heading-style-h4.u-weight-bold").last().text("В NŪRA");
  $(".u-text-style-label2")
    .filter((_, el) => $(el).text().trim() === "Под ваш вечер")
    .text("Под ваш вечер");

  $(".marquee_p_l").each((index, el) => {
    const words = ["ШЕФ", "КОКТЕЙЛИ", "ВИНО", "ТЕРРАСА", "БРАНЧ", "ДЕСЕРТ"];
    if (words[index]) {
      $(el).text(words[index]);
    }
  });
}

function applyExperienceDetail($, config) {
  setMeta(
    $,
    `${config.title} | ${brandName}`,
    config.metaDescription,
    remoteImages[2]
  );

  $("h1").first().text(config.title);
  $(".u-subheadline-1").first().text(config.summary);
  const pills = $(".info_pill");
  config.pills.forEach((value, index) => {
    $(pills[index]).text(value);
  });

  $('h2').each((_, el) => {
    const text = $(el).text().trim();
    if (text === "FAQ") {
      $(el).text("Частые вопросы");
    }
    if (text.includes("Savor")) {
      $(el).text(config.bodyHeading);
    }
  });

  $(".u-rich-text").first().html(config.body);

  $(".accordion-css__item").each((index, el) => {
    const entry = globalFaq[index % globalFaq.length];
    $(el).find(".accordion-css__item-top p").first().text(entry[0]);
    $(el).find(".u-rich-text").first().html(entry[1]);
  });

  $(".testimonial_card").each((index, el) => {
    const [quote, author] = detailTestimonials[index % detailTestimonials.length];
    $(el).find(".u-text-style-quote1").first().text(quote);
    $(el).find(".u-text-style-label2").first().text(author);
  });
}

function applyBlogIndex($) {
  setMeta(
    $,
    `${brandName} | Журнал`,
    "Журнал NŪRA Restaurant: заметки о сервисе, шефском столе, баре, дегустационных сетах и ритме современного ресторана.",
    remoteImages[3]
  );
  $("h1").first().text("Журнал");
}

function applyBlogDetail($, config) {
  setMeta($, `${config.title} | ${brandName}`, config.metaDescription, remoteImages[4]);
  $("h1").first().text(config.title);
  $(".blog_summary").first().text(config.summary);
  $(".u-rich-text").first().html(config.body);
}

function buildAssetMap(values, replacements) {
  const unique = [...new Set(values)];
  return new Map(unique.map((value, index) => [value, replacements[index % replacements.length]]));
}

function replaceAssetsInHtml(html, imageMap, videoMap) {
  let output = html;

  for (const [from, to] of imageMap.entries()) {
    output = output.split(from).join(to);
  }

  for (const [from, to] of videoMap.entries()) {
    output = output.split(from).join(to);
  }

  return output;
}

function collectMatches(content, regex) {
  return [...content.matchAll(regex)].map((match) => match[0]);
}

const htmlFiles = await walkHtmlFiles(repoRoot);
const imageRegex =
  /(?:https:\/\/cdn\.prod\.website-files\.com|\/city\/assets\/cdn\.prod\.website-files\.com|\/assets\/cdn\.prod\.website-files\.com)[^"'`\s)]+?\.(?:avif|png|jpe?g|webp)(?:\?[^"'`\s)]*)?/g;
const videoRegex =
  /(?:https:\/\/cdn\.prod\.website-files\.com|\/city\/assets\/cdn\.prod\.website-files\.com|\/assets\/cdn\.prod\.website-files\.com)[^"'`\s)]+?\.mp4(?:\?[^"'`\s)]*)?/g;

const rawContents = new Map();
const allImages = [];
const allVideos = [];

for (const file of htmlFiles) {
  const content = await fs.readFile(file, "utf8");
  rawContents.set(file, content);
  allImages.push(...collectMatches(content, imageRegex));
  allVideos.push(...collectMatches(content, videoRegex));
}

const imageMap = buildAssetMap(allImages, remoteImages);
const videoMap = buildAssetMap(allVideos, localVideos);

for (const file of htmlFiles) {
  const relativePath = path.relative(repoRoot, file).replaceAll(path.sep, "/");
  const $ = cheerio.load(rawContents.get(file), { decodeEntities: false });

  applyCommonDomChanges($);
  replaceTextAndAttrs($.root()[0], commonReplacements);

  if (relativePath === "index.html") {
    applyHomePage($);
  } else if (relativePath === "experiences/index.html") {
    applyExperienceIndex($);
  } else if (relativePath === "blog/index.html") {
    applyBlogIndex($);
  } else if (experiencePages[relativePath]) {
    applyExperienceDetail($, experiencePages[relativePath]);
  } else if (blogPages[relativePath]) {
    applyBlogDetail($, blogPages[relativePath]);
  }

  $("img").each((index, el) => {
    const src = $(el).attr("src");
    if (!src) {
      $(el).attr("src", remoteImages[index % remoteImages.length]);
    }
  });

  $("video").each((index, el) => {
    $(el).attr("src", localVideos[index % localVideos.length]);
  });

  let html = $.html();
  html = replaceInString(html, [
    ["Paris by Emily", brandName],
    ["Emily in Paris", brandName],
    ["Seek Dharma Limited", brandName],
    ["bonjour@parisbyemily.com", brandEmail],
    ["Shuffle", "Сменить"],
    ["Official travel brand of NŪRA", "Современный ресторан авторской кухни"],
    ["Official travel brand of NŪRA Restaurant", "Современный ресторан авторской кухни"],
    ["https://www.instagram.com/parisbyemily/?hl=en", "https://www.instagram.com/"],
    ["loadparisbyemily", "loadNuraScript"],
    ["Slater loaded NŪRA Restaurant.js", "Slater loaded NŪRA.js"],
  ]);
  html = replaceAssetsInHtml(html, imageMap, videoMap);

  await fs.writeFile(file, html, "utf8");
}

console.log(`Rebranded ${htmlFiles.length} HTML files for ${brandName}.`);
