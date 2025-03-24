'use client'
import LaneForm from '@/components/forms/lane-form'
import CustomModal from '@/components/global/custom-modal'
import { Button } from '@/components/ui/button'
import {
  LaneDetail,
  PipelineDetailsWithLanesCardsTagsTickets,
  TicketandTags,
} from '@/lib/types'
import { useModal } from '@/providers/modal-provider'
import { Lane, Ticket } from '@prisma/client'
import { Flag, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'
import PipelineLane from './pipeline-lane'

type Props = {
  lanes: LaneDetail[]
  pipelineId: string
  subaccountId: string
  pipelineDetails: PipelineDetailsWithLanesCardsTagsTickets
  updateLanesOrder: (lanes: Lane[]) => Promise<void>
  updateTicketsOrder: (tickets: Ticket[]) => Promise<void>
}

const PipelineView = ({
  lanes,
  pipelineDetails,
  pipelineId,
  subaccountId,
  updateLanesOrder,
  updateTicketsOrder,
}: Props) => {
  const { setOpen } = useModal()
  const router = useRouter()
  const [allLanes, setAllLanes] = useState<LaneDetail[]>([])

  useEffect(() => {
    setAllLanes(lanes)
  }, [lanes])

  const ticketsFromAllLanes: TicketandTags[] = []
  lanes.forEach((item) => {
    item.Tickets.forEach((i) => {
      ticketsFromAllLanes.push(i)
    })
  })
  const [allTickets, setAllTickets] = useState(ticketsFromAllLanes)

  const handleAddLane = () => {
    setOpen(
      <CustomModal
        title="Create A Lane"
        subheading="Lanes allow you to group tickets"
      >
        <LaneForm pipelineId={pipelineId} />
      </CustomModal>
    )
  }

  const onDragEnd = async (dropResult: DropResult) => {
    const { destination, source, type, draggableId } = dropResult

    // Return if dropped outside valid droppable
    if (!destination) return

    // Return if dropped in same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    // Handle lane reordering
    if (type === 'lane') {
      const newLanes = Array.from(allLanes)
      const [movedLane] = newLanes.splice(source.index, 1)
      newLanes.splice(destination.index, 0, movedLane)

      const updatedLanes = newLanes.map((lane, idx) => ({
        ...lane,
        order: idx,
      }))

      setAllLanes(updatedLanes)
      await updateLanesOrder(updatedLanes)
      return
    }

    // Handle ticket movement
    if (type === 'ticket') {
      const sourceLane = allLanes.find(lane => lane.id === source.droppableId)
      const destLane = allLanes.find(lane => lane.id === destination.droppableId)

      if (!sourceLane || !destLane) return

      const newSourceTickets = Array.from(sourceLane.Tickets)
      const [movedTicket] = newSourceTickets.splice(source.index, 1)

      // Update ticket's laneId
      const updatedTicket = {
        ...movedTicket,
        laneId: destination.droppableId,
        order: destination.index,
      }

      // Handle moving within same lane
      if (source.droppableId === destination.droppableId) {
        newSourceTickets.splice(destination.index, 0, updatedTicket)
        const updatedLanes = allLanes.map(lane => {
          if (lane.id === sourceLane.id) {
            return {
              ...lane,
              Tickets: newSourceTickets.map((ticket, idx) => ({
                ...ticket,
                order: idx,
              })),
            }
          }
          return lane
        })
        setAllLanes(updatedLanes)
        await updateTicketsOrder(newSourceTickets)
      }
      // Handle moving between different lanes
      else {
        const newDestTickets = Array.from(destLane.Tickets)
        newDestTickets.splice(destination.index, 0, updatedTicket)

        const updatedLanes = allLanes.map(lane => {
          if (lane.id === sourceLane.id) {
            return {
              ...lane,
              Tickets: newSourceTickets.map((ticket, idx) => ({
                ...ticket,
                order: idx,
              })),
            }
          }
          if (lane.id === destLane.id) {
            return {
              ...lane,
              Tickets: newDestTickets.map((ticket, idx) => ({
                ...ticket,
                order: idx,
              })),
            }
          }
          return lane
        })

        setAllLanes(updatedLanes)
        await updateTicketsOrder([...newSourceTickets, ...newDestTickets])
      }

      router.refresh()
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="bg-white/60 dark:bg-background/60 rounded-xl p-4 use-automation-zoom-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">{pipelineDetails?.name}</h1>
          <Button
            className="flex items-center gap-4"
            onClick={handleAddLane}
          >
            <Plus size={15} />
            Create Lane
          </Button>
        </div>
        <Droppable
          droppableId="lanes"
          type="lane"
          direction="horizontal"
        >
          {(provided) => (
            <div
              className="flex items-center  overflow-auto mt-4"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {allLanes.map((lane, index) => (
                <PipelineLane
                  key={lane.id}
                  allTickets={allTickets}
                  setAllTickets={setAllTickets}
                  subaccountId={subaccountId}
                  pipelineId={pipelineId}
                  tickets={lane.Tickets}
                  laneDetails={lane}
                  index={index}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        {allLanes.length == 0 && (
          <div className="flex items-center justify-center w-full flex-col">
            <div className="opacity-100">
              <Flag
                width="100%"
                height="100%"
                className="text-muted-foreground"
              />
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  )
}

export default PipelineView

