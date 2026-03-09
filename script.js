// CONFIG — Edit sesuai kebutuhan Anda

const CONFIG = {
  musicVolume: 0.32,
  musicFadeOut: 0.08,  
  musicFadeIn: 1800,     
  musicFadeOutMs: 1600,  

  // Typewriter lines Scene 3 
  typewriterLines: [
    { text: "25 Desember 2024…", cls: "tw-line date" },
    { text: "Kamu balas catatan IG ku.", cls: "tw-line" },
    { text: "Dari satu notif sederhana itu…", cls: "tw-line" },
    { text: "cerita kita dimulai.", cls: "tw-line highlight" },
    { text: "Tanggal 25 Desember 2024 aku pernah bikin catatan ig “kapan bisa cosdate ya” terus kamu bales “gtww”, aku jawab “hanya bisa memandang org' cosdate”, dan kamu cuma kasih reaksi love, habis itu ya sudah selesai sampai situ. Tapi beberapa bulan kemudian, tepatnya 8 Juli 2025, aku bikin catatan ig lagi tulisannya “kangen cosplay”, dan kali ini kamu bales “kuy cosplay”. Dari situ kita mulai ngobrol tentang event cosplay, anime, dan hal-hal jejepangan, sampai akhirnya kenal nama, tahu cerita satu sama lain, sering kirim-kiriman reels, dan pelan-pelan jadi dekat. Sampai akhirnya kamu ngajak aku main bareng pertama kali di 5 September 2025, dan dari situ cerita kita benar-benar dimulai.", cls: "tw-line small" },
  ],

  // Slider captions Scene 5 
  sliderCaptions: [
    "Setiap foto nyimpen sejuta kenangan…",
    "Aku seneng banget bisa ada di sini, sama kamu.",
    "Semoga masih banyak foto lagi yang kita ambil"
  ],

  // progress bar
  sceneNames: [
    "",
    "🎂 Countdown",
    "🌟 Foto Sekarang",
    "🌱 Masa Kecil",
    "💭 Ingat?",
    "💌 Awal Kenal",
    "🌊 First Date",
    "📸 Kenangan Kita",
    "🌸 Hal Kecil",
    "🎥 Pesan dari aku",
    "🌸 Selamanya",
    "🎬 Behind The Story",
  ],
};

// STATE
let currentScene = 0;
const TOTAL_SCENES = 11;
const SCENE_IDS = ['','scene-1','scene-2','scene-2b','scene-2c','scene-3','scene-4','scene-5','scene-6','scene-7','scene-8','scene-9'];
let sliderInterval  = null;
let sliderIdx       = 0;
let countdownDone   = false;
let isMusicPlaying  = false;

const music = document.getElementById('bg-music');

// BOOT
document.addEventListener('DOMContentLoaded', () => {
  buildPreParticles();
  document.getElementById('scene-pre').addEventListener('click', startStory);
});

// START STORY
function startStory() {
  if (isMusicPlaying) return; 
  isMusicPlaying = true;

  music.volume = 0;
  music.play().catch(() => {});
  fadeVol(music, 0, CONFIG.musicVolume, CONFIG.musicFadeIn);

  goToScene(1);

  document.getElementById('tap-left').style.display  = 'block';
  document.getElementById('tap-right').style.display = 'block';
  document.getElementById('progress-bar').classList.add('visible');
  document.getElementById('scene-counter').classList.add('visible');

  setupTapZoneVideoGuard();

  startMusicNotes();
  startFloatingHearts();
}

