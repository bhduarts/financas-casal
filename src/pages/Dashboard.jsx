import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const SLICE_COLORS = ['#534AB7','#1D9E75','#D85A30','#D4537E','#378ADD','#639922','#BA7517','#E24B4A','#0F6E56','#185FA5','#3B6D11','#993556']

export default function Dashboard({ txs, fmt, colors }) {
  const gastos  = txs.filter(t => t.tipo === 'gasto')
  const ganhos  = txs.filter(t => t.tipo === 'ganho')
  const totalG  = gastos.reduce((a, t) => a + Number(t.val), 0)
  const totalR  = ganhos.reduce((a, t) => a + Number(t.val), 0)
  const saldo   = totalR - totalG

  const catMap = {}
  gastos.forEach(t => { catMap[t.cat] = (catMap[t.cat] || 0) + Number(t.val) })
  const pieData = Object.entries(catMap)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value], i) => ({ name, value: Math.round(value * 100) / 100, color: SLICE_COLORS[i] }))

  const recentes = [...txs].sort((a, b) => b.dia - a.dia).slice(0, 6)

  return (
    <div>
      <section className="section">
        <p className="section-label">Resumo do mês</p>
        <div className="cards2">
          <div className="mcard"><p className="mcard-label">Ganhos</p><p className="mcard-val green">{fmt(totalR)}</p></div>
          <div className="mcard"><p className="mcard-label">Gastos</p><p className="mcard-val red">{fmt(totalG)}</p></div>
          <div className="mcard"><p className="mcard-label">Saldo</p><p className={`mcard-val ${saldo >= 0 ? 'green' : 'red'}`}>{fmt(saldo)}</p></div>
          <div className="mcard"><p className="mcard-label">Lançamentos</p><p className="mcard-val">{txs.length}</p></div>
        </div>
      </section>

      {pieData.length > 0 && (
        <section className="section">
          <p className="section-label">Gastos por categoria</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={v => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend">
            {pieData.map((d, i) => (
              <span key={i} className="leg-item">
                <span className="leg-dot" style={{ background: d.color }} />
                {d.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <p className="section-label">Últimos lançamentos</p>
        {recentes.length === 0
          ? <p className="empty">Nenhum lançamento ainda. Clique em + para começar!</p>
          : (
            <div className="tx-list">
              {recentes.map(t => (
                <div key={t.id} className="tx">
                  <div className="tx-dot" style={{ background: colors[t.quem] || '#888' }} />
                  <div className="tx-info">
                    <p className="tx-desc">{t.descricao || t.cat}</p>
                    <p className="tx-meta">
                      Dia {t.dia} · {t.cat} ·{' '}
                      <span className={`badge ${t.quem === 'Izadora' ? 'iza' : t.quem === 'Henrique' ? 'hen' : 'cart'}`}>{t.quem}</span>
                    </p>
                  </div>
                  <p className={`tx-val ${t.tipo === 'gasto' ? 'out' : 'in'}`}>
                    {t.tipo === 'gasto' ? '-' : '+'} {fmt(t.val)}
                  </p>
                </div>
              ))}
            </div>
          )
        }
      </section>
    </div>
  )
}
