(() => {
  'use strict';

  const STAGES = ['stage0.jpg', 'stage1.jpg', 'stage2.jpg', 'stage3.jpg'];
  const CHANGE_TIMES = [23, 45, 60];
  const FINISH_SECONDS = 90;
  const CLIMAX_SECONDS = 90;

  const app = document.getElementById('app');
  const button = document.getElementById('startButton');
  const audio = document.getElementById('song');
  const stageImage = document.getElementById('stageImage');
  const cleanFlash = document.getElementById('cleanFlash');
  const bigStars = document.getElementById('bigStars');
  const bubbleParty = document.getElementById('bubbleParty');
  const celebration = document.getElementById('celebration');

  STAGES.forEach((src) => { const img = new Image(); img.src = src; });

  let timers = [];
  let running = false;
  let finished = false;

  const addTimer = (fn, ms) => timers.push(window.setTimeout(fn, ms));
  const clearTimers = () => { timers.forEach(window.clearTimeout); timers = []; };
  const replay = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  const flashAt = (x, y) => {
    cleanFlash.style.setProperty('--flash-x', x);
    cleanFlash.style.setProperty('--flash-y', y);
    replay(cleanFlash, 'show');
  };

  const setStage = (index) => {
    stageImage.classList.add('switching');
    window.setTimeout(() => {
      stageImage.src = STAGES[index];
      if (index === 3) stageImage.classList.add('clean-mode');
      window.setTimeout(() => stageImage.classList.remove('switching'), 130);
    }, 45);

    // バイキンが消えた場所に、はっきり大きい「ピカッ」を出す。
    if (index === 1) flashAt('27%', '39%');
    if (index === 2) flashAt('70%', '39%');
    if (index === 3) flashAt('50%', '50%');
  };

  const resetVisuals = () => {
    app.className = 'app';
    stageImage.src = STAGES[0];
    stageImage.classList.remove('switching', 'clean-mode');
    cleanFlash.classList.remove('show');
    bigStars.classList.remove('on');
    bubbleParty.classList.remove('on');
    celebration.classList.remove('show');
  };

  const reset = () => {
    clearTimers();
    running = false;
    finished = false;
    resetVisuals();
    audio.pause();
    try { audio.currentTime = 0; } catch (_) {}
  };

  const finish = () => {
    if (!running || finished) return;
    finished = true;
    app.classList.add('finished');
    app.classList.add('climax-cleaning');
    bigStars.classList.add('on');
    bubbleParty.classList.add('on');
    replay(celebration, 'show');
    // 音源は強制停止しない。最後まで自然に流す。
  };

  const start = async () => {
    reset();
    running = true;
    app.classList.add('running');

    // 0〜10秒は画面を落ち着かせる。10秒後から泡だけ出す。全体キラキラは90秒のごほうびまで出さない。
    CHANGE_TIMES.forEach((sec, i) => addTimer(() => setStage(i + 1), sec * 1000));
    addTimer(() => {
      bubbleParty.classList.add('on');
      app.classList.add('early-cleaning');
    }, 10 * 1000);
    addTimer(() => app.classList.add('first-cleaning'), 23 * 1000);
    addTimer(() => app.classList.add('mid-cleaning'), 45 * 1000);
    addTimer(() => app.classList.add('sparkle-party'), 60 * 1000);
    // クライマックスは90秒終了時に finish() の中で開始。
    addTimer(finish, FINISH_SECONDS * 1000);

    try {
      audio.currentTime = 0;
      await audio.play();
    } catch (_) {
      // iPhone/iPadの再生開始が遅れても、画面進行は維持。
    }
  };

  button.addEventListener('click', () => { if (!running || finished) start(); }, { passive: true });
  audio.addEventListener('ended', () => {
    if (running && !finished) finish();
    running = false;
    app.classList.remove('running');
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && running) reset(); });
})();
