export default function MiniSparkline({ values=[], positive=true, width=120, height=38 }) {
  if (!values.length) return null
  const min = Math.min(...values), max = Math.max(...values), range = Math.max(1, max-min)
  const points = values.map((v,i)=>{
    const x = (i/(values.length-1))*width
    const y = height - ((v-min)/range)*(height-4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return <svg className={`sparkline ${positive?'up':'down'}`} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="price trend">
    <polyline points={points} fill="none" vectorEffect="non-scaling-stroke"/>
  </svg>
}
