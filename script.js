const API_KEY = "d71d8f1r01qot5jd00lgd71d8f1r01qot5jd00m0";

let USD_TO_INR = 83;
let allStocks = [];

const STOCK_LIST = [
  "AAPL","TSLA","MSFT","AMZN","GOOGL",
  "META","NVDA","NFLX","BABA","INTC"
];

/* Exchange Rate */
async function getExchangeRate() {
  try {
    let res = await fetch(
      "https://finnhub.io/api/v1/forex/rates?base=USD&token=" + API_KEY
    );
    let data = await res.json();
    USD_TO_INR = data.quote.INR;
  } catch {}
}

/* Load */
window.onload = async function () {
  await getExchangeRate();
  loadDashboard();
};

/* Load Dashboard */
async function loadDashboard() {

  let results = [];

  for (let i = 0; i < STOCK_LIST.length; i++) {

    let symbol = STOCK_LIST[i];

    let res = await fetch(
      "https://finnhub.io/api/v1/quote?symbol=" + symbol + "&token=" + API_KEY
    );

    let data = await res.json();

    results.push({
      symbol: symbol,
      price: data.c,
      change: data.c - data.pc
    });
  }

  allStocks = results;

  displayDashboard(allStocks);
}

/* Display Dashboard */
function displayDashboard(stocks) {

  let bullish = [...stocks].sort((a,b)=>b.change-a.change).slice(0,4);
  let bearish = [...stocks].sort((a,b)=>a.change-b.change).slice(0,4);
  let popular = stocks.slice(0,5);

  renderList("bullish", bullish);
  renderList("bearish", bearish);
  renderList("popular", popular);
}

/* Render */
function renderList(id, list) {

  let container = document.getElementById(id);
  container.innerHTML = "";

  for (let i = 0; i < list.length; i++) {

    let stock = list[i];

    let priceINR = stock.price * USD_TO_INR;
    let changeINR = stock.change * USD_TO_INR;

    let div = document.createElement("div");
    div.className = "stock-item";

    div.innerHTML =
      "<strong>" + stock.symbol + "</strong> ₹" +
      priceINR.toFixed(2) +
      " <span class='" + (stock.change>=0?"green":"red") + "'>(" +
      changeINR.toFixed(2) + ")</span>";

    div.onclick = function () {
      document.getElementById("searchInput").value = stock.symbol;
      searchStock();
    };

    container.appendChild(div);
  }
}

/* Search */
async function searchStock() {

  let symbol = document.getElementById("searchInput").value.toUpperCase();
  if (!symbol) return;

  let res = await fetch(
    "https://finnhub.io/api/v1/quote?symbol=" + symbol + "&token=" + API_KEY
  );

  let data = await res.json();

  let priceINR = data.c * USD_TO_INR;

  let card = document.getElementById("stockData");

  card.innerHTML =
    "<h2>" + symbol + "</h2>" +
    "<p>Price: ₹" + priceINR.toFixed(2) + "</p>";

  card.style.display = "block";
}

/* Filter */
function filterStocks(type) {

  let filtered;

  if (type === "gainers") {
    filtered = allStocks.filter(s => s.change > 0);
  } 
  else if (type === "losers") {
    filtered = allStocks.filter(s => s.change < 0);
  } 
  else {
    filtered = allStocks;
  }

  displayDashboard(filtered);
}

/* Sort */
function sortStocks(type) {

  let sorted = [...allStocks];

  if (type === "price") {
    sorted.sort((a,b)=>b.price-a.price);
  } else {
    sorted.sort((a,b)=>b.change-a.change);
  }

  displayDashboard(sorted);
}

/* Dark Mode */
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}