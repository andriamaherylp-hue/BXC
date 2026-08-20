import btc from '../assets/bxc/btc.png'
import eth from '../assets/bxc/eth.png'
import sol from '../assets/bxc/sol.jpg'
import doge from '../assets/bxc/doge.jpg'
import xrp from '../assets/bxc/xrp.png'
import pepe from '../assets/bxc/pepe.png'
import bnb from '../assets/bxc/bnb.webp'
import atom from '../assets/bxc/atom.png'
import xlm from '../assets/bxc/xlm.png'
import dot from '../assets/bxc/dot.png'
import ltc from '../assets/bxc/ltc.png'
import ada from '../assets/bxc/ada.png'
import link from '../assets/bxc/link.png'
import uni from '../assets/bxc/uni.jpg'
import gbpusd from '../assets/bxc/gbpusd.png'
import usdjpy from '../assets/bxc/usdjpy.png'
import usdchf from '../assets/bxc/usdchf.png'
import usdsgd from '../assets/bxc/usdsgd.png'
import cadusd from '../assets/bxc/cadusd.png'
import audusd from '../assets/bxc/audusd.svg'
import eurgbp from '../assets/bxc/eurgbp.svg'
import tsla from '../assets/bxc/tsla.png'
import nvidia from '../assets/bxc/nvidia.png'
import aapl from '../assets/bxc/aapl.png'
import googl from '../assets/bxc/googl.webp'
import cbre from '../assets/bxc/cbre.jpg'
import amzn from '../assets/bxc/amzn.jpg'
import msft from '../assets/bxc/msft.jpg'
import xau from '../assets/bxc/xau.png'
import xag from '../assets/bxc/xag.png'
import usoil from '../assets/bxc/usoil.jpg'

// Logos fournis dans images.rar (20/08/2026)
import rarBtc from '../assets/bxc/winrar/pngtree-yellow-bitcoin-free-map-png-image_4670940.jpg'
import rarDot from '../assets/bxc/winrar/Polkadot-Crypto-Logo-PNG-File-removebg-preview.png'
import rarXlm from '../assets/bxc/winrar/stellar-xlm-icon-svg-download-png-5795336-removebg-preview.png'
import rarUni from '../assets/bxc/winrar/UNIUSDT.jpg'
import rarDoge from '../assets/bxc/winrar/images.jpg'
import rarGbpusd from '../assets/bxc/winrar/GBPUSD.png'
import rarEurusd from '../assets/bxc/winrar/EURUSDD.png'
import rarUsdhkd from '../assets/bxc/winrar/USDHKD.png'
import rarUsdcny from '../assets/bxc/winrar/USDCNY.png'
import rarCadusd from '../assets/bxc/winrar/CADUSD.jpg'
import rarTsla from '../assets/bxc/winrar/images (5).png'
import rarGoogl from '../assets/bxc/winrar/kisspng-google-pixel-2-xl-google-logo-google-search-nexus-1713919553801.webp'
import rarMsft from '../assets/bxc/winrar/MSFT.png'
import rarOrcl from '../assets/bxc/winrar/ORCL.png'
import rarJpm from '../assets/bxc/winrar/JPM.jpg'
import rarJnj from '../assets/bxc/winrar/JNJ.jpg'
import rarPltr from '../assets/bxc/winrar/PLTR.jpg'
import rarPg from '../assets/bxc/winrar/PG.jpg'
import rarXng from '../assets/bxc/winrar/XNG.jpg'
import rarXal from '../assets/bxc/winrar/XAL.png'
import rarXcu from '../assets/bxc/winrar/XCU.png'
import rarXpd from '../assets/bxc/winrar/XPD.jpg'
import rarXpt from '../assets/bxc/winrar/XPT.jpg'
import rarXni from '../assets/bxc/winrar/XNI.jpg'
import rarXpb from '../assets/bxc/winrar/XPB.jpg'
import rarXzn from '../assets/bxc/winrar/XZN.jpg'

