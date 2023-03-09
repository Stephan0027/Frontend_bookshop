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
let sortChoice = "price-ascending";
let priceChoice = "any price";
let shoppingCart = {};

let sortOptions = ["price-ascending", "price-descending", "title-ascending", "title-descending", "author-ascending", "author-descending"];
let priceOptions = {
  "any price": [0, 10000],
  "under 200SEK": [0, 200],
  "200 to 500SEK": [200, 500],
  "500 to 1000SEK": [500, 1000],
  "over 1000SEK": [1000, 100000]
}

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


//show oprice filter options in navBar
function showPriceNavbar() {
  //add options to dropdown
  let html = "";
  for (let option in priceOptions) {
    let val = option;
    html += `<li><a class="dropdown-item" id="${val}">${val}</a></li>`;
  }

  document.getElementById("navPrice").innerHTML = html;

  //add events to options
  for (let option in priceOptions) {
    let val = option;
    document.getElementById(val).addEventListener('click', event => {
      priceChoice = val;
      document.getElementById("priceChoice").innerHTML = val;
      showPriceNavbar();
      showBooks();
    })
  }
}


//show sort option in navbar
function showSortNavbar() {
  //add options to dropdown
  let html = "";
  for (let option in sortOptions) {
    let val = sortOptions[option];
    html += `<li><a class="dropdown-item" id="${val}">${val}</a></li>`;
  }

  document.getElementById("navSort").innerHTML = html;

  //add events to options
  for (let option in sortOptions) {
    let val = sortOptions[option];
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

  for (let bookId in shoppingCart) {
    let book = getBookInfo(bookId);
    title = book["title"];
    quantity = shoppingCart[bookId];
    price = book["price"] * quantity;

    totalItems += quantity;
    totalPrice += price;
    html += `<tr>
    <td>${maxStringSize(title, 30)}</td> 
    <td style="text-align:center"><input type="number" value=${quantity} min =0 id="q${bookId}" style="width:60px"></td>
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
    for (let bookId in shoppingCart) {
      quantity = document.getElementById("q" + bookId).value
      updateCart(bookId, quantity * 1);
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

function showBook(bookId) {
  let book = getBookInfo(bookId);

  let html = `
  <p style="text-align:right"><button type="button" class="btn btn-secondary text-white" id="backButton"> Back</button></p>
  <div class="card mb-3" style="padding:0px">
  <div class="row g-0">
    <div class="col-md-4">
      <img src="/book_id${bookId}.jpg" class="card-img" style="padding:5px"  alt="${book.title}">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h3 class="card-title">${book.title}</h3>
        <h5 class="card-text">${book.author}</h5>
        <br>
        <p class="card-text" style="text-align:left">${book.description}</p>
      </div>
    </div>
    <div class="card-footer">${book.price}SEK
    <button type="button" class="btn btn-secondary text-white" id="addCart"> Add to Cart</button>
    </div>
  </div>       
</div>`

  document.getElementById("bookview").innerHTML = html;

  //add button event
  document.getElementById("addCart").addEventListener('click', event => {
    updateCart(bookId, "add");
    updateCollapseCart();
  });

  //return to main button event
  document.getElementById("backButton").addEventListener('click', event => {
    showBooks();
  });

}

//shows books on main page
function showBooks() {
  let html = "";
  let itemList = [];
  let author, category, bookId, price;
  let priceRange = priceOptions[priceChoice];

  for (let book of books) {
    author = book["author"];
    category = book["category"];
    bookId = book["id"];
    price = book["price"];

    if ((authors[author]["checked"]) && (categories[category]["checked"]) && (price >= priceRange[0]) && (price < priceRange[1])) {
      html += `
        <div class="productFrame" id="info${bookId}">
          <div class="card">
            <img src="/book_id${bookId}.jpg" class="card-img-top" alt="${book.title}">
            <div class="card-body">
              <h5 class="card-title">${maxStringSize(book.title, 45)}</h5>
              <p>${author}</p>
            </div>
            <div class="card-footer">
              ${price}SEK
              <button type="button" class="btn btn-secondary text-white" id="book${bookId}"> Add to
                Cart</button>
            </div>
          </div>
        </div>
          `
      itemList.push(bookId);
    }
  }
  html += '</div>'
  document.getElementById("bookview").innerHTML = html;

  //add events
  for (let itemNr of itemList) {
    //add button event
    document.getElementById("book" + itemNr).addEventListener('click', event => {
      updateCart(itemNr, "add");
      updateCollapseCart();
    });

    //productframe event
    document.getElementById("info" + itemNr).addEventListener('click', event => {
      if (event.target.nodeName != "BUTTON") {
        console.log("info", itemNr);
        console.log(getBookInfo(itemNr));
        showBook(itemNr);
      }

    });

  }
}



//GENERAL FUNCTIONS
//________________________________________________________________________________________________________________________________


//Get book info
function getBookInfo(bookId) {
  bookId *= 1;
  let info;

  for (let book of books) {
    if (book["id"] === bookId) {
      info = book;
      break;
    }
  }

  return info;
}


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

document.getElementById("pageHeader").addEventListener('click', event => {
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
  showPriceNavbar();
  sortList(books);
  showBooks();
  updateCollapseCart();
}

start();


