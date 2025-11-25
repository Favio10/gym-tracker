'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
const supabase = createClient()

type Exercise = {
  id: number
  name: string
}

// defino la forma de una serie para el historial
type SetHistory = {
  id: number
  weight: number
  reps: number
  created_at: string
}

export default function LogWorkout({ exercises }: { exercises: Exercise[] }) {
  const [exerciseId, setExerciseId] = useState<number | string>(exercises[0]?.id || "")
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [loading, setLoading] = useState(false)
  
  // estado para guardar el historial que traemos de la base de datos
  const [history, setHistory] = useState<SetHistory[]>([])
 
  // Cada vez que cambia el exerciseId, buscamos su historial
  useEffect(() => {
    if (exerciseId) {
      fetchHistory(Number(exerciseId))
    }
  }, [exerciseId])

  // aca pido los datos a Supabase
  const fetchHistory = async (id: number) => {
    const { data, error } = await supabase
      .from('sets')
      .select('id, weight, reps, created_at')
      .eq('exercise_id', id)       // Filtrar por el ejercicio actual
      .order('created_at', { ascending: false }) // Los más nuevos primero
      .limit(5)                    // Solo los últimos 5

    if (error) console.error("Error trayendo historial:", error)
    if (data) setHistory(data)
  }

  const handleSave = async () => {
    if (!weight || !reps) return alert("Completa los datos fiera")
    
    setLoading(true)

    const { error } = await supabase
      .from('sets')
      .insert([
        { 
          exercise_id: Number(exerciseId), 
          weight: Number(weight), 
          reps: Number(reps) 
        }
      ])

    setLoading(false)

    if (error) {
      alert("Error: " + error.message)
    } else {
      // Limpiamos inputs
      setWeight('')
      setReps('')
      // Actualizamos el historial inmediatamente para ver el cambio
      fetchHistory(Number(exerciseId))
    }
  }


  // funcion para eliminar
  const handleDelete = async (id: number) => {
    // primero la confirmacion
    if(!window.confirm("¿confirmas eliminar esta serie?")) return

    // borrado en supabase
    const { error } = await supabase
      .from('sets')
      .delete()
      .eq('id', id)

      if (error) {
        alert("Error al borrar: " + error.message)
      } else {
        // actualizo el historial visual
        setHistory(prev => prev.filter(item => item.id !== id))
      }
  }
  

  // Helper para formatear la fecha 
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })
  }

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-2xl mt-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-6 text-green-400 flex items-center gap-2">
        <span>💪</span> Registrar Serie
      </h3>

      {/* FORMULARIO DE CARGA */}
      <div className="flex flex-col gap-4 mb-8">
        <div>
          <label className="block text-xs font-uppercase text-gray-400 mb-1 tracking-wider">EJERCICIO</label>
          <select 
            className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
            value={exerciseId}
            onChange={(e) => setExerciseId(e.target.value)}
          >
            {exercises.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <div className="w-1/2">
            <label className="block text-xs font-uppercase text-gray-400 mb-1 tracking-wider">PESO (KG)</label>
            <input 
              type="number" 
              className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-green-500 focus:outline-none text-center text-lg font-mono"
              placeholder="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className="w-1/2">
            <label className="block text-xs font-uppercase text-gray-400 mb-1 tracking-wider">REPS</label>
            <input 
              type="number" 
              className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-green-500 focus:outline-none text-center text-lg font-mono"
              placeholder="0"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-lg transition-all active:scale-95 shadow-lg shadow-green-900/20"
        >
          {loading ? 'Guardando...' : 'AGREGAR SERIE'}
        </button>
      </div>

      {/* HISTORIAL */}
      <div className="border-t border-gray-700 pt-6">
        <h4 className="text-sm text-gray-400 mb-3 uppercase tracking-widest font-semibold">
          Historial Reciente
        </h4>
        
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Sin datos previos.</p>
        ) : (
          <div className="space-y-2">
            {history.map((set) => (
              <div key={set.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded border-l-4 border-blue-500 group">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-bold text-lg">{set.weight} kg</span>
                    <span className="text-gray-400 text-sm">x</span>
                    <span className="text-white font-bold text-lg">{set.reps} reps</span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {formatDate(set.created_at)}
                  </div>
                </div>
                
                {/* BOTÓN BORRAR NUEVO */}
                <button 
                  onClick={() => handleDelete(set.id)}
                  className="text-gray-500 hover:text-red-500 p-2 transition-colors"
                  title="Borrar serie"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}