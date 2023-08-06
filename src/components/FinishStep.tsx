import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Check } from 'lucide-react'
import { useState } from 'react'

interface FinishStepProps {
  videosKeys: string[]
}

export function FinishStep({ videosKeys }: FinishStepProps) {
  const [text, setText] = useLocalStorage('text', '')
  const [loading, setLoading] = useState(false)

  async function generatePost() {
    try {
      setLoading(true)
      const responseTransform = await fetch('/api/ai/transform', {
        method: 'POST',
        body: JSON.stringify({
          videoKey: videosKeys[0],
        }),
      }).then((response) => response.json())

      setText(responseTransform?.message?.content)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <a
        href={`/api/ai/transcribe/download?key=${videosKeys[0]}`}
        className="text-sky-500 underline"
        target="_blank"
      >
        Baixar transcrição do vídeo
      </a>
      {!text && (
        <button
          onClick={generatePost}
          className="mt-2 inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-sky-500 px-4 py-3 text-sm font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {!loading ? 'Gerar post' : 'Gerando... (pode demorar um pouco)'}
          <Check className="h-4 w-4 text-white" />
        </button>
      )}
      {!!text && (
        <>
          <h2 className="text-xl font-bold">Pronto!</h2>
          <div className="m-3">
            <pre>{text}</pre>
          </div>
        </>
      )}
    </div>
  )
}
