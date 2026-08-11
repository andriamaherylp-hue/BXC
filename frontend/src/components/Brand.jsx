export default function Brand({ compact = false }) {
  const name = import.meta.env.VITE_APP_NAME || 'DXC'
  return <div className={`brand ${compact ? 'compact' : ''}`} aria-label={name}>{name}</div>
}
