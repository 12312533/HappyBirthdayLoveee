/* =========================================================
   SPIDER-MAN BIRTHDAY — FULL JAVASCRIPT
   ========================================================= */

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const preloader = $("#preloader");
  const loaderBar = $("#loaderBar");
  const startBtn = $("#startBtn");
  const audio = $("#bgAudio");
  const musicBtn = $("#playSongBtn");
  const musicText = $("#musicText");
  const audioStatus = $("#audioStatus");
  const webCanvas = $("#webCanvas");
  const cursor = $("#webCursor");
  const progress = $("#scrollProgress");

  let siteStarted = false;
  let audioUnlocked = false;
  let typeDone = false;
  let villainsHit = 0;
  let giftOpened = false;
  let draggingGift = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  /* ---------------------------------------------------------
     GSAP setup
  --------------------------------------------------------- */
  const hasGSAP = typeof window.gsap !== "undefined";
  if (hasGSAP && typeof window.ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------------------------------------------------------
     Cursor
  --------------------------------------------------------- */
  if (cursor && window.matchMedia("(pointer:fine)").matches) {
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let tx = cx;
    let ty = cy;

    window.addEventListener("pointermove", e => {
      tx = e.clientX;
      ty = e.clientY;
    }, {passive:true});

    const cursorLoop = () => {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      cursor.style.left = `${cx}px`;
      cursor.style.top = `${cy}px`;
      requestAnimationFrame(cursorLoop);
    };
    cursorLoop();

    document.addEventListener("pointerdown", () => cursor.classList.add("is-clicking"));
    document.addEventListener("pointerup", () => cursor.classList.remove("is-clicking"));

    $$("button, .comic-card, .gift").forEach(el => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-clicking"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-clicking"));
    });
  }

  /* ---------------------------------------------------------
     Loader
     --------------------------------------------------------- */
  let loaderProgress = 0;
  const loaderTimer = setInterval(() => {
    loaderProgress += Math.random() * 9 + 4;
    if (loaderProgress >= 100) {
      loaderProgress = 100;
      clearInterval(loaderTimer);
      startBtn.disabled = false;
    }
    if (loaderBar) loaderBar.style.width = `${loaderProgress}%`;
  }, 120);

  function startExperience() {
    if (siteStarted) return;
    siteStarted = true;

    document.body.classList.remove("is-loading");

    if (hasGSAP) {
      gsap.to(preloader, {
        yPercent: -100,
        duration: 1.1,
        ease: "power4.inOut",
        onComplete: () => {
          preloader.classList.add("is-done");
          preloader.setAttribute("aria-hidden", "true");
          initAnimations();
          tryAutoPlayMuted();
        }
      });
    } else {
      preloader.classList.add("is-done");
      initAnimations();
      tryAutoPlayMuted();
    }

    unlockAudio();
  }

  startBtn?.addEventListener("click", startExperience);

  // Fallback: jika user menekan Enter/Space saat loader selesai.
  preloader?.addEventListener("keydown", e => {
    if ((e.key === "Enter" || e.key === " ") && loaderProgress >= 100) {
      e.preventDefault();
      startExperience();
    }
  });

  /* ---------------------------------------------------------
     AUDIO

     Catatan penting:
     Chrome/Edge/Firefox/Safari dapat MEMBLOKIR autoplay
     dengan suara sebelum ada interaksi user.

     Solusi:
     1. Saat halaman mulai: coba autoplay MUTED.
     2. Begitu user klik "ENTER", web shooter, gift, dll:
        unmute + play.

     Jadi website tidak error walaupun browser menolak autoplay.
  --------------------------------------------------------- */
  audio.volume = 0.55;
  audio.muted = true;

  async function tryAutoPlayMuted() {
    if (!audio) return;

    try {
      await audio.play();
      showAudioStatus("Music ready • sound will activate on interaction");
    } catch (err) {
      showAudioStatus("Klik sekali di halaman untuk mengaktifkan musik");
    }
  }

  async function unlockAudio() {
    if (!audio || audioUnlocked) return;

    try {
      audio.muted = false;
      audio.volume = 0.55;
      await audio.play();
      audioUnlocked = true;
      updateMusicButton(true);
      showAudioStatus("♫ Music ON");
    } catch (err) {
      // Browser masih menolak; tombol Play Our Song tetap tersedia.
      audio.muted = true;
      showAudioStatus("Klik PLAY OUR SONG untuk menyalakan musik");
    }
  }

  function updateMusicButton(playing) {
    if (!musicBtn) return;
    musicBtn.classList.toggle("is-playing", playing);
    if (musicText) musicText.textContent = playing ? "PAUSE OUR SONG" : "PLAY OUR SONG";
  }

  async function toggleAudio() {
    if (!audio) return;

    try {
      if (audio.paused) {
        audio.muted = false;
        audio.volume = 0.55;
        await audio.play();
        audioUnlocked = true;
        updateMusicButton(true);
        showAudioStatus("♫ Music ON");
      } else {
        audio.pause();
        updateMusicButton(false);
        showAudioStatus("Music paused");
      }
    } catch (err) {
      showAudioStatus("File musik belum ditemukan / format tidak didukung");
    }
  }

  musicBtn?.addEventListener("click", e => {
    e.stopPropagation();
    toggleAudio();
  });

  // Any meaningful first interaction can unlock sound.
  ["pointerdown", "touchstart", "keydown"].forEach(eventName => {
    window.addEventListener(eventName, () => {
      if (siteStarted && !audioUnlocked) unlockAudio();
    }, {once:false, passive:true});
  });

  function showAudioStatus(message) {
    if (!audioStatus) return;
    audioStatus.textContent = message;
    audioStatus.classList.add("show");
    clearTimeout(showAudioStatus.timer);
    showAudioStatus.timer = setTimeout(() => {
      audioStatus.classList.remove("show");
    }, 3000);
  }

  audio?.addEventListener("error", () => {
    showAudioStatus("Musik tidak ditemukan. Pastikan file 'lagu.mp3' ada di folder website.");
  });

  /* ---------------------------------------------------------
     Scroll progress
  --------------------------------------------------------- */
  function updateProgress() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = `${value}%`;
  }
  window.addEventListener("scroll", updateProgress, {passive:true});
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ---------------------------------------------------------
     Web canvas
     --------------------------------------------------------- */
  const ctx = webCanvas?.getContext("2d");
  let webW = 0;
  let webH = 0;
  let webDpr = Math.min(window.devicePixelRatio || 1, 2);
  const webShots = [];

  function resizeCanvas() {
    if (!webCanvas || !ctx) return;
    webW = window.innerWidth;
    webH = window.innerHeight;
    webDpr = Math.min(window.devicePixelRatio || 1, 2);
    webCanvas.width = Math.floor(webW * webDpr);
    webCanvas.height = Math.floor(webH * webDpr);
    webCanvas.style.width = `${webW}px`;
    webCanvas.style.height = `${webH}px`;
    ctx.setTransform(webDpr, 0, 0, webDpr, 0, 0);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function drawWebs() {
    if (!ctx) return;
    ctx.clearRect(0,0,webW,webH);

    for (let i = webShots.length - 1; i >= 0; i--) {
      const shot = webShots[i];
      const age = performance.now() - shot.time;
      const progress = Math.min(age / shot.duration, 1);

      ctx.save();
      ctx.globalAlpha = 1 - progress;
      ctx.strokeStyle = shot.color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(shot.x1, shot.y1);
      const x = shot.x1 + (shot.x2 - shot.x1) * progress;
      const y = shot.y1 + (shot.y2 - shot.y1) * progress;
      ctx.lineTo(x,y);
      ctx.stroke();

      // little web knots
      ctx.beginPath();
      ctx.arc(x,y,4 + progress * 4,0,Math.PI*2);
      ctx.stroke();

      ctx.restore();

      if (progress >= 1) webShots.splice(i,1);
    }

    requestAnimationFrame(drawWebs);
  }
  drawWebs();

  function shootWebTo(x2,y2, fromX = window.innerWidth/2, fromY = window.innerHeight*.78) {
    webShots.push({
      x1:fromX,
      y1:fromY,
      x2,y2,
      time:performance.now(),
      duration:650,
      color:"#ffffff"
    });
  }

  /* ---------------------------------------------------------
     Hero web shooter
  --------------------------------------------------------- */
  const heroTitle = $("#heroTitle");
  const webShooter = $("#webShooter");
  const chapter2 = $("#chapter2");

  function activateHero() {
    unlockAudio();

    const rect = heroTitle?.getBoundingClientRect();
    if (rect) {
      shootWebTo(rect.left + rect.width/2, rect.top + rect.height/2);
    }

    if (hasGSAP) {
      gsap.timeline()
        .to(".hero-title", {scale:1.05, duration:.18, ease:"power2.out"})
        .to(".hero-title", {scale:1, duration:.22, ease:"back.out(2)"})
        .to(".hero", {filter:"brightness(1.5)", duration:.12})
        .to(".hero", {filter:"brightness(1)", duration:.25});
    }

    setTimeout(() => {
      chapter2?.scrollIntoView({behavior:"smooth", block:"start"});
    }, 420);
  }

  heroTitle?.addEventListener("click", activateHero);
  heroTitle?.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activateHero();
    }
  });
  webShooter?.addEventListener("click", activateHero);

  /* ---------------------------------------------------------
     Villain mini game
  --------------------------------------------------------- */
  const villains = $$(".villain");
  const scoreEl = $("#webScore");
  const missionMsg = $("#missionMsg");
  const rewardBox = $("#rewardBox");
  const webHit = $("#webHit");

  villains.forEach(villain => {
    villain.addEventListener("click", e => {
      if (villain.classList.contains("is-hit")) return;

      const rect = villain.getBoundingClientRect();
      shootWebTo(rect.left + rect.width/2, rect.top + rect.height/2);

      villain.classList.add("is-hit");
      villainsHit++;

      if (scoreEl) scoreEl.textContent = villainsHit;

      if (webHit) {
        webHit.style.left = `${rect.left}px`;
        webHit.style.top = `${rect.top}px`;
        webHit.classList.remove("active");
        void webHit.offsetWidth;
        webHit.classList.add("active");
      }

      if (villainsHit >= 3) {
        setTimeout(() => {
          rewardBox?.classList.add("is-free");
          missionMsg?.classList.add("show");
        }, 450);
      }
    });
  });

  $("#nextBtn")?.addEventListener("click", () => {
    $("#chapter3")?.scrollIntoView({behavior:"smooth"});
  });

  /* ---------------------------------------------------------
     Gift drag / tap
  --------------------------------------------------------- */
  const gift = $("#gift");
  const giftStage = $("#giftStage");
  const dragLabel = $("#dragLabel");

  function openGift() {
    if (giftOpened) return;
    giftOpened = true;

    unlockAudio();
    gift?.classList.add("is-open");
    if (dragLabel) dragLabel.textContent = "WEB UNLOCKED!";

    const reveal = $("#chapter4");
    setTimeout(() => {
      reveal?.scrollIntoView({behavior:"smooth"});
      setTimeout(startTypewriter, 900);
    }, 850);
  }

  gift?.addEventListener("click", openGift);
  gift?.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openGift();
    }
  });

  gift?.addEventListener("pointerdown", e => {
    if (giftOpened) return;
    draggingGift = true;
    gift.setPointerCapture?.(e.pointerId);

    const r = gift.getBoundingClientRect();
    dragOffsetX = e.clientX - (r.left + r.width/2);
    dragOffsetY = e.clientY - (r.top + r.height/2);

    gift.style.transition = "none";
  });

  gift?.addEventListener("pointermove", e => {
    if (!draggingGift || giftOpened) return;

    const stage = giftStage.getBoundingClientRect();
    const x = e.clientX - stage.left - stage.width/2 - dragOffsetX;
    const y = e.clientY - stage.top - stage.height/2 - dragOffsetY;

    const gs = parseFloat(getComputedStyle(gift).getPropertyValue("--gs")) || 1;
    gift.style.transform = `translate(${x}px,${y}px) rotate(${x/18}deg) scale(${gs})`;

    if (Math.abs(x) > stage.width * .22 || Math.abs(y) > stage.height * .22) {
      draggingGift = false;
      gift.style.transition = "";
      openGift();
    }
  });

  function endDrag() {
    if (!gift) return;
    draggingGift = false;
    if (!giftOpened) gift.style.transform = "";
    gift.style.transition = "";
  }

  gift?.addEventListener("pointerup", endDrag);
  gift?.addEventListener("pointercancel", endDrag);

  /* ---------------------------------------------------------
     Typewriter
  --------------------------------------------------------- */
  const message =
