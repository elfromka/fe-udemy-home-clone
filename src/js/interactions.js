"use strict";

// Elements - event fireres
// - modal (language changer)
const documentBody = document.getElementById("root");

const modal = document.getElementById("modalWrapper");
const modalCloseButton = document.getElementById("modalClose");

const languageChangerOpenButtons =
    document.getElementsByClassName("language-changer");

// - alert
const alertDismissButton = document.getElementById("alertDismiss");
const alertElement = alertDismissButton.parentElement;

// Functions
/**
 * Close modal when visitor clicks outside of it.
 * //TODO HOTFIX - re-check closing modal on click outside (event bubbling) - event listeners
 *
 * @param {string} elementId - the HTML elements' ID to get the that element which shouldn't be counted
 * as clicked outside (language-changer buttons and the modal itself without the backdrop)
 *
 * @return {Function} - returns an object - currying
 */
const closeWhenClickedOutside = (elementId) => {
    // console.log("still here");

    return (e) => {
        // if clicked outside of modal, or not on the first
        // language changer button found, close the modal
        if (
            !document.getElementById(elementId).contains(e.target) &&
            !languageChangerOpenButtons[0].contains(e.target)
        ) {
            closeModal(e);
        }
    };
};

/**
 * Display modal.
 * @param {Event} e - data about the click action and about the clicked element itself
 */
const openModal = (e) => {
    e.preventDefault();

    documentBody.addEventListener(
        "click",
        closeWhenClickedOutside("modalContent")
    );

    modal.classList.remove("d-none");

    documentBody.classList.add("overflow-hidden");
};

/**
 * Close/hide modal.
 * @param {Event} e - data about the click action and about the clicked element itself
 */
const closeModal = (e) => {
    e.preventDefault();

    documentBody.removeEventListener(
        "click",
        closeWhenClickedOutside("modalContent")
    );

    modal.classList.add("d-none");
    documentBody.classList.remove("overflow-hidden");
};

/**
 * Closes alert/notification from the top of the page.
 * @param {Event} e - data about the click action and about the clicked element itself
 */
const dismissAlert = (e) => {
    e.preventDefault();

    alertElement.remove();
};

// Event listeners
[...languageChangerOpenButtons].forEach((languageChangerOpenButton) => {
    languageChangerOpenButton.addEventListener("click", openModal);
});

modalCloseButton.addEventListener("click", closeModal);

alertDismissButton.addEventListener("click", dismissAlert);
