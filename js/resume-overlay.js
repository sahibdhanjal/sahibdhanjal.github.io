// Resume Overlay Logic

document.addEventListener('DOMContentLoaded', function () {
  const resumeLink = document.getElementById('resume-link'); // We will add this ID to the link
  const resumeOverlay = document.getElementById('resume-overlay');
  const closeBtn = document.querySelector('.close-btn');

  if (resumeLink && resumeOverlay && closeBtn) {
    // Open overlay
    resumeLink.addEventListener('click', function (e) {
      e.preventDefault(); // Prevent default link behavior
      resumeOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Disable background scrolling
    });

    // Close overlay
    closeBtn.addEventListener('click', function () {
      resumeOverlay.classList.remove('active');
      document.body.style.overflow = ''; // Enable background scrolling
    });

    // Close on outside click
    resumeOverlay.addEventListener('click', function (e) {
      if (e.target === resumeOverlay) {
        resumeOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (evt) {
      if (evt.key === "Escape" && resumeOverlay.classList.contains('active')) {
        resumeOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  } else {
    console.error("Resume overlay elements not found!");
  }
});
