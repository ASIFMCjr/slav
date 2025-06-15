var form = document.getElementById("form")
var modal = document.getElementById('modal');
var pdn = document.getElementById('is-button-active')
var btn = document.getElementById('submitBtn')
var slider = document.getElementById('reviews__cards')
var sliderContainer = document.getElementById('reviews_cards-container');
var formSelect = document.getElementById('select-option');
var currentSliderIndex = 0;
var itemWidth = sliderContainer.offsetWidth; // Width of one item (same as container)
var totalItems = slider.children.length;

function setIsActive(bool) {
  btn.disabled = !bool;
}
pdn.addEventListener('change', function() {
  if (this.checked) {
    setIsActive(true)
    } else {
      setIsActive(false)
    }
})
function reviewsChange(forward) {


  if (forward) {
    // Move to next item
    currentSliderIndex = (currentSliderIndex + 1) % totalItems; // Loop back to 0 if at end
  } else {
    // Move to previous item
    currentSliderIndex = (currentSliderIndex - 1 + totalItems) % totalItems; // Loop to end if at start
  }

  // Calculate new scroll position
  var scrollPosition = currentSliderIndex * itemWidth;

  // Smoothly scroll to the position
  slider.style.transform = `translateX(-${scrollPosition}px)`;
  slider.style.transition = 'transform 0.3s ease';
}
function scrollToElement(id) {
  var y = document.getElementById(id).getBoundingClientRect().top + window.scrollY;
  window.scroll({
    top: y,
    behavior: 'smooth'
  });
}
function openModal() {
  modal.style.display = 'flex';
}

// Function to close modal
function closeModal() {
  modal.style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});


form.addEventListener("submit", async (event) => {
  event.preventDefault();

  var formData = new FormData(event.target);
  if (!formData.get('name') || !formData.get('email') || !formData.get('phone')) return alert('Заполните поля');
  var formJSON = Object.fromEntries(formData.entries());
  try {
      var response = await fetch('/form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formJSON)
      });

      var result = await response.json();

      if (response.ok) {
        alert('Ваша заявка успешно отправлена!');
        closeModal();
      } else {
        alert('Произошла ошибка: ' + (result.message || 'не удалось отправить форму'));
      }
    } catch (error) {
      alert('Ошибка сети: ' + error.message);
    }
})
