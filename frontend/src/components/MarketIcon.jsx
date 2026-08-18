export default function MarketIcon({ item, large=false }) {
  if (item.image) {
    return (
      <span className={`market-icon image-icon ${large ? 'large' : ''}`} aria-hidden="true">
        <img src={item.image} alt="" loading="lazy" decoding="async" />
      </span>
    )
  }
  return <span className={`market-icon ${item.accent || ''} ${large ? 'large' : ''}`}>{item.icon}</span>
}
