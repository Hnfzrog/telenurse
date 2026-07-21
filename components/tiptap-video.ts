import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType
    }
  }
}

export const CustomVideoExtension = Node.create({
  name: 'video',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      type: {
        default: 'video', // 'video' or 'iframe'
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'video',
        getAttrs: (node) => {
          if (typeof node === 'string') return {}
          return {
            type: 'video',
            src: (node as HTMLElement).getAttribute('src'),
          }
        }
      },
      {
        tag: 'iframe',
        getAttrs: (node) => {
          if (typeof node === 'string') return {}
          return {
            type: 'iframe',
            src: (node as HTMLElement).getAttribute('src'),
          }
        }
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    if (HTMLAttributes.type === 'iframe') {
      return [
        'div', 
        { class: 'aspect-video w-full my-4 rounded-xl overflow-hidden shadow-sm border border-gray-100' }, 
        ['iframe', mergeAttributes(HTMLAttributes, { 
          class: 'w-full h-full',
          frameBorder: '0',
          allowFullScreen: 'true',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        })]
      ]
    }
    
    return ['video', mergeAttributes(HTMLAttributes, { 
      controls: 'true', 
      class: 'w-full aspect-video rounded-xl my-4 shadow-sm object-cover bg-black border border-gray-100' 
    })]
  },

  addCommands() {
    return {
      setVideo: (options) => ({ commands }) => {
        let src = options.src
        let type = 'video'

        // Detect YouTube links and convert to embed format
        if (src.includes('youtube.com/watch?v=') || src.includes('youtu.be/')) {
          type = 'iframe'
          try {
            const videoId = src.includes('youtu.be/') 
              ? src.split('youtu.be/')[1]?.split('?')[0] 
              : new URL(src).searchParams.get('v')
              
            if (videoId) src = `https://www.youtube.com/embed/${videoId}`
          } catch (e) {
            // keep original if parsing fails
          }
        }

        return commands.insertContent({
          type: this.name,
          attrs: { src, type },
        })
      },
    }
  },
})
