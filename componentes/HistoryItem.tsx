'use client'

import { useState } from 'react'

// Definimos los tipos aquí para que TS no se queje
type SetWithExercise = {
  id: number
  weight: number
  reps: number
  exercises: { name: string }
}

type WorkoutSession = {
  date: string
  sets: SetWithExercise[]
  totalVolume: number
}

export default function HistoryItem({ session }: { session: WorkoutSession }) {

  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg transition-all">
      
      {/* CABECERA (Siempre visible) - Al hacer click cambiamos el estado */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-750 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Icono de flecha que rota */}
          <span className={`text-gray-400 text-xs transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
            ▶
          </span>
          <div>
            <h3 className="text-lg font-bold text-white">📅 {session.date}</h3>
            <p className="text-xs text-gray-400">
              {session.sets.length} series
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="block text-xl font-mono font-bold text-green-400">
            {(session.totalVolume / 1000).toFixed(1)}k
          </span>
          <span className="text-[10px] uppercase text-gray-500 tracking-wider">Volumen</span>
        </div>
      </div>

      {/* DETALLE (Solo visible si isOpen es true) */}
      {isOpen && (
        <div className="p-4 space-y-3 bg-gray-900/30 border-t border-gray-700 animate-in slide-in-from-top-2 duration-200">
          {/* Agrupamos visualmente por ejercicio */}
          {Object.entries(
            session.sets.reduce((acc: any, set) => {
              const name = set.exercises.name;
              if (!acc[name]) acc[name] = [];
              acc[name].push(set);
              return acc;
            }, {})
          ).map(([exerciseName, sets]: [string, any]) => (
            <div key={exerciseName}>
              <h4 className="text-sm font-bold text-blue-200 mb-1 border-l-2 border-blue-500 pl-2">
                {exerciseName}
              </h4>
              <div className="flex flex-wrap gap-2 pl-3">
                {sets.map((s: any) => (
                  <span key={s.id} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 font-mono border border-gray-600">
                    {s.weight}kg x {s.reps}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}