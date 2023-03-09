// import the main scss file: the scss will compile to css
// and hot reload on changes thanks to Vite
import '../scss/style.scss';

// import bootstrap JS part
import * as bootstrap from 'bootstrap';


//MAIN VARIABLES
//________________________________________________________________________________________________________________________________

let books;
let categories;
let authors;
let sortChoice = "Sort (Price-ascending)";
let shoppingCart = {};

//NAVBAR
//________________________________________________________________________________________________________________________________

//sort book list
function sortList(list) {
  let array = sortChoice.split("-");

  if (array[1] === "descending") {
    list.sort(({ [array[0]]: a }, { [array[0]]: b }) => a < b ? 1 : -1);
  } else {
    list.sort(({ [array[0]]: a }, { [array[0]]: b }) => a > b ? 1 : -1);
  }

}

//show sort option in navbar
function showSortNavbar() {

  let navOptions = ["price-ascending", "price-descending", "title-ascending", "title-descending", "author-ascending", "author-descending"];

  //add options to dropdown
  let html = "";
  for (let option in navOptions) {
    let val = navOptions[option];
    html += `<li><a class="dropdown-item" id="${val}">${val}</a></li>`;
  }

  document.getElementById("navSort").innerHTML = html;

  //add events to options
  for (let option in navOptions) {
    let val = navOptions[option];
    document.getElementById(val).addEventListener('click', event => {
      sortChoice = val;
      document.getElementById("sortChoice").innerHTML = `Sort (${val})`;
      showSortNavbar();
      sortList(books);
      showBooks();
    })
  }
}

//show category option in navbar
function showCategoryNavbar() {
  //update count of items
  updateCount();

  //add options to dropdown
  let html = "";
  for (let category in categories) {
    if ((categories[category]["count"] > 0) || (category == "Check All")) {

      html += `<li><a class="dropdown-item">
               <div class="form-check">
               <input class="form-check-input" type="checkbox" name="categoryBox" id="cat${category}"`

      if (categories[category]["checked"]) {
        html += `checked`
      }
      html += `>${category} (${categories[category]["count"]})
               </div>
               </a></li>`

      if (category === "Check All") {
        html += `<li><hr class="dropdown-divider"></li>`;
      }
    }
  }
  document.getElementById("navCategory").innerHTML = html;


  //add events to options
  for (let category in categories) {

    //event for check all
    if (category === "Check All") {
      document.getElementById("cat" + category).addEventListener('click', event => {
        categories[category]["checked"] = document.getElementById("cat" + category).checked;

        for (let category2 in categories) {
          categories[category2]["checked"] = categories[category]["checked"];
          try {
            document.getElementById("cat" + category2).checked = categories[category]["checked"];
          } catch (error) {

          }

        }
        showAuthorNavbar();

        if (categories[category]["checked"]) {
          showCategoryNavbar();
        }

      });
    }
    //event for specific category
    else {
      if ((categories[category]["count"] > 0)) {
        document.getElementById("cat" + category).addEventListener('click', event => {
          categories[category]["checked"] = document.getElementById("cat" + category).checked;
          showAuthorNavbar();
        });
      }
    }
  }
}

//show author option in navbar
function showAuthorNavbar() {
  //update count of items
  updateCount();

  //add options to dropdown
  let html = "";
  for (let author in authors) {

    if ((authors[author]["count"] > 0) || (author == "Check All")) {
      html += `<li><a class="dropdown-item">
               <div class="form-check">
               <input class="form-check-input" type="checkbox" name="authorBox" id="aut${author}"`
      if (authors[author]["checked"]) {
        html += `checked`
      }
      html += `>${author} (${authors[author]["count"]})
    </div>
    </a></li>`

      if (author === "Check All") {
        html += `<li><hr class="dropdown-divider"></li>`;
      }
    }
  }
  document.getElementById("navAuthor").innerHTML = html;

  //add events to options
  for (let author in authors) {
    //event for check all
    if (author === "Check All") {
      document.getElementById("aut" + author).addEventListener('click', event => {
        authors[author]["checked"] = document.getElementById("aut" + author).checked;

        for (let author2 in authors) {
          authors[author2]["checked"] = authors[author]["checked"];

          try {
            document.getElementById("aut" + author2).checked = authors[author]["checked"];
          } catch (error) {
          }
        }
        showCategoryNavbar();

        if (authors[author]["checked"]) {
          showAuthorNavbar();
        }
      });
    } else {
      if ((authors[author]["count"]) > 0) {
        document.getElementById("aut" + author).addEventListener('click', event => {
          authors[author]["checked"] = document.getElementById("aut" + author).checked;
          showCategoryNavbar();
        });
      }
    }
  }
}

//Returns all unique values of string
function getUniqueValues(attribute) {
  let uniqueValues = { "Check All": { "count": 0, "checked": true } };

  for (let book in books) {
    let value = books[book][attribute]

    if (!Object.keys(uniqueValues).includes(value)) {
      uniqueValues[value] = { "count": 0, "checked": true };
    }
  }

  return uniqueValues;
}


