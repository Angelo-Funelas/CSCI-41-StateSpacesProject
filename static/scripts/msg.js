document.addEventListener("DOMContentLoaded", () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.has('msg')) {
        const message = urlParams.get('msg');
        const element = document.createElement('div');
        element.id = "message-container";
        element.textContent = message;
        element.addEventListener("animationend", (e) => {
            e.target.remove();
        })
        document.body.append(element)
    }
})