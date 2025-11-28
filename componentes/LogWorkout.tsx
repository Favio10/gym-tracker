'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import ProgressChart from './ProgressChart'

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

// Props actualizadas: ahora aceptamos allExercises opcionalmente
export default function LogWorkout({ 
  exercises: initialExercises, 
  allExercises = [] 
}: { 
  exercises: Exercise[], 
  allExercises?: Exercise[] 
}) {
  const supabase = createClient()
  
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises)
  const [exerciseId, setExerciseId] = useState<number | string>(initialExercises[0]?.id || "")
  
  // Estado para el modo "Agregar Extra"
  const [isAddingExtra, setIsAddingExtra] = useState(false)
  
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [setCount, setSetCount] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [history, setHistory] = useState<SetHistory[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [showChart, setShowChart] = useState(false)

  // Cronómetro
  const [restTimer, setRestTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && restTimer > 0) {
      interval = setInterval(() => setRestTimer((p) => p - 1), 1000)
    } else if (restTimer === 0 && isTimerRunning) {
      setIsTimerRunning(false)
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200])
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, restTimer])

  const adjustTime = (amount: number) => {
    setRestTimer(prev => Math.max(0, prev + amount))
    if (!isTimerRunning) setIsTimerRunning(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Cargar historial
  useEffect(() => {
    if (exerciseId) fetchHistory(Number(exerciseId))
  }, [exerciseId])

  const fetchHistory = async (id: number) => {
    const { data, error } = await supabase
      .from('sets')
      .select('id, weight, reps, created_at')
      .eq('exercise_id', id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) console.error(error)
    if (data) {
      setHistory(data)
      prepareChartData(data)
    }
  }

  const prepareChartData = (data: SetHistory[]) => {
    const reversedData = [...data].reverse()
    const cleanData = reversedData.map(item => ({
      date: new Date(item.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
      weight: item.weight
    }))
    setChartData(cleanData)
  }

  // --- LÓGICA: Crear ejercicio nuevo (Base de datos) ---
  const handleCreateNewExercise = async () => {
    const newName = window.prompt("Nombre del nuevo ejercicio:")
    if (!newName) return 

    const { data, error } = await supabase
      .from('exercises')
      .insert([{ name: newName }])
      .select()
      .single()

    if (error) {
      alert("Error: " + error.message)
    } else if (data) {
      setExercises(prev => [...prev, data])
      setExerciseId(data.id)
      alert(`¡${newName} creado!`)
    }
  }

  // --- LÓGICA: Agregar ejercicio existente a la sesión actual ---
  const handleIncludeExtra = (idString: string) => {
    if (!idString) return
    const id = Number(idString)
    
    // Verificar si ya está en la lista para no duplicar
    const alreadyInList = exercises.find(e => e.id === id)
    if (alreadyInList) {
      setExerciseId(id)
      setIsAddingExtra(false)
      return
    }

    // Buscar el ejercicio en el catálogo completo
    const exerciseToAdd = allExercises.find(e => e.id === id)
    if (exerciseToAdd) {
      setExercises(prev => [...prev, exerciseToAdd])
      setExerciseId(id)
      setIsAddingExtra(false) // Cerramos el selector extra
    }
  }

  const handleSave = async () => {
    if (!weight || !reps) return alert("Faltan datos")
    setLoading(true)

    const newSets = Array.from({ length: setCount }).map(() => ({
      exercise_id: Number(exerciseId), 
      weight: Number(weight), 
      reps: Number(reps)
    }))

    const { error } = await supabase.from('sets').insert(newSets)
    setLoading(false)

    if (error) {
      alert("Error: " + error.message)
    } else {
      setSetCount(1)
      fetchHistory(Number(exerciseId))
      setRestTimer(90)
      setIsTimerRunning(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Borrar?")) return
    const { error } = await supabase.from('sets').delete().eq('id', id)
    if (!error) {
      const newHistory = history.filter(item => item.id !== id)
      setHistory(newHistory)
      prepareChartData(newHistory)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })
  }

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-2xl mt-6 border border-gray-700 relative">
      
      {/* CRONÓMETRO */}
      {restTimer > 0 && (
        <div className="mb-6 bg-blue-900/40 border border-blue-500/50 p-4 rounded-xl flex flex-col items-center justify-center animate-pulse">
          <span className="text-xs text-blue-300 uppercase tracking-widest font-bold mb-1">Descanso</span>
          <div className="text-4xl font-mono font-bold text-white mb-3">
            {formatTime(restTimer)}
          </div>
          <div className="flex gap-2">
            <button onClick={() => adjustTime(-10)} className="px-3 py-1 bg-gray-700 rounded text-xs text-white">-10s</button>
            <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="px-4 py-1 bg-blue-600 rounded text-xs text-white font-bold">
              {isTimerRunning ? 'PAUSA' : 'Dale!'}
            </button>
            <button onClick={() => adjustTime(30)} className="px-3 py-1 bg-gray-700 rounded text-xs text-white">+30s</button>
            <button onClick={() => setRestTimer(0)} className="px-3 py-1 bg-red-900/50 text-red-300 rounded text-xs">❌</button>
          </div>
        </div>
      )}

      {/* HEADER DE SECCIÓN */}
      <h3 className="text-xl font-bold mb-6 text-green-400 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">💪 Registrar</span>
        <button 
          onClick={() => setShowChart(!showChart)}
          className={`text-xs px-3 py-1 rounded-full border transition-all ${
            showChart ? 'bg-blue-600/20 border-blue-500 text-blue-200' : 'bg-gray-700 border-gray-600 text-gray-400'
          }`}
        >
          {showChart ? 'Ocultar' : 'Ver Progreso 📈'}
        </button>
      </h3>

      {showChart && <ProgressChart data={chartData} />}

      <div className="flex flex-col gap-4 mb-8">
        
        {/* SELECTOR DE EJERCICIOS INTELIGENTE */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <label className="block text-xs font-uppercase text-gray-400 tracking-wider">EJERCICIO</label>
            <div className="flex gap-3">
              {/* Botón para abrir el buscador de existentes */}
              <button 
                onClick={() => setIsAddingExtra(!isAddingExtra)}
                className="text-xs text-yellow-400 hover:text-yellow-300 underline cursor-pointer"
              >
                {isAddingExtra ? 'Cancelar' : '+ Extra'}
              </button>
              {/* Botón para crear uno que no existe en DB */}
              <button 
                onClick={handleCreateNewExercise}
                className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
              >
                + Nuevo
              </button>
            </div>
          </div>
          
          {/* Si está activado "Extra", mostramos TODOS. Si no, solo los de la rutina */}
          {isAddingExtra ? (
             <select 
             className="w-full p-3 rounded-lg bg-gray-700 text-yellow-100 border border-yellow-500 focus:outline-none animate-in fade-in"
             onChange={(e) => handleIncludeExtra(e.target.value)}
             defaultValue=""
           >
             <option value="" disabled>-- Busca en la base de datos --</option>
             {allExercises
                .sort((a,b) => a.name.localeCompare(b.name))
                .map(ex => (
               <option key={ex.id} value={ex.id}>{ex.name}</option>
             ))}
           </select>
          ) : (
            <select 
              className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
              value={exerciseId}
              onChange={(e) => setExerciseId(e.target.value)}
            >
              {exercises.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* INPUTS DE CARGA */}
        <div className="flex gap-2">
          <div className="w-1/3">
            <label className="block text-xs font-uppercase text-gray-400 mb-1 tracking-wider">PESO</label>
            <input 
              type="number" 
              className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-green-500 focus:outline-none text-center text-lg font-mono"
              placeholder="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className="w-1/3">
            <label className="block text-xs font-uppercase text-gray-400 mb-1 tracking-wider">REPS</label>
            <input 
              type="number" 
              className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-green-500 focus:outline-none text-center text-lg font-mono"
              placeholder="0"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
          </div>

          <div className="w-1/3">
            <label className="block text-xs font-uppercase text-blue-400 mb-1 tracking-wider font-bold">SERIES</label>
            <div className="flex items-center bg-gray-900 rounded-lg border border-gray-600 overflow-hidden">
               <button onClick={() => setSetCount(p => Math.max(1, p - 1))} className="px-3 py-3 hover:bg-gray-700 text-gray-400">-</button>
               <div className="flex-1 text-center font-mono text-lg text-white font-bold">{setCount}</div>
               <button onClick={() => setSetCount(p => Math.min(10, p + 1))} className="px-3 py-3 hover:bg-gray-700 text-blue-400">+</button>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-lg transition-all active:scale-95 shadow-lg shadow-green-900/20 mt-2"
        >
          {loading ? 'Guardando...' : `AGREGAR ${setCount > 1 ? setCount + ' SERIES' : 'SERIE'}`}
        </button>
      </div>

      {/* HISTORIAL */}
      <div className="border-t border-gray-700 pt-6">
        <h4 className="text-sm text-gray-400 mb-3 uppercase tracking-widest font-semibold">Historial Reciente</h4>
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Sin datos previos.</p>
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
                  <div className="text-xs text-gray-500 font-mono">{formatDate(set.created_at)}</div>
                </div>
                <button onClick={() => handleDelete(set.id)} className="text-gray-500 hover:text-red-500 p-2">🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}