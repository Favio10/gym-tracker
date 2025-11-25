'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    //aca saco los datos del form
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        console.log(error)
        redirect('/error')
    }
    revalidatePath('/', 'layout')
    redirect('/')
}

// funcion para registrar un nuevo usuario
export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        console.log('Error en registro: ', error)
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}