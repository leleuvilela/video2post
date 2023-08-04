import { Mic2 } from 'lucide-react'
import { forwardRef } from 'react'

interface TranscribeStepProps {
  loading: boolean
}

export const TranscribeStep = forwardRef<
  HTMLTextAreaElement,
  TranscribeStepProps
>(function TranscribeStep({ loading, ...rest }, ref) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="transcription_input">Prompt de transcrição</label>
      <textarea
        id="transcription_input"
        className="min-h-[160px] w-full flex-1 rounded border border-zinc-200 px-4 py-3 leading-relaxed text-zinc-900"
        {...rest}
        ref={ref}
      />
      <span className="text-xs text-zinc-500">
        Adicione o contexto dos vídeos contendo palavras-chave sobre o conteúdo
        apresentado.
      </span>
      <button
        type="submit"
        disabled={loading}
        className="mt-2 inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-sky-500 px-4 py-3 text-sm font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Mic2 className="h-4 w-4 text-white" />
        Transcrever vídeos
      </button>
    </div>
  )
})