`Happy birthday, 18th Sayangg. ❤️

Hari ini bukan cuma tentang bertambahnya satu angka di usia kamu. Hari ini adalah pengingat bahwa ada seseorang yang begitu berharga dan pantas dirayakan.

Semoga di tahun baru kehidupanmu, langkahmu selalu dimudahkan, rezekimu dilancarkan, kesehatanmu dijaga, dan semua hal baik yang kamu impikan perlahan menemukan jalannya.

Terima kasih sudah menjadi seseorang yang punya tempat spesial dalam cerita ini. Semoga kita terus punya banyak halaman untuk ditulis, banyak kota untuk dijelajahi, banyak tawa untuk dibagikan, dan banyak kenangan yang suatu hari nanti akan kita lihat kembali sambil tersenyum.

Keep being you. Keep being my favorite hero.

Happy birthday, my favorite person. 🕷️❤️`;

  function startTypewriter() {
    if (typeDone) return;
    const target = $("#typewriterText");
    if (!target) return;

    typeDone = true;
    target.textContent = message;
    target.style.minHeight = target.offsetHeight + "px"; // kunci tinggi
    target.textContent = "";

    let index = 0;
    const speed = 24;

    function type() {
      if (index >= message.length) {
        $("#caret")?.remove();
        target.style.minHeight = "";
        return;
      }

      target.textContent += message[index];
      index++;
      setTimeout(type, message[index-1] === "\n" ? 130 : speed);
    }
    type();
  }

  $("#letterBody")?.addEventListener("click", () => {
    if (!typeDone) {
      typeDone = true;
      const target = $("#typewriterText");
      if (target) target.textContent = message;
      $("#caret")?.remove();
    }
  });

  /* ---------------------------------------------------------
     Images: reliable fallback + preload detection
  --------------------------------------------------------- */
  $$(".comic-photo img").forEach(img => {
    const markMissing = () => {
      img.classList.add("is-missing");
      img.parentElement?.classList.add("is-missing");
    };

    img.addEventListener("error", markMissing);

    // Some local-server cases can resolve after the DOM event.
    if (img.complete && img.naturalWidth === 0) markMissing();

    img.addEventListener("load", () => {
      img.classList.remove("is-missing");
      img.parentElement?.classList.remove("is-missing");
    });
  });

  /* ---------------------------------------------------------
     GSAP scroll animations
  --------------------------------------------------------- */
  function initAnimations() {
    if (!hasGSAP) return;

    gsap.from(".hero-inner > *", {
      opacity:0,
      y:40,
      duration:.9,
      stagger:.12,
      ease:"power3.out"
    });

    if (typeof window.ScrollTrigger !== "undefined") {
      gsap.utils.toArray(".comic-card").forEach((card, i) => {
        gsap.from(card, {
          opacity:0,
          y:70,
          rotate:i % 2 ? 4 : -4,
          duration:.8,
          ease:"power3.out",
          clearProps:"transform,opacity",
          onStart:() => { card.style.transition = "none"; },
          onComplete:() => { card.style.transition = ""; },
          scrollTrigger:{
            trigger:card,
            start:"top 88%",
            once:true
          }
        });
      });

      gsap.from(".letter", {
        opacity:0,
        y:80,
        rotate:-7,
        duration:1,
        ease:"back.out(1.5)",
        scrollTrigger:{
          trigger:".letter-scene",
          start:"top 75%",
          once:true,
          onEnter:() => startTypewriter()
        }
      });

      gsap.to(".spider--small", {
        y:130,
        rotation:8,
        ease:"none",
        scrollTrigger:{
          trigger:"main",
          start:"top top",
          end:"bottom bottom",
          scrub:1
        }
      });

      gsap.to(".spider--medium", {
        y:-180,
        x:-80,
        rotation:-8,
        ease:"none",
        scrollTrigger:{
          trigger:"main",
          start:"top top",
          end:"bottom bottom",
          scrub:1.2
        }
      });

      gsap.to(".spider--giant", {
        y:240,
        x:-70,
        rotation:3,
        ease:"none",
        scrollTrigger:{
          trigger:"main",
          start:"top top",
          end:"bottom bottom",
          scrub:1.5
        }
      });

      gsap.to(".hero-grid", {
        yPercent:25,
        ease:"none",
        scrollTrigger:{
          trigger:".hero",
          start:"top top",
          end:"bottom top",
          scrub:true
        }
      });
    }

    // Recalculate after images load.
    setTimeout(() => {
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 700);
  }

  /* ---------------------------------------------------------
     Back to top
  --------------------------------------------------------- */
  $("#backTop")?.addEventListener("click", () => {
    window.scrollTo({top:0,behavior:"smooth"});
  });

  /* ---------------------------------------------------------
     Prevent accidental anchor-like stuck states
  --------------------------------------------------------- */
  window.addEventListener("load", () => {
    // Critical fix: always release scroll after page load.
    document.body.classList.remove("is-loading");
    updateProgress();

    if (window.ScrollTrigger) {
      setTimeout(() => ScrollTrigger.refresh(), 400);
    }
  });

  // If page was restored from browser back/forward cache.
  window.addEventListener("pageshow", () => {
    document.body.classList.remove("is-loading");
    updateProgress();
  });

})();