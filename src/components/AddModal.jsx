import { useState } from 'react'

export default function AddModal({ onClose, onAdd, gastosCats, ganhosCats, pessoas }) {
  const [tipo,   setTipo]   = useState('gasto')
  const [quem,   setQuem]   = useState('Henrique')
  const [cat,    setCat]    = useState(gastosCats[0])
  const [descricao, setDescricao] = useState('')
  const [val,    setVal]    = useState('')
  const [dia,    setDia]    = useState('1')
  const [saving, setSaving] = useState(false)

  const cats = tipo === 'gasto' ? gastosCats : ganhosCats

  const handleTipo = t => {
    setTipo(t)
    setCat((t === 'gasto' ? gastosCats : ganhosCats)[0])
  }

  const submit = async () => {
    if (!val || isNaN(Number(val))) { alert('Informe o valor!'); return }
    setSaving(true)
    await onAdd({ dia: parseInt(dia) || 1, quem, tipo, cat, descricao, val: Number(val) })
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <p className="modal-title">Novo lançamento</p>

        <div className="type-toggle">
          <button className={`ttype gasto${tipo === 'gasto' ? ' active' : ''}`} onClick={() => handleTipo('gasto')}>Gasto</button>
          <button className={`ttype ganho${tipo === 'ganho' ? ' active' : ''}`} onClick={() => handleTipo('ganho')}>Ganho</button>
        </div>

        <div className="form-row">
          <label className="form-label">Quem?</label>
          <select value={quem} onChange={e => setQuem(e.target.value)}>
            {pessoas.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div className="form-row">
          <label className="form-label">Categoria</label>
          <select value={cat} onChange={e => setCat(e.target.value)}>
            {cats.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-row">
          <label className="form-label">Descrição</label>
          <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Mercado, Uber, Netflix..." />
        </div>

        <div className="form-row">
          <label className="form-label">Valor (R$)</label>
          <input type="number" step="0.01" value={val} onChange={e => setVal(e.target.value)} placeholder="0,00" />
        </div>

        <div className="form-row">
          <label className="form-label">Dia do mês</label>
          <input type="number" min="1" max="31" value={dia} onChange={e => setDia(e.target.value)} />
        </div>

        <button className="btn-add" onClick={submit} disabled={saving}>
          {saving ? 'Salvando...' : 'Adicionar'}
        </button>
        <button className="btn-cancel" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}
