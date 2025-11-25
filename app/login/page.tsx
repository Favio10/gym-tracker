import {login, signup} from './actions'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <form className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Gym Tracker 🔐</h1>

                <div className='flex flex-col gap-4'>
                    <div>
                        <label className='block text-sm text-gray-400 mb-1'>Email</label>
                        <input 
                        name='email'
                        type='email'
                        required
                        className='w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none'
                        placeholder='tu@email.com'
                        />
                    </div>
                    <div>
                        <label className='block text-sm text-gray-400 mb-1'>Contraseña</label>
                        <input 
                        name='password'
                        type='password'
                        required
                        className='w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none'
                        placeholder='********'
                        />
                    </div>

                    <div className='flex gap-4 mt-4'>
                        {/* Boton Login */}
                        <button formAction={login} className='flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded font-bold transition'>
                            Entrar
                        </button>

                        {/* Boton registrarse */}
                        <button formAction={signup}className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded font-bold transition border border-gray-500">
                            Registrarme
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}