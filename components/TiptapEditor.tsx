"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { CustomImageExtension } from './tiptap-image'
import { CustomVideoExtension } from './tiptap-video'
import { Bold, Italic, List, ListOrdered, Heading2, ImageIcon, Video } from 'lucide-react'
import { useRef, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export function TiptapEditor({ content, onChange }: { content: string, onChange: (val: string) => void }) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImageExtension,
      CustomVideoExtension,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-blue max-w-none m-5 focus:outline-none min-h-[300px]',
      },
    },
  })

  if (!editor) {
    return null
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error("Gagal mengunggah gambar")
      
      const data = await res.json()
      // Sisipkan gambar ke dalam editor
      editor.chain().focus().setImage({ src: data.url }).run()
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal", description: err.message })
    } finally {
      setUploading(false)
      // Reset input supaya bisa milih file yang sama lagi kalau mau
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mt-1 bg-white">
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Masukkan URL gambar:")
            if (url) {
              editor.chain().focus().setImage({ src: url }).run()
            }
          }}
          className="p-2 rounded hover:bg-gray-200 text-gray-600 text-xs font-semibold px-3"
          title="Sisipkan URL Gambar"
        >
          + URL Gambar
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Masukkan URL Video (MP4 atau YouTube):")
            if (url) {
              editor.chain().focus().setVideo({ src: url }).run()
            }
          }}
          className="p-2 rounded hover:bg-gray-200 text-gray-600 flex items-center gap-1 text-xs font-semibold px-3"
          title="Sisipkan URL Video"
        >
          <Video className="w-4 h-4" /> URL Video
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`p-2 rounded hover:bg-gray-200 text-gray-600 flex items-center gap-1 text-xs font-semibold px-3 ${uploading ? 'opacity-50 cursor-wait' : ''}`}
          title="Unggah Gambar Lokal"
        >
          <ImageIcon className="w-4 h-4" /> Upload
        </button>
        {/* Hidden file input for Tiptap image upload */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          className="hidden" 
        />
      </div>
      <div className="p-2 min-h-[300px] cursor-text" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
