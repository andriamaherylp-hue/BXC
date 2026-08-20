import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { api } from '../api'

const money = (value) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function AdminPage({ i18n, user, onLogout }) {
  const { t } = i18n
  const [users, setUsers] = useState([])
  const [overview, setOverview] = useState(null)
  const [activity, setActivity] = useState({ funding_requests: [], open_orders: [], transactions: [], audit: [] })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')

  const load = async () => {
    setBusy(true)
    setError('')
    try {
      const [u, o, a] = await Promise.all([
        api('/api/admin/users/'),
        api('/api/admin/overview/'),
        api('/api/admin/activity/'),
      ])
      const nextUsers = u.users || []
      setUsers(nextUsers)
      setOverview(o)
      setActivity(a)
      setSelectedId((current) => current || String(nextUsers.find((item) => !item.is_staff)?.id || nextUsers[0]?.id || ''))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (user?.is_staff) load()
  }, [user?.is_staff])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((item) =>
      [item.username, item.email, item.phone, item.account_code, item.display_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    )
  }, [users, search])

  const selected = users.find((item) => String(item.id) === String(selectedId)) || null
  const normalUsers = users.filter((item) => !item.is_staff)

  if (!user?.is_staff) {
    return <main className="admin-page"><p>Staff access required.</p><Link to="/home">← {t.home}</Link></main>
  }

  const run = async (fn, success) => {
    setError('')
    setNotice('')
    try {
      await fn()
      setNotice(success)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const createClient = async (event) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    await run(async () => {
      const result = await api('/api/admin/clients/create/', {
        method: 'POST',
        body: JSON.stringify({
          display_name: fd.get('display_name'),
          username: fd.get('username'),
          email: fd.get('email'),
          password: fd.get('password'),
        }),
      })
      event.currentTarget.reset()
      if (result.temporary_password) {
        setNotice(`Client created. Temporary password: ${result.temporary_password}`)
      }
    }, 'Client created successfully.')
  }

  const addDeposit = async (event) => {
    event.preventDefault()
    if (!selected) return
    const fd = new FormData(event.currentTarget)
    await run(
      () => api(`/api/admin/users/${selected.id}/add-deposit/`, {
        method: 'POST',
        body: JSON.stringify({
          account_type: fd.get('account_type'),
          network: fd.get('network'),
          amount: fd.get('amount'),
          note: fd.get('note'),
        }),
      }),
      'Sandbox deposit credited.',
    )
    event.currentTarget.reset()
  }

  const adjustBalance = async (event) => {
    event.preventDefault()
    if (!selected) return
    const fd = new FormData(event.currentTarget)
    await run(
      () => api(`/api/admin/users/${selected.id}/adjust-balance/`, {
        method: 'POST',
        body: JSON.stringify({
          account_type: fd.get('account_type'),
          amount: fd.get('amount'),
          note: fd.get('note'),
        }),
      }),
      'Sandbox balance adjusted.',
    )
    event.currentTarget.reset()
  }

  const changeVip = async (level) => {
    if (!selected) return
    await run(
      () => api(`/api/admin/users/${selected.id}/vip/`, { method: 'POST', body: JSON.stringify({ vip_level: level }) }),
      level ? `VIP${level} assigned.` : 'VIP removed.',
    )
  }

  const toggleSuspend = async (item) => {
    await run(
      () => api(`/api/admin/users/${item.id}/suspend/`, { method: 'POST', body: JSON.stringify({ suspended: !item.is_suspended }) }),
      item.is_suspended ? 'Account restored.' : 'Account suspended.',
    )
  }

  const toggleWithdrawals = async (item) => {
    await run(
      () => api(`/api/admin/users/${item.id}/withdrawal-access/`, { method: 'POST', body: JSON.stringify({ blocked: !item.withdrawals_blocked }) }),
      item.withdrawals_blocked ? 'Sandbox withdrawals enabled.' : 'Sandbox withdrawals disabled.',
    )
  }

  const toggleVerify = async (item) => {
    await run(
      () => api(`/api/admin/users/${item.id}/verify/`, { method: 'POST', body: JSON.stringify({ verified: !item.is_verified }) }),
      item.is_verified ? 'Verification removed.' : 'Account verified.',
    )
  }

  const deleteClient = async (item) => {
    if (!window.confirm(`Delete sandbox account ${item.username}? This cannot be undone.`)) return
    await run(
      () => api(`/api/admin/users/${item.id}/delete/`, { method: 'POST', body: '{}' }),
      'Sandbox account deleted.',
    )
  }

  const reviewFunding = async (item, decision) => {
    await run(
      () => api(`/api/admin/funding/${item.id}/review/`, { method: 'POST', body: JSON.stringify({ decision }) }),
      `Sandbox ${item.kind} ${decision === 'approve' ? 'approved' : 'rejected'}.`,
    )
  }

  const closeOrder = async (event, order) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    await run(
      () => api(`/api/admin/orders/${order.id}/close/`, {
        method: 'POST',
        body: JSON.stringify({
          result: fd.get('result'),
          pnl: fd.get('pnl'),
          close_price: fd.get('close_price'),
          note: fd.get('note'),
        }),
      }),
      'Demo order closed.',
    )
  }

  const selectOptions = normalUsers.map((item) => (
    <option value={item.id} key={item.id}>
      {item.email || item.username} — {item.account_code} — ${money(item.balances?.total)}
    </option>
  ))

  return <main className="app-page admin-dashboard digifinex-admin-inspired">
    <AppHeader i18n={i18n} user={user} onLogout={onLogout} />
    <section className="admin-dashboard-shell admin-ops-shell">
      <div className="admin-title-row">
        <div>
          <p className="eyebrow">BXC SANDBOX ADMIN</p>
          <h1>{t.adminDashboard}</h1>
          <p>Account operations, verification review and sandbox activity controls.</p>
        </div>
        <button onClick={load}>{busy ? t.loading : t.refresh}</button>
      </div>

      {overview && <div className="admin-kpis admin-kpis-7">
        <article><span>Total users</span><strong>{overview.total_users}</strong></article>
        <article><span>Active</span><strong>{overview.active_users}</strong></article>
        <article><span>Suspended</span><strong>{overview.suspended_users}</strong></article>
        <article><span>Verified</span><strong>{overview.verified_users}</strong></article>
        <article><span>VIP</span><strong>{overview.vip_users}</strong></article>
        <article><span>Pending funding</span><strong>{(overview.pending_deposits || 0) + (overview.pending_withdrawals || 0)}</strong></article>
        <article><span>Open demo orders</span><strong>{overview.open_demo_orders}</strong></article>
      </div>}

      {error && <div className="form-error">{error}</div>}
      {notice && <div className="form-success">{notice}</div>}

      <div className="admin-operations-grid">
        <article className="admin-operation-card">
          <h3>Create client account</h3>
          <form onSubmit={createClient} className="admin-form-stack">
            <input name="display_name" placeholder="Client name" />
            <input name="username" placeholder="Client username" required />
            <input name="email" type="email" placeholder="Client email (optional)" />
            <input name="password" type="password" placeholder="Temporary password (blank = generate)" />
            <button className="admin-primary">Create client</button>
          </form>
        </article>

        <article className="admin-operation-card">
          <h3>Add approved sandbox deposit</h3>
          <form onSubmit={addDeposit} className="admin-form-stack">
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>{selectOptions}</select>
            {selected && <div className="selected-account-card"><b>{selected.email || selected.username}</b><small>{selected.account_code} · Sandbox balance ${money(selected.balances?.total)}</small></div>}
            <select name="account_type" defaultValue="spot"><option value="spot">Spot account</option><option value="trading">Trading account</option><option value="finance">Finance account</option></select>
            <select name="network" defaultValue="USDT-TRC20"><option>USDT-TRC20</option><option>USDT-ERC20</option><option>USDT-BEP20</option></select>
            <input name="amount" type="number" step="0.01" min="0.01" placeholder="Sandbox deposit amount" required />
            <input name="note" placeholder="Admin note" />
            <button className="admin-primary">Approve sandbox deposit</button>
          </form>
        </article>

        <article className="admin-operation-card">
          <h3>Adjust client sandbox balance</h3>
          <form onSubmit={adjustBalance} className="admin-form-stack">
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>{selectOptions}</select>
            {selected && <div className="selected-account-card"><b>{selected.email || selected.username}</b><small>{selected.account_code} · Total ${money(selected.balances?.total)}</small></div>}
            <select name="account_type" defaultValue="trading"><option value="trading">Trading account</option><option value="spot">Spot account</option><option value="finance">Finance account</option><option value="loan">Loan demo balance</option></select>
            <input name="amount" type="number" step="0.01" placeholder="Amount: -100 or 250" required />
            <input name="note" placeholder="Reason" />
            <button className="admin-primary">Apply adjustment</button>
          </form>
        </article>

        <article className="admin-operation-card">
          <h3>VIP badge management</h3>
          <div className="admin-form-stack">
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>{selectOptions}</select>
            {selected && <div className="selected-account-card"><b>{selected.email || selected.username}</b><small>{selected.account_code} · Status: {selected.vip_label}</small></div>}
            <div className="admin-button-row vip-buttons">
              {[1, 2, 3, 4].map((level) => <button type="button" className="admin-primary" key={level} onClick={() => changeVip(level)}>VIP{level}</button>)}
              <button type="button" className="admin-danger-soft" onClick={() => changeVip(0)}>Remove VIP</button>
            </div>
          </div>
        </article>

        <article className="admin-operation-card">
          <h3>Account access</h3>
          <div className="admin-form-stack">
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>{selectOptions}</select>
            {selected && <div className="selected-account-card"><b>{selected.email || selected.username}</b><small>{selected.account_code} · Status: {selected.is_suspended ? 'Suspended' : 'Active'}</small></div>}
            <div className="admin-button-row"><button className="admin-danger-soft" disabled={!selected || selected.is_suspended} onClick={() => selected && toggleSuspend(selected)}>Suspend account</button><button className="admin-primary" disabled={!selected || !selected.is_suspended} onClick={() => selected && toggleSuspend(selected)}>Restore account</button></div>
          </div>
        </article>

        <article className="admin-operation-card">
          <h3>Sandbox withdrawal access</h3>
          <div className="admin-form-stack">
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>{selectOptions}</select>
            {selected && <div className="selected-account-card"><b>{selected.email || selected.username}</b><small>{selected.account_code} · Withdrawals: {selected.withdrawals_blocked ? 'Disabled' : 'Enabled'}</small></div>}
            <div className="admin-button-row"><button className="admin-danger-soft" disabled={!selected || selected.withdrawals_blocked} onClick={() => selected && toggleWithdrawals(selected)}>Disable withdrawals</button><button className="admin-primary" disabled={!selected || !selected.withdrawals_blocked} onClick={() => selected && toggleWithdrawals(selected)}>Enable withdrawals</button></div>
          </div>
        </article>
      </div>

      <section className="admin-list-card">
        <div className="admin-list-heading"><h3>Clients</h3><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search accounts…" /></div>
        <div className="admin-client-list">
          {filtered.map((item) => <div className="admin-client-row" key={item.id}>
            <div><b>{item.email || item.username}</b><small>{item.account_code} {item.vip_level ? `· VIP${item.vip_level}` : ''} {item.withdrawals_blocked ? '· Withdrawals disabled' : ''}</small></div>
            <strong>${money(item.balances?.total)}</strong>
            <span>{item.is_verified ? 'Verified' : 'Not verified'}</span>
            <button onClick={() => toggleVerify(item)}>{item.is_verified ? 'Unverify' : 'Verify'}</button>
            <button className="admin-danger-soft" disabled={item.is_staff} onClick={() => deleteClient(item)}>Delete account</button>
          </div>)}
        </div>
      </section>

      <div className="admin-pending-grid">
        <section className="admin-list-card">
          <h3>Pending sandbox withdrawals</h3>
          {activity.funding_requests.filter((item) => item.kind === 'withdrawal').length === 0 && <p className="admin-muted">No pending withdrawal</p>}
          {activity.funding_requests.filter((item) => item.kind === 'withdrawal').map((item) => <div className="pending-card" key={item.id}><div><b>{item.email || item.username}</b><span>{item.account_code} · {item.amount} USDT eq. · {item.asset}</span><small>{item.address || item.network}</small></div><div className="pending-actions"><button className="admin-primary" onClick={() => reviewFunding(item, 'approve')}>Approve</button><button className="admin-danger" onClick={() => reviewFunding(item, 'reject')}>Reject</button></div></div>)}
        </section>
        <section className="admin-list-card">
          <h3>Pending sandbox deposits</h3>
          {activity.funding_requests.filter((item) => item.kind === 'deposit').length === 0 && <p className="admin-muted">No pending deposit</p>}
          {activity.funding_requests.filter((item) => item.kind === 'deposit').map((item) => <div className="pending-card" key={item.id}><div><b>{item.email || item.username}</b><span>{item.account_code} · {item.amount} USDT eq. · {item.asset}</span><small>{item.network}</small></div><div className="pending-actions"><button className="admin-primary" onClick={() => reviewFunding(item, 'approve')}>Approve</button><button className="admin-danger" onClick={() => reviewFunding(item, 'reject')}>Reject</button></div></div>)}
        </section>
      </div>

      <section className="admin-list-card">
        <h3>Open demo trade orders</h3>
        {activity.open_orders.length === 0 && <p className="admin-muted">No open demo trade order</p>}
        <div className="open-orders-grid">
          {activity.open_orders.map((order) => <form className="trade-close-card" onSubmit={(e) => closeOrder(e, order)} key={order.id}>
            <div><b>{order.email || order.username}</b><small>{order.account_code} · {order.market_code} · {order.mode} · {order.direction || 'call'} · {order.investment} DEMO USDT</small></div>
            <select name="result" defaultValue="win"><option value="win">Win</option><option value="loss">Loss</option><option value="cancelled">Cancelled</option></select>
            <input name="pnl" type="number" step="0.01" min="0" defaultValue="0" placeholder="Profit / loss amount" />
            <input name="close_price" type="number" step="0.00000001" placeholder="Close price" />
            <input name="note" placeholder="Admin note" />
            <button className="admin-primary">Close demo order</button>
          </form>)}
        </div>
      </section>

      <div className="admin-safety"><strong>Sandbox financial controls</strong><p>These controls only modify BXC demonstration balances and simulated requests/orders. They do not move cryptocurrency, approve real withdrawals, create real loans, or settle real brokerage trades.</p></div>
    </section>
  </main>
}
