import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LogWorkout from "@/componentes/LogWorkout";
import Link from "next/link";

export default async function WorkoutSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Verificamos sesión
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Traemos la rutina
  const { data: routine } = await supabase
    .from('routines')
    .select('*')
    .eq('id', id)
    .single();

  if (!routine) return <div className="p-8 text-white">Rutina no encontrada 😢</div>;

  // 3. Traemos los ejercicios de la rutina (El Plan)
  const { data: routineExercises } = await supabase
    .from('routine_exercises')
    .select(`
      order_index,
      exercises (
        id,
        name
      )
    `)
    .eq('routine_id', id)
    .order('order_index');

  const exercisesList = routineExercises?.map((item: any) => ({
    id: item.exercises.id,
    name: item.exercises.name
  })) || [];

  // 4. Traemos TODOS los ejercicios disponibles (El Catálogo para extras)
  const { data: allExercises } = await supabase
    .from('exercises')
    .select('*')
    .order('name');

  return (
    <div className="min-h-screen p-4 bg-gray-900 text-white">
      <div className="max-w-md mx-auto">
        {/* Header de Navegación */}
        <div className="mb-6 flex items-center gap-2">
          <Link href="/" className="text-gray-400 hover:text-white text-xl">
            ←
          </Link>
          <div>
            <span className="block text-xs text-green-400 uppercase font-bold tracking-wider">
              Modo Entreno
            </span>
            <h1 className="text-2xl font-bold text-white">{routine.name}</h1>
          </div>
        </div>

        {/* --- BLOQUE RESTAURADO: Resumen del Plan --- */}
        {exercisesList.length > 0 ? (
          <div className="mb-4 bg-blue-900/20 p-3 rounded border border-blue-800 text-sm text-blue-200">
            📋 <b>Tu plan para hoy:</b> {exercisesList.map(e => e.name).join(", ")}.
          </div>
        ) : (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded text-center text-sm text-red-200">
            Esta rutina está vacía. ¡Usa el botón "+ Extra" para agregar ejercicios!
          </div>
        )}

        {/* Componente de Carga */}
        <LogWorkout 
          exercises={exercisesList} 
          allExercises={allExercises || []} 
        />
      </div>
    </div>
  );
}