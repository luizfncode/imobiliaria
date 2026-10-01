/* =========================================================
   JOÃO LUIZ IMÓVEIS
   HERO CINEMATOGRÁFICO + SITE
========================================================= */

/* =========================================================
   CONFIGURAÇÃO DO HERO
========================================================= */

/*
  Coloque os frames em:

  /frames/

  Exemplo:

  f_0001.jpg
  f_0002.jpg
  f_0003.jpg
  ...
  f_0100.jpg

  A sequência deve representar:

  CASA DISTANTE
      ↓
  APROXIMAÇÃO
      ↓
  FACHADA
      ↓
  ENTRADA
      ↓
  INTERIOR
*/

const N = 8;

const PATH = i =>
  `frames/f_${String(i + 1).padStart(4, '0')}.jpg`;


/* =========================================================
   ELEMENTOS
========================================================= */

const $ = id => document.getElementById(id);

const cv = $('cv');
const cx = cv ? cv.getContext('2d') : null;

const cv2 = $('cv2');
const cx2 = cv2 ? cv2.getContext('2d') : null;

const hero = $('hero');
const stage = $('stage');

const h1 = document.querySelector('#hero h1');
const sub = document.querySelector('#hero .sub');
const tag = document.querySelector('#hero .tag');
const cta = document.querySelector('#hero #cta');
const scr = document.querySelector('#hero #scr');

const imgs = new Array(N);

let real = false;

let cur = 0;
let target = 0;

let lastFrame = -1;

let heroReady = false;


/* =========================================================
   FALLBACK PROCEDURAL
   Usado caso os frames ainda não existam.
========================================================= */

function scene(c, w, h, t) {

  const g = c.createLinearGradient(0, 0, 0, h);

  g.addColorStop(0, '#303b48');
  g.addColorStop(.48, '#827064');
  g.addColorStop(1, '#181716');

  c.fillStyle = g;
  c.fillRect(0, 0, w, h);


  /*
    Simulação simples de uma casa.
    Serve apenas como fallback visual.
  */

  c.save();

  const zoom = 1 + t * 1.8;

  c.translate(
    w * .5,
    h * .64
  );

  c.scale(zoom, zoom);


  const u = Math.min(w, h * 1.5);


  /* chão */

  c.fillStyle = '#252321';

  c.fillRect(
    -u,
    0,
    u * 2,
    u
  );


  /* casa */

  c.fillStyle = '#d6cec1';

  c.fillRect(
    -u * .38,
    -u * .42,
    u * .76,
    u * .43
  );


  /* telhado */

  c.fillStyle = '#292724';

  c.beginPath();

  c.moveTo(
    -u * .46,
    -u * .42
  );

  c.lineTo(
    0,
    -u * .72
  );

  c.lineTo(
    u * .46,
    -u * .42
  );

  c.closePath();

  c.fill();


  /* janelas */

  const windowGradient =
    c.createLinearGradient(
      0,
      -u * .35,
      0,
      -u * .1
    );

  windowGradient.addColorStop(
    0,
    '#f3d39b'
  );

  windowGradient.addColorStop(
    1,
    '#9d6842'
  );

  c.fillStyle = windowGradient;


  c.fillRect(
    -u * .28,
    -u * .32,
    u * .15,
    u * .19
  );

  c.fillRect(
    u * .12,
    -u * .32,
    u * .15,
    u * .19
  );


  /* porta */

  c.fillStyle = '#302821';

  c.fillRect(
    -u * .075,
    -u * .28,
    u * .15,
    u * .29
  );


  /* luz da entrada */

  c.fillStyle =
    'rgba(243,194,122,.18)';

  c.fillRect(
    -u * .2,
    -u * .04,
    u * .4,
    u * .08
  );


  c.restore();
}


/* =========================================================
   COVER
========================================================= */