// SCENE NAVIGATION
function goToScene(n) {
  if (n < 1 || n > TOTAL_SCENES) return;

  const prevEl = document.querySelector('.scene.active');
  if (prevEl) prevEl.classList.remove('active');

  // Stop slider if leaving scene 7 (was 5)
  if (currentScene === 7 && n !== 7 && sliderInterval) {
    clearInterval(sliderInterval);
    sliderInterval = null;
  }

  // Stop childhood slideshow if leaving scene 3 (scene-2b)
  if (currentScene === 3 && n !== 3 && childhoodInterval) {
    clearInterval(childhoodInterval);
    childhoodInterval = null;
  }

  // Resume music volume if leaving video scene (scene 9 = scene-7)
  if (currentScene === 9 && n !== 9) {
    const vid = document.getElementById('main-video');
    if (vid && !vid.paused) {
      vid.pause();
    }
    if (music.volume < CONFIG.musicVolume) {
      if (!music.paused) {
        fadeVol(music, music.volume, CONFIG.musicVolume, 2000);
      } else {
        music.play().catch(() => {});
        fadeVol(music, 0, CONFIG.musicVolume, 2000);
      }
    }
  }

  if (currentScene === 11 && n !== 11) {
    const btsVid = document.querySelector('#bts-video-wrap video');
    if (btsVid && !btsVid.paused) {
      btsVid.pause();
    }
    if (music.paused) {
      music.play().catch(() => {});
      fadeVol(music, 0, CONFIG.musicVolume, 2000);
    }
  }

  currentScene = n;
  const sceneEl = document.getElementById(SCENE_IDS[n]);
  if (sceneEl) sceneEl.classList.add('active');

  updateProgress();
  updateSceneCounter();
  onEnter(n);
}

function nextScene() { doFlash(); goToScene(currentScene + 1); }
function prevScene() { doFlash(); goToScene(currentScene - 1); }

// PROGRESS
function updateProgress() {
  const pct = Math.round((currentScene / TOTAL_SCENES) * 100);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-pct').textContent  = pct + '%';
  document.getElementById('scene-name').textContent    = CONFIG.sceneNames[currentScene] || '';
}

function updateSceneCounter() {
  const s = currentScene < 10 ? '0' + currentScene : '' + currentScene;
  const t = TOTAL_SCENES < 10 ? '0' + TOTAL_SCENES : '' + TOTAL_SCENES;
  document.getElementById('scene-counter').textContent = s + ' / ' + t;
}

// SCENE ENTER HOOKS
let childhoodInterval = null;

function onEnter(n) {
  // n: 1=countdown, 2=foto-sekarang, 3=masa-kecil, 4=pertanyaan, 5=awal-kenal,
  //    6=first-date, 7=slider, 8=hal-kecil, 9=video, 10=ending, 11=bts
  const fn = {
    1:  enterCountdown,
    2:  enterFotoSekarang,
    3:  enterChildhoodSlide,
    4:  enterQuestion,
    5:  enterTypewriter,
    6:  () => {},
    7:  enterSlider,
    8:  enterJokes,
    9:  enterVideo,
    10: enterEnding,
    11: enterBTS,
  };
  if (fn[n]) fn[n]();
}

// SCENE 1 — COUNTDOWN
function enterCountdown() {
  if (countdownDone) {
    const ringEl = document.querySelector('.countdown-ring');
    if (ringEl) { ringEl.style.display = 'none'; ringEl.style.opacity = '0'; }
    document.getElementById('bday-title').style.display = 'block';
    document.getElementById('bday-sub').style.display   = 'block';
    document.getElementById('scene-1').classList.add('show-birthday');
    return;
  }

  const numEl  = document.getElementById('countdown-num');
  const titleEl = document.getElementById('bday-title');
  const subEl   = document.getElementById('bday-sub');
  const ring    = document.getElementById('countdown-ring-progress');

  titleEl.style.display = 'none';
  subEl.style.display   = 'none';
  numEl.style.display   = 'block';
  numEl.style.opacity   = '1';

  const CIRCUMFERENCE = 565;
  let count = 3;
  numEl.textContent = count;
  if (ring) ring.style.strokeDashoffset = '0'; // ring selalu full

  const tick = setInterval(() => {
    count--;

    if (count > 0) {
      // Update angka dulu, baru animasi
      numEl.textContent = count;
      numEl.style.transform = 'scale(1.25)';
      numEl.style.opacity   = '0.5';
      setTimeout(() => {
        numEl.style.transform = 'scale(1)';
        numEl.style.opacity   = '1';
      }, 200);

      if (ring) ring.style.strokeDashoffset = '0';

      if (count === 1 && navigator.vibrate) {
        navigator.vibrate([120, 60, 200]);
      }
    } else {
      // count === 0 → selesai
      clearInterval(tick);
      countdownDone = true;
      if (navigator.vibrate) navigator.vibrate([150, 80, 200, 80, 150]);

      numEl.style.opacity = '0';
      setTimeout(() => {
        const ringEl = document.querySelector('.countdown-ring');
        if (ringEl) {
          ringEl.style.transition = 'opacity 0.4s ease';
          ringEl.style.opacity    = '0';
          setTimeout(() => { ringEl.style.display = 'none'; }, 420);
        }
        numEl.style.display   = 'none';
        titleEl.style.display = 'block';
        subEl.style.display   = 'block';
        document.getElementById('scene-1').classList.add('show-birthday');
        launchConfetti();
        launchBirthdaySparkles();
      }, 400);
    }
  }, 900);
}

