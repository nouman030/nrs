
'use client'
import { useEditor } from '@/providers/editor/editor-provider'
import React from 'react'
import { ChevronDown, ChevronRight, Eye, EyeOff, Plus } from 'lucide-react'
import { SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ElementProps {
  element: any
  depth: number
}

const ElementItem = ({ element, depth }: ElementProps) => {
  const { state, dispatch } = useEditor()
  const [isExpanded, setIsExpanded] = React.useState(true)

  const getElementIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'container':
        return <div className="h-2 w-2 rounded-sm bg-blue-500" />
      case 'twocolumns':
        return <div className="h-2 w-2 rounded-sm bg-green-500" />
      case 'text':
        return <div className="h-2 w-2 rounded-full bg-yellow-500" />
      case 'link':
        return <div className="h-2 w-2 rounded-full bg-purple-500" />
      case 'video':
        return <div className="h-2 w-2 rounded-full bg-red-500" />
      case 'image':
        return <div className="h-2 w-2 rounded-full bg-pink-500" />
      default:
        return <div className="h-2 w-2 rounded-full bg-muted-foreground" />
    }
  }

  const getElementName = (element: any) => {
    if (element.name) return element.name
    if (element.type === 'text' && element.content) {
      return `Text: ${element.content.substring(0, 20)}...`
    }
    return element.type
  }

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          'group flex items-center gap-2 py-2 px-4 hover:bg-accent/40 rounded-sm cursor-pointer transition-colors',
          {
            'bg-accent/60': state.editor.selectedElement?.id === element.id,
          }
        )}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
        onClick={() => {
          dispatch({
            type: 'CHANGE_CLICKED_ELEMENT',
            payload: { elementDetails: element },
          })
        }}
        onMouseEnter={() => {
          dispatch({
            type: 'CHANGE_CLICKED_ELEMENT',
            payload: { elementDetails: element },
          })
        }}
        onMouseLeave={() => {
          dispatch({
            type: 'CHANGE_CLICKED_ELEMENT',
            payload: { elementDetails: { id: "", content: [], name: "", styles: {}, type: null } },
          })
        }}
      >
        {(element.children?.length > 0 || element.type === 'twocolumns') && (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
        <div className="flex items-center gap-2 flex-1">
          {getElementIcon(element.type)}
          <span className="text-xs">{getElementName(element)}</span>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={(e) => {
              e.stopPropagation()
              dispatch({
                type: 'UPDATE_ELEMENT',
                payload: {
                  elementDetails: {
                    ...element,
                    styles: {
                      ...element.styles,
                      display: element.styles?.display === 'none' ? 'block' : 'none'
                    }
                  }
                },
              })
            }}
          >
            {element.styles?.display === 'none' ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col">
          {element.children?.map((child: any) => (
            <ElementItem
              key={child.id}
              element={child}
              depth={depth + 1}
            />
          ))}
          {element.type === 'twocolumns' && element.columns?.map((column: any, index: number) => (
            <div key={index} className="flex flex-col">
              <ElementItem
                element={{ ...column, name: `Column ${index + 1}` }}
                depth={depth + 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const LayersTab = () => {
  const { state } = useEditor()

  return (
    <div className="h-[900px] overflow-auto">
      <SheetHeader className="text-left p-6">
        <SheetTitle>Layers</SheetTitle>
        <SheetDescription>
          View the editor in a tree structure
        </SheetDescription>
      </SheetHeader>
      <div className="px-4">
        <div className="flex flex-col gap-2">
          {state.editor.elements.map((element) => (
            <ElementItem
              key={element.id}
              element={element}
              depth={0}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default LayersTab
