export default function MarketIcon({ item, large=false }) {
  return <span className={`market-icon ${item.accent || ''} ${large?'large':''}`}>
    {item.image
      ? <img src={item.image} alt="" aria-hidden="true"/>
      : <span className="market-icon-fallback">{item.icon}</span>}
  </span>
}
