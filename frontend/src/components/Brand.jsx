export default function Brand({ compact=false }) {
  return <span className={`brand ${compact ? 'compact' : ''}`} aria-label="BXC">BXC</span>
}