// CONFETTI
function launchConfetti() {
  const colors = ['#c8837a','#c9a96e','#f5efe6','#fff','#e8b4b8','#b8d8b0','#f0c4a0'];
  const shapes = ['circle','square','rect'];

  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size  = 4 + Math.random() * 7;
      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        top: -12px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        width: ${shape === 'rect' ? size * 2 : size}px;
        height: ${size}px;
        border-radius: ${shape === 'circle' ? '50%' : '2px'};
        animation-duration: ${2.5 + Math.random() * 2.5}s;
        animation-delay: ${Math.random() * 0.6}s;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5500);
    }, i * 22);
  }
}

// Birthday sparkle burst
function launchBirthdaySparkles() {
  const symbols = ['✦','✧','⋆','✸','✹','·'];
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'sparkle';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.cssText = `
      left: ${10 + Math.random() * 80}vw;
      top:  ${10 + Math.random() * 70}vh;
      color: ${Math.random() > 0.5 ? 'var(--gold)' : 'var(--rose2)'};
      animation-duration: ${1 + Math.random() * 1.5}s;
      animation-delay: ${Math.random() * 0.8}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

// SCENE 2 — FOTO SEKARANG
function enterFotoSekarang() {
  const badge    = document.getElementById('age-badge');
  const ageLabel = document.getElementById('age-label');
  const caption  = document.getElementById('s2-caption');

  badge.classList.remove('visible');
  if (ageLabel) ageLabel.classList.remove('visible');
  caption.classList.remove('visible');

  setTimeout(() => badge.classList.add('visible'), 300);
  setTimeout(() => { if (ageLabel) ageLabel.classList.add('visible'); }, 600);
  setTimeout(() => caption.classList.add('visible'), 1000);
}

// SCENE 2B — MASA KECIL SLIDESHOW
function enterChildhoodSlide() {
  const slides = document.querySelectorAll('.childhood-slide');
  const dotsEl = document.getElementById('cs-dots');
  if (!dotsEl) return;

  dotsEl.innerHTML = '';
  let csIdx = 0;

  slides.forEach((s, i) => {
    s.classList.remove('active');
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    dotsEl.appendChild(d);
  });
  slides[0].classList.add('active');

  function showSlide(idx) {
    slides.forEach(s => s.classList.remove('active'));
    slides[idx].classList.add('active');
    document.querySelectorAll('#cs-dots .dot').forEach((d, i) =>
      d.classList.toggle('active', i === idx)
    );
  }

  if (childhoodInterval) clearInterval(childhoodInterval);
  childhoodInterval = setInterval(() => {
    csIdx = (csIdx + 1) % slides.length;
    showSlide(csIdx);
  }, 3000);
}

// SCENE 2C — PERTANYAAN
function enterQuestion() {
  // purely CSS-animated, nothing to do
}

// SCENE 3 — TYPEWRITER
function enterTypewriter() {
  const container = document.getElementById('tw-container');
  container.innerHTML = '';

  const lines = CONFIG.typewriterLines;
  let lineIdx = 0;

  function typeLine() {
    if (lineIdx >= lines.length) return;
    const { text, cls } = lines[lineIdx];

    const div = document.createElement('div');
    div.className = cls;
    container.appendChild(div);

    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    div.appendChild(cursor);

    let charIdx = 0;
    const chars = [...text]; 

    const iv = setInterval(() => {
      if (charIdx >= chars.length) {
        clearInterval(iv);
        cursor.remove();
        lineIdx++;
        setTimeout(typeLine, 700);
        return;
      }
      div.insertBefore(document.createTextNode(chars[charIdx]), cursor);
      charIdx++;
    }, 48);
  }

  setTimeout(typeLine, 900);
}

// SCENE 5 — SLIDER
function enterSlider() {
  const slides = document.querySelectorAll('.slide-item');
  const dotsEl = document.getElementById('slider-dots');
  dotsEl.innerHTML = '';

  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    dotsEl.appendChild(d);
  });

  sliderIdx = 0;
  renderSlide(slides);

  if (sliderInterval) clearInterval(sliderInterval);
  sliderInterval = setInterval(() => {
    sliderIdx = (sliderIdx + 1) % slides.length;
    renderSlide(slides);
  }, 3200);
}

function renderSlide(slides) {
  document.getElementById('slider-track').style.transform =
    `translateX(-${sliderIdx * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) =>
    d.classList.toggle('active', i === sliderIdx)
  );
  const cap = document.getElementById('slide-caption');
  if (!cap) return;
  cap.style.opacity = '0';
  setTimeout(() => {
    cap.textContent = CONFIG.sliderCaptions[sliderIdx] || '';
    cap.style.opacity = '1';
  }, 300);
}

