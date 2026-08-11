function seededSeries(seed=1, count=46) {
  let s = seed * 9301 + 49297
  let value = 58
  const rows=[]
  for (let i=0;i<count;i++) {
    s = (s*233280 + 17) % 2147483647
    const r = (s % 1000)/1000
    const open = value
    const drift = (r-.55)*10
    const close = Math.max(18, Math.min(86, open + drift))
    const high = Math.min(92, Math.max(open,close)+2+(r*4))
    const low = Math.max(8, Math.min(open,close)-2-(r*3))
    const volume = 12 + ((s>>3)%35)
    rows.push({open,close,high,low,volume})
    value=close
  }
  return rows
}

export default function TradingChart({ market }) {
  const seed = [...(market?.code || 'BXC')].reduce((a,c)=>a+c.charCodeAt(0),0)
  const rows=seededSeries(seed)
  const width=840, height=360, chartTop=72, chartBottom=275, volumeTop=292, volumeBottom=345
  const candleW=10, gap=7
  const scaleY=(v)=>chartBottom-((v-5)/90)*(chartBottom-chartTop)
  const last=rows[rows.length-1]
  const positive=(market?.change||0)>=0
  return <div className="trading-chart-shell">
    <div className="chart-head">
      <div><strong>{market.code}</strong><div className="chart-price-row"><b>{market.price}</b><span className={positive?'positive':'negative'}>{market.change.toFixed(2)}%</span></div></div>
      <button className="chart-period">5m⌄</button>
    </div>
    <div className="ohlc-row"><span>Open price: <b>{(market.price*(1-(market.change/100))).toFixed(3)}</b></span><span>Low: <b>{(market.price*.996).toFixed(3)}</b></span><span>High: <b>{(market.price*1.004).toFixed(3)}</b></span><span>Close: <b>{market.price}</b></span></div>
    <svg className="trading-chart" viewBox={`0 0 ${width} ${height}`}>
      {[90,135,180,225,270,315].map(y=><line key={y} x1="0" x2={width} y1={y} y2={y} className="chart-grid"/>) }
      {rows.map((row,i)=>{
        const x=10+i*(candleW+gap)
        const up=row.close>=row.open
        const color=up?'#00e59a':'#ff0b57'
        const yo=scaleY(row.open), yc=scaleY(row.close), yh=scaleY(row.high), yl=scaleY(row.low)
        const top=Math.min(yo,yc), h=Math.max(3,Math.abs(yc-yo))
        const volH=(row.volume/50)*(volumeBottom-volumeTop)
        return <g key={i}>
          <line x1={x+candleW/2} x2={x+candleW/2} y1={yh} y2={yl} stroke={color} strokeWidth="1"/>
          <rect x={x} y={top} width={candleW} height={h} fill={color}/>
          <rect x={x} y={volumeBottom-volH} width={candleW} height={volH} fill={color}/>
        </g>
      })}
      <line x1="0" x2={width} y1={scaleY(last.close)} y2={scaleY(last.close)} className="last-price-line"/>
    </svg>
  </div>
}
