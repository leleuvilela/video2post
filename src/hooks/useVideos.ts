/* eslint-disable no-unused-vars */
import { useReducer, useRef } from 'react'
import { enableMapSet, produce } from 'immer'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { FFmpeg } from '@ffmpeg/ffmpeg'

enableMapSet()

export interface Video {
  file: File
  previewURL: string
  isLoading: boolean
  convertedAt?: Date
  conversionProgress: number
  transcribedAt?: Date
}

interface VideoState {
  videos: Map<string, Video>
  isConverting: boolean
  isTranscribing: boolean
  finishedConversionAt?: Date
  finishedTranscriptionAt?: Date
}

export enum ActionTypes {
  UPLOAD,
  REMOVE_VIDEO,

  START_CONVERSION,
  FINISH_CONVERSION,
  START_TRANSCRIPTION,
  FINISH_TRANSCRIPTION,

  MARK_VIDEO_AS_CONVERTED,
  MARK_VIDEO_AS_TRANSCRIBED,
  MARK_VIDEO_AS_LOADING,
  UPDATE_VIDEO_CONVERSION_PROGRESS,

  ERROR,
}

interface Action {
  type: ActionTypes
  payload?: any
}

const initialState: VideoState = {
  videos: new Map(),
  isConverting: false,
  isTranscribing: false,
}

const reducer = (state: VideoState, action: Action) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case ActionTypes.UPLOAD: {
        const files = action.payload.files as FileList

        Array.from(files).forEach((file) => {
          const videoId = crypto.randomUUID()

          draft.videos.set(videoId, {
            file,
            previewURL: URL.createObjectURL(file),
            isLoading: false,
            conversionProgress: 0,
          })
        })

        break
      }
      case ActionTypes.START_CONVERSION: {
        draft.isConverting = true

        break
      }
      case ActionTypes.FINISH_CONVERSION: {
        draft.isConverting = false
        draft.finishedConversionAt = new Date()

        break
      }
      case ActionTypes.START_TRANSCRIPTION: {
        draft.isTranscribing = true

        break
      }
      case ActionTypes.FINISH_TRANSCRIPTION: {
        draft.isTranscribing = false
        draft.finishedTranscriptionAt = new Date()

        break
      }
      case ActionTypes.REMOVE_VIDEO: {
        const videoId = action.payload.id as string

        draft.videos.delete(videoId)

        break
      }
      case ActionTypes.MARK_VIDEO_AS_LOADING: {
        const videoId = action.payload.id as string

        const videoToBeUpdated = draft.videos.get(videoId)

        if (!videoToBeUpdated) {
          return
        }

        draft.videos.set(videoId, {
          ...videoToBeUpdated,
          isLoading: true,
        })

        break
      }
      case ActionTypes.UPDATE_VIDEO_CONVERSION_PROGRESS: {
        const videoId = action.payload.id as string
        const progress = action.payload.progress as number

        const videoToBeUpdated = draft.videos.get(videoId)

        if (!videoToBeUpdated) {
          return
        }

        draft.videos.set(videoId, {
          ...videoToBeUpdated,
          conversionProgress: progress,
        })

        break
      }
      case ActionTypes.MARK_VIDEO_AS_CONVERTED: {
        const videoId = action.payload.id as string

        const videoToBeUpdated = draft.videos.get(videoId)

        if (!videoToBeUpdated) {
          return
        }

        draft.videos.set(videoId, {
          ...videoToBeUpdated,
          convertedAt: new Date(),
          isLoading: false,
        })

        break
      }
      case ActionTypes.MARK_VIDEO_AS_TRANSCRIBED: {
        const videoId = action.payload.id as string

        const videoToBeUpdated = draft.videos.get(videoId)

        if (!videoToBeUpdated) {
          return
        }

        draft.videos.set(videoId, {
          ...videoToBeUpdated,
          transcribedAt: new Date(),
          isLoading: false,
        })

        break
      }
      case ActionTypes.ERROR: {
        draft.isConverting = false
        draft.isTranscribing = false
      }
    }
  })
}

export function useVideos() {
  const [
    {
      videos,
      isConverting,
      isTranscribing,
      finishedConversionAt,
      finishedTranscriptionAt,
    },
    dispatch,
  ] = useReducer(reducer, initialState)
  const ffmpegRef = useRef<FFmpeg>(new FFmpeg())

  async function loadFFmpeg() {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.1/dist/umd'
    const ffmpeg = ffmpegRef.current
    ffmpeg.on('log', ({ message }: { message: string }) => {
      console.log(message)
    })
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm',
      ),
    })
  }

  function addFiles(files: FileList) {
    dispatch({
      type: ActionTypes.UPLOAD,
      payload: {
        files,
      },
    })
  }

  function removeVideo(videoId: string) {
    dispatch({
      type: ActionTypes.REMOVE_VIDEO,
      payload: {
        id: videoId,
      },
    })
  }

  async function convertVideoToAudio(videoId: string) {
    const ffmpeg = ffmpegRef.current

    try {
      dispatch({
        type: ActionTypes.MARK_VIDEO_AS_LOADING,
        payload: {
          id: videoId,
        },
      })

      if (!ffmpeg.loaded) {
        await loadFFmpeg()
      }

      const video = videos.get(videoId)

      if (!video) {
        throw new Error(
          `Trying to convert an inexistent video with id ${videoId}`,
        )
      }

      const { file } = video

      ffmpeg.writeFile(file.name, await fetchFile(file))

      ffmpeg.on('progress', ({ progress }: { progress: number }) => {
        dispatch({
          type: ActionTypes.UPDATE_VIDEO_CONVERSION_PROGRESS,
          payload: {
            id: videoId,
            progress: Math.round(progress * 100),
          },
        })
      })

      await ffmpeg.exec([
        '-i',
        file.name,
        '-map',
        '0:a',
        '-b:a',
        '20k',
        '-acodec',
        'libmp3lame',
        `${videoId}.mp4`,
      ])

      const data = await ffmpeg.readFile(`${videoId}.mp4`)

      const response = await fetch('api/upload', {
        method: 'POST',
        body: JSON.stringify({ videoId }),
      })

      const { url } = await response.json()

      await fetch(url, {
        method: 'PUT',
        body: data,
      })

      dispatch({
        type: ActionTypes.MARK_VIDEO_AS_CONVERTED,
        payload: {
          id: videoId,
        },
      })
    } catch (e) {
      console.error(e)
      throw new Error(`Error converting video ${videoId}`)
    }
  }

  async function startAudioConversion() {
    try {
      dispatch({
        type: ActionTypes.START_CONVERSION,
      })

      for (const id of videos.keys()) {
        await convertVideoToAudio(id)
      }

      dispatch({
        type: ActionTypes.FINISH_CONVERSION,
      })
    } catch (e) {
      console.error(e)
      dispatch({
        type: ActionTypes.ERROR,
      })
    }
  }

  return {
    videos,
    isConverting,
    isTranscribing,
    finishedConversionAt,
    finishedTranscriptionAt,
    addFiles,
    removeVideo,
    startAudioConversion,
  }
}
