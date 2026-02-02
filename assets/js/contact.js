document.addEventListener("DOMContentLoaded", function () {
  console.log("contact.js loaded");

  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  if (!form) {
    console.error("Form not found (#contactForm)");
    return;
  }

  var API_URL = "https://api.9thframefilms.com/contact";

  function setStatus(msg, state) {
    // state: "success" | "error" | "info"
    if (!status) return;
    status.textContent = msg;
    status.style.opacity = "1";
    status.className = "status " + (state || "info");
  }

  function safeTrim(v) {
    return (v && String(v).trim()) || "";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var el = form.elements;

    // Honeypot check (bots fill this)
    if (el["company"] && el["company"].value) {
      return; // silently drop spam
    }

    var payload = {
      name: safeTrim(el["name"] && el["name"].value),
      email: safeTrim(el["email"] && el["email"].value),
      project: safeTrim(el["project"] && el["project"].value),
      dateWindow: safeTrim(el["dateWindow"] && el["dateWindow"].value),
      budget: safeTrim(el["budget"] && el["budget"].value),
      message: safeTrim(el["message"] && el["message"].value),
      // include honeypot field for visibility on server if you ever want it
      company: safeTrim(el["company"] && el["company"].value)
    };

    // Required fields (keep aligned with what YOU want required)
    if (!payload.name || !payload.email || !payload.project || !payload.message) {
      setStatus("Please fill in: name, email, project, and message.", "error");
      return;
    }

    // Timeout so it doesn’t hang forever on mobile networks
    var controller = new AbortController();
    var timeoutMs = 15000; // 15s
    var timeoutId = setTimeout(function () {
      controller.abort();
    }, timeoutMs);

    setStatus("Sending…", "info");

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      mode: "cors",
      signal: controller.signal
    })
      .then(function (res) {
        clearTimeout(timeoutId);

        // Read as text first so we can handle HTML/empty responses gracefully
        return res.text().then(function (text) {
          var data = null;

          try {
            data = text ? JSON.parse(text) : null;
          } catch (_) {
            data = null; // non-JSON response (like 503 HTML)
          }

          if (!res.ok || !data || !data.ok) {
            // Prefer server-provided JSON message if available
            var serverMsg = data && data.error ? " (" + data.error + ")" : "";

            // Useful debug if Apache returns HTML
            if (!data && text && text.indexOf("<html") !== -1) {
              serverMsg = " (server returned HTML error)";
            }

            throw new Error("Request failed: " + res.status + serverMsg);
          }

          return data;
        });
      })
      .then(function () {
        setStatus("Message sent ✓", "success");
        form.reset();
      })
      .catch(function (err) {
        clearTimeout(timeoutId);
        console.error("Contact submit error:", err);

        // Better user-facing messages
        if (err && err.name === "AbortError") {
          setStatus("Request timed out. Try again or email instead.", "error");
          return;
        }

        setStatus("Couldn’t reach the server. Try email instead.", "error");
      });
  });
});
