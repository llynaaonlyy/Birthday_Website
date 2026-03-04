/* ============================================================
   BIRTHDAY RAIHAN — script.js
   Ana × Raihan · 2025
   ============================================================ */

// ============================================================
// CONFIG — Edit sesuai kebutuhan Ana
// ============================================================
const CONFIG = {
  musicVolume: 0.32,
  musicFadeOut: 0.08,    // volume saat video ucapan play
  musicFadeIn: 1800,     // ms fade in saat start
  musicFadeOutMs: 1600,  // ms fade out saat video play

  // --- Typewriter lines Scene 3 ---
  // cls options: "tw-line" | "tw-line date" | "tw-line highlight" | "tw-line small"
  typewriterLines: [
    { text: "5 Juli 2025…", cls: "tw-line date" },
    { text: "Kamu balas catatan IG ku.", cls: "tw-line" },
    { text: "Dari satu notif kecil itu…", cls: "tw-line" },
    { text: "semuanya dimulai.", cls: "tw-line highlight" },
    // ============================================================
    // EDIT INI: Tambah/ganti baris cerita awal kenal di sini
    // Contoh:
    // { text: "Aku bahkan ga nyangka bakal sejauh ini…", cls: "tw-line small" },
    // { text: "Tapi ternyata kamu beda dari yang lain.", cls: "tw-line" },
    // ============================================================
    { text: "[ Tulis cerita awal kenal kalian di sini… ]", cls: "tw-line small" },
  ],

  // --- Slider captions Scene 5 ---
  sliderCaptions: [
    "Kita nulis cerita kita sendiri 🤍",
    "Setiap foto nyimpen sejuta kenangan…",
    "Aku seneng banget bisa ada di sini, sama kamu.",
    "Semakin hari, semakin sayang.",
    "Semoga masih banyak foto lagi yang kita ambil 🌸",
  ],

  // --- Scene name labels (progress bar) ---
  sceneNames: [
    "",
    "🎂 Countdown",
    "🌱 19 th",
    "💌 Awal Kenal",
    "🌊 First Date",
    "📸 Kenangan Kita",
    "🌸 Hal Kecil Tentang Kamu",
    "🎥 Pesan dari aku",
    "🌸 Selamanya",
    "🎬 Behind The Story",
  ],
};

// ============================================================
// STATE
// ============================================================
let currentScene = 0;
const TOTAL_SCENES = 9;
let sliderInterval  = null;
let sliderIdx       = 0;
let countdownDone   = false;
let isMusicPlaying  = false;

const music = document.getElementById('bg-music');

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  buildPreParticles();
  document.getElementById('scene-pre').addEventListener('click', startStory);
});

