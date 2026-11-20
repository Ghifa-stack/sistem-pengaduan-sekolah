'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { ubahKataSandi } from '@/app/actions/akun'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, Lock } from 'lucide-react'
import { useRef, useEffect } from 'react'

function TombolUbahPassword() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" variant="default" disabled={pending} className="gap-1.5">
      {pending ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Memperbarui...
        </>
      ) : (
        <>
          <Lock className="w-3.5 h-3.5" />
          Perbarui Kata Sandi
        </>
      )}
    </Button>
  )
}

export function FormUbahPassword() {
  const [state, action] = useFormState(ubahKataSandi, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state?.success])

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {state?.success && (
        <Alert className="border-green-200 bg-green-50 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800 text-xs">
            {state.message}
          </AlertDescription>
        </Alert>
      )}

      {state && !state.success && state.message && !state.errors && (
        <Alert variant="destructive" className="py-2.5">
          <AlertDescription className="text-xs">{state.message}</AlertDescription>
        </Alert>
      )}

      {/* Password Lama */}
      <div className="space-y-1.5">
        <Label htmlFor="passwordLama" className="text-xs font-semibold text-gray-700">
          Kata Sandi Saat Ini *
        </Label>
        <Input
          id="passwordLama"
          name="passwordLama"
          type="password"
          required
          placeholder="Masukkan kata sandi lama"
          className={`h-9 text-sm ${state?.errors?.passwordLama ? 'border-red-400' : ''}`}
        />
        {state?.errors?.passwordLama && (
          <p className="text-xs text-red-600">{state.errors.passwordLama[0]}</p>
        )}
      </div>

      {/* Password Baru */}
      <div className="space-y-1.5">
        <Label htmlFor="passwordBaru" className="text-xs font-semibold text-gray-700">
          Kata Sandi Baru *
        </Label>
        <Input
          id="passwordBaru"
          name="passwordBaru"
          type="password"
          required
          placeholder="Minimal 8 karakter"
          className={`h-9 text-sm ${state?.errors?.passwordBaru ? 'border-red-400' : ''}`}
        />
        {state?.errors?.passwordBaru && (
          <p className="text-xs text-red-600">{state.errors.passwordBaru[0]}</p>
        )}
      </div>

      {/* Konfirmasi Password Baru */}
      <div className="space-y-1.5">
        <Label htmlFor="konfirmasiPasswordBaru" className="text-xs font-semibold text-gray-700">
          Konfirmasi Kata Sandi Baru *
        </Label>
        <Input
          id="konfirmasiPasswordBaru"
          name="konfirmasiPasswordBaru"
          type="password"
          required
          placeholder="Ketik ulang kata sandi baru"
          className={`h-9 text-sm ${state?.errors?.konfirmasiPasswordBaru ? 'border-red-400' : ''}`}
        />
        {state?.errors?.konfirmasiPasswordBaru && (
          <p className="text-xs text-red-600">{state.errors.konfirmasiPasswordBaru[0]}</p>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <TombolUbahPassword />
      </div>
    </form>
  )
}
