// Phoneme Quant — shared site behaviour (nav, accordions, FAQs, contact form)
(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector(".menu-toggle");
  var panel = document.querySelector(".mobile-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  // Generic accordion (disclosures) + FAQ (same mechanism, different classes)
  function wireToggle(triggerSelector, panelClass) {
    document.querySelectorAll(triggerSelector).forEach(function (trigger) {
      trigger.setAttribute("aria-expanded", "false");
      trigger.addEventListener("click", function () {
        var panel = trigger.parentElement.querySelector("." + panelClass);
        var expanded = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", expanded ? "false" : "true");
        if (!panel) return;
        if (expanded) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    });
  }
  wireToggle(".accordion-trigger", "accordion-panel");
  wireToggle(".faq-q", "faq-a");

  // Active nav link based on current path
  var here = (location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll(".nav-links a, .mobile-panel a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === here || (here === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  // Contact form: client-side validation + hand-off to WhatsApp with a pre-filled message.
  // NOTE for whoever wires this to production: replace the whatsappHandoff() call below
  // with a POST to your form backend of choice (Formspree, Web3Forms, your own CRM endpoint).
  // This keeps the page fully functional with zero backend for now.
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.getElementById("form-status");
      var name = form.name.value.trim();
      var contact = form.contact.value.trim();
      var interest = form.interest.value;
      var message = form.message.value.trim();
      var consent = form.consent.checked;

      if (!name || !contact || !consent) {
        status.textContent = "Please fill your name, a phone/email, and accept the note above before sending.";
        status.className = "form-status show error";
        return;
      }

      var text = "Hello Phoneme Quant, I have a query.\n" +
        "Name: " + name + "\n" +
        "Contact: " + contact + "\n" +
        "Interested in: " + (interest || "Not specified") + "\n" +
        (message ? "Message: " + message : "");

      status.textContent = "Thanks, " + name.split(" ")[0] + " — opening WhatsApp with your query pre-filled. Prefer email? Write to phonemequant@gmail.com.";
      status.className = "form-status show success";
      form.reset();

      window.open("https://wa.me/918527095766?text=" + encodeURIComponent(text), "_blank");
    });
  }
  // Cursor-reactive particle field for the homepage hero.
  var hero = document.querySelector(".hero");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (hero && !reduceMotion.matches) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    if (context) {
      canvas.className = "hero-particles";
      canvas.setAttribute("aria-hidden", "true");
      hero.insertBefore(canvas, hero.firstChild);

      var particles = [];
      var pointer = { x: 0, y: 0, renderX: 0, renderY: 0, active: false, initialized: false };
      var width = 0;
      var height = 0;
      var pixelRatio = 1;
      var colors = ["#FF6B27", "#F59E0B", "#EF4444", "#DB2777", "#7C3AED", "#2563EB"];
      var desktopDensity = window.innerWidth > 700;

      function buildParticles() {
        var bounds = hero.getBoundingClientRect();
        width = Math.max(1, Math.round(bounds.width));
        height = Math.max(1, Math.round(bounds.height));
        pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        var count = desktopDensity
          ? Math.min(125, Math.max(78, Math.round(width / 12)))
          : Math.min(44, Math.max(28, Math.round(width / 13)));
        particles = [];
        for (var i = 0; i < count; i += 1) {
          var baseX = Math.random() * width;
          var baseY = Math.random() * height;
          particles.push({
            x: baseX,
            y: baseY,
            baseX: baseX,
            baseY: baseY,
            vx: 0,
            vy: 0,
            phase: Math.random() * Math.PI * 2,
            speed: 0.35 + Math.random() * 0.45,
            drift: 2 + Math.random() * 4,
            length: 2 + Math.random() * 3.5,
            width: 0.8 + Math.random() * 0.85,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 0.12 + Math.random() * 0.18
          });
        }
      }

      function updatePointer(event) {
        if (event.pointerType === "touch") return;
        var bounds = hero.getBoundingClientRect();
        pointer.x = event.clientX - bounds.left;
        pointer.y = event.clientY - bounds.top;
        pointer.active =
          pointer.x >= 0 && pointer.x <= bounds.width &&
          pointer.y >= 0 && pointer.y <= bounds.height;
        if (pointer.active && !pointer.initialized) {
          pointer.renderX = pointer.x;
          pointer.renderY = pointer.y;
          pointer.initialized = true;
        }
      }

      hero.addEventListener("pointermove", updatePointer, { passive: true });
      hero.addEventListener("pointerenter", updatePointer, { passive: true });
      hero.addEventListener("pointerleave", function () {
        pointer.active = false;
        pointer.initialized = false;
      }, { passive: true });

      function draw(time) {
        context.clearRect(0, 0, width, height);
        var seconds = time * 0.001;
        if (pointer.active) {
          pointer.renderX += (pointer.x - pointer.renderX) * 0.16;
          pointer.renderY += (pointer.y - pointer.renderY) * 0.16;
          var glowRadius = 95;
          var glow = context.createRadialGradient(pointer.renderX, pointer.renderY, 0, pointer.renderX, pointer.renderY, glowRadius);
          glow.addColorStop(0, "rgba(255,107,39,0.09)");
          glow.addColorStop(0.48, "rgba(124,58,237,0.045)");
          glow.addColorStop(1, "rgba(37,99,235,0)");
          context.fillStyle = glow;
          context.fillRect(pointer.renderX - glowRadius, pointer.renderY - glowRadius, glowRadius * 2, glowRadius * 2);
        }

        particles.forEach(function (particle) {
          var targetX = particle.baseX + Math.sin(seconds * particle.speed + particle.phase) * particle.drift;
          var targetY = particle.baseY + Math.cos(seconds * particle.speed * 0.8 + particle.phase) * particle.drift;
          var proximity = 0;

          if (pointer.active) {
            var dx = targetX - pointer.renderX;
            var dy = targetY - pointer.renderY;
            var distance = Math.sqrt(dx * dx + dy * dy) || 1;
            var radius = Math.min(440, Math.max(280, width * 0.28));

            if (distance < radius) {
              proximity = 1 - distance / radius;
              var curve = proximity * proximity * 1.05;
              var expansion = 1 + proximity * 0.16;
              var cosine = Math.cos(curve);
              var sine = Math.sin(curve);
              var curvedX = (dx * cosine - dy * sine) * expansion;
              var curvedY = (dx * sine + dy * cosine) * expansion;
              targetX = pointer.renderX + curvedX;
              targetY = pointer.renderY + curvedY;
            }
          }

          particle.vx += (targetX - particle.x) * 0.032;
          particle.vy += (targetY - particle.y) * 0.032;
          particle.vx *= 0.84;
          particle.vy *= 0.84;
          particle.x += particle.vx;
          particle.y += particle.vy;

          var angle = pointer.active
            ? Math.atan2(particle.y - pointer.renderY, particle.x - pointer.renderX) + Math.PI * 0.5
            : Math.atan2(particle.vy, particle.vx);
          var halfLength = particle.length * (1 + proximity * 1.65) * 0.5;
          context.beginPath();
          context.moveTo(
            particle.x - Math.cos(angle) * halfLength,
            particle.y - Math.sin(angle) * halfLength
          );
          context.lineTo(
            particle.x + Math.cos(angle) * halfLength,
            particle.y + Math.sin(angle) * halfLength
          );
          context.strokeStyle = particle.color;
          context.globalAlpha = Math.min(0.58, particle.alpha + proximity * 0.32);
          context.lineWidth = particle.width;
          context.lineCap = "round";
          context.stroke();
        });

        context.globalAlpha = 1;
        window.requestAnimationFrame(draw);
      }

      buildParticles();
      if ("ResizeObserver" in window) {
        new ResizeObserver(buildParticles).observe(hero);
      } else {
        window.addEventListener("resize", buildParticles);
      }
      window.requestAnimationFrame(draw);
    }
  }
})();