function cover(c, im, w, h) {

  if (!im || !im.naturalWidth) return;

  const scale =
    Math.max(
      w / im.width,
      h / im.height
    );

  const dw = im.width * scale;
  const dh = im.height * scale;

  c.drawImage(
    im,
    (w - dw) / 2,
    (h - dh) / 2,
    dw,
    dh
  );
}


/* =========================================================
   DRAW FRAME
========================================================= */

function draw(c, w, h, frame) {

  if (!c || !w || !h) return;


  const im =
    imgs[frame] &&
    imgs[frame].complete &&
    imgs[frame].naturalWidth
      ? imgs[frame]
      : null;


  if (real && im) {

    cover(
      c,
      im,
      w,
      h
    );

    return;
  }


  if (!real) {

    scene(
      c,
      w,
      h,
      frame / Math.max(1, N - 1)
    );

    return;
  }


  /*
    Se o frame ainda não carregou,
    procura o frame mais próximo disponível.
  */

  for (let d = 1; d < N; d++) {

    const a =
      imgs[frame - d] ||
      imgs[frame + d];

    if (
      a &&
      a.complete &&
      a.naturalWidth
    ) {

      cover(
        c,
        a,
        w,
        h
      );

      return;
    }
  }
}


/* =========================================================
   RESIZE
========================================================= */

function size() {

  if (!cv || !cv2) return;


  const d =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );


  cv.width =
    window.innerWidth * d;

  cv.height =
    window.innerHeight * d;


  const r =
    cv2.getBoundingClientRect();


  cv2.width =
    Math.max(1, r.width * d);

  cv2.height =
    Math.max(1, r.height * d);


  lastFrame = -1;


  draw(
    cx2,
    cv2.width,
    cv2.height,
    N - 1
  );
}


/* =========================================================
   CARREGAMENTO DOS FRAMES
========================================================= */

function load(i) {

  return new Promise(resolve => {

    const im = new Image();

    im.onload = () => {

      imgs[i] = im;

      resolve(im);

    };


    im.onerror = () => {

      imgs[i] = im;

      resolve(im);

    };


    im.src = PATH(i);

  });
}


/* =========================================================
   CARREGAMENTO INTELIGENTE
========================================================= */

async function loadHeroFrames() {

  /*
    Primeiro frame.
    Ele é prioridade porque precisa aparecer
    imediatamente.
  */

  const first =
    await load(0);


  if (!first.naturalWidth) {

    real = false;

    size();

    heroReady = true;

    window.dispatchEvent(
      new CustomEvent(
        'hero-first-frame-ready'
      )
    );

    return;

  }


  real = true;


  size();


  /*
    Primeiro carregamos frames estratégicos.

    Isso evita a sensação de tela vazia enquanto
    a sequência inteira ainda está carregando.
  */

  const priority = [

    0,

    Math.floor(N * .10),

    Math.floor(N * .20),

    Math.floor(N * .30),

    Math.floor(N * .40),

    Math.floor(N * .50),

    Math.floor(N * .60),

    Math.floor(N * .70),

    Math.floor(N * .80),

    Math.floor(N * .90),

    N - 1

  ];


  const unique =
    [...new Set(priority)]
      .filter(i => i > 0 && i < N);


  await Promise.all(
    unique.map(load)
  );


  /*
    Agora o hero já tem uma sequência suficiente
    para começar.
  */

  heroReady = true;


  draw(
    cx,
    cv.width,
    cv.height,
    0
  );


  window.dispatchEvent(
    new CustomEvent(
      'hero-first-frame-ready'
    )
  );


  /*
    Depois carregamos o restante em pequenos grupos.
  */

  const remaining =
    [...Array(N).keys()]
      .filter(i =>
        i !== 0 &&
        !priority.includes(i)
      );


  const batchSize = 5;


  for (
    let i = 0;
    i < remaining.length;
    i += batchSize
  ) {

    const batch =
      remaining.slice(
        i,
        i + batchSize
      );


    await Promise.all(
      batch.map(load)
    );


    /*
      Se o usuário já estiver vendo o hero,
      redesenha o frame atual.
    */

    if (heroReady) {

      const frame =
        Math.round(
          cur * (N - 1)
        );


      draw(
        cx,
        cv.width,
        cv.height,
        frame
      );

    }
  }
}


