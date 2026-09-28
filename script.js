(() => {
  const cvs = document.getElementById("c");
  const ctx = cvs.getContext("2d");

  let W, H, S, bgGrad;
  let paused = false;
  let started = false;
  let idleTimer;
  let overBar = false;

  const settings = {
    type: "mouse",
    count: 1,
    pace: 1,
    sound: false,
  };

  const PROFILES = {
    mouse: {
      speed: 260,
      dart: 720,
      turn: 7,
      pauseChance: 0.45,
      pause: [0.4, 2.4],
      hideChance: 0.15,
      noise: 0.6,
    },
    bug: {
      speed: 110,
      dart: 320,
      turn: 12,
      pauseChance: 0.35,
      pause: [0.3, 1.8],
      hideChance: 0.08,
      noise: 3.5,
    },
    fish: {
      speed: 150,
      dart: 430,
      turn: 2.8,
      pauseChance: 0.15,
      pause: [0.5, 1.6],
      hideChance: 0.1,
      noise: 0.3,
    },
    bird: {
      speed: 210,
      dart: 680,
      turn: 4.2,
      pauseChance: 0,
      pause: [0.2, 0.5],
      hideChance: 0.18,
      noise: 0.35,
    },
    cursor: {
      speed: 380,
      dart: 1050,
      turn: 11,
      pauseChance: 0.25,
      pause: [0.15, 0.9],
      hideChance: 0.05,
      noise: 0.12,
    },
    laser: {
      speed: 520,
      dart: 1500,
      turn: 22,
      pauseChance: 0.42,
      pause: [0.15, 1.3],
      hideChance: 0.08,
      noise: 1,
    },
  };

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const normalizeAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    W = innerWidth;
    H = innerHeight;

    cvs.width = W * dpr;
    cvs.height = H * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    S = Math.max(26, Math.min(W, H) * 0.045);

    bgGrad = ctx.createRadialGradient(
      W / 2,
      H / 2,
      Math.min(W, H) * 0.1,
      W / 2,
      H / 2,
      Math.hypot(W, H) * 0.6,
    );

    bgGrad.addColorStop(0, "#16304a");
    bgGrad.addColorStop(1, "#081522");
  }

  addEventListener("resize", resize);

  resize();

  let actx = null;
  let lastSound = 0;

  function tone(f1, f2, dur, type = "sine", vol = 0.06, delay = 0) {
    const t = actx.currentTime + delay;

    const oscillator = actx.createOscillator();

    const gain = actx.createGain();

    oscillator.type = type;

    oscillator.frequency.setValueAtTime(f1, t);

    oscillator.frequency.exponentialRampToValueAtTime(f2, t + dur);

    gain.gain.setValueAtTime(0.0001, t);

    gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);

    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    oscillator.connect(gain).connect(actx.destination);

    oscillator.start(t);

    oscillator.stop(t + dur + 0.03);
  }

  function sfx(kind) {
    if (!settings.sound || !actx || paused) {
      return;
    }

    const now = performance.now();

    if (kind !== "catch" && (now - lastSound < 700 || Math.random() < 0.45)) {
      return;
    }

    lastSound = now;

    if (settings.type === "mouse") {
      tone(2600, 3700, 0.07, "sine", 0.06);

      tone(3500, 2500, 0.09, "sine", 0.05, 0.1);
    } else if (settings.type === "bug") {
      for (let i = 0; i < 3; i++) {
        tone(4300, 3900, 0.025, "square", 0.018, i * 0.055);
      }
    } else if (settings.type === "fish") {
      tone(320, 950, 0.12, "sine", 0.08);
    } else if (settings.type === "bird") {
      tone(2900, 4100, 0.08, "sine", 0.045);

      tone(3900, 2600, 0.09, "sine", 0.035, 0.08);
    } else if (settings.type === "cursor") {
      if (kind === "catch") {
        tone(1300, 900, 0.045, "square", 0.02);
      }
    } else {
      tone(1900, 1700, 0.03, "triangle", 0.025);
    }

    if (kind === "catch") {
      tone(600, 1500, 0.16, "triangle", 0.05, 0.05);
    }
  }

  class Critter {
    constructor() {
      this.trail = [];
      this.facing = 1;
      this.reset();
    }

    get p() {
      return PROFILES[settings.type];
    }

    reset() {
      this.phase = Math.random() * 10;

      this.cur = 0;
      this.exiting = false;

      this.x = rand(W * 0.25, W * 0.75);

      this.y = rand(H * 0.25, H * 0.75);

      this.heading = rand(-Math.PI, Math.PI);

      this.facing = Math.cos(this.heading) < 0 ? -1 : 1;

      this.mode = "pause";

      this.t = rand(0.3, 1.2);

      this.trail = [];
    }

    pickTarget(fast = false) {
      const margin = S * 1.6;

      let tx;
      let ty;
      let tries = 0;

      do {
        tx = rand(margin, W - margin);

        ty = rand(margin, H - margin);

        tries++;
      } while (
        Math.hypot(tx - this.x, ty - this.y) < Math.min(W, H) * 0.25 &&
        tries < 8
      );

      this.tx = tx;
      this.ty = ty;

      this.mode = "move";

      this.moveT = 0;
      this.exiting = false;

      const dart = fast || Math.random() < 0.28;

      this.goal = dart ? this.p.dart : this.p.speed * rand(0.7, 1.25);

      if (dart) {
        sfx("dart");
      }
    }

    exit() {
      const offset = S * 3;

      const options = [
        [-offset, this.y],
        [W + offset, this.y],
        [this.x, -offset],
        [this.x, H + offset],
      ];

      const distances = [this.x, W - this.x, this.y, H - this.y];

      [this.tx, this.ty] = options[distances.indexOf(Math.min(...distances))];

      this.exiting = true;
      this.mode = "move";
      this.moveT = 0;

      this.goal = this.p.dart * 0.8;
    }

    enter() {
      this.trail = [];

      if (settings.type === "laser") {
        this.x = rand(S * 2, W - S * 2);

        this.y = rand(S * 2, H - S * 2);

        this.mode = "pause";

        this.t = rand(0.3, 0.9);

        this.cur = 0;

        return;
      }

      const edge = Math.floor(Math.random() * 4);

      const offset = S * 2.5;

      if (edge === 0) {
        this.x = -offset;

        this.y = rand(H * 0.15, H * 0.85);
      } else if (edge === 1) {
        this.x = W + offset;

        this.y = rand(H * 0.15, H * 0.85);
      } else if (edge === 2) {
        this.y = -offset;

        this.x = rand(W * 0.15, W * 0.85);
      } else {
        this.y = H + offset;

        this.x = rand(W * 0.15, W * 0.85);
      }

      this.heading = Math.atan2(H / 2 - this.y, W / 2 - this.x);

      this.facing = Math.cos(this.heading) < 0 ? -1 : 1;

      this.cur = this.p.speed;

      this.pickTarget();

      sfx("enter");
    }

    arrive() {
      const r = Math.random();

      if (r < this.p.hideChance) {
        this.exit();
      } else if (r < this.p.hideChance + this.p.pauseChance) {
        this.mode = "pause";

        this.t = rand(...this.p.pause);
      } else {
        this.pickTarget();
      }
    }

    flee(px, py) {
      const angle = Math.atan2(this.y - py, this.x - px) + rand(-0.6, 0.6);

      const distance = Math.min(W, H) * 0.45;

      const margin = S * 1.6;

      this.tx = clamp(this.x + Math.cos(angle) * distance, margin, W - margin);

      this.ty = clamp(this.y + Math.sin(angle) * distance, margin, H - margin);

      this.mode = "move";

      this.moveT = 0;
      this.exiting = false;

      this.goal = this.p.dart;

      sfx("dart");
    }

    update(dt) {
      const p = this.p;

      const laser = settings.type === "laser";

      if (this.mode === "hidden") {
        this.t -= dt;

        if (this.t <= 0) {
          this.enter();
        }

        return;
      }

      this.phase += dt * (3 + this.cur / 35);

      if (this.mode === "pause") {
        this.t -= dt;

        this.cur += (0 - this.cur) * Math.min(1, dt * 10);

        if (Math.random() < dt * 1.5) {
          this.heading += rand(-0.5, 0.5);
        }

        if (laser) {
          this.x += rand(-1, 1) * S * 0.03;

          this.y += rand(-1, 1) * S * 0.03;
        }

        if (this.t <= 0) {
          this.pickTarget();
        }
      } else {
        this.moveT += dt;

        const dx = this.tx - this.x;

        const dy = this.ty - this.y;

        const distance = Math.hypot(dx, dy);

        let difference = Math.atan2(dy, dx) - this.heading;

        difference = normalizeAngle(difference);

        this.heading +=
          clamp(difference, -p.turn * dt, p.turn * dt) +
          rand(-1, 1) * p.noise * dt;

        const horizontal = Math.cos(this.heading);

        if (horizontal > 0.15) {
          this.facing = 1;
        }

        if (horizontal < -0.15) {
          this.facing = -1;
        }

        let goal = this.goal * settings.pace;

        if (!this.exiting && !laser) {
          goal *= Math.min(1, 0.25 + distance / (S * 4));
        }

        if (Math.abs(difference) > 1.2) {
          goal *= 0.5;
        }

        this.cur += (goal - this.cur) * Math.min(1, dt * (laser ? 10 : 4));

        if (this.exiting) {
          if (
            this.x < -S * 2 ||
            this.x > W + S * 2 ||
            this.y < -S * 2 ||
            this.y > H + S * 2
          ) {
            this.mode = "hidden";

            this.t = rand(1.2, 4);
          }
        } else if (distance < S * 0.9 || this.moveT > 7) {
          this.arrive();
        }
      }

      this.x += Math.cos(this.heading) * this.cur * dt;

      this.y += Math.sin(this.heading) * this.cur * dt;

      if (laser) {
        this.trail.push([this.x, this.y]);

        if (this.trail.length > 14) {
          this.trail.shift();
        }
      }
    }
  }

  const birdFrames = {
    up: new Image(),
    mid: new Image(),
    glide: new Image(),
    down: new Image(),
  };

  birdFrames.up.src = "assets/birds/bird-up.svg";

  birdFrames.mid.src = "assets/birds/bird-mid.svg";

  birdFrames.glide.src = "assets/birds/bird-glide.svg";

  birdFrames.down.src = "assets/birds/bird-down.svg";

  function ellipse(x, y, rx, ry, fill) {
    ctx.beginPath();

    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);

    ctx.fillStyle = fill;

    ctx.fill();
  }

  function drawMouse(c) {
    const s = S;

    const wiggle = 0.15 + Math.min(c.cur / 400, 0.5);

    ellipse(s * 0.12, s * 0.14, s * 0.85, s * 0.5, "rgba(0,0,0,.28)");

    ctx.strokeStyle = "#d8aaa2";

    ctx.lineWidth = s * 0.08;

    ctx.lineCap = "round";

    ctx.beginPath();

    ctx.moveTo(-s * 0.7, 0);

    for (let i = 1; i <= 14; i++) {
      const k = i / 14;

      ctx.lineTo(
        -s * 0.7 - k * s * 1.7,

        Math.sin(c.phase - k * 4) * wiggle * s * k * 1.2,
      );
    }

    ctx.stroke();

    const step = c.cur > 15 ? Math.sin(c.phase * 2) * s * 0.12 : 0;

    [
      [0.4, 1],
      [-0.45, -1],
    ].forEach(([fx, sign]) => {
      ellipse(s * fx + step * sign, s * 0.42, s * 0.1, s * 0.07, "#e9b7b0");

      ellipse(s * fx - step * sign, -s * 0.42, s * 0.1, s * 0.07, "#e9b7b0");
    });

    const g = ctx.createRadialGradient(0, -s * 0.1, s * 0.1, 0, 0, s * 0.85);

    g.addColorStop(0, "#cfc5bb");

    g.addColorStop(1, "#8f857c");

    ellipse(0, 0, s * 0.78, s * 0.46, g);

    [-1, 1].forEach((k) => {
      ellipse(s * 0.55, k * s * 0.31, s * 0.2, s * 0.2, "#b2a79e");

      ellipse(s * 0.56, k * s * 0.31, s * 0.13, s * 0.13, "#f0b1ad");
    });

    ellipse(s * 0.74, 0, s * 0.4, s * 0.31, "#b9aea5");

    ellipse(s * 1.02, 0, s * 0.17, s * 0.13, "#c4b9af");

    [-1, 1].forEach((k) => {
      ellipse(s * 0.88, k * s * 0.14, s * 0.055, s * 0.055, "#15110e");

      ellipse(s * 0.9, k * s * 0.14 - s * 0.02, s * 0.018, s * 0.018, "#fff");
    });

    ellipse(s * 1.18, 0, s * 0.06, s * 0.06, "#f08c9a");

    ctx.strokeStyle = "rgba(255,255,255,.55)";

    ctx.lineWidth = 1;

    [-1, 1].forEach((k) => {
      ctx.beginPath();

      ctx.moveTo(s * 1.08, k * s * 0.06);

      ctx.lineTo(s * 1.35, k * s * 0.3);

      ctx.moveTo(s * 1.08, k * s * 0.06);

      ctx.lineTo(s * 1.4, k * s * 0.12);

      ctx.stroke();
    });
  }

  function drawBug(c) {
    const s = S * 0.62;

    ellipse(s * 0.12, s * 0.14, s * 0.75, s * 0.65, "rgba(0,0,0,.28)");

    ctx.strokeStyle = "#141414";

    ctx.lineWidth = s * 0.08;

    ctx.lineCap = "round";

    const moving = c.cur > 5 ? 1 : 0.15;

    [-1, 1].forEach((side) => {
      for (let i = 0; i < 3; i++) {
        const bx = s * (0.35 - i * 0.35);

        const swing =
          Math.sin(c.phase * 1.8 + i * 2 + (side > 0 ? Math.PI : 0)) *
          s *
          0.18 *
          moving;

        ctx.beginPath();

        ctx.moveTo(bx, side * s * 0.3);

        ctx.lineTo(
          bx + swing + s * 0.12 * (1 - i),

          side * s * 0.88,
        );

        ctx.stroke();
      }

      ctx.lineWidth = s * 0.05;

      ctx.beginPath();

      ctx.moveTo(s * 0.75, side * s * 0.1);

      ctx.quadraticCurveTo(
        s * 1.05,
        side * s * 0.15,

        s * 1.12,
        side * s * (0.35 + Math.sin(c.phase) * 0.05),
      );

      ctx.stroke();

      ctx.lineWidth = s * 0.08;
    });

    ellipse(s * 0.62, 0, s * 0.3, s * 0.3, "#141414");

    [-1, 1].forEach((k) =>
      ellipse(s * 0.78, k * s * 0.13, s * 0.06, s * 0.06, "#f4f0e6"),
    );

    const g = ctx.createRadialGradient(
      s * 0.1,
      -s * 0.2,
      s * 0.05,
      0,
      0,
      s * 0.7,
    );

    g.addColorStop(0, "#ff5a45");

    g.addColorStop(1, "#b8190f");

    ellipse(0, 0, s * 0.62, s * 0.6, g);

    ctx.strokeStyle = "#141414";

    ctx.lineWidth = s * 0.06;

    ctx.beginPath();

    ctx.moveTo(s * 0.45, 0);

    ctx.lineTo(-s * 0.6, 0);

    ctx.stroke();

    ellipse(s * 0.42, 0, s * 0.16, s * 0.42, "#141414");

    [
      [0.12, 0.3],
      [0.12, -0.3],
      [-0.28, 0.36],
      [-0.28, -0.36],
      [-0.02, 0.12],
      [-0.02, -0.12],
    ].forEach(([x, y]) => ellipse(s * x, s * y, s * 0.11, s * 0.11, "#141414"));

    ellipse(s * 0.12, -s * 0.32, s * 0.16, s * 0.08, "rgba(255,255,255,.3)");
  }

  function drawFish(c) {
    const s = S * 1.05;

    const amp = 0.2 + Math.min(c.cur / 500, 0.4);

    const N = 16;

    const top = [];
    const bottom = [];

    let tail;

    for (let i = 0; i <= N; i++) {
      const k = i / N;

      const x = s * 0.95 - k * s * 1.7;

      const y = Math.sin(c.phase * 0.8 - k * 3) * amp * s * k * k * 0.6;

      const width =
        s *
        0.34 *
        (k < 0.3 ? Math.sqrt(k / 0.3) : 1 - ((k - 0.3) / 0.7) * 0.82);

      top.push([x, y - width]);

      bottom.push([x, y + width]);

      if (i === N) {
        tail = [x, y];
      }
    }

    ellipse(s * 0.1, s * 0.12, s * 0.9, s * 0.32, "rgba(0,0,0,.25)");

    const tailAngle = Math.sin(c.phase * 0.8 - 3.2) * amp * 1.4;

    ctx.save();

    ctx.translate(tail[0], tail[1]);

    ctx.rotate(tailAngle);

    ctx.fillStyle = "rgba(255,214,110,.85)";

    ctx.beginPath();

    ctx.moveTo(s * 0.05, 0);

    ctx.quadraticCurveTo(-s * 0.25, -s * 0.1, -s * 0.5, -s * 0.32);

    ctx.quadraticCurveTo(-s * 0.35, 0, -s * 0.5, s * 0.32);

    ctx.quadraticCurveTo(-s * 0.25, s * 0.1, s * 0.05, 0);

    ctx.fill();

    ctx.restore();

    const flap = Math.sin(c.phase * 1.3) * 0.35;

    [-1, 1].forEach((k) => {
      ctx.save();

      ctx.translate(s * 0.45, k * s * 0.26);

      ctx.rotate(k * (0.9 + flap));

      ellipse(-s * 0.12, 0, s * 0.2, s * 0.08, "rgba(255,224,140,.8)");

      ctx.restore();
    });

    ctx.save();

    ctx.beginPath();

    ctx.moveTo(...top[0]);

    top.forEach((point) => ctx.lineTo(...point));

    for (let i = bottom.length - 1; i >= 0; i--) {
      ctx.lineTo(...bottom[i]);
    }

    ctx.closePath();

    const g = ctx.createLinearGradient(0, -s * 0.35, 0, s * 0.35);

    g.addColorStop(0, "#f7b733");

    g.addColorStop(0.5, "#ffd766");

    g.addColorStop(1, "#f7b733");

    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();

    ellipse(s * 0.7, -s * 0.05, s * 0.28, s * 0.3, "#fff8e8");

    ellipse(-s * 0.15, s * 0.12, s * 0.22, s * 0.16, "#fff8e8");

    ellipse(s * 0.15, -s * 0.18, s * 0.12, s * 0.1, "#e0741f");

    ctx.restore();

    [-1, 1].forEach((k) =>
      ellipse(s * 0.82, k * s * 0.14, s * 0.045, s * 0.045, "#1a1208"),
    );
  }

  function drawBird(c) {
    const sequence = [
      birdFrames.up,
      birdFrames.mid,
      birdFrames.glide,
      birdFrames.mid,
      birdFrames.down,
      birdFrames.mid,
    ];

    const image = sequence[Math.floor(c.phase * 0.8) % sequence.length];

    if (!image.complete || !image.naturalWidth) {
      return;
    }

    const width = S * 3.2;

    const height = width * (180 / 320);

    ctx.drawImage(image, -width * 0.5, -height * 0.5, width, height);
  }

  function drawCursor() {
    const s = 18;

    ctx.save();

    ctx.shadowColor = "rgba(0,0,0,.35)";

    ctx.shadowBlur = s * 0.08;

    ctx.shadowOffsetX = s * 0.06;

    ctx.shadowOffsetY = s * 0.08;

    ctx.beginPath();

    ctx.moveTo(-s * 0.56, -s * 0.86);

    ctx.lineTo(-s * 0.5, s * 0.6);

    ctx.lineTo(-s * 0.13, s * 0.25);

    ctx.lineTo(s * 0.23, s * 0.91);

    ctx.lineTo(s * 0.49, s * 0.77);

    ctx.lineTo(s * 0.13, s * 0.12);

    ctx.lineTo(s * 0.64, s * 0.1);

    ctx.closePath();

    ctx.fillStyle = "#fff";

    ctx.strokeStyle = "#080808";

    ctx.lineWidth = Math.max(2, s * 0.075);

    ctx.lineJoin = "round";

    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  function drawLaser(c) {
    for (let i = 0; i < c.trail.length; i++) {
      const [x, y] = c.trail[i];

      ctx.globalAlpha = (i / c.trail.length) * 0.22;

      ellipse(x, y, S * 0.09, S * 0.09, "#ff3b30");
    }

    ctx.globalAlpha = 1;

    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, S * 0.8);

    g.addColorStop(0, "rgba(255,60,50,.55)");

    g.addColorStop(1, "rgba(255,60,50,0)");

    ellipse(c.x, c.y, S * 0.8, S * 0.8, g);

    ellipse(c.x, c.y, S * 0.14, S * 0.14, "#ff3b30");

    ellipse(c.x, c.y, S * 0.065, S * 0.065, "#ffe1dc");
  }

  const DRAW = {
    mouse: drawMouse,
    bug: drawBug,
    fish: drawFish,
    bird: drawBird,
    cursor: drawCursor,
  };

  function drawCritter(c) {
    if (c.mode === "hidden") {
      return;
    }

    if (settings.type === "laser") {
      drawLaser(c);

      return;
    }

    ctx.save();

    ctx.translate(c.x, c.y);

    if (settings.type === "bird") {
      let pitch =
        c.facing === -1
          ? normalizeAngle(c.heading - Math.PI)
          : normalizeAngle(c.heading);

      pitch = clamp(pitch, -0.48, 0.48);

      ctx.rotate(pitch);

      if (c.facing === -1) {
        ctx.scale(-1, 1);
      }
    } else if (settings.type !== "cursor") {
      ctx.rotate(c.heading);
    }

    DRAW[settings.type](c);

    ctx.restore();
  }

  const sparks = [];

  function burst(x, y) {
    for (let i = 0; i < 14; i++) {
      const angle = rand(0, Math.PI * 2);

      const velocity = rand(120, 380);

      sparks.push({
        x,
        y,

        vx: Math.cos(angle) * velocity,

        vy: Math.sin(angle) * velocity,

        life: 1,
      });
    }
  }

  let critters = [];

  function rebuild() {
    critters = Array.from(
      {
        length: settings.count,
      },

      () => new Critter(),
    );
  }

  rebuild();

  let last = performance.now();

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);

    last = now;

    ctx.fillStyle = bgGrad;

    ctx.fillRect(0, 0, W, H);

    critters.forEach((c) => {
      if (!paused) {
        c.update(dt);
      }

      drawCritter(c);
    });

    for (let i = sparks.length - 1; i >= 0; i--) {
      const spark = sparks[i];

      if (!paused) {
        spark.x += spark.vx * dt;

        spark.y += spark.vy * dt;

        spark.vx *= 0.92;

        spark.vy *= 0.92;

        spark.life -= dt * 1.6;
      }

      if (spark.life <= 0) {
        sparks.splice(i, 1);

        continue;
      }

      ctx.globalAlpha = spark.life;

      ellipse(spark.x, spark.y, S * 0.08, S * 0.08, "#f2c14e");
    }

    ctx.globalAlpha = 1;

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  let catches = 0;

  const catchesEl = document.getElementById("catches");

  cvs.addEventListener(
    "pointerdown",

    (event) => {
      if (paused) {
        return;
      }

      critters.forEach((c) => {
        if (c.mode === "hidden") {
          return;
        }

        const distance = Math.hypot(
          c.x - event.clientX,

          c.y - event.clientY,
        );

        if (distance < S * 1.5) {
          catches++;

          catchesEl.textContent = `Catches: ${catches}`;

          burst(c.x, c.y);

          sfx("catch");

          if (settings.type === "laser") {
            c.mode = "hidden";

            c.t = rand(0.6, 1.4);
          } else {
            c.flee(event.clientX, event.clientY);
          }
        } else if (distance < S * 4 && settings.type !== "laser") {
          c.flee(event.clientX, event.clientY);
        }
      });
    },
  );

  cvs.addEventListener(
    "pointermove",

    (event) => {
      if (paused || settings.type === "laser") {
        return;
      }

      critters.forEach((c) => {
        if (c.mode === "hidden" || c.exiting || c.goal === c.p.dart) {
          return;
        }

        if (
          Math.hypot(
            c.x - event.clientX,

            c.y - event.clientY,
          ) <
          S * 3
        ) {
          c.flee(event.clientX, event.clientY);
        }
      });
    },
  );

  const soundBtn = document.getElementById("sound");

  const pauseBtn = document.getElementById("pause");

  const fsBtn = document.getElementById("fs");

  const bar = document.getElementById("bar");

  const intro = document.getElementById("intro");

  const startBtn = document.getElementById("start");

  function setPressed(button, pressed) {
    button.setAttribute("aria-pressed", String(pressed));
  }

  function syncBarAccessibility() {
    const hidden =
      document.body.classList.contains("idle") ||
      document.body.classList.contains("hidebar");

    bar.inert = hidden;

    bar.setAttribute("aria-hidden", String(hidden));
  }

  function showControls() {
    document.body.classList.remove("idle");

    syncBarAccessibility();
  }

  document.querySelectorAll(".group[data-set]").forEach((group) => {
    group.addEventListener(
      "click",

      (event) => {
        const button = event.target.closest("button");

        if (!button) {
          return;
        }

        group.querySelectorAll("button").forEach((item) => {
          const selected = item === button;

          item.classList.toggle("on", selected);

          setPressed(item, selected);
        });

        const key = group.dataset.set;

        const value = button.dataset.v;

        settings[key] = key === "type" ? value : Number(value);

        if (key !== "pace") {
          rebuild();
        }
      },
    );
  });

  function setSound(on) {
    settings.sound = on;

    if (on && !actx) {
      try {
        actx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (_) {}
    }

    if (on && !paused && actx?.state === "suspended") {
      actx.resume().catch(() => {});
    }

    soundBtn.textContent = on ? "🔊 Sound on" : "🔇 Sound off";

    soundBtn.classList.toggle("on", on);

    setPressed(soundBtn, on);
  }

  soundBtn.addEventListener(
    "click",

    () => {
      setSound(!settings.sound);
    },
  );

  let lock = null;

  async function keepAwake() {
    if (
      !started ||
      paused ||
      document.visibilityState !== "visible" ||
      !("wakeLock" in navigator) ||
      (lock && !lock.released)
    ) {
      return;
    }

    try {
      lock = await navigator.wakeLock.request("screen");

      lock.addEventListener(
        "release",

        () => {
          lock = null;
        },

        {
          once: true,
        },
      );
    } catch (_) {
      lock = null;
    }
  }

  async function releaseWakeLock() {
    if (!lock) {
      return;
    }

    const currentLock = lock;

    lock = null;

    try {
      await currentLock.release();
    } catch (_) {}
  }

  function togglePause() {
    paused = !paused;

    pauseBtn.textContent = paused ? "▶ Resume" : "⏸ Pause";

    pauseBtn.classList.toggle("on", paused);

    setPressed(pauseBtn, paused);

    if (paused) {
      document.body.classList.remove("idle", "hidebar");

      clearTimeout(idleTimer);

      syncBarAccessibility();

      releaseWakeLock();

      if (actx?.state === "running") {
        actx.suspend().catch(() => {});
      }
    } else {
      last = performance.now();

      if (settings.sound && actx?.state === "suspended") {
        actx.resume().catch(() => {});
      }

      keepAwake();

      armIdle();
    }
  }

  pauseBtn.addEventListener("click", togglePause);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  fsBtn.addEventListener("click", toggleFullscreen);

  document.addEventListener(
    "fullscreenchange",

    () => {
      const fullscreen = Boolean(document.fullscreenElement);

      fsBtn.textContent = fullscreen ? "⛶ Exit fullscreen" : "⛶ Fullscreen";

      setPressed(fsBtn, fullscreen);
    },
  );

  document.addEventListener(
    "visibilitychange",

    () => {
      if (document.visibilityState === "visible" && started && !paused) {
        keepAwake();
      } else {
        releaseWakeLock();
      }
    },
  );

  startBtn.addEventListener(
    "click",

    () => {
      started = true;

      startBtn.blur();

      intro.classList.add("gone");

      intro.inert = true;

      intro.setAttribute("aria-hidden", "true");

      document.documentElement.requestFullscreen?.().catch(() => {});

      keepAwake();

      armIdle();
    },
  );

  bar.addEventListener(
    "pointerenter",

    () => {
      overBar = true;
    },
  );

  bar.addEventListener(
    "pointerleave",

    () => {
      overBar = false;
    },
  );

  function armIdle() {
    showControls();

    clearTimeout(idleTimer);

    if (paused) {
      return;
    }

    idleTimer = setTimeout(
      () => {
        if (started && !overBar && !paused) {
          document.body.classList.add("idle");

          syncBarAccessibility();
        } else {
          armIdle();
        }
      },

      2500,
    );
  }

  addEventListener(
    "pointermove",

    (event) => {
      if (event.pointerType === "mouse") {
        armIdle();
      }
    },
  );

  function toggleControlBar() {
    if (paused) {
      return;
    }

    document.body.classList.toggle("hidebar");

    document.body.classList.remove("idle");

    syncBarAccessibility();
  }

  addEventListener(
    "keydown",

    (event) => {
      const key = event.key.toLowerCase();

      if (key === "f") {
        toggleFullscreen();
      } else if (key === "h") {
        toggleControlBar();
      } else if (key === "p") {
        togglePause();
      } else if ("123456".includes(key) && key.length === 1) {
        const button = document.querySelectorAll(
          '.group[data-set="type"] button',
        )[Number(key) - 1];

        if (button) {
          button.click();
        }
      }
    },
  );

  syncBarAccessibility();
})();