// SCENE 6 — JOKES
function enterJokes() {
  const cards = document.querySelectorAll('.joke-card');
  cards.forEach(c => c.classList.remove('pop'));
  cards.forEach((c, i) => {
    setTimeout(() => c.classList.add('pop'), 250 + i * 320);
  });
}

// SCENE 7 — VIDEO UCAPAN
function enterVideo() {
  const preText = document.getElementById('pre-video-text');
  preText.classList.remove('visible');
  setTimeout(() => preText.classList.add('visible'), 300);

  const videoWrap = document.getElementById('video-wrap');
  const vid = document.getElementById('main-video');
  if (vid) {
    setupVideoMusic(vid, false);
  }
}

function setupVideoMusic(vid, isBTS) {
  vid.removeAttribute('autoplay');
  vid.setAttribute('controls', '');
  vid.pause();

  if (vid._musicHooked) return;
  vid._musicHooked = true;

  vid.addEventListener('play', () => {
    if (isBTS) {
      music.pause();
    } else {
      fadeVol(music, music.volume, CONFIG.musicFadeOut, CONFIG.musicFadeOutMs);
    }
  });

  vid.addEventListener('pause', () => {
    if (!vid.ended) {
      if (isBTS) {
        music.play().catch(() => {});
        fadeVol(music, 0, CONFIG.musicVolume, 1800);
      } else {
        fadeVol(music, music.volume, CONFIG.musicVolume, 2000);
      }
    }
  });

  vid.addEventListener('ended', () => {
    if (isBTS) {
      music.play().catch(() => {});
      fadeVol(music, 0, CONFIG.musicVolume, 2000);
    } else {
      fadeVol(music, music.volume, CONFIG.musicVolume, 2200);
    }
  });
}

// SCENE 8 — ENDING
function enterEnding() {
  ['ending-title', 'ending-sub', 'ending-hearts'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('visible');
  });

  const img = document.getElementById('ending-img');
  if (img) img.classList.remove('show');

  setTimeout(() => {
    document.getElementById('ending-title')?.classList.add('visible');
    document.getElementById('ending-sub')?.classList.add('visible');
    document.getElementById('ending-hearts')?.classList.add('visible');
    if (img) setTimeout(() => img.classList.add('show'), 600);
    launchEndingSparkles();
  }, 400);
}

// SCENE 9 — BTS
function enterBTS() {
  const btsWrap = document.getElementById('bts-video-wrap');
  const btsVid  = btsWrap ? btsWrap.querySelector('video') : null;
  if (btsVid) {
    setupVideoMusic(btsVid, true);
  }
}

