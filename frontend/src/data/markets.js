export const MARKET_TABS = [
  ['crypto', 'Crypto'],
  ['forex', 'Forex'],
  ['stocks', 'Stocks'],
  ['futures', 'Futures'],
]

const line = (...values) => values

export const MARKET_DATA = {
  crypto: [
    { code:'BTC/USDT', symbol:'BTC', name:'Bitcoin', price:63367.4, change:-0.72, icon:'₿', accent:'orange', spark:line(42,44,43,47,46,49,50,48,47,42,41) },
    { code:'ETH/USDT', symbol:'ETH', name:'Ethereum', price:1863.46, change:-0.42, icon:'◆', accent:'blue', spark:line(48,45,52,46,53,49,55,47,50,46,48) },
    { code:'SOL/USDT', symbol:'SOL', name:'Solana', price:75.24, change:-0.71, icon:'≋', accent:'mint', spark:line(41,43,46,49,52,53,55,52,50,51,48) },
    { code:'DOGE/USDT', symbol:'DOGE', name:'Dogecoin', price:0.07078, change:1.68, icon:'Ð', accent:'gold', spark:line(40,43,46,48,52,55,53,57,55,52,51) },
    { code:'XRP/USDT', symbol:'XRP', name:'XRP', price:1.0106, change:-0.74, icon:'×', accent:'black', spark:line(42,46,48,50,52,50,54,51,48,47,45) },
    { code:'PEPE/USDT', symbol:'PEPE', name:'Pepe', price:0.00000279, change:-2.11, icon:'P', accent:'green', spark:line(55,38,55,38,55,38,55,38,55,38,44) },
    { code:'BNB/USDT', symbol:'BNB', name:'BNB', price:609.17, change:1.60, icon:'◇', accent:'yellow', spark:line(42,44,48,46,49,51,50,54,53,49,47) },
    { code:'ATOM/USDT', symbol:'ATOM', name:'Cosmos', price:1.432, change:1.85, icon:'✳', accent:'charcoal', spark:line(40,45,44,50,49,54,52,55,51,49,48) },
    { code:'XLM/USDT', symbol:'XLM', name:'Stellar', price:0.1609, change:-0.74, icon:'✦', accent:'black', spark:line(42,46,48,47,50,49,52,48,51,47,46) },
    { code:'DOT/USDT', symbol:'DOT', name:'Polkadot', price:0.783, change:-2.37, icon:'P', accent:'pink', spark:line(55,52,48,45,44,39,42,48,47,49,45) },
    { code:'LTC/USDT', symbol:'LTC', name:'Litecoin', price:45.25, change:0.38, icon:'Ł', accent:'silver', spark:line(39,41,44,45,48,50,54,52,55,51,50) },
    { code:'ADA/USDT', symbol:'ADA', name:'Cardano', price:0.1855, change:-3.99, icon:'◉', accent:'navy', spark:line(48,52,46,50,47,53,49,52,48,51,47) },
    { code:'LINK/USDT', symbol:'LINK', name:'Chainlink', price:8.56, change:4.14, icon:'⬡', accent:'blue', spark:line(39,45,48,52,55,57,55,59,56,48,46) },
    { code:'UNI/USDT', symbol:'UNI', name:'Uniswap', price:3.718, change:-5.27, icon:'U', accent:'pink', spark:line(53,49,47,45,40,38,42,45,47,46,48) },
  ],
  forex: [
    { code:'GBP/USD', symbol:'GBPUSD', name:'GBP/USD', price:1.35006, change:-0.08, icon:'🇬🇧🇺🇸', accent:'flag', spark:line(51,45,43,46,44,42,40,41,44,43,46) },
    { code:'USD/JPY', symbol:'USDJPY', name:'USD/JPY', price:159.3, change:0.07, icon:'🇺🇸🇯🇵', accent:'flag', spark:line(40,45,50,55,52,49,51,54,55,51,48) },
    { code:'EUR/USD', symbol:'EURUSD', name:'EUR/USD', price:1.154, change:-0.03, icon:'🇪🇺🇺🇸', accent:'flag', spark:line(49,45,44,41,43,42,44,45,44,48,52) },
    { code:'USD/CHF', symbol:'USDCHF', name:'USD/CHF', price:0.81101, change:0.10, icon:'🇺🇸🇨🇭', accent:'flag', spark:line(43,46,50,51,53,52,54,53,52,48,39) },
    { code:'USD/SGD', symbol:'USDSGD', name:'USD/SGD', price:1.28001, change:0.01, icon:'🇺🇸🇸🇬', accent:'flag', spark:line(38,43,50,55,48,51,53,52,55,51,50) },
    { code:'USD/HKD', symbol:'USDHKD', name:'USD/HKD', price:7.84689, change:0.01, icon:'🇺🇸🇭🇰', accent:'flag', spark:line(40,42,41,44,44,45,47,46,50,49,54) },
    { code:'USD/CNY', symbol:'USDCNY', name:'USD/CNY', price:6.74585, change:0.02, icon:'🇺🇸🇨🇳', accent:'flag', spark:line(44,58,42,55,39,48,46,50,51,47,49) },
    { code:'AUD/USD', symbol:'AUDUSD', name:'AUD/USD', price:0.70558, change:-0.04, icon:'🇦🇺🇺🇸', accent:'flag', spark:line(48,46,49,45,47,44,43,41,39,42,40) },
    { code:'CAD/USD', symbol:'CADUSD', name:'CAD/USD', price:1.39185, change:-0.09, icon:'🇨🇦🇺🇸', accent:'flag', spark:line(51,50,48,49,47,46,43,41,43,42,40) },
    { code:'EUR/GBP', symbol:'EURGBP', name:'EUR/GBP', price:0.85474, change:0.04, icon:'🇪🇺🇬🇧', accent:'flag', spark:line(40,42,45,48,49,51,54,55,53,54,56) },
  ],
  stocks: [
    { code:'TSLA', symbol:'TSLA', name:'Tesla', price:322.62, change:0.33, icon:'T', accent:'red', spark:line(40,44,47,48,51,50,52,49,53,46,45) },
    { code:'NVIDIA', symbol:'NVIDIA', name:'NVIDIA', price:218.395, change:-0.38, icon:'◉', accent:'lime', spark:line(48,51,53,52,54,55,53,54,49,47,46) },
    { code:'AAPL', symbol:'AAPL', name:'Apple', price:312.55, change:0.50, icon:'●', accent:'black', spark:line(46,48,49,50,51,50,49,47,44,42,41) },
    { code:'GOOGL', symbol:'GOOGL', name:'Google', price:359.66, change:-0.76, icon:'G', accent:'google', spark:line(50,48,49,47,46,44,43,40,38,36,35) },
    { code:'CBRE', symbol:'CBRE', name:'CBRE', price:148.51, change:-1.75, icon:'CBRE', accent:'teal', spark:line(48,50,46,52,49,51,47,49,45,46,44) },
    { code:'AMZN', symbol:'AMZN', name:'Amazon', price:273.804, change:0.42, icon:'⌣', accent:'orange', spark:line(39,42,45,47,50,53,55,54,52,48,46) },
    { code:'MSFT', symbol:'MSFT', name:'Microsoft', price:497.38, change:2.04, icon:'▦', accent:'blue', spark:line(38,41,45,48,51,55,57,56,58,55,54) },
  ],
  futures: [
    { code:'XAU', symbol:'XAU', name:'Gold', price:4369.81, change:-1.09, icon:'◆', accent:'gold', spark:line(54,52,50,49,45,43,40,39,42,44,45) },
    { code:'XAG', symbol:'XAG', name:'Silver', price:64.647, change:-1.78, icon:'◉', accent:'silver', spark:line(52,48,46,45,42,40,38,39,41,43,45) },
    { code:'USOIL', symbol:'USOIL', name:'US Oil', price:83.159, change:1.35, icon:'◒', accent:'charcoal', spark:line(40,45,43,50,47,52,48,51,46,52,49) },
    { code:'XNG', symbol:'XNG', name:'Natural Gas', price:2.775, change:-0.29, icon:'🔥', accent:'blue', spark:line(40,43,47,50,52,54,55,50,48,46,46) },
    { code:'XAL', symbol:'XAL', name:'Aluminium', price:3339.39, change:0.14, icon:'Al', accent:'silver', spark:line(50,51,50,50,50,49,49,49,49,49,37) },
    { code:'XCU', symbol:'XCU', name:'Copper', price:14114.54, change:-0.37, icon:'Cu', accent:'copper', spark:line(47,46,45,46,44,44,43,45,46,47,34) },
    { code:'XPD', symbol:'XPD', name:'Palladium', price:1361.15, change:-1.77, icon:'Pd', accent:'silver', spark:line(48,50,46,44,41,43,45,42,40,44,43) },
  ],
}

export const ETF_DATA = [
  ...MARKET_DATA.crypto.filter(item => ['BTC','ETH','SOL','DOGE','XRP','LTC'].includes(item.symbol)),
  { code:'USDT', symbol:'USDT', name:'Tether', price:1, change:0, icon:'T', accent:'mint', spark:line(50,50,50,50,50,50,50,50,50,50,50) },
]

export function findMarket(category, code) {
  const decoded = decodeURIComponent(code || '')
  return (MARKET_DATA[category] || []).find(item => item.code === decoded || item.symbol === decoded)
}
