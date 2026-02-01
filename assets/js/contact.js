const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");

const API_BASE = "https://api.9thframefilms.com";

function setStatus(msg, type){
  statusEl.textContent = msg;
  statusEl.className = `status ${type || ""}`.trim();
}

function validate(data){
  if(!data.name?.trim()) return "Please enter your name.";
  if(!data.email?.trim()) return "Please enter your email.";
  if(!data.project?.trim()) return "Tell me what you’re making.";
  if(!data.message?.trim()) return "Add a short message.";
  return null;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = Object.fromEntries(new FormData(form));

  // honeypot: if filled, silently succeed
  if (payload.company && payload.company.trim()) {
    form.reset();
    return setStatus("Message sent ✓", "ok");
  }
  delete payload.company;

  const err = validate(payload);
  if (err) return setStatus(err, "err");

  setStatus("Sending…");
  form.querySelector("button[type='submit']").disabled = true;

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Request failed");

    form.reset();
    setStatus("Message sent ✓ I’ll get back to you soon.", "ok");

  } catch (error) {
    setStatus("Couldn’t send right now. Try again in a minute.", "err");
  } finally {
    form.querySelector("button[type='submit']").disabled = false;
  }
});
