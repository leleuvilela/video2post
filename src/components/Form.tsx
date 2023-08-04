'use client'

import { useState } from 'react'
import { TranscribeStep } from './TranscribeStep'
import { UploadStep } from './UploadStep'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const formSchema = z.object({
  transcriptionPrompt: z.string().nonempty(),
})

type FormSchema = z.infer<typeof formSchema>

export function MainForm() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'upload' | 'transcribe' | 'generate'>(
    'upload',
  )

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transcriptionPrompt: 'Esse vídeo fala sobre Typescript, React e Next.js.',
    },
  })

  async function submit(data: FormSchema) {
    setLoading(true)

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: JSON.stringify(data),
      }).then((response) => response.json())

      console.log(response)
    } catch (error) {
      console.error(error)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      {step === 'upload' && <UploadStep />}
      {step === 'transcribe' && (
        <TranscribeStep
          {...register('transcriptionPrompt')}
          loading={loading}
        />
      )}
    </form>
  )
}
