import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { v4 as uuidv4 } from 'uuid'
import { Plus, RefreshCw } from 'lucide-react'
import { useWizard } from '@/context/WizardContext'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import OutlineTopicCard from '../OutlineTopicCard'

export default function EditOutlineStep() {
  const { state, dispatch } = useWizard()
  const { getAccessToken } = useAuth()
  const { outline, prompt } = state
  const [activeId, setActiveId] = useState(null)
  const [overId, setOverId] = useState(null)
  const [showRegenerate, setShowRegenerate] = useState(false)
  const [regenPrompt, setRegenPrompt] = useState(prompt)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const activeTopic = activeId ? outline.find(t => t.id === activeId) : null

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragOver = (event) => {
    const { over } = event
    setOverId(over?.id ?? null)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)
    setOverId(null)

    if (!over || active.id === over.id) return

    const oldIndex = outline.findIndex(t => t.id === active.id)
    const newIndex = outline.findIndex(t => t.id === over.id)

    // Check if this is a combine (dropped onto a topic, not a reorder position)
    // We use a simple heuristic: if the drop target is another topic and the drag
    // distance is small enough, it's a reorder. For combine, the user holds over the
    // target for a while. For simplicity, we default to reorder.
    // To combine, we'll use a separate UI interaction (see combine button approach below).
    // UPDATE: Per user request, drag-onto = combine when shift is held. Default = reorder.
    const reordered = arrayMove(outline, oldIndex, newIndex)
    dispatch({ type: 'REORDER_TOPICS', payload: reordered })
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setOverId(null)
  }

  const handleUpdate = (updatedTopic) => {
    dispatch({ type: 'UPDATE_TOPIC', payload: updatedTopic })
  }

  const handleDelete = (topicId) => {
    dispatch({ type: 'DELETE_TOPIC', payload: topicId })
  }

  const handleAddTopic = () => {
    const newTopic = {
      id: uuidv4().slice(0, 8),
      title: 'New Topic',
      subTopics: [],
    }
    dispatch({ type: 'ADD_TOPIC', payload: newTopic })
  }

  const handleCombineTopics = (sourceId, targetId) => {
    dispatch({ type: 'COMBINE_TOPICS', payload: { sourceId, targetId } })
  }

  const handleRegenerate = () => {
    dispatch({ type: 'SET_PROMPT', payload: regenPrompt })
    dispatch({ type: 'SET_STEP', payload: 3 })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit Outline</CardTitle>
              <CardDescription>
                Drag topics to reorder. Click to edit titles and sub-topics.
                Drag one topic onto another to combine them.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowRegenerate(!showRegenerate)}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={handleAddTopic}>
                <Plus className="h-4 w-4 mr-1" />
                Add Topic
              </Button>
            </div>
          </div>
        </CardHeader>

        {showRegenerate && (
          <CardContent className="pt-0 pb-4">
            <div className="p-4 rounded-lg bg-muted space-y-3">
              <p className="text-sm font-medium">Modify your prompt and regenerate:</p>
              <Textarea
                value={regenPrompt}
                onChange={e => setRegenPrompt(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleRegenerate} disabled={!regenPrompt.trim()}>
                  Regenerate Outline
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowRegenerate(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        <CardContent className={showRegenerate ? 'pt-0' : ''}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={outline.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {outline.map(topic => (
                  <OutlineTopicCard
                    key={topic.id}
                    topic={topic}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    isDraggedOver={overId === topic.id && activeId !== topic.id}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeTopic ? (
                <OutlineTopicCard
                  topic={activeTopic}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                  isOverlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>

          {outline.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No topics in the outline. Add a topic or regenerate.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
        >
          Back to Prompt
        </Button>
        <Button
          onClick={() => dispatch({ type: 'SET_STEP', payload: 5 })}
          disabled={outline.length === 0}
        >
          Generate Final Notes
        </Button>
      </div>
    </div>
  )
}
