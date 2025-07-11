"use client"
import { useState, useRef } from "react"
import { updatePage, userHasPermission, type Page, type User } from "@/lib/auth"
import {
  Save,
  Eye,
  EyeOff,
  Type,
  ImageIcon,
  Square,
  MousePointer,
  Layers,
  Code,
  Link,
  Grid,
  Palette,
  Trash2,
  Copy,
  Move3D,
  Plus,
} from "lucide-react"

interface EnhancedVisualEditorProps {
  page: Page
  userId: string
  user?: User
  onSave?: (updatedPage: Page) => void
  onClose?: () => void
}

interface DraggableElement {
  id: string
  type: "text" | "image" | "button" | "card" | "html" | "embed"
  content: string
  styles: Record<string, string>
  position: { x: number; y: number; width: number; height: number }
}

export function EnhancedVisualEditor({ page, userId, user, onSave, onClose }: EnhancedVisualEditorProps) {
  const [content, setContent] = useState(page.content)
  const [htmlContent, setHtmlContent] = useState(page.htmlContent || "")
  const [embedUrl, setEmbedUrl] = useState(page.embedUrl || "")
  const [isPreview, setIsPreview] = useState(false)
  const [activeTab, setActiveTab] = useState<"visual" | "code" | "settings">("visual")
  const [loading, setLoading] = useState(false)
  const [selectedTool, setSelectedTool] = useState<string>("select")
  const [elements, setElements] = useState<DraggableElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Check user permissions for advanced editing
  const canUseAdvancedEditor = user
    ? userHasPermission(user, "ui_editing.visual_editor") || userHasPermission(user, "ui_editing.drag_drop")
    : true

  const canEditHTML = user ? userHasPermission(user, "ui_editing.html_blocks") : true
  const canEditEmbeds = user ? userHasPermission(user, "ui_editing.embed_links") : true
  const canEditLayout = user ? userHasPermission(user, "ui_editing.layout_control") : true

  const handleSave = async () => {
    setLoading(true)
    try {
      const success = updatePage(page.id, {
        content,
        htmlContent: generateHTMLFromElements(),
        embedUrl,
        createdBy: userId,
      })

      if (success && onSave) {
        onSave({
          ...page,
          content,
          htmlContent: generateHTMLFromElements(),
          embedUrl,
          updatedAt: new Date(),
        })
      }
    } catch (error) {
      console.error("Failed to save page:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateHTMLFromElements = () => {
    if (elements.length === 0) return htmlContent

    return `
      <div style="position: relative; min-height: 400px; background: #f8f9fa;">
        ${elements
          .map(
            (element) => `
          <div 
            style="
              position: absolute;
              left: ${element.position.x}px;
              top: ${element.position.y}px;
              width: ${element.position.width}px;
              height: ${element.position.height}px;
              ${Object.entries(element.styles)
                .map(([key, value]) => `${key}: ${value}`)
                .join("; ")}
            "
          >
            ${generateElementHTML(element)}
          </div>
        `,
          )
          .join("")}
      </div>
    `
  }

  const generateElementHTML = (element: DraggableElement) => {
    switch (element.type) {
      case "text":
        return `<p style="margin: 0; padding: 8px;">${element.content}</p>`
      case "button":
        return `<button style="padding: 12px 24px; border: none; border-radius: 6px; background: #3b82f6; color: white; cursor: pointer;">${element.content}</button>`
      case "card":
        return `<div style="background: white; border-radius: 8px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">${element.content}</div>`
      case "image":
        return `<img src="${element.content}" alt="Image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />`
      case "html":
        return element.content
      case "embed":
        return `<iframe src="${element.content}" width="100%" height="100%" frameborder="0"></iframe>`
      default:
        return element.content
    }
  }

  const addElement = (type: DraggableElement["type"]) => {
    const newElement: DraggableElement = {
      id: `element_${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
      position: { x: 50, y: 50, width: 200, height: 100 },
    }
    setElements([...elements, newElement])
    setSelectedElement(newElement.id)
  }

  const getDefaultContent = (type: DraggableElement["type"]) => {
    switch (type) {
      case "text":
        return "Sample Text"
      case "button":
        return "Click Me"
      case "card":
        return "Card Content"
      case "image":
        return "/placeholder.svg?height=100&width=200"
      case "html":
        return "<div>Custom HTML</div>"
      case "embed":
        return "https://example.com"
      default:
        return "Content"
    }
  }

  const getDefaultStyles = (type: DraggableElement["type"]) => {
    const baseStyles = { border: "2px solid transparent" }
    switch (type) {
      case "text":
        return { ...baseStyles, fontSize: "16px", color: "#374151" }
      case "button":
        return { ...baseStyles, backgroundColor: "#3b82f6", color: "white", borderRadius: "6px" }
      case "card":
        return { ...baseStyles, backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }
      default:
        return baseStyles
    }
  }

  const updateElementContent = (id: string, content: string) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, content } : el)))
  }

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id))
    setSelectedElement(null)
  }

  const duplicateElement = (id: string) => {
    const element = elements.find((el) => el.id === id)
    if (element) {
      const newElement = {
        ...element,
        id: `element_${Date.now()}`,
        position: { ...element.position, x: element.position.x + 20, y: element.position.y + 20 },
      }
      setElements([...elements, newElement])
    }
  }

  // Top Toolbar
  const renderTopToolbar = () => (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Tool Selection */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setSelectedTool("select")}
              className={`p-2 rounded ${selectedTool === "select" ? "bg-blue-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-600"}`}
              title="Select Tool"
            >
              <MousePointer size={16} />
            </button>
            <button
              onClick={() => setSelectedTool("move")}
              className={`p-2 rounded ${selectedTool === "move" ? "bg-blue-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-600"}`}
              title="Move Tool"
            >
              <Move3D size={16} />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          {/* Element Tools */}
          {canUseAdvancedEditor && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => addElement("text")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Add Text"
              >
                <Type size={16} />
              </button>
              <button
                onClick={() => addElement("button")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Add Button"
              >
                <Square size={16} />
              </button>
              <button
                onClick={() => addElement("card")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Add Card"
              >
                <Layers size={16} />
              </button>
              <button
                onClick={() => addElement("image")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Add Image"
              >
                <ImageIcon size={16} />
              </button>
              {canEditHTML && (
                <button
                  onClick={() => addElement("html")}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Add HTML Block"
                >
                  <Code size={16} />
                </button>
              )}
              {canEditEmbeds && (
                <button
                  onClick={() => addElement("embed")}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Add Embed"
                >
                  <Link size={16} />
                </button>
              )}
            </div>
          )}

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          {/* Layout Tools */}
          {canEditLayout && (
            <div className="flex items-center gap-1">
              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Grid Layout"
              >
                <Grid size={16} />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" title="Styles">
                <Palette size={16} />
              </button>
            </div>
          )}

          {selectedElement && (
            <>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => duplicateElement(selectedElement)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Duplicate"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => deleteElement(selectedElement)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              isPreview
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {isPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            {isPreview ? "Edit Mode" : "Preview"}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? "Saving..." : "Save"}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )

  // Visual Canvas
  const renderVisualCanvas = () => (
    <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-4">
      <div
        ref={canvasRef}
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg min-h-96 overflow-hidden"
        style={{ minHeight: "600px" }}
      >
        {elements.map((element) => (
          <div
            key={element.id}
            className={`absolute cursor-pointer transition-all duration-200 ${
              selectedElement === element.id ? "ring-2 ring-blue-500" : "hover:ring-1 hover:ring-gray-400"
            }`}
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.position.width,
              height: element.position.height,
              ...element.styles,
            }}
            onClick={() => setSelectedElement(element.id)}
          >
            {generateElementHTML(element) && <div dangerouslySetInnerHTML={{ __html: generateElementHTML(element) }} />}

            {selectedElement === element.id && (
              <div className="absolute -top-8 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                {element.type} - {element.id.split("_")[1]}
              </div>
            )}
          </div>
        ))}

        {elements.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">Start Creating</h3>
              <p className="text-gray-500 dark:text-gray-500">Use the toolbar above to add elements to your page</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Properties Panel
  const renderPropertiesPanel = () =>
    selectedElement && (
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Element Properties</h3>
        {(() => {
          const element = elements.find((el) => el.id === selectedElement)
          if (!element) return null

          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
                <textarea
                  value={element.content}
                  onChange={(e) => updateElementContent(element.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Width</label>
                  <input
                    type="number"
                    value={element.position.width}
                    onChange={(e) => {
                      const newElements = elements.map((el) =>
                        el.id === selectedElement
                          ? { ...el, position: { ...el.position, width: Number.parseInt(e.target.value) || 0 } }
                          : el,
                      )
                      setElements(newElements)
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height</label>
                  <input
                    type="number"
                    value={element.position.height}
                    onChange={(e) => {
                      const newElements = elements.map((el) =>
                        el.id === selectedElement
                          ? { ...el, position: { ...el.position, height: Number.parseInt(e.target.value) || 0 } }
                          : el,
                      )
                      setElements(newElements)
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    )

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {renderTopToolbar()}

      <div className="flex flex-1 overflow-hidden">
        {renderVisualCanvas()}
        {renderPropertiesPanel()}
      </div>
    </div>
  )
}
