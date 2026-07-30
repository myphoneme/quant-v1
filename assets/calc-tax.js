(function () {
  "use strict";
  function fmtINR(n) {
    return "₹" + Math.round(Math.max(n, 0)).toLocaleString("en-IN");
  }

  // FY 2025-26 / AY 2026-27 slabs, individuals below 60. Illustrative only.
  var NEW_SLABS = [
    [400000, 0], [800000, 0.05], [1200000, 0.10], [1600000, 0.15],
    [2000000, 0.20], [2400000, 0.25], [Infinity, 0.30],
  ];
  var OLD_SLABS = [
    [250000, 0], [500000, 0.05], [1000000, 0.20], [Infinity, 0.30],
  ];

  function slabTax(taxable, slabs) {
    var tax = 0, lower = 0;
    for (var i = 0; i < slabs.length; i++) {
      var upper = slabs[i][0], rate = slabs[i][1];
      if (taxable > lower) {
        tax += (Math.min(taxable, upper) - lower) * rate;
      }
      lower = upper;
      if (taxable <= upper) break;
    }
    return tax;
  }

  function withCess(tax) {
    return tax * 1.04;
  }

  function calc() {
    var income = parseFloat(document.getElementById("tax-income").value);
    var deductions = parseFloat(document.getElementById("tax-deductions").value);
    var salaried = document.getElementById("tax-salaried").checked;

    document.getElementById("tax-income-val").textContent = fmtINR(income);
    document.getElementById("tax-deductions-val").textContent = fmtINR(deductions);

    var stdDeduction = salaried ? 75000 : 0;

    // New regime: standard deduction only (deductions field is an old-regime concept)
    var newTaxable = Math.max(income - stdDeduction, 0);
    var newTax = slabTax(newTaxable, NEW_SLABS);
    if (newTaxable <= 1200000) newTax = 0; // Section 87A rebate, FY25-26
    newTax = withCess(newTax);

    // Old regime: standard deduction + user-entered deductions
    var oldTaxable = Math.max(income - stdDeduction - deductions, 0);
    var oldTax = slabTax(oldTaxable, OLD_SLABS);
    if (oldTaxable <= 500000) oldTax = 0; // Section 87A rebate, old regime
    oldTax = withCess(oldTax);

    document.getElementById("tax-new").textContent = fmtINR(newTax);
    document.getElementById("tax-old").textContent = fmtINR(oldTax);

    var savings = Math.abs(newTax - oldTax);
    document.getElementById("tax-savings").textContent = fmtINR(savings);
    document.getElementById("tax-winner").textContent = newTax <= oldTax ? "New Regime" : "Old Regime";
  }

  ["tax-income", "tax-deductions", "tax-salaried"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", calc);
  });
  if (document.getElementById("tax-income")) calc();
})();
