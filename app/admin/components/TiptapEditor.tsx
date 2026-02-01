"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, Italic, List, ListOrdered, Heading2, Quote, Undo, Redo 
} from 'lucide-react';

const Toolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const btnClass = (active: boolean) => 
    `p-2 rounded transition-colors ${active ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:bg-zinc-200'}`;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-zinc-50 rounded-t-xl">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}>
        <Bold size={18} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}>
        <Italic size={18} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))}>
        <Heading2 size={18} />
      </button>
      <div className="w-px h-6 bg-zinc-300 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}>
        <List size={18} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}>
        <ListOrdered size={18} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))}>
        <Quote size={18} />
      </button>
      <div className="ml-auto flex gap-1">
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className="p-2 text-zinc-400 hover:text-zinc-800"><Undo size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className="p-2 text-zinc-400 hover:text-zinc-800"><Redo size={18} /></button>
      </div>
    </div>
  );
};

export default function TiptapEditor({ content, onChange }: { content: string, onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-zinc focus:outline-none min-h-[300px] p-6 text-black max-w-none bg-white',
      },
    },
  });

  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-black/5 transition-all">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
