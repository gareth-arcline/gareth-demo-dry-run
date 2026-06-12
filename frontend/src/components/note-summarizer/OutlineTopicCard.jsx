import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Plus, X, PenLine } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function OutlineTopicCard({ topic, onUpdate, onDelete, isOverlay = false, isDraggedOver = false }) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(topic.title)
  const [editingBulletId, setEditingBulletId] = useState(null)
  const [bulletValue, setBulletValue] = useState('')
  const [addingBullet, setAddingBullet] = useState(false)
  const [newBulletText, setNewBulletText] = useState('')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleTitleSave = () => {
    setEditingTitle(false)
    if (titleValue.trim() && titleValue !== topic.title) {
      onUpdate({ ...topic, title: titleValue.trim() })
    } else {
      setTitleValue(topic.title)
    }
  }

  const handleBulletEdit = (bulletId) => {
    const bullet = topic.subTopics.find(b => b.id === bulletId)
    if (bullet) {
      setEditingBulletId(bulletId)
      setBulletValue(bullet.text)
    }
  }

  const handleBulletSave = (bulletId) => {
    setEditingBulletId(null)
    if (bulletValue.trim()) {
      onUpdate({
        ...topic,
        subTopics: topic.subTopics.map(b =>
          b.id === bulletId ? { ...b, text: bulletValue.trim() } : b
        ),
      })
    }
  }

  const handleBulletDelete = (bulletId) => {
    onUpdate({
      ...topic,
      subTopics: topic.subTopics.filter(b => b.id !== bulletId),
    })
  }

  const handleAddBullet = () => {
    if (newBulletText.trim()) {
      onUpdate({
        ...topic,
        subTopics: [...topic.subTopics, { id: uuidv4().slice(0, 8), text: newBulletText.trim() }],
      })
      setNewBulletText('')
      setAddingBullet(false)
    }
  }

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={isOverlay ? undefined : style}
      className={cn(
        "border rounded-lg bg-card p-4 transition-all",
        isDragging && "opacity-50",
        isDraggedOver && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isOverlay && "shadow-lg rotate-1"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <div
          {...(isOverlay ? {} : { ...listeners, ...attributes })}
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          {editingTitle ? (
            <input
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') { setEditingTitle(false); setTitleValue(topic.title) } }}
              className="w-full text-base font-semibold bg-transparent border-b-2 border-primary outline-none pb-1"
              autoFocus
            />
          ) : (
            <h3
              className="text-base font-semibold cursor-text hover:text-primary transition-colors flex items-center gap-2"
              onClick={() => setEditingTitle(true)}
            >
              {topic.title}
              <PenLine className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
            </h3>
          )}

          {/* Bullets */}
          <ul className="mt-2 space-y-1.5">
            {topic.subTopics.map(bullet => (
              <li key={bullet.id} className="flex items-start gap-2 group/bullet">
                <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                {editingBulletId === bullet.id ? (
                  <input
                    value={bulletValue}
                    onChange={e => setBulletValue(e.target.value)}
                    onBlur={() => handleBulletSave(bullet.id)}
                    onKeyDown={e => { if (e.key === 'Enter') handleBulletSave(bullet.id); if (e.key === 'Escape') setEditingBulletId(null) }}
                    className="flex-1 text-sm bg-transparent border-b border-primary outline-none"
                    autoFocus
                  />
                ) : (
                  <span
                    className="flex-1 text-sm text-muted-foreground cursor-text hover:text-foreground transition-colors"
                    onClick={() => handleBulletEdit(bullet.id)}
                  >
                    {bullet.text}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover/bullet:opacity-100 transition-opacity shrink-0"
                  onClick={() => handleBulletDelete(bullet.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </li>
            ))}
          </ul>

          {/* Add bullet */}
          {addingBullet ? (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-muted-foreground shrink-0">•</span>
              <input
                value={newBulletText}
                onChange={e => setNewBulletText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddBullet(); if (e.key === 'Escape') { setAddingBullet(false); setNewBulletText('') } }}
                placeholder="Enter sub-topic..."
                className="flex-1 text-sm bg-transparent border-b border-input outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAddBullet}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setAddingBullet(true)}
              className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add sub-topic
            </button>
          )}
        </div>

        {/* Delete button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
          onClick={() => onDelete(topic.id)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete topic</span>
        </Button>
      </div>
    </div>
  )
}
