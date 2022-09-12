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
 * Called on sidenav related actions (open/close).
 *
 * @param {Event} e - data about the click action and about the clicked element itself
 * @param {string} action - "open" is the default value, "close" can be set
 *
 * @return {boolean} - if the elements needed to make the action were found: true, else false
 */
const sideNavActions = (e, action = "open") => {
    e.preventDefault();

    const sideNavigationCloser = document.querySelector(
        '[data-element-close="side-nav"]'
    );
    const sideNavigationElement = document.getElementById("sideNavigation");

    if (!sideNavigationElement || !sideNavigationCloser) return false;

    sideNavigationCloser.addEventListener(
        "click",
        () => {
            sideNavActions(e, "close");
        },
        true
    );

    const documentBody = document.getElementById("root");
    const backDrop = document.getElementById("backdrop");

    if (action === "close") {
        sideNavigationElement.style.removeProperty("width");
        documentBody.classList.remove("overflow-hidden");
        backDrop.classList.add("d-none");

        sideNavigationCloser.removeEventListener("click", sideNavActions, true);

        setTimeout(() => {
            sideNavigationElement.firstElementChild.classList.add =
                "visibility-hidden";
            sideNavigationElement.firstElementChild.classList.add =
                "opacity-low";

            sideNavigationCloser.classList.add("visibility-hidden");
            sideNavigationCloser.classList.add("opacity-low");
        }, 250);

        return true;
    }

    sideNavigationElement.style.width = "70vw";
    documentBody.classList.add("overflow-hidden");
    backDrop.classList.remove("d-none");

    setTimeout(() => {
        sideNavigationElement.firstElementChild.classList.remove(
            "visibility-hidden"
        );

        sideNavigationElement.firstElementChild.classList.remove("opacity-low");
        sideNavigationCloser.classList.remove("visibility-hidden");
        sideNavigationCloser.classList.remove("opacity-low");
    }, 250);

    return true;
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
    const sideNavigation = document.getElementById("sideNavigation");

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

            if (checkLoadableContent === "search") {
                const modalContent = document.getElementById("modalContent");

                modalContent.classList.add("full-screen");
            }
        }
    })();

    if (sideNavigation && sideNavigation.style.width) {
        sideNavActions(e, "close");
    }

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

    const modalContent = document.getElementById("modalContent");
    if (modalContent.classList.contains("full-screen")) {
        modalContent.classList.remove("full-screen");
    }

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
 *
 * @param {string} elementId - the HTML elements' ID to get the that element which shouldn't be counted
 * as clicked outside (language-changer buttons and the modal itself without the backdrop)
 *
 * @return {Function} - returns an object - currying
 */
const closeWhenClickedOutside = (elementId) => {
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

/**
 * Set the boundaries of the carousel.
 *
 * @summary - blocks the visitor to drag more than it should (out of the carousels' container) from left (before the first item) or right side (after the last item)
 * @param {object} carouselWrapper - The DOM Node which is the main wrapper of the carousel element - this holds the other element which holds all the items
 * @param {object} carouselWrapperItems - The DOM Node which is child of the carouselWrapper and holds the actual items
 */
const setCarouselBoundaries = (carouselWrapper, carouselWrapperItems) => {
    const carouselWrapperPositionInfo = carouselWrapper.getBoundingClientRect();
    const carouselWrapperItemsPositionInfo =
        carouselWrapperItems.getBoundingClientRect();

    // if the left side (the first elements space) is bigger (no other element is there), - block the drag
    if (parseInt(carouselWrapperItems.style.left) > 0) {
        carouselWrapperItems.style.left = 0;
    } else if (
        carouselWrapperItemsPositionInfo.right <
        carouselWrapperPositionInfo.right
    ) {
        carouselWrapperItems.style.left = `-${
            carouselWrapperItemsPositionInfo.width -
            carouselWrapperPositionInfo.width
        }px`;
    }
};

/**
 * Initialize carousels on page.
 * @summary - called on load to initialize (add event listeners) on all carousels which are loaded in the DOM.
 *
 * @return {boolean} - if carousels found returns true else false
 */
const carouselsInitialization = () => {
    const carouselWrappers = document.querySelectorAll(".carousel-wrapper");
    if (!carouselWrappers) return false;

    // keep track of users' mouse down and up
    let isPressedDown = false;

    // retrieve if the mouse is clicked or not at all (button is released or not)
    window.addEventListener("mouseup", () => {
        isPressedDown = false;
    });

    carouselWrappers.forEach((carouselWrapper) => {
        // the actual items holder/wrapper, this has the items (cards-tutorials)
        const carouselWrapperItems = carouselWrapper.firstElementChild;
        if (!carouselWrapperItems) return false;

        // to set grid-template-columns dynamically
        const totalItems = carouselWrapperItems.childElementCount;
        carouselWrapperItems.style.setProperty(
            "grid-template-columns",
            `repeat(${totalItems}, 23rem)`
        );

        // x horizonal space of cursor from inner container
        let cursorHorizontalPosition;

        // on clicking the mouse button, get where the user clicked, change the cursor
        carouselWrapper.addEventListener("mousedown", (e) => {
            isPressedDown = true;
            cursorHorizontalPosition =
                e.offsetX - carouselWrapperItems.offsetLeft; // get where the user clicked exactly
            carouselWrapper.style.cursor = "grabbing";
        });

        // on release, set the grab button as cursor
        carouselWrapper.addEventListener("mouseup", () => {
            carouselWrapper.style.cursor = "grab";
        });

        // moving the cursor in the container
        carouselWrapper.addEventListener("mousemove", (e) => {
            if (!isPressedDown) return;

            e.preventDefault();
            carouselWrapperItems.style.left = `${
                e.offsetX - cursorHorizontalPosition
            }px`;

            setCarouselBoundaries(carouselWrapper, carouselWrapperItems);
        });
    });

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

            if (accordionContent) {
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

    // carousels
    carouselsInitialization();
};

loadPageEventListeners();
