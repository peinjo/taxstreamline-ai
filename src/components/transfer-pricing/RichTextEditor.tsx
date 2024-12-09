import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, 
  Italic, 
  Heading2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered,
  Undo,
  Redo,
  Underline as UnderlineIcon
} from 'lucide-react';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md">
      <div className="border-b p-2 space-y-2">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-gray-200" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 ${editor.isActive('heading') ? 'bg-gray-200' : ''}`}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-gray-200" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-gray-200" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <EditorContent 
        editor={editor} 
        className="p-4 min-h-[400px] prose max-w-none focus:outline-none"
      />
    </div>
  );
}