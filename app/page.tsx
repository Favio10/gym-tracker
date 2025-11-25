import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogWorkout from "@/componentes/LogWorkout"; // Mantenemos el modo libre por si acaso

export default async function Home() {
  const supabase = await createClient();

  // 1. Verificamos usuario
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // 2. Traemos las RUTINAS del usuario
  const { data: routines } = await supabase
    .from('routines')
    .select('*')
    .order('created_at', { ascending: false });

  // 3. Traemos TODOS los ejercicios (para el modo "Entrenamiento Libre" de abajo)
  const { data: allExercises } = await supabase.from('exercises').select('*').order('name');

  return (
    <div className="min-h-screen p-4 bg-gray-900 text-white pb-20">
      <div className="max-w-md mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-blue-400 tracking-tighter">GYM TRACKER 🚀</h1>
            <p className="text-xs text-gray-400">Hola, {user.email?.split('@')[0]}</p>
          </div>
          <form action={async () => {
            'use server'
            const supabase = await createClient()
            await supabase.auth.signOut()
            redirect('/login')
          }}>
            <button className="text-xs bg-red-900/30 text-red-200 px-3 py-1 rounded border border-red-800 hover:bg-red-900/50">
              Salir
            </button>
          </form>
        </header>

        {/* --- SECCIÓN: MIS RUTINAS --- */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Mis Rutinas</h2>
            <Link href="/routines/create" className="text-sm text-blue-400 hover:underline">
              + Nueva
            </Link>
          </div>

          {routines && routines.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {routines.map(routine => (
                <Link 
                  key={routine.id} 
                  href={`/workout/${routine.id}`} // <--- ESTO ES LA CLAVE
                  className="block bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-gray-750 transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg group-hover:text-blue-400 transition-colors">
                      {routine.name}
                    </span>
                    <span className="text-2xl">💪</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Clic para empezar →</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-gray-800/50 rounded-xl border border-dashed border-gray-700 text-center">
              <p className="text-gray-400 text-sm mb-2">No tienes rutinas armadas.</p>
              <Link href="/routines/create" className="text-blue-400 font-bold text-sm">
                ¡Crea la primera aquí!
              </Link>
            </div>
          )}
        </section>

        {/* --- FALLBACK: ENTRENAMIENTO LIBRE (Lo viejo) --- */}
        <div className="border-t border-gray-800 pt-8">
          <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-widest">
            Entrenamiento Libre / Rápido
          </h3>
          {allExercises && <LogWorkout exercises={allExercises} />}
        </div>
      </div>
    </div>
  );
}