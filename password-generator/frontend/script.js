const API_URL = "http://127.0.0.1:5000/generate";

const lengthInput = document.getElementById("length");
const lettersCheckbox = document.getElementById("letters");
const digitsCheckbox = document.getElementById("digits");
const specialCheckbox = document.getElementById("special");
const generateBtn = document.getElementById("generateBtn");
const resultBox = document.getElementById("resultBox");
const copyBtn = document.getElementById("copyBtn");
const strengthMeter = document.getElementById("strengthMeter");

generateBtn.addEventListener("click", generatePassword);
copyBtn.addEventListener("click", copyPassword);

async function generatePassword() {
  const length = parseInt(lengthInput.value, 10) || 12;
  const letters = lettersCheckbox.checked;
  const digits = digitsCheckbox.checked;
  const special = specialCheckbox.checked;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ length, letters, digits, special }),
  });

  const data = await res.json();
  if (data.error) {
    resultBox.value = "⚠ " + data.error;
    strengthMeter.textContent = "Strength: ❌ Weak";
    strengthMeter.className = "strength str-weak";
    return;
  }

  resultBox.value = data.password;
  checkStrength(data.password);
}

function copyPassword() {
  const pw = resultBox.value;
  if (!pw || pw.startsWith("⚠")) return;
  navigator.clipboard.writeText(pw);
  alert("📋 Password copied!");
}

function checkStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[\W_]/.test(password)) score++;

  if (score <= 2) {
    strengthMeter.className = "strength str-weak";
    strengthMeter.textContent = "Strength: ❌ Weak";
  } else if (score <= 4) {
    strengthMeter.className = "strength str-medium";
    strengthMeter.textContent = "Strength: ⚠ Medium";
  } else {
    strengthMeter.className = "strength str-strong";
    strengthMeter.textContent = "Strength: 💪 Strong";
  }
}