loadHeroFrames();


/* =========================================================
   UTILITÁRIOS
========================================================= */

const clamp = (
  value,
  min = 0,
  max = 1
) =>
  Math.min(
    max,
    Math.max(min, value)
  );


/*
  Smoothstep.

  Deixa a câmera começar devagar,
  acelerar no meio e desacelerar
  novamente no final.
*/

function smoothstep(t) {

  t = clamp(t);

  return (
    t * t *
    (3 - 2 * t)
  );
}


/*
  Curva mais cinematográfica.

  Mantém o começo mais lento,
  acelera no meio e desacelera
  perto do interior.
*/

function cinematic(t) {

  t = clamp(t);

  return (
    t < .5
      ? 2 * t * t
      : 1 -
        Math.pow(
          -2 * t + 2,
          2
        ) / 2
  );
}


/* =========================================================
   SCROLL DO HERO
========================================================= */

function onScroll() {

  if (!hero) return;


  const r =
    hero.getBoundingClientRect();


  /*
    Barra de navegação.
  */

  const nav =
    $('nav');


  if (nav) {

    nav.classList.toggle(
      'solid',
      r.bottom <
        window.innerHeight * .6
    );

  }


  /*
    Progresso da câmera.

    0 = primeiro frame
    1 = último frame
  */

  const distance =
    r.height -
    window.innerHeight;


  if (distance <= 0) {

    target = 0;

  } else {

    target =
      clamp(
        -r.top / distance
      );

  }
}


/* =========================================================
   HERO ANIMATION
========================================================= */

function tick() {

  /*
    Suavização física da câmera.
  */

  cur +=
    (target - cur) * .085;


  const p =
    clamp(cur);


  /*
    Curva aplicada aos frames.

    A câmera não corre imediatamente.
  */

  const camera =
    cinematic(p);


  const frame =
    Math.round(
      camera *
      (N - 1)
    );


  if (
    frame !== lastFrame
  ) {

    lastFrame = frame;


    draw(
      cx,
      cv.width,
      cv.height,
      frame
    );

  }


  /* =======================================================
     TEXTO DO HERO
  ======================================================= */


  /*
    Primeiros 15%:
    texto ainda aparece.

    Depois começa a desaparecer.
  */

  const textOut =
    clamp(
      (p - .08) / .22
    );


  const textEase =
    smoothstep(textOut);


  if (h1) {

    h1.style.opacity =
      1 - textEase;


    h1.style.transform =
      `translateY(${
        -textEase * 70
      }px)`;

  }


  if (sub) {

    const subOut =
      clamp(
        (p - .04) / .20
      );


    sub.style.opacity =
      1 - smoothstep(subOut);

  }


  if (tag) {

    const tagOut =
      clamp(
        (p - .02) / .16
      );


    tag.style.opacity =
      1 - smoothstep(tagOut);

  }


  if (cta) {

    const ctaOut =
      clamp(
        (p - .01) / .12
      );


    cta.style.opacity =
      1 - smoothstep(ctaOut);


    cta.style.pointerEvents =
      p > .12
        ? 'none'
        : '';

  }


  if (scr) {

    const scrollOut =
      clamp(
        p / .08
      );


    scr.style.opacity =
      1 - smoothstep(scrollOut);

  }


  /*
    Continua o loop.
  */

  requestAnimationFrame(tick);
}


/* =========================================================
   EVENTOS HERO
========================================================= */

window.addEventListener(
  'scroll',
  onScroll,
  { passive: true }
);


window.addEventListener(
  'resize',
  () => {

    size();

    onScroll();

  }
);


size();

onScroll();

cur = target;

tick();


/* =========================================================
   IMAGENS DAS OUTRAS SEÇÕES
========================================================= */

