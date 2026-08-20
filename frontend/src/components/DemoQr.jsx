function hashString(value='') {
  let h=2166136261
  for (let i=0;i<value.length;i++) { h^=value.charCodeAt(i); h=Math.imul(h,16777619) }
  return h>>>0
}

export default function DemoQr({ value='', size=154 }) {
  const n=25
  let seed=hashString(value)
  const bit=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return (seed>>>30)&1}
  const grid=Array.from({length:n*n},()=>bit())
  const finder=(x,y)=> x<7&&y<7 || x>=n-7&&y<7 || x<7&&y>=n-7
  return <div className="demo-qr" style={{width:size,height:size}} aria-label="Sandbox reference pattern">
    {Array.from({length:n*n}).map((_,i)=>{
      const x=i%n,y=Math.floor(i/n)
      const dark=finder(x,y)?((x%7===0||y%7===0||x%7===6||y%7===6)||(x%7>=2&&x%7<=4&&y%7>=2&&y%7<=4)):grid[i]
      return <i key={i} className={dark?'dark':''}/>
    })}
  </div>
}
