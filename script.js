const API_KEY = "d71d8f1r01qot5jd00lgd71d8f1r01qot5jd00m0";

let USD_TO_INR = 83;

/* STOCK LIST */
const STOCK_LIST = [
  "AAPL", "TSLA", "MSFT", "AMZN", "GOOGL",
  "META", "NVDA", "NFLX", "BABA", "INTC"
];

/* GET INR RATE */
async function getExchangeRate() {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/forex/rates?base=USD&token=${API_KEY}`
    );
    const data = await res.json();
    USD_TO_INR = data.quote.INR;
  } catch {
    console.log("Using default rate");
  }
}

/* LOAD ON START */
window.onload = async () => {
  await getExchangeRate();
  loadDashboard();
};

/* LOAD DASHBOARD */
async function loadDashboard() {
  const loader = document.getElementById("loader");
  loader.style.display = "block";

  let results = [];

  const promises = STOCK_LIST.map(symbol =>
    fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`)
      .then(res => res.json())
      .then(data => ({
        symbol,
        price: data.c,
        change: data.c - data.pc
      }))
  );

  results = await Promise.all(promises);

  displayDashboard(results);
  loader.style.display = "none";
}

/* DISPLAY DASHBOARD */
function displayDashboard(stocks) {
  const bullish = [...stocks].sort((a,b)=>b.change-a.change).slice(0,4);
  const bearish = [...stocks].sort((a,b)=>a.change-b.change).slice(0,4);
  const popular = stocks.slice(0,5);

  renderList("bullish", bullish);
  renderList("bearish", bearish);
  renderList("popular", popular);
}

/* RENDER LIST */
function renderList(id, list) {
  const container = document.getElementById(id);
  container.innerHTML = "";

  list.forEach(stock => {
    const div = document.createElement("div");

    const priceINR = stock.price * USD_TO_INR;
    const changeINR = stock.change * USD_TO_INR;
    const color = stock.change >= 0 ? "green" : "red";

    div.className = "stock-item";

    div.innerHTML = `
      <strong>${stock.symbol}</strong> 
      ₹${priceINR.toFixed(2)} 
      <span class="${color}">
        (${changeINR.toFixed(2)})
      </span>
    `;

    div.onclick = () => {
      document.getElementById("searchInput").value = stock.symbol;
      searchStock();
    };

    container.appendChild(div);
  });
}

/* SEARCH STOCK */
async function searchStock() {
  const symbol = document.getElementById("searchInput").value.toUpperCase();
  if (!symbol) return;

  const loader = document.getElementById("loader");
  const card = document.getElementById("stockData");

  loader.style.display = "block";
  card.style.display = "none";

  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
  );

  const data = await res.json();

  const change = data.c - data.pc;
  const changePercent = ((change / data.pc) * 100).toFixed(2);

  const priceINR = data.c * USD_TO_INR;

  card.innerHTML = `
    <h2>${symbol}</h2>
    <p>Price: ₹${priceINR.toFixed(2)}</p>
    <p>High: ₹${(data.h * USD_TO_INR).toFixed(2)}</p>
    <p>Low: ₹${(data.l * USD_TO_INR).toFixed(2)}</p>
    <p>Previous Close: ₹${(data.pc * USD_TO_INR).toFixed(2)}</p>
    <p class="${change>=0?'green':'red'}">
      Change: ₹${(change*USD_TO_INR).toFixed(2)} (${changePercent}%)
    </p>
  `;

  card.style.display = "block";
  loader.style.display = "none";
}