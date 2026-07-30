(function () {
  "use strict";
  function fmtINR(n) {
    return "₹" + Math.round(n).toLocaleString("en-IN");
  }
  function calc() {
    var amount = parseFloat(document.getElementById("sip-amount").value);
    var annualReturn = parseFloat(document.getElementById("sip-return").value);
    var years = parseFloat(document.getElementById("sip-years").value);

    document.getElementById("sip-amount-val").textContent = fmtINR(amount);
    document.getElementById("sip-return-val").textContent = annualReturn + "%";
    document.getElementById("sip-years-val").textContent = years + (years == 1 ? " year" : " years");

    var months = years * 12;
    var monthlyRate = annualReturn / 100 / 12;
    var maturity;
    if (monthlyRate === 0) {
      maturity = amount * months;
    } else {
      maturity = amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    }
    var invested = amount * months;
    var gains = Math.max(maturity - invested, 0);

    document.getElementById("sip-maturity").textContent = fmtINR(maturity);
    document.getElementById("sip-invested").textContent = fmtINR(invested);
    document.getElementById("sip-gains").textContent = fmtINR(gains);

    var investedPct = Math.max(6, Math.min(94, (invested / maturity) * 100 || 6));
    document.getElementById("sip-bar-invested").style.height = investedPct + "%";
    document.getElementById("sip-bar-gains").style.height = (100 - investedPct) + "%";
  }

  ["sip-amount", "sip-return", "sip-years"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", calc);
  });
  if (document.getElementById("sip-amount")) calc();
})();
