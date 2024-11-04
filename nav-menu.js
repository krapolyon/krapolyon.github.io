const navButton = document.getElementById("btn-main-nav");
const disclosure = document.getElementById("main-nav-list");
const listItems = disclosure.querySelectorAll("li a");

function openNavigation() {
  navButton.classList.add("btn--hamburger--active");
  navButton.setAttribute("aria-expanded", "true");
  navButton.setAttribute("aria-label", "Fermer le menu");
  disclosure.classList.remove("menu__list--hidden");
}

function closeNavigation() {
  navButton.classList.remove("btn--hamburger--active");
  navButton.setAttribute("aria-expanded", "false");
  navButton.setAttribute("aria-label", "Ouvrir le menu");
  disclosure.classList.add("menu__list--hidden");
}

function toggleNavigation() {
  const open = navButton.getAttribute("aria-expanded");
  open === "false" ? openNavigation() : closeNavigation();
}

// This function closes an open disclosure if a user tabs away from the
// last anchor element in the list. It is reliant on the ul container 
// having a class to check whether the relatedTarget is within the disclosure.
// If not, it will close.
function handleBlur() {
  const navList = event.currentTarget.closest(".menu__list");
  if (!event.relatedTarget || !navList.contains(event.relatedTarget)) {
    closeNavigation();
  }
}

navButton.addEventListener("click", toggleNavigation);

// add event to the last item in the nav list to trigger the disclosure to close if the user tabs out of the disclosure
listItems[listItems.length - 1].addEventListener("blur", handleBlur);

// Close the disclosure if a user presses the escape key
window.addEventListener("keyup", (e) => {
  if (e.key === "Escape") {
    navButton.focus();
    closeNavigation();
  }
});