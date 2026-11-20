'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { updateProfil } from '@/app/actions/akun'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2 } from 'lucide-react'

function TombolSimpanProfil() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={pending} className="gap-1.5">
      {pending ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Menyimpan...
        </>
      ) : (
        'Simpan Perubahan'
      )}
    </Button>
  )
}

interface FormEditProfilProps {
  user: {
    nama: string
    email: string
    telepon?: string | null
  }
}

export function FormEditProfil({ user }: FormEditProfilProps) {
  const [state, action] = useFormState(updateProfil, null)

  return (
    <form action={action} className="space-y-4">
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

      {/* Nama Lengkap */}
      <div className="space-y-1.5">
        <Label htmlFor="nama" className="text-xs font-semibold text-gray-700">Nama Lengkap *</Label>
        <Input
          id="nama"
          name="nama"
          defaultValue={user.nama}
          required
          maxLength={100}
          className={`h-9 text-sm ${state?.errors?.nama ? 'border-red-400' : ''}`}
        />
        {state?.errors?.nama && (
          <p className="text-xs text-red-600">{state.errors.nama[0]}</p>
        )}
      </div>

      {/* Email (Read-only) */}
      <div className="space-y-1.5">
        <Label htmlFor="email-display" className="text-xs font-semibold text-gray-700">Alamat Email</Label>
        <Input
          id="email-display"
          value={user.email}
          disabled
          className="h-9 text-sm bg-gray-100 text-gray-500 cursor-not-allowed font-mono"
        />
        <p className="text-[11px] text-gray-400">Email akun digunakan sebagai identitas masuk.</p>
      </div>

      {/* Nomor Telepon / WA */}
      <div className="space-y-1.5">
        <Label htmlFor="telepon" className="text-xs font-semibold text-gray-700">Nomor Telepon / WhatsApp</Label>
        <Input
          id="telepon"
          name="telepon"
          type="tel"
          defaultValue={user.telepon || ''}
          placeholder="Contoh: 08123456789"
          maxLength={20}
          className={`h-9 text-sm ${state?.errors?.telepon ? 'border-red-400' : ''}`}
        />
        {state?.errors?.telepon && (
          <p className="text-xs text-red-600">{state.errors.telepon[0]}</p>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <TombolSimpanProfil />
      </div>
    </form>
  )
}
