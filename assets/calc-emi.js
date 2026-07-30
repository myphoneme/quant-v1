(function () {
  "use strict";
  function fmtINR(n) {
    return "₹" + Math.round(n).toLocaleString("en-IN");
  }
  function calc() {
    var amount = parseFloat(document.getElementById("emi-amount").value);
    var annualRate = parseFloat(document.getElementById("emi-rate").value);
    var years = parseFloat(document.getElementById("emi-years").value);

    document.getElementById("emi-amount-val").textContent = fmtINR(amount);
    document.getElementById("emi-rate-val").textContent = annualRate + "%";
    document.getElementById("emi-years-val").textContent = years + (years == 1 ? " year" : " years");

    var months = years * 12;
    var monthlyRate = annualRate / 100 / 12;
    var emi;
    if (monthlyRate === 0) {
      emi = amount / months;
    } else {
      emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    }
    var totalPayable = emi * months;
    var totalInterest = Math.max(totalPayable - amount, 0);

    document.getElementById("emi-monthly").textContent = fmtINR(emi);
    document.getElementById("emi-principal").textContent = fmtINR(amount);
    document.getElementById("emi-interest").textContent = fmtINR(totalInterest);
    document.getElementById("emi-total").textContent = fmtINR(totalPayable);
  }

  var typeSelect = document.getElementById("emi-type");
  if (typeSelect) {
    typeSelect.addEventListener("change", function () {
      var opt = typeSelect.options[typeSelect.selectedIndex];
      document.getElementById("emi-amount").value = opt.getAttribute("data-amount");
      document.getElementById("emi-rate").value = opt.getAttribute("data-rate");
      document.getElementById("emi-years").value = opt.getAttribute("data-years");
      calc();
    });
  }

  ["emi-amount", "emi-rate", "emi-years"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", calc);
  });
  if (document.getElementById("emi-amount")) calc();
})();
