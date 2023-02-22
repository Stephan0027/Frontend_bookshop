// import the main scss file: the scss will compile to css
// and hot reload on changes thanks to Vite
import '../scss/style.scss';

// import bootstrap JS part
import * as bootstrap from 'bootstrap';

//import json files
export async function getJSON(url) {
  // read the json from our route/url
  let rawData = await fetch(url);
  // unpack/deserialize the json int a javascript data structure
  let data = await rawData.json();
  // the same as: await (await fetch('./persons.json)')).json();
  return data;
}


async function start() {
  let books = await getJSON('/json/book_data.json');
  console.log(books);
  showBooks(books);

}

function showBooks(books) {
  let html = '<div class="row row-cols-4">';

  for (let book of books) {
    html += `
           <div class="product-frame">
            <img src="/book_img.jpg" class="card-img-top" alt="book cover">
            <h3>${book.title}</h3>
            <h4>${book.author}<h4>
                <p style="color:grey"> ${book.price}SEK</p>
          </div>
          `
  }
  html += '</div>'
  document.querySelector("#bookview").innerHTML = html;
}


start();


