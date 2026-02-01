document.addEventListener("DOMContentLoaded", function () {
  console.log("contact.js loaded");

  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  if (!form) {
    console.error("Form not found (#contactForm)");
    return;
  }

  var API_URL = "https://api.9thframefilms.com/contact";

  function setStatus(msg, ok) {
    if (!status) return;
    status.textContent = msg;
    status.style.opacity = "1";
    status.className = "status " + (ok ? "success" : "error");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var el = form.elements;

    // Honeypot check (bots fill this)
    if (el["company"] && el["company"].value) {
      return; // silently drop spam
    }

    var payload = {
      name: (el["name"] && el["name"].value ? el["name"].value.trim() : ""),
      email: (el["email"] && el["email"].value ? el["email"].value.trim() : ""),
      project: (el["project"] && el["project"].value ? el["project"].value.trim() : ""),
      dateWindow: (el["dateWindow"] && el["dateWindow"].value ? el["dateWindow"].value.trim() : ""),
      budget: (el["budget"] && el["budget"].value ? el["budget"].value.trim() : ""),
      message: (el["message"] && el["message"].value ? el["message"].value.trim() : "")
    };

    if (!payload.name || !payload.email || !payload.project || !payload.message) {
      setStatus("Please fill in: name, email, project, and message.", false);
      return;
    }

    setStatus("Sending…", true);

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json()
          .catch(function () { return null; })
          .then(function (data) {
            if (!res.ok || !data || !data.ok) {
              var serverMsg = (data && data.error) ? (" (" + data.error + ")") : "";
              throw new Error("Request failed: " + res.status + serverMsg);
            }
            return data;
          });
      })
      .then(function () {
        setStatus("Message sent ✓", true);
        form.reset();
      })
      .catch(function (err) {
        console.error("Contact submit error:", err);
        setStatus("Couldn’t reach the server. Try email instead.", false);
      });
  });
});
