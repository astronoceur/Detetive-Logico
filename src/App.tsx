import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { MenuPrincipal } from './pages/MenuPrincipal'
import { NarrativaInicial } from './pages/NarrativaInicial'
import { HubInvestigacao } from './pages/HubInvestigacao'
import { Fase } from './pages/Fase'
import { Acusacao } from './pages/Acusacao'

export default function App() {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={<MenuPrincipal />} />
        <Route path="/narrativa" element={<NarrativaInicial />} />
        <Route path="/hub" element={<HubInvestigacao />} />
        <Route path="/fase/:id" element={<Fase />} />
        <Route path="/desafio-final" element={<Acusacao />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
