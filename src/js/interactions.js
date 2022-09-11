"use strict";

// Functions

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
 * Display modal with content.
 *
 * @summary - loads the modal with a certain type of content (here: language list, search). A "data-content-load" attribute MUST be set on the calle (button, etc.) which needs to be the same as the contents' components name.
 * @param {Event} e - data about the click action and about the clicked element itself
 */
const openModal = (e) => {
    e.preventDefault();

    const checkLoadableContent = e.currentTarget.dataset.contentLoad;
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
        // checks if the clicked element is from inside the modal
        const isFromModal = document
            .getElementById(elementId)
            .contains(e.target);

        // checks if the clicked target is a modal opener from outside before click
        const isModalOpener = [
            ...document.querySelectorAll("[data-content-load]"),
        ].some((el) => el.contains(e.target));

        // if clicked outside of modal, or not on the
        // modal opener buttons were found, close the modal
        if (!isFromModal && !isModalOpener) closeModal(e);
    };
};

const sideNavActions = (e, action = "open") => {
    e.preventDefault();
    const sideNavigationElement = document.getElementById("sideNavigation");

    if (!sideNavigationElement) return false;

    const documentBody = document.getElementById("root");
    const backDrop = document.getElementById("backdrop");

    if (action === "close") {
        sideNavigationElement.style.width = "0";
        documentBody.classList.remove("overflow-hidden");
        backDrop.classList.add("d-none");

        setTimeout(() => {
            sideNavigationElement.firstElementChild.classList.add =
                "visibility-hidden";
            sideNavigationElement.firstElementChild.classList.add =
                "opacity-low";
        }, 250);

        return true;
    }

    sideNavigationElement.style.width = "65vw";
    documentBody.classList.add("overflow-hidden");
    backDrop.classList.remove("d-none");

    setTimeout(() => {
        sideNavigationElement.firstElementChild.classList.remove(
            "visibility-hidden"
        );
        sideNavigationElement.firstElementChild.classList.remove("opacity-low");
    }, 250);

    return true;
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

    if (!accordionElementTogglers.length) return false;

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
    const modalOpeners = document.querySelectorAll("[data-content-load]");
    const sideNavOpener = document.querySelector(
        '[data-element-open="side-nav"]'
    );

    // alert from top of the page
    if (alertDismissButton) {
        alertDismissButton.addEventListener("click", dismissAlert);
    }

    if (sideNavOpener) {
        sideNavOpener.addEventListener("click", sideNavActions);
    }

    // modal openers (language changer, search)
    if (modalOpeners.length) {
        [...modalOpeners].forEach((modalOpener) => {
            modalOpener.addEventListener("click", openModal);
        });
    }

    // accordion
    accordionItemsTogglers();
};

loadPageEventListeners();