const phs =
  [
    ...document.querySelectorAll(
      '.ph'
    )
  ];


function paint(c) {

  if (!c) return;


  const d =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );


  const r =
    c.getBoundingClientRect();


  if (
    !r.width ||
    !r.height
  ) return;


  c.width =
    r.width * d;

  c.height =
    r.height * d;


  const context =
    c.getContext('2d');


  if (
    c._im &&
    c._im.naturalWidth
  ) {

    cover(
      context,
      c._im,
      c.width,
      c.height
    );

  } else {

    scene(
      context,
      c.width,
      c.height,
      +c.dataset.t || 0
    );

  }
}


function setSrc(c, src) {

  if (!c || !src) return;


  c._im = null;


  const im =
    new Image();


  im.onload = () => {

    c._im = im;

    paint(c);

  };


  im.onerror = () => {

    paint(c);

  };


  im.src = src;
}


phs.forEach(c => {

  if (
    c.id !== 'prev'
  ) {

    setSrc(
      c,
      c.dataset.src
    );

  }


  paint(c);

});


/* =========================================================
   SERVIÇOS
========================================================= */

const prev =
  $('prev');


const items =
  [
    ...document.querySelectorAll(
      '.svc li'
    )
  ];


function pick(li) {

  if (!li || !prev) return;


  items.forEach(item => {

    item.classList.toggle(
      'on',
      item === li
    );

  });


  prev.dataset.t =
    li.dataset.t || 0;


  setSrc(
    prev,
    li.dataset.src
  );


  paint(prev);

}


items.forEach(li => {

  li.tabIndex = 0;


  li.addEventListener(
    'mouseenter',
    () => pick(li)
  );


  li.addEventListener(
    'focus',
    () => pick(li)
  );

});


if (items.length) {

  pick(items[0]);

}


window.addEventListener(
  'resize',
  () => {

    document
      .querySelectorAll('.ph')
      .forEach(paint);

  }
);


/* =========================================================
   EXPLORAR IMÓVEIS
========================================================= */

const L =
  'Luziânia — GO';


const WA =
  'https://wa.me/556199563527';


const P = [

  {
    fin: 'comprar',
    tipo: 'Casa',
    nome: 'Casa residencial',
    t: .10
  },

  {
    fin: 'comprar',
    tipo: 'Apartamento',
    nome: 'Apartamento residencial',
    t: .30
  },

  {
    fin: 'comprar',
    tipo: 'Terreno',
    nome: 'Terreno',
    t: .50
  },

  {
    fin: 'comprar',
    tipo: 'Lote',
    nome: 'Lote',
    t: .70
  },

  {
    fin: 'comprar',
    tipo: 'Casa',
    nome: 'Casa residencial',
    t: .90
  },

  {
    fin: 'comprar',
    tipo: 'Terreno',
    nome: 'Terreno',
    t: .40
  }

];


let fin =
  'comprar';


function render() {

  const type =
    $('ft')
      ? $('ft').value
      : '';


  const results =
    P.filter(
      p =>
        p.fin === fin &&
        (!type ||
          p.tipo === type)
    );


  const count =
    $('cnt');


  if (count) {

    count.textContent =
      results.length
        ? results.length +
          (
            results.length === 1
              ? ' imóvel à venda'
              : ' imóveis à venda'
          )
        : '';

  }


  const list =
    $('list');


  if (!list) return;


  if (!results.length) {

    list.innerHTML = `

      <li class="empty">

        ${
          fin === 'alugar'
            ? 'Consulte as opções de locação residenciais e comerciais com a nossa equipe.'
            : 'Nenhum imóvel nesse tipo no momento.'
        }

        <a
          href="${WA}"
          target="_blank"
          rel="noopener"
        >
          Falar no WhatsApp
        </a>

      </li>

    `;


    return;

  }


  list.innerHTML =
    results
      .map(p => {

        const message =
          encodeURIComponent(
            'Olá! Tenho interesse em: ' +
            p.nome +
            ' em ' +
            L
          );


        return `

          <li>

            <canvas
              class="ph"
              data-t="${p.t}"
            ></canvas>


            <div>

              <span class="st">
                Venda
              </span>

              <h3>
                ${p.nome}
              </h3>

              <p>
                ${L}
              </p>

            </div>


            <p>
              Detalhes e valores sob consulta
            </p>


            <b>
              Consulte valores
            </b>


            <a
              target="_blank"
              rel="noopener"
              href="${WA}?text=${message}"
            >
              Ver detalhes
            </a>

          </li>

        `;

      })
      .join('');


  document
    .querySelectorAll(
      '#list .ph'
    )
    .forEach(paint);

}


