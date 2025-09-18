const API_URL = "http://127.0.0.1:5000/calculate";

async function calculate(operation) {
  const num1 = document.getElementById("num1").value;
  const num2 = document.getElementById("num2").value;

  if (num1 === "" || num2 === "") {
    document.getElementById("resultBox").innerText = "⚠ Please enter both numbers.";
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ num1, num2, operation })
    });

    const data = await res.json();

    if (data.error) {
      document.getElementById("resultBox").innerText = "❌ " + data.error;
    } else {
      document.getElementById("resultBox").innerText = "✅ Result: " + data.result;
    }
  } catch (err) {
    document.getElementById("resultBox").innerText = "⚠ Backend not running!";
  }
}
