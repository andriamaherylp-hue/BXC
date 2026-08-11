export default function MarketIcon({ item, large=false }) {
  return <span className={`market-icon ${item.accent || ''} ${large?'large':''}`}>{item.icon}</span>
}
