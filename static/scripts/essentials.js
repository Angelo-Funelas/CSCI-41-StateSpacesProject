function formatDateStr(date) {
    date = new Date(date);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    
    const day = date.getDate();
    const year = date.getFullYear();

    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month} ${day}, ${year} ${hours}:${minutes}${ampm}`;
}
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