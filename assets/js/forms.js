(() => {
  const forms = document.querySelectorAll("[data-contact-form]");

  forms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = form.querySelector("[data-form-status]");
      const button = form.querySelector('button[type="submit"]');

      if (form.dataset.endpointStatus !== "ready" || !form.action) {
        status.textContent = "הטופס מוכן לתצוגה מקומית. נחבר את השליחה רק בשלב הפרסום.";
        return;
      }

      button.disabled = true;
      status.textContent = "שולחים את הפרטים…";

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error("Form submission failed");
        form.reset();
        status.textContent = "תודה, הפרטים נשלחו בהצלחה.";
      } catch (error) {
        status.textContent = "השליחה לא הצליחה. אפשר לפנות אלינו ישירות בוואטסאפ.";
      } finally {
        button.disabled = false;
      }
    });
  });
})();
