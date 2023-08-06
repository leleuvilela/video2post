'use client'

import { useState } from 'react'
import { TranscribeStep } from './TranscribeStep'
import { UploadStep } from './UploadStep'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Video } from '@/hooks/useVideos'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { FinishStep } from './FinishStep'

const formSchema = z.object({
  transcriptionPrompt: z.string().nonempty(),
})

type FormSchema = z.infer<typeof formSchema>

export function Form() {
  const [videosKeys, setVideosKeys] = useLocalStorage<string[]>('videos', [])
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [step, setStep] = useLocalStorage<'upload' | 'transcribe' | 'generate'>(
    'step',
    'upload',
  )

  const { register, handleSubmit } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transcriptionPrompt: 'Esse vídeo fala sobre Typescript, React e Next.js.',
    },
  })

  async function submit(data: FormSchema) {
    try {
      setIsTranscribing(true)
      const responseTranscribe = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: JSON.stringify({
          videoKey: videosKeys[0],
          transcriptionPrompt: data.transcriptionPrompt,
        }),
      }).then((response) => response.json())

      console.log(responseTranscribe)
      setStep('generate')
    } catch (error) {
      console.error(error)
    } finally {
      setIsTranscribing(false)
    }
  }

  function handleUploaded(videos: Map<string, Video>) {
    setVideosKeys(Array.from(videos.keys()))
    setStep('transcribe')
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      {step === 'upload' && <UploadStep onNextStep={handleUploaded} />}
      {step === 'transcribe' && (
        <TranscribeStep
          {...register('transcriptionPrompt')}
          loading={isTranscribing}
        />
      )}
      {step === 'generate' && <FinishStep videosKeys={videosKeys} />}
    </form>
  )
}
