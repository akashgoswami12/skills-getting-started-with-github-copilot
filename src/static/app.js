document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        const participantItems = details.participants.length
          ? details.participants
              .map(
                (participant) => `
                  <li class="participant-item">
                    <span class="participant-email">${participant}</span>
                    <button
                      type="button"
                      class="delete-participant-btn"
                      data-activity="${name}"
                      data-email="${participant}"
                      aria-label="Remove ${participant} from ${name}"
                      title="Remove participant"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M9 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1h2a1 1 0 1 1 0 2H7a1 1 0 0 1 0-2h2Zm-2 4h10l-1 12.5A2.5 2.5 0 0 1 13.5 22h-3A2.5 2.5 0 0 1 8 19.5L7 7Zm3 2.5a1 1 0 0 0-1 1V17a1 1 0 1 0 2 0v-6.5a1 1 0 0 0-1-1Zm4 0a1 1 0 0 0-1 1V17a1 1 0 1 0 2 0v-6.5a1 1 0 0 0-1-1Z"/>
                      </svg>
                    </button>
                  </li>
                `
              )
              .join("")
          : '<li class="participants-empty">No students signed up yet.</li>';

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <h5>Participants</h5>
            <ul class="participants-list">
              ${participantItems}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  async function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  activitiesList.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest(".delete-participant-btn");
    if (!deleteButton) {
      return;
    }

    const activity = deleteButton.dataset.activity;
    const email = deleteButton.dataset.email;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/participants?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        await fetchActivities();
        await showMessage(result.message, "success");
      } else {
        await showMessage(result.detail || "Unable to unregister participant.", "error");
      }
    } catch (error) {
      console.error("Error unregistering participant:", error);
      await showMessage("Failed to unregister participant. Please try again.", "error");
    }
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        await fetchActivities();
        await showMessage(result.message, "success");
        signupForm.reset();
      } else {
        await showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      await showMessage("Failed to sign up. Please try again.", "error");
    }
  });

  // Initialize app
  fetchActivities();
});