// ============================================================
// START STORY
// ============================================================
function startStory() {
  if (isMusicPlaying) return; // prevent double tap
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

// ============================================================
// SCENE NAVIGATION
// ============================================================
function goToScene(n) {
  if (n < 1 || n > TOTAL_SCENES) return;

  const prevEl = document.querySelector('.scene.active');
  if (prevEl) prevEl.classList.remove('active');

  // Stop slider if leaving scene 5
  if (currentScene === 5 && n !== 5 && sliderInterval) {
    clearInterval(sliderInterval);
    sliderInterval = null;
  }

  // Resume music volume if leaving video scene
  if (currentScene === 7 && n !== 7) {
    const vid = document.getElementById('main-video');
    if (vid && !vid.paused) {
      vid.pause();
    }
    // Kembalikan volume musik jika bukan BTS
    if (music.volume < CONFIG.musicVolume) {
      if (!music.paused) {
        fadeVol(music, music.volume, CONFIG.musicVolume, 2000);
      } else {
        music.play().catch(() => {});
        fadeVol(music, 0, CONFIG.musicVolume, 2000);
      }
    }
  }

  if (currentScene === 9 && n !== 9) {
    const btsVid = document.querySelector('#bts-video-wrap video');
    if (btsVid && !btsVid.paused) {
      btsVid.pause();
    }
    // Resume musik jika sedang berhenti karena BTS
    if (music.paused) {
      music.play().catch(() => {});
      fadeVol(music, 0, CONFIG.musicVolume, 2000);
    }
  }

  currentScene = n;
  const sceneEl = document.getElementById('scene-' + n);
  if (sceneEl) sceneEl.classList.add('active');

  updateProgress();
  updateSceneCounter();
  onEnter(n);
}

function nextScene() { doFlash(); goToScene(currentScene + 1); }
function prevScene() { doFlash(); goToScene(currentScene - 1); }

// ============================================================
// PROGRESS
// ============================================================
function updateProgress() {
  const pct = Math.round((currentScene / TOTAL_SCENES) * 100);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-pct').textContent  = pct + '%';
  document.getElementById('scene-name').textContent    = CONFIG.sceneNames[currentScene] || '';
}

function updateSceneCounter() {
  document.getElementById('scene-counter').textContent =
    '0' + currentScene + ' / 0' + TOTAL_SCENES;
}

// ============================================================
// SCENE ENTER HOOKS
// ============================================================
function onEnter(n) {
  const fn = {
    1: enterCountdown,
    2: enterChildhood,
    3: enterTypewriter,
    4: () => {}, // static
    5: enterSlider,
    6: enterJokes,
    7: enterVideo,
    8: enterEnding,
    9: enterBTS,
  };
  if (fn[n]) fn[n]();
}

// ============================================================
// SCENE 1 — COUNTDOWN
// ============================================================
function enterCountdown() {
  if (countdownDone) {
    // Jika countdown sudah selesai, langsung tampilkan Happy Birthday (ring sudah hidden)
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
  if (ring) ring.style.strokeDashoffset = '0';

  const tick = setInterval(() => {
    // Vibrate saat angka 1 (countdown terakhir sebelum 0)
    if (count === 1 && navigator.vibrate) {
      navigator.vibrate([120, 60, 200]);
    }

    // Pulse animation
    numEl.style.transform = 'scale(1.25)';
    numEl.style.opacity   = '0.5';
    setTimeout(() => {
      numEl.style.transform = 'scale(1)';
      numEl.style.opacity   = '1';
    }, 200);

    // Ring progress
    if (ring) {
      const offset = CIRCUMFERENCE * (count / 3);
      ring.style.strokeDashoffset = String(CIRCUMFERENCE - offset);
    }

    count--;
    if (count > 0) {
      numEl.textContent = count;
    } else {
      clearInterval(tick);
      countdownDone = true;
      if (navigator.vibrate) navigator.vibrate([150, 80, 200, 80, 150]);

      numEl.style.opacity = '0';
      setTimeout(() => {
        // Sembunyikan seluruh ring wrapper agar Happy Birthday bisa center
        const ringEl = document.querySelector('.countdown-ring');
        if (ringEl) {
          ringEl.style.transition = 'opacity 0.4s ease';
          ringEl.style.opacity    = '0';
          setTimeout(() => { ringEl.style.display = 'none'; }, 420);
        }
        numEl.style.display  = 'none';
        titleEl.style.display = 'block';
        subEl.style.display   = 'block';
        document.getElementById('scene-1').classList.add('show-birthday');
        launchConfetti();
        launchBirthdaySparkles();
      }, 400);
    }
  }, 900);
}

// ============================================================
// CONFETTI
// ============================================================
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

// ============================================================
// SCENE 2 — CHILDHOOD
// ============================================================
function enterChildhood() {
  const badge   = document.getElementById('age-badge');
  const ageLabel = document.getElementById('age-label');
  const caption = document.getElementById('s2-caption');
  const photos  = document.querySelectorAll('.childhood-photo');

  badge.classList.remove('visible');
  if (ageLabel) ageLabel.classList.remove('visible');
  caption.classList.remove('visible');
  photos.forEach(p => p.classList.remove('visible'));

  setTimeout(() => badge.classList.add('visible'), 300);
  setTimeout(() => { if (ageLabel) ageLabel.classList.add('visible'); }, 600);

  photos.forEach((p, i) => {
    setTimeout(() => {
      photos.forEach(x => x.classList.remove('visible'));
      p.classList.add('visible');
    }, 800 + i * 2600);
  });

  setTimeout(() => caption.classList.add('visible'), 1000);
}

// ============================================================
// SCENE 3 — TYPEWRITER
// ============================================================
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
    const chars = [...text]; // supports emoji

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

// ============================================================
// SCENE 5 — SLIDER
// ============================================================
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

// ============================================================
// SCENE 6 — JOKES
// ============================================================
function enterJokes() {
  const cards = document.querySelectorAll('.joke-card');
  cards.forEach(c => c.classList.remove('pop'));
  cards.forEach((c, i) => {
    setTimeout(() => c.classList.add('pop'), 250 + i * 320);
  });
}

// ============================================================
// SCENE 7 — VIDEO UCAPAN
// ============================================================
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
  // Pastikan tidak autoplay & pakai kontrol bawaan browser
  vid.removeAttribute('autoplay');
  vid.setAttribute('controls', '');
  vid.pause();

  // Cegah event listener dobel
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

// ============================================================
// SCENE 8 — ENDING
// ============================================================
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

// ============================================================
// SCENE 9 — BTS
// ============================================================
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

// ============================================================
// MUSIC NOTES (floating icons)
// ============================================================
const NOTE_SYMBOLS = ['♪','♫','♩','♬','𝅘𝅥𝅮','♭'];

function startMusicNotes() {
  setInterval(() => {
    if (currentScene === 0 || currentScene === 7) return; // pause during video
    spawnNote();
  }, 2800);

  // burst on start
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

// ============================================================
// FLOATING HEARTS (random, subtle)
// ============================================================
function startFloatingHearts() {
  setInterval(() => {
    if (currentScene === 0 || currentScene === 7) return;
    if (Math.random() > 0.4) return; // ~40% chance each tick
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

// ============================================================
// PRE-SCENE PARTICLES
// ============================================================
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

// ============================================================
// TAP ZONE — nonaktifkan saat kursor/sentuhan di atas elemen video
// ============================================================
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
    // Intercept touchstart — block navigation se sentuh area video
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

// ============================================================
// VOLUME FADE UTIL
// ============================================================
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