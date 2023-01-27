/**
 * Cambia el layout de los bredcrumbs depende del tamaño del navegador
 */ 

/**
 * Crea el botón expandir
 * @returns {object}
 */ 
const expandButton = () => {
  const btn = document.createElement("button");
  btn.textContent = "…";
  btn.classList.add("js-ellip", "device-breadcrumb__expand-button");
  btn.dataset.title = "Expandir menú";
  // btn.title = "Expandir menú";
  btn.setAttribute("aria-hidden", true);
  return btn;
};

/**
* Crea el botón de cerrar
* @returns {object}
*/ 
const closeButton = () => {
const btn = document.createElement("button");
  btn.textContent = "Cerrar";
  btn.classList.add(
      "js-close", "btn-default", "btn-sm", 
      "device-breadcrumb__compress-button"
  );
  btn.dataset.title = "Contraer menú";
  btn.setAttribute("aria-hidden", true);
  return btn;
};

/**
* Agrega el estilo de menú expandido.
* @returns {undefined}
*/ 
const removeDeviceHidden = (menus) => menus
  .forEach(e => e.classList.add("device-breadcrumb--expanded"));

/**
* Agraga la clase global device-breadcrumbs
* @returns {undefined}
*/
const addGlobalClass = () => document
  .querySelectorAll(".breadcrumbs, .breadcrumb")
  .forEach(e => e.classList.add("device-breadcrumb"));

/**
* Remueve la clase expanded
* @returns {undefined}
*/ 
const removeExpanded = (menus) => menus
  .forEach(e => e.classList.remove("device-breadcrumb--expanded"));

/**
 * Tiene o no página de inicio.
 * @param {object} menuItems Retorno del selector
 * @returns {boolean}
 */
const isFirstElementHome = (menuItems) => {
    let result = false;
    menuItems.forEach((e, k) => {
        if(k == 0){
            const href = e.firstChild.getAttribute("href");
            const rgx = new RegExp('(/|argentina.gob.ar|argentina.gob.ar/)');
            if(rgx.exec(href)){
                result = true;
            }  
        }
    });
    return result;
};

/**
 * Verifica si el último li tiene un enlace dentro.
 * @param {object} menuItems Retorno del selector 
 * @returns {boolean}
 */
const isLastElementText = (menuItems) => {
  let result = [];
  menuItems.forEach(e => {
      if(
          !e.firstChild.tagName != "A" && 
          e.firstChild.textContent != ""
      ){
          result.push(true);
      } else {
          result.push(false);
      }
  });
  return result.some(s => s);
}

/**
* 
* @param {integer} innerWidth Tamaño en pixeles de la pantalla.
*/
function deviceBreadcrumb(innerWidth){
  document
      .querySelectorAll(".js-ellip, .js-close")
      .forEach(ele => ele.remove());
  
  const wSize = 991;
  const menuItems = document.querySelectorAll(
      ".breadcrumbs li, .breadcrumb li");
  const breadcrumb = document.querySelectorAll(
      '.breadcrumbs, .breadcrumb');
  const totalItems = menuItems.length;
  const lastElementText = isLastElementText(menuItems); 
  const firstElementHome = isFirstElementHome(menuItems);
  const counter = (lastElementText ? totalItems - 2 : totalItems - 1);

  menuItems.forEach((element, key) => {
      // Agrego una clase al último elemento visible
      // Hack por si no está el dash final.
      if(lastElementText && key == totalItems - 2){
          element.classList.add("device-breadcrumb__last-visible-item");
      }
      // Toggle items
      if(key < counter){
          element.classList.add("device-breadcrumb__toggle-item");
      }
  });

  let totals = totalItems;
  totals = (lastElementText ? totals - 1 : totals);
  totals = (firstElementHome ? totals - 1 : totals);

  if(innerWidth <= wSize){
      if(totals > 1){
          // Agrega el botón expandir.
          const sp2 = menuItems[0];
          const parentDiv = sp2.parentNode;
          parentDiv.insertBefore(expandButton(), sp2);
          
          // Agrega el botón de cerrar.
          breadcrumb.forEach(menu => {
              const li = closeButton();
              menu.appendChild(li);
          });
      }
  } 

  // Agrego el listener para los butones
  document
      .querySelectorAll(".js-ellip")
      .forEach(e => e.addEventListener(
          "click", () => removeDeviceHidden(breadcrumb) 
      ));

  document
      .querySelectorAll(".js-close")
      .forEach(e => e.addEventListener(
          "click", () => removeExpanded(breadcrumb)
      ));
};

// resize
window.addEventListener('resize', event => {
    deviceBreadcrumb(window.innerWidth);
}, true);

// init
document.addEventListener("DOMContentLoaded", event => {
    addGlobalClass();
    deviceBreadcrumb(window.innerWidth);
});