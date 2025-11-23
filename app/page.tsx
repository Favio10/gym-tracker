import { supabase } from "@/lib/supabase";
import LogWorkout from "@/componentes/LogWorkout"; // importo el componente 

export default async function Home() {
  // pido los ejercicios al servidor para pasarlo al formulario
  const { data: exercises } = await supabase.from('exercises').select('*');

  return (
    <div className="min-h-screen p-4 bg-gray-900 text-white">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-400 tracking-tighter">
          GYM TRACKER 💪
        </h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          dale loco, metele.
        </p>

        {/* aca ponemos el formulario y le pasamos los ejercicios como "props" */}
        {exercises && exercises.length > 0 && (
          <LogWorkout exercises={exercises} />
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
            Ejercicios Disponibles
          </h2>
          <ul className="space-y-2 opacity-75">
            {exercises?.map((exercise) => (
              <li key={exercise.id} className="text-sm text-gray-400">
                • {exercise.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}