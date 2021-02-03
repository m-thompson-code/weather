'use strict';

let searches = [
    // 'first',
    // 'second',
    // 'third',
];

searches = getSearches();

// LocalStorage helpers
function getSearches() {
    return JSON.parse(localStorage.getItem("searches") || "[]");
}

function setSearches() {
    localStorage.setItem("searches", JSON.stringify(searches));
}
// END LocalStorage helpers

// Storage array of cities (searches)

// Populate the dom based on these cities

// container-box-left

function renderSearchlist() {
    $('#history').empty();

    for (let i = 0; i < searches.length; i++) {
        const search = searches[i];
    
        console.log(search);
    
        $('#history').append(`<a href="#" class="list-group-item list-group-item-action">${search}</a>`);
    }
}

function addToSearchHistory(search) {
    // Add search to searches
    searches.unshift(search);

    // Limit is 10 search terms
    searches = searches.slice(0, 10);
}

function search() {
    // get input's value
    const inputValue = $("#my-input").val();

    if (!inputValue.trim()) {
        alert("Please type a city");
        // TODO: Maybe I'd validate that what they typed was a valid city
        return;
    }

    // Add input's value to searches
    addToSearchHistory(inputValue);

    // Clear input's value
    $("#my-input").val("");

    // Rerender list
    renderSearchlist();

    setSearches();
}

renderSearchlist();

// It's better to just bind your click event handlers on the dom
// $("#search-button").click(search);
