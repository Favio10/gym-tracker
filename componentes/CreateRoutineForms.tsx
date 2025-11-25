'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type Exercise = {
  id: number
  name: string
}

export default function CreateRoutineForm({ exercises }: { exercises: Exercise[] }) {
  const supabase = createClient()
  const router = useRouter() // para redirigir al Home despues de guardar

  const [name, setName] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  // funcion para marcar/desmarcar ejercicios
  const toggleExercise = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) // Si ya está, lo quitamos
        : [...prev, id]              // Si no está, lo agregamos
    )
  }

  const handleSave = async () => {
    if (!name.trim()) return alert("Ponle un nombre a la rutina, fiera.")
    if (selectedIds.length === 0) return alert("Selecciona al menos un ejercicio.")

    setLoading(true)

    try {
      // 1. Crear la Rutina (Cabecera)
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .insert([{ name: name }])
        .select()
        .single() // Queremos el objeto único creado

      if (routineError) throw routineError

      // 2. Crear las relaciones (Detalle)
      // Preparamos el array de objetos para insertar todos de una vez
      const routineExercises = selectedIds.map((exId, index) => ({
        routine_id: routineData.id,
        exercise_id: exId,
        order_index: index + 1 // El orden en que los seleccionaste
      }))

      const { error: relationError } = await supabase
        .from('routine_exercises')
        .insert(routineExercises)

      if (relationError) throw relationError

      alert("¡Rutina creada con éxito!")
      router.push('/') // Volvemos al inicio
      router.refresh() // Forzamos que se actualicen los datos

    } catch (error: any) {
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg mx-auto border border-gray-700">
      <h2 className="text-xl font-bold text-blue-400 mb-6">Nueva Rutina</h2>

      {/* Nombre */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Nombre de la Rutina</label>
        <input 
          type="text"
          placeholder="Ej: Empuje Pesado, Pierna Hipertrofia..."
          className="w-full p-3 rounded bg-gray-900 text-white border border-gray-600 focus:border-blue-500 outline-none"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      {/* Selección de Ejercicios */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Selecciona los Ejercicios</label>
        <div className="bg-gray-900 rounded border border-gray-600 max-h-60 overflow-y-auto p-2 space-y-2">
          {exercises.map(ex => (
            <div 
              key={ex.id} 
              onClick={() => toggleExercise(ex.id)}
              className={`p-3 rounded cursor-pointer flex justify-between items-center transition-all ${
                selectedIds.includes(ex.id) 
                  ? 'bg-blue-600/20 border border-blue-500 text-blue-100' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <span>{ex.name}</span>
              {selectedIds.includes(ex.id) && <span>✅</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          * Selecciónalos en el orden que quieras realizarlos.
        </p>
      </div>

      <button 
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-transform active:scale-95"
      >
        {loading ? 'Guardando...' : 'CREAR RUTINA'}
      </button>
    </div>
  )
}