//counts active items
function updateCount() {
  for (let author in authors) {
    authors[author]["count"] = 0
  }

  for (let category in categories) {
    categories[category]["count"] = 0
  }

  for (let book in books) {
    let author = books[book]["author"];
    let category = books[book]["category"];

    if ((authors[author]["checked"]) && (categories[category]["checked"])) {
      categories[category]["count"] += 1
      authors[author]["count"] += 1

      categories["Check All"]["count"] += 1
      authors["Check All"]["count"] += 1
    }
  }
}

//SHOPPING CART
//________________________________________________________________________________________________________________________________

//Update the shopping cart
function updateCollapseCart() {
  let totalItems = 0;
  let totalPrice = 0;
  let quantity, price, title;

  let html = `<p style="font-size:15px">Items in cart:</p>
  <table>
  <tr>
  <th>Title</th>
  <th style="text-align:center">Quantity</th>
  <th style="text-align:center">Price</th>
  </tr>
  `

  for (let row in shoppingCart) {
    title = books[row]["title"];
    quantity = shoppingCart[row];
    price = books[row]["price"] * quantity;

    totalItems += quantity;
    totalPrice += price;
    html += `<tr>
    <td>${maxStringSize(title, 30)}</td> 
    <td style="text-align:center"><input type="number" value=${quantity} min =0 id="q${row}" style="width:60px"></td>
    <td style="text-align:center">${price}SEK</td>
    </tr>`
  }

  html += `<tr>
  <th></th>
  <th></th>
  <th style="text-align:center">${totalPrice}SEK</th>
  </tr>
  </table>
  <button type="button" class="btn btn-secondary text-white" style="font-size:15px" id="updateCartButton"> Update cart</button>`

  //replace html content in shopping cart
  document.getElementById("collapseShoppingCart").innerHTML = html;

  //change buttontag quanitiy
  document.getElementById("numberInCart").innerHTML = totalItems;

  //add update function to adjust quantities in cart
  document.getElementById("updateCartButton").addEventListener('click', event => {
    let quantity;
    for (let row in shoppingCart) {
      quantity = document.getElementById("q" + row).value
      updateCart(row, quantity * 1);
    }

    updateCollapseCart();
  })

}

//Update a book in the shopping cart
function updateCart(bookRecord, quantity) {
  //from add to cart button
  if (quantity === "add") {
    if (!Object.keys(shoppingCart).includes(String(bookRecord))) {
      shoppingCart[bookRecord] = 1;
    } else {
      shoppingCart[bookRecord] += 1;
    }
  }
  //edit from shopping cart
  else {
    if (quantity === 0) {
      delete shoppingCart[bookRecord];
    } else
      shoppingCart[bookRecord] = quantity
  }
}


//SHOW BOOKS
//________________________________________________________________________________________________________________________________

function showBook(row) {
  let book = books[row];
  let html = `<p>boek</p>`

  document.getElementById("bookview").innerHTML = html;
}

//shows books on main page
function showBooks() {
  let html = "";
  let rowList = [];
  let row = 0;



  for (let book of books) {
    let author = book["author"];
    let category = book["category"];
    let bookId = book["id"];

    if ((authors[author]["checked"]) && (categories[category]["checked"])) {
      html += `
        <div class="productFrame" id="info${row}">
          <div class="card">
            <img src="/book_img.jpg" class="card-img-top" alt="...">
            <div class="card-body">
              <h5 class="card-title">${maxStringSize(book.title, 45)}</h5>
              <p>${book.author}</p>
            </div>
            <div class="card-footer">
              ${book.price}SEK
              <button type="button" class="btn btn-secondary text-white" id="book${row}"> Add to
                Cart</button>
            </div>
          </div>
        </div>
          `
      rowList.push(row);
    }
    row += 1
  }
  html += '</div>'
  document.getElementById("bookview").innerHTML = html;

  //add events
  for (let row of rowList) {
    //add button event
    document.getElementById("book" + row).addEventListener('click', event => {
      updateCart(row, "add");
      updateCollapseCart();
    });

    //productframe event
    document.getElementById("info" + row).addEventListener('click', event => {
      if (event.target.nodeName != "BUTTON") {
        console.log("info", row);
      }

    });

  }
}



//GENERAL FUNCTIONS
//________________________________________________________________________________________________________________________________

//Checks string length and maximizes it to specified number of characters
function maxStringSize(word, maxSize) {
  let size = word.length

  if (size > maxSize) {
    word = word.slice(0, maxSize - 3) + "...";
  }

  return word;
}

//import json files
async function getJSON(url) {
  let rawData = await fetch(url);
  let data = await rawData.json();
  return data;
}



document.getElementById("dropdownAuthor").addEventListener('hide.bs.dropdown', event => {
  showBooks();
});

document.getElementById("dropdownCategory").addEventListener('hide.bs.dropdown', event => {
  showBooks();
});


//start function to run main page
async function start() {
  //start data
  books = await getJSON('/json/book_data.json');
  categories = getUniqueValues("category");
  authors = getUniqueValues("author");

  showSortNavbar();
  showCategoryNavbar();
  showAuthorNavbar();
  showBooks();
  updateCollapseCart();
  console.log(books)
}

start();