export const MARKET_TABS = [['crypto','Crypto'],['forex','Forex'],['stocks','Stocks'],['futures','Futures']]
const line=(...values)=>values

export const MARKET_DATA={
  crypto:[
    {code:'BTC/USDT',symbol:'BTC',name:'Bitcoin',price:64791.99,change:1.46,image:rarBtc,accent:'orange',spark:line(40,42,44,50,51,49,54,55,54,53,55)},
    {code:'ETH/USDT',symbol:'ETH',name:'Ethereum',price:1914.48,change:.48,image:eth,accent:'blue',spark:line(39,43,46,49,50,52,55,53,55,54,56)},
    {code:'SOL/USDT',symbol:'SOL',name:'Solana',price:76.93,change:1.41,image:sol,accent:'mint',spark:line(40,43,45,47,51,52,55,53,52,54,55)},
    {code:'DOGE/USDT',symbol:'DOGE',name:'Dogecoin',price:.07021,change:-.16,image:rarDoge,accent:'gold',spark:line(45,44,43,46,51,53,52,50,49,50,49)},
    {code:'XRP/USDT',symbol:'XRP',name:'XRP',price:1.0034,change:.06,image:xrp,accent:'black',spark:line(41,44,46,49,47,50,52,51,50,53,52)},
    {code:'PEPE/USDT',symbol:'PEPE',name:'Pepe',price:.0000028,change:.78,image:pepe,accent:'green',spark:line(42,45,43,50,48,54,51,57,54,58,55)},
    {code:'BNB/USDT',symbol:'BNB',name:'BNB',price:603.56,change:-.43,image:bnb,accent:'yellow',spark:line(49,48,47,45,44,46,47,45,46,48,47)},
    {code:'ATOM/USDT',symbol:'ATOM',name:'Cosmos',price:1.413,change:-.07,image:atom,accent:'charcoal',spark:line(43,44,43,45,47,49,50,49,52,54,53)},
    {code:'XLM/USDT',symbol:'XLM',name:'Stellar',price:.1549,change:-1.84,image:rarXlm,accent:'black',spark:line(47,46,45,47,49,48,46,43,44,42,40)},
    {code:'DOT/USDT',symbol:'DOT',name:'Polkadot',price:.733,change:-4.31,image:rarDot,accent:'pink',spark:line(56,51,49,46,42,43,45,46,44,45,43)},
    {code:'LTC/USDT',symbol:'LTC',name:'Litecoin',price:44.34,change:-.11,image:ltc,accent:'silver',spark:line(46,48,47,50,49,48,45,44,46,45,44)},
    {code:'ADA/USDT',symbol:'ADA',name:'Cardano',price:.1754,change:.75,image:ada,accent:'navy',spark:line(40,44,42,48,52,49,53,55,54,50,51)},
    {code:'LINK/USDT',symbol:'LINK',name:'Chainlink',price:9.526,change:.13,image:link,accent:'blue',spark:line(40,42,46,49,51,53,55,53,55,54,56)},
    {code:'UNI/USDT',symbol:'UNI',name:'Uniswap',price:3.718,change:-.47,image:rarUni,accent:'pink',spark:line(52,49,47,45,46,43,41,43,44,46,45)},
  ],
  forex:[
    {code:'GBP/USD',symbol:'GBPUSD',name:'GBP/USD',price:1.35381,change:.03,image:rarGbpusd,accent:'flag',spark:line(40,43,44,46,48,47,48,49,50,50,51)},
    {code:'USD/JPY',symbol:'USDJPY',name:'USD/JPY',price:159.6,change:.01,image:usdjpy,accent:'flag',spark:line(41,47,46,50,47,51,49,50,48,49,49)},
    {code:'EUR/USD',symbol:'EURUSD',name:'EUR/USD',price:1.15779,change:.04,image:rarEurusd,accent:'flag',spark:line(40,43,45,46,44,48,49,50,49,51,52)},
    {code:'USD/CHF',symbol:'USDCHF',name:'USD/CHF',price:.81241,change:.09,image:usdchf,accent:'flag',spark:line(42,44,46,48,50,52,51,53,54,55,52)},
    {code:'USD/SGD',symbol:'USDSGD',name:'USD/SGD',price:1.27818,change:.02,image:usdsgd,accent:'flag',spark:line(42,43,44,46,45,47,49,50,51,50,51)},
    {code:'USD/HKD',symbol:'USDHKD',name:'USD/HKD',price:7.84403,change:-.01,image:rarUsdhkd,accent:'flag',spark:line(44,44,45,46,47,47,48,49,50,51,54)},
    {code:'USD/CNY',symbol:'USDCNY',name:'USD/CNY',price:6.74597,change:.02,image:rarUsdcny,accent:'flag',spark:line(43,55,42,49,44,48,45,49,50,47,49)},
    {code:'AUD/USD',symbol:'AUDUSD',name:'AUD/USD',price:.70963,change:-.09,image:audusd,accent:'flag',spark:line(50,48,47,45,46,43,42,41,39,40,38)},
    {code:'CAD/USD',symbol:'CADUSD',name:'CAD/USD',price:1.38913,change:.13,image:rarCadusd,accent:'flag',spark:line(40,42,44,47,49,52,51,53,54,52,53)},
    {code:'EUR/GBP',symbol:'EURGBP',name:'EUR/GBP',price:.85518,change:.02,image:eurgbp,accent:'flag',spark:line(45,43,46,44,42,45,44,47,49,48,50)},
  ],
  stocks:[
    {code:'TSLA',symbol:'TSLA',name:'Tesla',price:337.04,change:-.67,image:rarTsla,accent:'red',spark:line(52,49,50,48,46,47,45,44,43,45,44)},
    {code:'NVIDIA',symbol:'NVIDIA',name:'NVIDIA',price:219.53,change:-2.44,image:nvidia,accent:'lime',spark:line(53,51,49,48,46,43,44,43,41,42,40)},
    {code:'AAPL',symbol:'AAPL',name:'Apple',price:310.455,change:1.59,image:aapl,accent:'black',spark:line(40,42,45,48,50,51,53,54,53,54,55)},
    {code:'GOOGL',symbol:'GOOGL',name:'Google',price:343.31,change:-.20,image:rarGoogl,accent:'google',logoShape:'wide',spark:line(48,47,49,46,48,47,46,44,43,44,42)},
    {code:'CBRE',symbol:'CBRE',name:'CBRE',price:150.45,change:1.68,image:cbre,accent:'teal',spark:line(40,44,45,48,51,52,53,54,52,54,53)},
    {code:'AMZN',symbol:'AMZN',name:'Amazon',price:260.42,change:-.34,image:amzn,accent:'orange',spark:line(44,43,45,46,49,51,52,51,50,48,47)},
    {code:'MSFT',symbol:'MSFT',name:'Microsoft',price:482.153,change:.38,image:rarMsft,accent:'blue',spark:line(42,45,44,48,50,49,52,53,51,54,52)},
    {code:'ORCL',symbol:'ORCL',name:'Oracle',price:143.415,change:-2.21,image:rarOrcl,accent:'red',logoShape:'wide',spark:line(52,50,48,47,45,43,41,42,40,39,38)},
    {code:'JPM',symbol:'JPM',name:'JPMorgan',price:360.82,change:-.04,image:rarJpm,accent:'blue',logoShape:'wide',spark:line(47,48,46,47,45,44,46,45,44,43,43)},
    {code:'HOUS',symbol:'HOUS',name:'Anywhere Real Estate',price:17.63,change:-.06,icon:'H',accent:'charcoal',spark:line(45,44,43,42,41,40,43,47,49,51,53)},
    {code:'JNJ',symbol:'JNJ',name:'Johnson & Johnson',price:270.21,change:2.99,image:rarJnj,accent:'red',logoShape:'wide',spark:line(40,45,48,43,49,52,47,51,50,53,54)},
    {code:'PLTR',symbol:'PLTR',name:'Palantir',price:171.835,change:-.41,image:rarPltr,accent:'black',logoShape:'wide',spark:line(49,48,50,47,46,44,43,42,43,41,40)},
    {code:'PG',symbol:'PG',name:'P&G',price:143.97,change:.59,image:rarPg,accent:'blue',spark:line(40,42,45,48,50,52,51,53,55,54,56)},
  ],
  futures:[
    {code:'XAU',symbol:'XAU',name:'Gold',price:4364.47,change:-.14,image:xau,accent:'gold',spark:line(52,51,50,48,47,45,43,42,44,45,45)},
    {code:'XAG',symbol:'XAG',name:'Silver',price:63.912,change:-.41,image:xag,accent:'silver',spark:line(51,49,47,46,44,42,41,42,43,45,44)},
    {code:'USOIL',symbol:'USOIL',name:'US Oil',price:85.247,change:.24,image:usoil,accent:'charcoal',spark:line(40,44,42,47,50,49,52,48,51,50,52)},
    {code:'XNG',symbol:'XNG',name:'Natural Gas',price:2.729,change:-.18,image:rarXng,accent:'blue',logoShape:'wide',spark:line(44,46,49,50,52,50,47,45,46,45,44)},
    {code:'XAL',symbol:'XAL',name:'Aluminium',price:3215.13,change:.02,image:rarXal,accent:'silver',logoShape:'wide',spark:line(48,49,48,50,49,50,51,49,50,48,49)},
    {code:'XCU',symbol:'XCU',name:'Copper',price:13968.44,change:-.02,image:rarXcu,accent:'copper',logoShape:'wide',spark:line(50,49,48,47,48,46,45,44,43,44,42)},
    {code:'XPD',symbol:'XPD',name:'Palladium',price:1291.57,change:-.17,image:rarXpd,accent:'silver',logoShape:'wide',spark:line(50,48,46,45,44,42,43,41,42,40,41)},
    {code:'XPT',symbol:'XPT',name:'Platinum',price:1728.69,change:-.11,image:rarXpt,accent:'silver',logoShape:'wide',spark:line(48,46,45,43,42,40,41,42,44,45,43)},
    {code:'UKOIL',symbol:'UKOIL',name:'UK Oil',price:91.35,change:.18,image:usoil,accent:'charcoal',spark:line(40,43,47,45,49,51,48,52,51,53,52)},
    {code:'XNI',symbol:'XNI',name:'Nickel',price:16754.28,change:-.28,image:rarXni,accent:'silver',logoShape:'wide',spark:line(51,49,48,47,45,44,43,42,41,40,39)},
    {code:'XPB',symbol:'XPB',name:'Lead',price:1885.25,change:-.02,image:rarXpb,accent:'silver',logoShape:'wide',spark:line(47,46,45,44,43,42,41,42,41,40,40)},
    {code:'XZN',symbol:'XZN',name:'Zinc',price:3691.07,change:-.15,image:rarXzn,accent:'silver',logoShape:'wide',spark:line(48,47,46,44,45,43,42,41,40,42,41)},
  ]
}

export const ETF_DATA=[
  ...MARKET_DATA.crypto.filter(item=>['BTC','ETH','SOL','DOGE','XRP','LTC'].includes(item.symbol)),
  {code:'USDT',symbol:'USDT',name:'Tether',price:1,change:0,icon:'T',accent:'mint',spark:line(50,50,50,50,50,50,50,50,50,50,50)},
]

export const EXCHANGE_RATES={BTC:64775.99,ETH:1914.86,USDT:1,USDC:1,SOL:76.93}

export function findMarket(category,code){
  const decoded=decodeURIComponent(code||'')
  return (MARKET_DATA[category]||[]).find(item=>item.code===decoded||item.symbol===decoded)
}
