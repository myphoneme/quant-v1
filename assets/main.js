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
})();
