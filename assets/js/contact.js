document.addEventListener("DOMContentLoaded", function () {
  console.log("contact.js loaded");

  var form = document.getElementById("contactForm");
var status = document.getElementById("contactStatus");
  if (!form) {
    console.error("Form not found (#contactForm)");
    return;
  }

  // Grab the submit button (no ID required)
  var submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
  // If you used spans inside the button (recommended)
  var btnTextEl = submitBtn ? submitBtn.querySelector(".btn-text") : null;

  var API_URL = "https://api.9thframefilms.com/contact";

  function setStatus(msg, state) {
    // state: "success" | "error" | "info"
    if (!status) return;
    status.textContent = msg;
    status.style.opacity = "1";
    status.className = "status " + (state || "info");
  }

  function clearStatusLater(ms) {
    if (!status) return;
    window.setTimeout(function () {
      // only clear if it hasn't changed since
      status.textContent = "";
      status.className = "status";
      status.style.opacity = "0";
    }, ms);
  }

  function safeTrim(v) {
    return (v && String(v).trim()) || "";
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;

    // Disable button while sending
    submitBtn.disabled = isLoading;

    // Add a class so your CSS spinner can show
    if (submitBtn.classList) {
      submitBtn.classList.toggle("is-loading", isLoading);
    }

    // Update button text
    if (btnTextEl) {
      btnTextEl.textContent = isLoading ? "Sending…" : "Send message";
    } else {
      // fallback if you didn't add .btn-text span
      if (submitBtn.tagName.toLowerCase() === "input") {
        submitBtn.value = isLoading ? "Sending…" : "Send message";
      } else {
        submitBtn.textContent = isLoading ? "Sending…" : "Send message";
      }
    }
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
      company: safeTrim(el["company"] && el["company"].value)
    };

    // Required fields
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

    setLoading(true);
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

        return res.text().then(function (text) {
          var data = null;

          try {
            data = text ? JSON.parse(text) : null;
          } catch (_) {
            data = null;
          }

          if (!res.ok || !data || !data.ok) {
            var serverMsg = data && data.error ? " (" + data.error + ")" : "";

            if (!data && text && text.indexOf("<html") !== -1) {
              serverMsg = " (server returned HTML error)";
            }

            throw new Error("Request failed: " + res.status + serverMsg);
          }

          return data;
        });
      })
      .then(function () {
        setStatus(
          "Message sent ✓ I’ll get back to you within 24–48 hours. If it’s urgent, include your phone number + best time to call.",
          "success"
        );
        form.reset();
        clearStatusLater(8000);
      })
      .catch(function (err) {
        clearTimeout(timeoutId);
        console.error("Contact submit error:", err);

        if (err && err.name === "AbortError") {
          setStatus("Request timed out. Try again or email instead.", "error");
          return;
        }

        setStatus("Couldn’t reach the server. Try email instead.", "error");
      })
      .finally(function () {
        setLoading(false);
      });
  });
});