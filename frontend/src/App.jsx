import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [page, setPage] = useState('login') // 'login' | 'register' | 'chat'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(localStorage.getItem('mv_token') || '')
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (token) {
      localStorage.setItem('mv_token', token)
      fetchHistory()
      setPage('chat')
    }
  }, [token])

  async function register() {
    const form = new FormData()
    form.append('username', username)
    form.append('password', password)
    try {
      await axios.post(`${API}/register`, form)
      alert('Registrado com sucesso — faça login.')
      setPage('login')
    } catch (e) {
      alert(e?.response?.data?.detail || 'Erro ao registrar')
    }
  }

  async function login() {
    const form = new FormData()
    form.append('username', username)
    form.append('password', password)
    try {
      const res = await axios.post(`${API}/login`, form)
      setToken(res.data.access_token)
      setPage('chat')
    } catch (e) {
      alert(e?.response?.data?.detail || 'Erro ao logar')
    }
  }

  async function fetchHistory() {
    try {
      const res = await axios.get(`${API}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(res.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  async function sendPrompt() {
    if (!prompt) return
    try {
      const res = await axios.post(`${API}/ask`, { prompt }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(prev => [{ prompt, response: res.data.response }, ...prev])
      setPrompt('')
    } catch (e) {
      alert(e?.response?.data?.detail || 'Erro ao enviar prompt')
    }
  }

  function logout() {
    setToken('')
    localStorage.removeItem('mv_token')
    setPage('login')
    setUsername('')
    setPassword('')
    setMessages([])
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-blue-900 text-sky-100 p-4">
      <div className="w-full max-w-3xl bg-blue-800/40 backdrop-blur-md rounded-2xl p-6 shadow-xl">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">🤖 Multiversal</h1>
          {token && <button onClick={logout} className="px-3 py-1 bg-blue-600 rounded">Logout</button>}
        </header>

        {page !== 'chat' && (
          <div className="grid gap-4">
            <div className="flex gap-2">
              <input className="flex-1 p-3 rounded bg-slate-800 placeholder-slate-400" placeholder="Usuário" value={username} onChange={e => setUsername(e.target.value)} />
              <input className="flex-1 p-3 rounded bg-slate-800 placeholder-slate-400" placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button onClick={login} className="px-4 py-3 bg-blue-600 rounded">Login</button>
              <button onClick={register} className="px-4 py-3 bg-blue-500 rounded">Registrar</button>
              <button onClick={() => setPage(page === 'login' ? 'register' : 'login')} className="px-3 py-3 bg-blue-400 rounded">{page === 'login' ? 'Ir para registro' : 'Ir para login'}</button>
            </div>
          </div>
        )}

        {page === 'chat' && (
          <div className="grid gap-4">
            <div className="flex">
              <input className="flex-1 p-3 rounded-l bg-slate-800 placeholder-slate-400" placeholder="Escreva um prompt..." value={prompt} onChange={e => setPrompt(e.target.value)} />
              <button onClick={sendPrompt} className="px-4 py-3 bg-blue-500 rounded-r">Enviar</button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.length === 0 && <p className="text-slate-300">Nenhuma conversa ainda.</p>}
              {messages.map((m, i) => (
                <div key={i} className="p-3 rounded bg-slate-800/60">
                  <div className="text-sm text-slate-300"><strong>Você:</strong> {m.prompt}</div>
                  <div className="mt-2 text-sky-100"><strong>Multiversal:</strong> {m.response}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
