const scriptURL = "https://script.google.com/macros/s/AKfycbzRyDjY-aD9RX6MckBK74qnMHR4p3pdM15FAfw-snKlVKSX-MlGNIEOHp5iASczmbf8/exec";

const form = document.getElementById("contactForm");
const submitBtn = form.querySelector(".submit-btn");

// overlay elements
const overlay = document.getElementById("thankYouOverlay");
const closeBtn = document.getElementById("closeThankYou");

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.innerHTML = isLoading ? "Sending..." : "Send Message ✈";
}

function showThankYou() {
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function hideThankYou() {
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

closeBtn.addEventListener("click", hideThankYou);

// click outside box closes overlay
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) hideThankYou();
});

const callButton = document.getElementById("showCallOptionsBtn");
const callOptions = document.getElementById("callOptionsContainer");
const copyPhoneBtn = document.getElementById("copyPhoneBtn");
const closeCallOptionsBtn = document.getElementById("closeCallOptionsBtn");
const phoneNumber = "+91 7084770847";

if (callButton && callOptions) {
  callButton.addEventListener("click", () => {
    const isActive = callOptions.classList.toggle("active");
    callOptions.setAttribute("aria-hidden", isActive ? "false" : "true");
    callButton.textContent = isActive ? "Hide Call Options" : "Show Call Options";
  });
}

if (closeCallOptionsBtn && callOptions && callButton) {
  closeCallOptionsBtn.addEventListener("click", () => {
    callOptions.classList.remove("active");
    callOptions.setAttribute("aria-hidden", "true");
    callButton.textContent = "Show Call Options";
  });
}

if (copyPhoneBtn) {
  copyPhoneBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      alert(`Phone number ${phoneNumber} copied to clipboard.`);
    } catch (err) {
      console.warn("Clipboard write failed, fallback:", err);
      const textArea = document.createElement("textarea");
      textArea.value = phoneNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert(`Phone number ${phoneNumber} copied to clipboard.`);
    }
  });
}

const callEnquiryBtn = document.getElementById("callEnquiryBtn");
if (callEnquiryBtn && callButton && callOptions) {
  callEnquiryBtn.addEventListener("click", () => {
    callOptions.classList.add("active");
    callOptions.setAttribute("aria-hidden", "false");
    callButton.textContent = "Hide Call Options";
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(form);

  setLoading(true);

  try {
    const res = await fetch(scriptURL, { method: "POST", body: fd });
    if (!res.ok) throw new Error("Network error");

    form.reset();
    showThankYou();

  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
});