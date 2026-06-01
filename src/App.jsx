import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { SEED, GASTOS_CATS, GANHOS_CATS, PESSOAS, COLORS } from './data/seed'
import Dashboard from './pages/Dashboard'
import Historico from './pages/Historico'
import Comparativo from './pages/Comparativo'
import AddModal from './components/AddModal'
import './index.css'

export default function App() {
  const [txs, setTxs]         = useState([])
  const [loading, setLoading] = useState(true)
  const [seeded, setSeeded]   = useState(false)
  const [page, setPage]       = useState('dashboard')
  const [filter, setFilter]   = useState('all')
  const [modal, setModal]     = useState(false)
  const [mes, setMes]         = useState('2025-05')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .eq('mes', mes)
      .order('dia', { ascending: true })
    if (!error) setTxs(data || [])
    setLoading(false)
  }, [mes])

  useEffect(() => { load() }, [load])

  // Seed once if DB is empty for May 2025
  useEffect(() => {
    if (!loading && txs.length === 0 && !seeded && mes === '2025-05') {
      setSeeded(true)
      supabase.from('transacoes').insert(SEED).then(() => load())
    }
  }, [loading, txs, seeded, mes, load])

  // Real-time sync — changes by one appear for the other instantly
  useEffect(() => {
    const channel = supabase
      .channel('transacoes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transacoes' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load])

  const addTx = async (tx) => {
    await supabase.from('transacoes').insert({ ...tx, mes })
  }

  const deleteTx = async (id) => {
    await supabase.from('transacoes').delete().eq('id', id)
  }

  const filtered = filter === 'all' ? txs : txs.filter(t => t.quem === filter)
  const fmt = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const pages = { dashboard: Dashboard, historico: Historico, comparativo: Comparativo }
  const PageComponent = pages[page]

  const mesLabel = () => {
    const [ano, m] = mes.split('-')
    const nomes = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
    return `${nomes[parseInt(m)]} ${ano}`
  }

  const mudarMes = (delta) => {
    const [ano, m] = mes.split('-').map(Number)
    let nm = m + delta, na = ano
    if (nm > 12) { nm = 1; na++ }
    if (nm < 1)  { nm = 12; na-- }
    setMes(`${na}-${String(nm).padStart(2,'0')}`)
  }

  return (
    <div className="app">
      {/* Top bar */}
      <header className="topbar">
        <div className="topbar-left">
          <p className="topbar-title">Finanças do Casal</p>
          <div className="mes-nav">
            <button className="mes-btn" onClick={() => mudarMes(-1)}>‹</button>
            <p className="topbar-sub">{mesLabel()}</p>
            <button className="mes-btn" onClick={() => mudarMes(1)}>›</button>
          </div>
        </div>
        <div className="avatar-row">
          {['all','Izadora','Henrique','Cartão'].map(p => {
            const label = p === 'all' ? 'Todos' : p === 'Izadora' ? 'IZ' : p === 'Henrique' ? 'HE' : 'CC'
            const cls   = `avatar ${p === 'all' ? 'all' : p === 'Izadora' ? 'iza' : p === 'Henrique' ? 'hen' : 'cart'}${filter === p ? ' active' : ''}`
            return <button key={p} className={cls} onClick={() => setFilter(p)} title={p}>{label}</button>
          })}
        </div>
      </header>

      {/* Content */}
      <main className="main-content">
        {loading
          ? <div className="loading"><div className="spinner" /><p>Carregando...</p></div>
          : <PageComponent txs={filtered} allTxs={txs} fmt={fmt} colors={COLORS} onDelete={deleteTx} />
        }
      </main>

      {/* FAB */}
      <button className="fab" onClick={() => setModal(true)} aria-label="Adicionar lançamento">+</button>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        {[
          { id: 'dashboard',   icon: '⊞', label: 'Início'      },
          { id: 'historico',   icon: '☰', label: 'Histórico'   },
          { id: 'comparativo', icon: '⊟', label: 'Comparativo' },
        ].map(({ id, icon, label }) => (
          <button key={id} className={`nav-btn${page === id ? ' active' : ''}`} onClick={() => setPage(id)}>
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {modal && (
        <AddModal
          onClose={() => setModal(false)}
          onAdd={addTx}
          gastosCats={GASTOS_CATS}
          ganhosCats={GANHOS_CATS}
          pessoas={PESSOAS}
        />
      )}
    </div>
  )
}
