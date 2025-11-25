import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CreateRoutineForm from "@/componentes/CreateRoutineForms";

export default async function CreateRoutinePage() {
  const supabase = await createClient();

  // Verificamos sesion
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Traemos los ejercicios disponibles para pasarlos al creador
  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .order('name');

  return (
    <div className="min-h-screen p-4 bg-gray-900 text-white">
      <div className="mb-6">
        <a href="/" className="text-sm text-gray-400 hover:text-white">← Volver al Home</a>
      </div>
      
      <CreateRoutineForm exercises={exercises || []} />
    </div>
  );
}