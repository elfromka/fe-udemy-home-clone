"use strict";

/**
 * Loads HTML elements to a selected div with an ID.
 *
 * @param {string} toId - ID of an element to append/replace to the HTML file contentsw
 * @param {string} type - mainly the folders' name where it is stored should be set (components/pages here)
 * @param {string} filename - the files' name WITHOUT the .html extension
 * @param {string} childrenSettings - an object with 2 keys: parentId (containing a string) and children (containing an array of strings with the file names of each child)
 * @return {boolean} - on success: true, on failure: false.
 */
const loadHtml = async (toId, type, filename, childrenSettings = {}) => {
    const modifyElement = document.getElementById(toId);

    if (!modifyElement)
        throw new Error(`Couldn't find element with ID named: ${toId}`);

    const response = await fetch(`/src/${type}/${filename}.html`);
    const data = await response.text();

    // convert HTML text received in Node Element
    // with the help of a temporary div, which will be removed
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = data;
    const parentHtmlElement = [...tempDiv.children];

    if (Object.keys(childrenSettings).length === 0) {
        modifyElement.appendChild(
            parentHtmlElement[parentHtmlElement.length - 1]
        );
    } else {
        parentHtmlElement.forEach((element) => {
            const { parentId, children } = childrenSettings;

            if (
                parentId &&
                children.length > 0 &&
                element.hasAttribute("id") &&
                element.getAttribute("id") === parentId
            ) {
                children.forEach(async (child) => {
                    const response = await fetch(
                        `/src/components/${child}.html`
                    );
                    const childData = await response.text();

                    const tempDiv = document.createElement("div");
                    tempDiv.innerHTML = childData;

                    const childHtmlElement = [...tempDiv.children];

                    parentHtmlElement[parentHtmlElement.length - 1].appendChild(
                        childHtmlElement[childHtmlElement.length - 1]
                    );
                });
            }
        });

        modifyElement.appendChild(
            parentHtmlElement[parentHtmlElement.length - 1]
        );
    }

    return true;
};

/**
 * Removes HTML elements.
 *
 * @summary - removes all HTML child elements of an HTML element with a certain ID passed in the argument of the function.
 * @param {string} fromId - the ID of the HTML parent element
 * @return {boolean} - on success: true, on failure: false.
 */
const removeHtml = (fromId) => {
    const parentHtmlElement = document.getElementById(fromId);

    if (!parentHtmlElement) {
        return false;
    }

    parentHtmlElement.innerHTML = "";

    return true;
};

/**
 * Append another script tag at the end of the body tag.
 *
 * @summary - creates a script tag with the source path for interactions.js separately after all the pages
 * and its' components are loaded, appends before the closing body tag, so the interactions
 * will work with those as well.
 * @param {string} toId - the ID of the HTML element to append
 * @return {boolean} - on success: true, on failure: false.
 */
const appendInteractions = (toId) => {
    const documentBody = document.getElementById(toId);

    if (!documentBody) {
        return false;
    }

    // append functions for components (modal, alert dismiss, etc)
    const script = document.createElement("script");
    script.src = "/src/js/interactions.js";

    // insert script tag with path to the script last
    documentBody.insertBefore(script, null);

    return true;
};

// Load full HTML page with components
Promise.all([
    loadHtml("root", "components", "modal"),
    loadHtml("root", "pages", "home", {
        parentId: "wrapper",
        children: ["side-nav", "alert", "header", "main", "footer"],
    }),
])
    .then(
        (results) =>
            results.every((result) => result === true) &&
            appendInteractions("root")
    )
    .catch((e) => console.error(e.message));
