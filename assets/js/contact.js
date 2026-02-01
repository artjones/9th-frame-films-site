document.addEventListener("DOMContentLoaded", () => {
  console.log("contact.js loaded");

  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  if (!form) {
    console.error("Form not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    const data = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value
    };

    try {
      const res = await fetch("https://api.9thframefilms.com/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.ok) {
        status.textContent = "Message sent ✓";
      } else {
        status.textContent = "Something went wrong.";
      }
    } catch (err) {
      console.error(err);
      status.textContent = "Network error.";
    }
  });
});
