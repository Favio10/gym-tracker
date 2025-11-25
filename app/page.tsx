import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LogWorkout from "@/componentes/LogWorkout";

export default async function Home() {
  const supabase = await createClient();

  // 1. Verificamos usuario
  const { data: { user } } = await supabase.auth.getUser();

  // SI NO HAY USUARIO va AL LOGIN
  if (!user) {
    return redirect("/login");
  }

  // 2. Si hay usuario, cargamos los ejercicios
  const { data: exercises } = await supabase.from('exercises').select('*');

  return (
    <div className="min-h-screen p-4 bg-gray-900 text-white">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-400 tracking-tighter">
            GYM TRACKER 🚀
          </h1>
          <form action={async () => {
            'use server'
            const supabase = await createClient()
            await supabase.auth.signOut()
            redirect('/login')
          }}>
            <button className="text-xs bg-red-900/50 text-red-200 px-3 py-1 rounded border border-red-800">
              Salir
            </button>
          </form>
        </div>

        <p className="text-gray-400 mb-6 text-sm">
          Hola, <span className="text-white font-bold">{user.email}</span>
        </p>

        {exercises && exercises.length > 0 && (
          <LogWorkout exercises={exercises} />
        )}
      </div>
    </div>
  );
}