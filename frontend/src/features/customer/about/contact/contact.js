// function loadComponent(id, filePath) {
//     fetch(filePath)
//       .then(response => response.text())
//       .then(data => {
//         document.getElementById(id).innerHTML = data;
//       })
//       .catch(err => console.error("Error loading component:", err));
//   }
//   loadComponent("header", "/frontend/src/core/components/navbar.html");
//   loadComponent("footer", "/frontend/src/core/components/footer.html");

function loadComponent(id,filePath)
{
    fetch(filePath)
       .then(response=>response.text())
       .then(data => {
        document.getElementById(id).innerHTML=data;
       })
       .catch(err=>console.error("Error loading component:",err));
}
  loadComponent("header", "/frontend/src/core/components/navbar.html");
  loadComponent("footer", "/frontend/src/core/components/footer.html");