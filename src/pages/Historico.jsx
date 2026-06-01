import { useState } from 'react'

export default function Historico({ txs, fmt, colors, onDelete }) {
  const [confirm, setConfirm] = useState(null)
  const sorted = [...txs].sort((a, b) => b.dia - a.dia)

  if (!sorted.length) return <div className="empty">Nenhum lançamento neste mês.</div>

  return (
    <div>
      <section className="section">
        <p className="section-label">{sorted.length} lançamentos</p>
        <div className="tx-list">
          {sorted.map(t => (
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
              <button className="delete-btn" onClick={() => setConfirm(confirm === t.id ? null : t.id)}>×</button>
              {confirm === t.id && (
                <div className="confirm-row">
                  <span>Remover?</span>
                  <button className="confirm-yes" onClick={() => { onDelete(t.id); setConfirm(null) }}>Sim</button>
                  <button className="confirm-no"  onClick={() => setConfirm(null)}>Não</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
