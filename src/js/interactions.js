"use strict";

// Elements
// - modal (language changer)
const documentBody = document.getElementById("root");
const languageChangerModal = document.getElementById("languageChanger");
const languageChangerOpenButtons =
    document.getElementsByClassName("language-changer");
const languageChangerCloseButton = document.getElementById(
    "languageChangerClose"
);

// - alert
const alertDismissButton = document.getElementById("alertDismiss");
const alertElement = alertDismissButton.parentElement;

// Functions
const openModal = (e) => {
    e.preventDefault();
    languageChangerModal.classList.remove("d-none");
    documentBody.classList.add("overflow-hidden");
    // window.scrollTo(0, 0); // TODO HOTFIX - this needs to be changed!
};

const closeModal = (e) => {
    e.preventDefault();
    languageChangerModal.classList.add("d-none");
    documentBody.classList.remove("overflow-hidden");
};

const dismissAlert = (e) => {
    e.preventDefault();
    alertElement.remove();
};

// Event listeners
[...languageChangerOpenButtons].forEach((languageChangerOpenButton) => {
    languageChangerOpenButton.addEventListener("click", openModal);
});

languageChangerCloseButton.addEventListener("click", closeModal);

alertDismissButton.addEventListener("click", dismissAlert);
