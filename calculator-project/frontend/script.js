const API_URL = "http://127.0.0.1:5000/calculate";

function append(value) {
  const display = document.getElementById("display");
  display.value += value;
}

function clearDisplay() {
  document.getElementById("display").value = "";
  document.getElementById("resultBox").innerText = "Result will appear here";
}

async function calculateResult() {
  const expression = document.getElementById("display").value;

  if (expression.trim() === "") {
    document.getElementById("resultBox").innerText = "⚠ Please enter an expression.";
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expression })
    });

    const data = await res.json();

    if (data.status === "error") {
      document.getElementById("resultBox").innerText = "❌ " + data.message;
    } else {
      document.getElementById("resultBox").innerText = "✅ Result: " + data.result;
      document.getElementById("display").value = data.result; // show result in display
    }
  } catch (err) {
    document.getElementById("resultBox").innerText = "⚠ Backend not running!";
  }
}
