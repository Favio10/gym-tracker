import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import HistoryItem from "@/componentes/HistoryItem"; // <--- Importamos el componente nuevo

// Tipos (Necesarios para el procesamiento de datos del servidor)
type SetWithExercise = {
  id: number
  weight: number
  reps: number
  created_at: string
  exercises: {
    name: string
  }
}

type WorkoutSession = {
  date: string
  sets: SetWithExercise[]
  totalVolume: number
}

export default async function HistoryPage() {
  const supabase = await createClient();

  // 1. Verificar usuario
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Traer datos
  const { data: rawSets } = await supabase
    .from('sets')
    .select(`
      id,
      weight,
      reps,
      created_at,
      exercises ( name )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // 3. Agrupar datos (Igual que antes)
  const groupedSessions: WorkoutSession[] = [];
  
  if (rawSets) {
    const groups = new Map<string, SetWithExercise[]>();

    rawSets.forEach((set: any) => {
      const dateKey = new Date(set.created_at).toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
      if (!groups.has(dateKey)) groups.set(dateKey, []);
      groups.get(dateKey)?.push(set);
    });

    groups.forEach((sets, date) => {
      const totalVolume = sets.reduce((acc, curr) => acc + (curr.weight * curr.reps), 0);
      groupedSessions.push({ date, sets, totalVolume });
    });
  }

  return (
    <div className="min-h-screen p-4 bg-gray-900 text-white pb-20">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-4">
          <Link href="/" className="text-2xl text-gray-400 hover:text-white transition">←</Link>
          <h1 className="text-2xl font-bold text-blue-400">Historial</h1>
        </div>

        {/* Lista de Sesiones */}
        <div className="space-y-4">
          {groupedSessions.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <p>Sin datos aún 👻</p>
            </div>
          ) : (
            // Aquí usamos el componente interactivo
            groupedSessions.map((session, index) => (
              <HistoryItem key={index} session={session} />
            ))
          )}
        </div>

      </div>
    </div>
  );
}