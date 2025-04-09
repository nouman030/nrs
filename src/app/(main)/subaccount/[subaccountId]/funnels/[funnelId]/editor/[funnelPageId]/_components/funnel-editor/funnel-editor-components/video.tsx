'use client'
import { Badge } from '@/components/ui/badge'
import { EditorBtns } from '@/lib/constants'
import { EditorElement, useEditor } from '@/providers/editor/editor-provider'
import clsx from 'clsx'
import { Trash } from 'lucide-react'
import React, { useState, useEffect } from 'react'

type Props = {
  element: EditorElement
}

const VideoComponent = (props: Props) => {
  const { dispatch, state } = useEditor()
  const styles = props.element.styles
  const [isValidUrl, setIsValidUrl] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  // Initialize embedUrl when component mounts or src changes
  useEffect(() => {
    if (props.element.content.embedUrl) {
      const embedUrl = getYouTubeEmbedUrl(props.element.content.embedUrl)
      if (embedUrl) {
        dispatch({
          type: 'UPDATE_ELEMENT',
          payload: {
            elementDetails: {
              ...props.element,
              content: {
                ...props.element.content,
                embedUrl: embedUrl,
              },
            },
          },
        })
      }
    }
  }, [props.element.content, dispatch, props.element])

  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return
    e.dataTransfer.setData('componentType', type)
  }

  const handleOnClickBody = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch({
      type: 'CHANGE_CLICKED_ELEMENT',
      payload: {
        elementDetails: props.element,
      },
    })
  }

  const handleDeleteElement = () => {
    dispatch({
      type: 'DELETE_ELEMENT',
      payload: { elementDetails: props.element },
    })
  }

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      // Handle various YouTube URL formats
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^"&?\/\s]{11})/,
        /youtube\.com\/shorts\/([^"&?\/\s]{11})/,
        /youtube\.com\/live\/([^"&?\/\s]{11})/,
      ]

      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match && match[1]) {
          return `https://www.youtube.com/embed/${match[1]}`
        }
      }
      return url
    } catch (error) {
      return url
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    const embedUrl = getYouTubeEmbedUrl(url)
    const isValid = embedUrl.includes('youtube.com/embed/')
    
    setIsValidUrl(isValid)
    
    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        elementDetails: {
          ...props.element,
          content: {
            src: url,
            embedUrl: embedUrl,
          },
        },
      },
    })
  }

  const handleBlur = () => {
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const embedUrl = getYouTubeEmbedUrl(pastedText)
    const isValid = embedUrl.includes('youtube.com/embed/')
    
    setIsValidUrl(isValid)
    
    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        elementDetails: {
          ...props.element,
          content: {
            src: pastedText,
            embedUrl: embedUrl,
          },
        },
      },
    })
  }

  return (
    <div
      style={styles}
      draggable
      onDragStart={(e) => handleDragStart(e, 'video')}
      onClick={handleOnClickBody}
      className={clsx(
        'p-[2px] w-full m-[5px] relative text-[16px] transition-all flex items-center justify-center',
        {
          '!border-blue-500':
            state.editor.selectedElement.id === props.element.id,
          '!border-solid': state.editor.selectedElement.id === props.element.id,
          'border-dashed border-[1px] border-slate-300': !state.editor.liveMode,
        }
      )}
    >
      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg ">
            {state.editor.selectedElement.name}
          </Badge>
        )}

      {!Array.isArray(props.element.content) && (
        <div className="w-full">
          {state.editor.previewMode || state.editor.liveMode ? (
            <div className="w-full max-w-[600px] mx-auto aspect-video bg-black rounded-lg overflow-hidden">
              {props.element.content.embedUrl && (
                <iframe
                  width="100%"
                  height="100%"
                  src={props.element.content.embedUrl}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  className="w-full h-full"
                />
              )}
            </div>
          ) : (
            <div className="w-full">
              <div className="w-full max-w-[600px] mx-auto aspect-video bg-black flex items-center justify-center mb-2 rounded-lg overflow-hidden">
                {props.element.content.embedUrl ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={props.element.content.embedUrl}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    className="w-full h-full"
                  />
                ) : (
                  <span className="text-white font-medium">Video Preview</span>
                )}
              </div>
              <div className="w-full max-w-[600px] mx-auto">
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="Paste YouTube URL (e.g., https://youtu.be/VIDEO_ID)"
                    value={props.element.content.src || ''}
                    onChange={handleUrlChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    autoFocus
                    className={clsx(
                      "w-full p-2 border rounded-md text-sm text-gray-900 placeholder:text-gray-500 bg-white",
                      !isValidUrl && "border-red-500 focus:border-red-500"
                    )}
                  />
                ) : (
                  <div 
                    onClick={() => setIsEditing(true)}
                    className="w-full p-2 border rounded-md text-sm cursor-text hover:bg-gray-50 flex items-center justify-between bg-white"
                  >
                    <span className="truncate text-gray-900">
                      {props.element.content.src || "Click to add YouTube URL"}
                    </span>
                    {props.element.content.src && (
                      <span className="text-xs text-gray-500 ml-2">
                        Click to edit
                      </span>
                    )}
                  </div>
                )}
                {!isValidUrl && (
                  <p className="text-red-500 text-xs mt-1 font-medium">Please enter a valid YouTube URL</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <div className="absolute bg-primary px-2.5 py-1 text-xs font-bold  -top-[25px] -right-[1px] rounded-none rounded-t-lg !text-white">
            <Trash
              className="cursor-pointer"
              size={16}
              onClick={handleDeleteElement}
            />
          </div>
        )}
    </div>
  )
}

export default VideoComponent
