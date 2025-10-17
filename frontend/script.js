
async function sendMessage() {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const userMessage = input.value;

  chatBox.innerHTML += `<p><strong>Você:</strong> ${userMessage}</p>`;

  const response = await fetch("http://localhost:8000/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt: userMessage })
  });

  const data = await response.json();
  chatBox.innerHTML += `<p><strong>Multiversal:</strong> ${data.response}</p>`;

  input.value = "";
}
