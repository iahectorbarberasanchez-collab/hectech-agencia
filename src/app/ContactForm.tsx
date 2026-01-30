'use client'

import { useState } from 'react'
import { submitLead } from './actions'

export function ContactForm() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    async function handleSubmit(formData: FormData) {
        setStatus('submitting')
        const result = await submitLead(formData)

        if (result.error) {
            setStatus('error')
            setMessage(result.error)
        } else if (result.success) {
            setStatus('success')
            setMessage(result.success as string)
            // Reset form
            const form = document.querySelector('form')
            if (form) form.reset()
        }
    }

    return (
        <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input name="name" type="text" placeholder="¿Cómo te llamas?" required className="bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:border-primary transition-colors h-14 text-white placeholder-slate-500" />
            <input name="email" type="email" placeholder="Tu mejor email (para no hacerte spam)" required className="bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:border-primary transition-colors h-14 text-white placeholder-slate-500" />
            <input name="phone" type="text" placeholder="Teléfono" className="bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:border-primary transition-colors h-14 md:col-span-2 text-white placeholder-slate-500" />
            <textarea name="message" placeholder="Cuéntanos brevemente qué proceso te quita más tiempo ahora mismo..." required className="bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:border-primary transition-colors h-32 md:col-span-2 resize-none text-white placeholder-slate-500"></textarea>

            <button
                type="submit"
                disabled={status === 'submitting'}
                className="md:col-span-2 py-4 bg-primary text-black font-bold rounded-xl text-lg glow-effect mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
                {status === 'submitting' ? 'Enviando...' : 'Solicitar mi consultoría gratis'}
            </button>

            {message && (
                <p className={`md:col-span-2 text-center p-4 rounded-lg ${status === 'error' ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                    {message}
                </p>
            )}
        </form>
    )
}
