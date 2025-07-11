"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface InlineEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  multiline?: boolean
  placeholder?: string
}

export function InlineEditor({
  value,
  onChange,
  className = "",
  multiline = false,
  placeholder = "Click to edit...",
}: InlineEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (!multiline) {
        ;(inputRef.current as HTMLInputElement).select()
      }
    }
  }, [isEditing, multiline])

  const handleClick = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (editValue !== value) {
      onChange(editValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault()
      handleBlur()
    }
    if (e.key === "Escape") {
      setEditValue(value)
      setIsEditing(false)
    }
  }

  const baseClasses = `
    inline-block w-full min-w-0 resize-none outline-none
    focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded
    transition-all duration-200
  `

  if (isEditing) {
    const Component = multiline ? "textarea" : "input"
    return (
      <Component
        ref={inputRef as any}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${baseClasses} ${className} bg-white dark:bg-gray-700 border border-blue-300 px-2 py-1`}
        placeholder={placeholder}
        {...(multiline ? { rows: 3 } : {})}
      />
    )
  }

  return (
    <span
      onClick={handleClick}
      className={`${baseClasses} ${className} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600`}
      title="Click to edit"
    >
      {value || placeholder}
    </span>
  )
}