function launchEndingSparkles() {
  const symbols = ['✦','✧','·','⋆','★','✸'];
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'sparkle';
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      el.style.cssText = `
        left: ${5 + Math.random() * 90}vw;
        top:  ${5 + Math.random() * 80}vh;
        color: ${Math.random() > 0.5 ? 'var(--gold)' : 'var(--rose2)'};
        animation-duration: ${2 + Math.random() * 2}s;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4500);
    }, i * 300);
  }
}

// MUSIC NOTES (floating icons)
const NOTE_SYMBOLS = ['♪','♫','♩','♬','𝅘𝅥𝅮','♭'];

function startMusicNotes() {
  setInterval(() => {
    if (currentScene === 0 || currentScene === 9) return; // pause during video
    spawnNote();
  }, 2800);

  for (let i = 0; i < 4; i++) {
    setTimeout(spawnNote, 300 + i * 400);
  }
}

function spawnNote() {
  const el = document.createElement('div');
  el.className = 'music-note';
  el.textContent = NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)];

  const size = 14 + Math.random() * 14;
  const x    = 6 + Math.random() * 88;
  const dur  = 3.5 + Math.random() * 2.5;
  const delay = Math.random() * 0.4;
  const colorPool = ['var(--rose)','var(--gold)','var(--rose2)','var(--gold2)','rgba(255,255,255,0.5)'];
  const color = colorPool[Math.floor(Math.random() * colorPool.length)];

  el.style.cssText = `
    left: ${x}vw;
    bottom: ${55 + Math.random() * 20}px;
    font-size: ${size}px;
    color: ${color};
    animation-duration: ${dur}s;
    animation-delay: ${delay}s;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), (dur + delay + 0.5) * 1000);
}

// FLOATING HEARTS (random, subtle)
function startFloatingHearts() {
  setInterval(() => {
    if (currentScene === 0 || currentScene === 9) return;
    if (Math.random() > 0.4) return;
    spawnHeart();
  }, 5000);
}

function spawnHeart() {
  const hearts = ['🤍','🩷','🌸','✿','❀'];
  const el = document.createElement('div');
  el.className = 'floating-heart';
  el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
  const dur = 3 + Math.random() * 2;
  el.style.cssText = `
    left: ${10 + Math.random() * 80}vw;
    bottom: ${70 + Math.random() * 30}px;
    font-size: ${14 + Math.random() * 10}px;
    animation-duration: ${dur}s;
    opacity: 0;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000 + 500);
}

// PRE-SCENE PARTICLES
function buildPreParticles() {
  const wrap = document.getElementById('pre-particles');
  if (!wrap) return;
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'pre-particle';
    const size = 1 + Math.random() * 3;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px; height: ${size}px;
      animation-duration: ${8 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 8}s;
      opacity: 0;
      background: ${Math.random() > 0.5 ? 'var(--gold)' : 'var(--rose)'};
    `;
    wrap.appendChild(p);
  }
}

// TAP ZONE 
function setupTapZoneVideoGuard() {
  const tapLeft  = document.getElementById('tap-left');
  const tapRight = document.getElementById('tap-right');

  function isOverVideo(e) {
    const touch = e.touches ? e.touches[0] : e;
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return false;
    return el.closest('video') !== null || el.closest('#video-wrap') !== null || el.closest('#bts-video-wrap') !== null;
  }

  [tapLeft, tapRight].forEach(zone => {
    zone.addEventListener('touchstart', (e) => {
      if (isOverVideo(e)) { e.stopImmediatePropagation(); e.preventDefault(); }
    }, { capture: true, passive: false });

    zone.addEventListener('click', (e) => {
      if (isOverVideo(e)) { e.stopImmediatePropagation(); }
    }, { capture: true });
  });
}

function doFlash() {
  const f = document.getElementById('flash');
  if (!f) return;
  f.classList.add('on');
  setTimeout(() => f.classList.remove('on'), 100);
}

// VOLUME FADE UTIL
function fadeVol(audio, from, to, duration) {
  const steps    = 24;
  const stepTime = duration / steps;
  const diff     = (to - from) / steps;
  let s = 0;
  const iv = setInterval(() => {
    s++;
    audio.volume = Math.min(1, Math.max(0, from + diff * s));
    if (s >= steps) clearInterval(iv);
  }, stepTime);
}