"use strict";

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
 * Display modal with content.
 *
 * @summary - loads the modal with a certain type of content (here: language list, search). A "data-content-load" attribute MUST be set on the calle (button, etc.) which needs to be the same as the contents' components name.
 * @param {Event} e - data about the click action and about the clicked element itself
 */
const openModal = (e) => {
    e.preventDefault();

    const checkLoadableContent = e.target.dataset.contentLoad;
    const documentBody = document.getElementById("root");
    const modal = document.getElementById("modalWrapper");

    (async () => {
        const loadModalContent = await loadHtml(
            "modalContent",
            "components",
            checkLoadableContent
        );

        if (loadModalContent) {
            const modalCloseButton = document.getElementById("modalClose");

            if (modalCloseButton) {
                modalCloseButton.addEventListener("click", closeModal);
            }
        }
    })();

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

    const documentBody = document.getElementById("root");
    const modal = document.getElementById("modalWrapper");

    removeHtml("modalContent");

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

    // - alert
    const alertDismissButton = document.getElementById("alertDismiss");
    const alertElement = alertDismissButton.parentElement;

    alertElement.remove();
};

/**
 * Set open/close actions for accordion items if accordion exists on the loaded page.
 *
 * @return {boolean} - if click events were set successfully: true, else false
 */
const accordionItemsTogglers = () => {
    const accordionElementTogglers = document.querySelectorAll(
        "[data-accordion-action]"
    );

    if (!accordionElementTogglers.length) {
        return false;
    }

    accordionElementTogglers.forEach((accordionToggler) => {
        accordionToggler.addEventListener("click", () => {
            const accordionContent = accordionToggler.nextElementSibling;

            if (!accordionContent) {
                accordionToggler.classList.toggle("active");
                accordionContent.classList.toggle("d-none");
            }
        });
    });

    return true;
};

/**
 * Add event listeners after the whole DOM/the page is loaded.
 */
const loadPageEventListeners = () => {
    const alertDismissButton = document.getElementById("alertDismiss");
    const languageChangerOpenButtons =
        document.getElementsByClassName("language-changer");

    if (alertDismissButton) {
        alertDismissButton.addEventListener("click", dismissAlert);
    }

    if (languageChangerOpenButtons.length) {
        [...languageChangerOpenButtons].forEach((languageChangerOpenButton) => {
            languageChangerOpenButton.addEventListener("click", openModal);
        });
    }

    accordionItemsTogglers();
};

loadPageEventListeners();
