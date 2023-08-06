import { Video } from '@/hooks/useVideos'
import { X } from 'lucide-react'

interface VideoItemProps {
  id: string
  video: Video
  onRemove: (id: string) => void
}

export function VideoItem({ id, video, onRemove }: VideoItemProps) {
  return (
    <div className="relative w-full rounded-md">
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
      >
        <X className="h-4 w-4" />
      </button>

      <video
        src={video.previewURL}
        className="pointer-events-none aspect-video w-full rounded-md data-[disabled=true]:opacity-60"
        controls={false}
      />

      <span className="absolute bottom-0 left-0 right-0 rounded-b-md bg-black/40 p-1 text-center text-xs text-zinc-200">
        {video.isLoading ? `${video.conversionProgress}%` : video.file.name}
      </span>
    </div>
  )
}
