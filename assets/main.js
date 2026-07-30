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
      var pointer = { x: 0, y: 0, active: false };
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
          ? Math.min(260, Math.max(150, Math.round(width / 6.5)))
          : Math.min(70, Math.max(42, Math.round(width / 9)));
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
            drift: 4 + Math.random() * 7,
            length: 4 + Math.random() * 6,
            width: 1.3 + Math.random() * 1.7,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 0.35 + Math.random() * 0.3
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
      }

      hero.addEventListener("pointermove", updatePointer, { passive: true });
      hero.addEventListener("pointerenter", updatePointer, { passive: true });
      hero.addEventListener("pointerleave", function () {
        pointer.active = false;
      }, { passive: true });

      function draw(time) {
        context.clearRect(0, 0, width, height);
        var seconds = time * 0.001;

        particles.forEach(function (particle) {
          var targetX = particle.baseX + Math.sin(seconds * particle.speed + particle.phase) * particle.drift;
          var targetY = particle.baseY + Math.cos(seconds * particle.speed * 0.8 + particle.phase) * particle.drift;
          var proximity = 0;

          if (pointer.active) {
            var dx = targetX - pointer.x;
            var dy = targetY - pointer.y;
            var distance = Math.sqrt(dx * dx + dy * dy) || 1;
            var radius = Math.min(620, Math.max(380, width * 0.4));

            if (distance < radius) {
              proximity = 1 - distance / radius;
              var curve = proximity * proximity * 1.35;
              var expansion = 1 + proximity * 0.22;
              var cosine = Math.cos(curve);
              var sine = Math.sin(curve);
              var curvedX = (dx * cosine - dy * sine) * expansion;
              var curvedY = (dx * sine + dy * cosine) * expansion;
              targetX = pointer.x + curvedX;
              targetY = pointer.y + curvedY;
            }
          }

          particle.vx += (targetX - particle.x) * 0.032;
          particle.vy += (targetY - particle.y) * 0.032;
          particle.vx *= 0.84;
          particle.vy *= 0.84;
          particle.x += particle.vx;
          particle.y += particle.vy;

          var angle = pointer.active
            ? Math.atan2(particle.y - pointer.y, particle.x - pointer.x) + Math.PI * 0.5
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
          context.globalAlpha = Math.min(0.86, particle.alpha + proximity * 0.36);
          context.lineWidth = particle.width;
          context.lineCap = "round";
          context.stroke();
        });

        context.globalAlpha = 1;
        window.requestAnimationFrame(draw);
      }

      buildParticles();      if ("ResizeObserver" in window) {
        new ResizeObserver(buildParticles).observe(hero);
      } else {
        window.addEventListener("resize", buildParticles);
      }
      window.requestAnimationFrame(draw);
    }
  }
})();
