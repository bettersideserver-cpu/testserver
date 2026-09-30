document.addEventListener("DOMContentLoaded", () => {
      const closeCard = document.getElementById("closeCard");

      if (closeCard) {
        closeCard.addEventListener("click", () => {
          // 🔹 Change this path to wherever you want the button to take you
          window.location.href = "/";
          // Example: "../index.html" or "../SubPages/Tower_A.html"
        });
      }
    });