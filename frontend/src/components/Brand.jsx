import brandLogo from '../assets/bxc/brand.avif'

export default function Brand({ compact=false, inverse=false }) {
  return <span className={`brand-logo ${compact ? 'compact' : ''} ${inverse ? 'inverse' : ''}`} aria-label="BXC">
    <img src={brandLogo} alt="BXC" />
  </span>
}
