'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

type Exercise = {
  id: number
  name: string
}

type SetHistory = {
  id: number
  weight: number
  reps: number
  created_at: string
}

// Recibimos initialExercises en lugar de exercises fijos
export default function LogWorkout({ exercises: initialExercises }: { exercises: Exercise[] }) {
  const supabase = createClient()
  
  // Convertimos los ejercicios en un ESTADO para poder agregar nuevos visualmente
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises)
  const [exerciseId, setExerciseId] = useState<number | string>(initialExercises[0]?.id || "")
  
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<SetHistory[]>([])

  useEffect(() => {
    if (exerciseId) {
      fetchHistory(Number(exerciseId))
    }
  }, [exerciseId])

  const fetchHistory = async (id: number) => {
    const { data, error } = await supabase
      .from('sets')
      .select('id, weight, reps, created_at')
      .eq('exercise_id', id)
      .order('created_at', { ascending: false })
      .limit(5) // Traemos los últimos 5

    if (error) console.error("Error trayendo historial:", error)
    if (data) setHistory(data)
  }

  // --- NUEVA FUNCIÓN: AGREGAR EJERCICIO ---
  const handleAddExercise = async () => {
    const newName = window.prompt("¿Nombre del nuevo ejercicio? (Ej: Curl de Bíceps)")
    if (!newName) return // Si cancela o lo deja vacío, no hacemos nada

    // 1. Guardar en Supabase
    const { data, error } = await supabase
      .from('exercises')
      .insert([{ name: newName }])
      .select() // Pedimos que nos devuelva el dato creado

    if (error) {
      alert("Error al crear: " + error.message)
    } else if (data) {
      // 2. Agregarlo a la lista visualmente
      const newExercise = data[0]
      setExercises(prev => [...prev, newExercise])
      // 3. Seleccionarlo automáticamente
      setExerciseId(newExercise.id)
      alert(`¡Ejercicio "${newName}" creado!`)
    }
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
      setWeight('')
      setReps('')
      fetchHistory(Number(exerciseId))
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Borrar esta serie?")) return
    const { error } = await supabase.from('sets').delete().eq('id', id)
    if (!error) setHistory(prev => prev.filter(item => item.id !== id))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })
  }

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-2xl mt-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-6 text-green-400 flex items-center gap-2">
        <span>💪</span> Registrar Serie
      </h3>

      <div className="flex flex-col gap-4 mb-8">
        {/* SELECTOR + BOTÓN NUEVO */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <label className="block text-xs font-uppercase text-gray-400 tracking-wider">EJERCICIO</label>
            <button 
              onClick={handleAddExercise}
              className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
            >
              + Crear Nuevo
            </button>
          </div>
          
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

      <div className="border-t border-gray-700 pt-6">
        <h4 className="text-sm text-gray-400 mb-3 uppercase tracking-widest font-semibold">
          Historial Reciente
        </h4>
        
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Sin datos previos para este ejercicio.</p>
        ) : (
          <div className="space-y-2">
            {history.map((set) => (
              <div key={set.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded border-l-4 border-blue-500">
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
                <button 
                  onClick={() => handleDelete(set.id)}
                  className="text-gray-500 hover:text-red-500 p-2"
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