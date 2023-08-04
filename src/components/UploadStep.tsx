import { PlusCircle, Music } from 'lucide-react'

export function UploadStep() {
  return (
    <div className="relative flex flex-col gap-4">
      <label
        htmlFor="videos"
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-sky-500 px-4 py-3 text-sm font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <PlusCircle className="h-4 w-4 text-white" />
        Selecione os vídeos
      </label>

      <span className="inline-block text-center text-xs text-zinc-500">
        Nenhum vídeo selecionado.
      </span>

      <button className="mt-2 inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-sky-500 px-4 py-3 text-sm font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60">
        <Music className="h-4 w-4 text-white" />
        Converter vídeos em áudio
      </button>
    </div>
  )
}
