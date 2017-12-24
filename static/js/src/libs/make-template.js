import "./polyfills/prepend";

export default (html, css) => {
    let style = document.createElement('style');
    style.textContent = css;
    let template = document.createElement('template');
    // Create the fragment
    var frag = document.createDocumentFragment();

    template.innerHTML = html;
    template.prepend(style);
   // template.appendChild(frag);
    return template
}