document
  .querySelectorAll(
    '.seg button'
  )
  .forEach(button => {

    button.onclick = () => {

      fin =
        button.dataset.fin;


      document
        .querySelectorAll(
          '.seg button'
        )
        .forEach(x => {

          x.classList.toggle(
            'on',
            x === button
          );

        });


      render();

    };

  });


if ($('ft')) {

  $('ft').onchange =
    render;

}


if ($('go')) {

  $('go').onclick = () => {

    render();


    if ($('list')) {

      $('list')
        .scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

    }

  };

}


render();


/* =========================================================
   MENU MOBILE
========================================================= */

const nav =
  $('nav');


const burger =
  $('burger');


if (
  nav &&
  burger
) {

  burger.onclick = () => {

    const open =
      nav.classList.toggle(
        'open'
      );


    burger.setAttribute(
      'aria-expanded',
      open
    );

  };


  document
    .querySelectorAll(
      '#menu a'
    )
    .forEach(a => {

      a.addEventListener(
        'click',
        () => {

          nav.classList.remove(
            'open'
          );


          burger.setAttribute(
            'aria-expanded',
            'false'
          );

        }
      );

    });

}


/* =========================================================
   REVEAL DAS SEÇÕES
========================================================= */

if (
  'IntersectionObserver'
  in window
) {

  const io =
    new IntersectionObserver(
      entries => {

        entries.forEach(
          entry => {

            if (
              entry.isIntersecting
            ) {

              entry.target
                .classList
                .add('in');


              io.unobserve(
                entry.target
              );

            }

          }
        );

      },
      {
        threshold: .12
      }
    );


  document
    .querySelectorAll('.rv')
    .forEach(
      element =>
        io.observe(element)
    );

} else {

  document
    .querySelectorAll('.rv')
    .forEach(
      element =>
        element.classList.add('in')
    );

}


/* =========================================================
   INTRO DE ABERTURA
========================================================= */

const siteIntro =
  document.getElementById(
    'siteIntro'
  );


let introStarted =
  false;


if (siteIntro) {

  document.documentElement
    .classList
    .add('intro-lock');


  document.body
    .classList
    .add('intro-lock');

}


function startSiteIntro() {

  if (
    introStarted ||
    !siteIntro
  ) return;


  introStarted = true;


  /*
    Primeiro aparece a marca.
  */

  setTimeout(() => {

    siteIntro.classList
      .add('play');

  }, 120);


  /*
    Depois as cortinas se abrem.
  */

  setTimeout(() => {

    siteIntro.classList
      .add('open');

  }, 850);


  /*
    Libera o scroll.
  */

  setTimeout(() => {

    siteIntro.classList
      .add('done');


    document.documentElement
      .classList
      .remove('intro-lock');


    document.body
      .classList
      .remove('intro-lock');

  }, 1900);


  /*
    Remove o elemento.
  */

  setTimeout(() => {

    siteIntro.remove();

  }, 2500);

}


/*
  Começa quando o primeiro frame
  já estiver disponível.
*/

window.addEventListener(
  'hero-first-frame-ready',
  startSiteIntro
);


/*
  Fallback.
*/

setTimeout(() => {

  if (!introStarted) {

    startSiteIntro();

  }

}, 2200);