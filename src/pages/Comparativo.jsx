import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Comparativo({ allTxs, fmt, colors }) {
  const gastos = allTxs.filter(t => t.tipo === 'gasto')
  const ganhos = allTxs.filter(t => t.tipo === 'ganho')

  const sum = (arr, quem) => arr.filter(t => t.quem === quem).reduce((a, t) => a + Number(t.val), 0)

  const izaG  = sum(gastos, 'Izadora')
  const henG  = sum(gastos, 'Henrique')
  const cartG = sum(gastos, 'Cartão')
  const izaR  = sum(ganhos, 'Izadora')
  const henR  = sum(ganhos, 'Henrique')
  const maxG  = Math.max(izaG, henG, cartG, 1)
  const maxR  = Math.max(izaR, henR, 1)

  const catMap = {}
  gastos.forEach(t => {
    if (!catMap[t.cat]) catMap[t.cat] = { cat: t.cat, Izadora: 0, Henrique: 0, Cartão: 0 }
    catMap[t.cat][t.quem] = (catMap[t.cat][t.quem] || 0) + Number(t.val)
  })
  const barData = Object.values(catMap)
    .sort((a, b) => (b.Izadora + b.Henrique + b.Cartão) - (a.Izadora + a.Henrique + a.Cartão))
    .slice(0, 8)
    .map(r => ({
      cat: r.cat.length > 13 ? r.cat.slice(0, 13) + '…' : r.cat,
      Izadora:  Math.round(r.Izadora  * 100) / 100,
      Henrique: Math.round(r.Henrique * 100) / 100,
      Cartão:   Math.round(r.Cartão   * 100) / 100,
    }))

  const CompBar = ({ label, val, max, color }) => (
    <div className="comp-row">
      <span className="comp-name">{label}</span>
      <div className="comp-bar-bg">
        <div className="comp-bar-fill" style={{ width: `${Math.round(val / max * 100)}%`, background: color }} />
      </div>
      <span className="comp-val">{fmt(val)}</span>
    </div>
  )

  return (
    <div>
      <section className="section">
        <p className="section-label">Quem gastou mais</p>
        <CompBar label="Izadora"  val={izaG}  max={maxG} color={colors.Izadora}  />
        <CompBar label="Henrique" val={henG}  max={maxG} color={colors.Henrique} />
        <CompBar label="Cartão"   val={cartG} max={maxG} color={colors.Cartão}   />
      </section>

      <section className="section">
        <p className="section-label">Quem ganhou mais</p>
        <CompBar label="Izadora"  val={izaR} max={maxR} color={colors.Izadora}  />
        <CompBar label="Henrique" val={henR} max={maxR} color={colors.Henrique} />
      </section>

      {barData.length > 0 && (
        <section className="section">
          <p className="section-label">Gastos por categoria</p>
          <ResponsiveContainer width="100%" height={barData.length * 52 + 60}>
            <BarChart data={barData} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000 ? `R$${(v/1000).toFixed(1)}k` : `R$${v}`} />
              <YAxis type="category" dataKey="cat" tick={{ fontSize: 11 }} width={95} />
              <Tooltip formatter={v => fmt(v)} />
              <Legend />
              <Bar dataKey="Izadora"  fill={colors.Izadora}  radius={[0,3,3,0]} />
              <Bar dataKey="Henrique" fill={colors.Henrique} radius={[0,3,3,0]} />
              <Bar dataKey="Cartão"   fill={colors.Cartão}   radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  )
}
