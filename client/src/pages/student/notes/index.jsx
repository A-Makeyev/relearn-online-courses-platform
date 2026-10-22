import { useContext, useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AuthContext } from "@/context/auth"
import { getNotes, createNote, updateNote, deleteNote } from "@/services/notes-service"
import { getCourseById } from "@/services"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import {
    Plus,
    Trash2,
    Edit3,
    Save,
    X,
    BookOpen,
    FileText,
    Clock,
    ChevronRight
} from "lucide-react"
import { formatDate } from "@/utils"

export default function NotesPage() {
    const navigate = useNavigate()
    const { courseId } = useParams()
    const { auth } = useContext(AuthContext)

    const [notes, setNotes] = useState([])
    const [currentNote, setCurrentNote] = useState(null)
    const [editing, setEditing] = useState(false)
    const [noteContent, setNoteContent] = useState("")
    const [saving, setSaving] = useState(false)
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            if (!courseId || !auth?.user?._id) return

            try {
                setLoading(true)

                // Load course info
                const courseResponse = await getCourseById(courseId)
                if (courseResponse?.success) {
                    setCourse(courseResponse.data)
                }

                // Load notes
                const notesResponse = await getNotes(courseId)
                if (notesResponse?.success) {
                    setNotes(notesResponse.data || [])
                }
            } catch (error) {
                console.error("Error loading data:", error)
                toast.error("Failed to load notes")
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [courseId, auth?.user?._id])

    function handleCreateNote() {
        if (!courseId || !auth?.user?._id) return

        setCurrentNote(null)
        setNoteContent("")
        setEditing(true)
    }

    async function handleSaveNote() {
        if (!noteContent.trim()) {
            toast.error("Note content cannot be empty")
            return
        }

        if (!courseId || !auth?.user?._id) return

        setSaving(true)

        try {
            if (currentNote) {
                // Update existing note
                const response = await updateNote(currentNote._id, noteContent)
                if (response?.success) {
                    setNotes(prev =>
                        prev.map(note =>
                            note._id === currentNote._id
                                ? { ...note, content: noteContent, updatedAt: new Date() }
                                : note
                        )
                    )
                    toast.success("Note updated")
                } else {
                    toast.error(response?.message || "Failed to update note")
                }
            } else {
                // Create new note
                const response = await createNote({
                    courseId,
                    content: noteContent
                })
                if (response?.success) {
                    setNotes(prev => [response.data, ...prev])
                    toast.success("Note created")
                } else {
                    toast.error(response?.message || "Failed to create note")
                }
            }

            setEditing(false)
            setCurrentNote(null)
            setNoteContent("")
        } catch (error) {
            console.error("Error saving note:", error)
            toast.error("Failed to save note")
        } finally {
            setSaving(false)
        }
    }

    async function handleDeleteNote(noteId) {
        if (!confirm("Are you sure you want to delete this note?")) return

        try {
            const response = await deleteNote(noteId)
            if (response?.success) {
                setNotes(prev => prev.filter(note => note._id !== noteId))
                if (currentNote?._id === noteId) {
                    setEditing(false)
                    setCurrentNote(null)
                    setNoteContent("")
                }
                toast.success("Note deleted")
            } else {
                toast.error(response?.message || "Failed to delete note")
            }
        } catch (error) {
            console.error("Error deleting note:", error)
            toast.error("Failed to delete note")
        }
    }

    function openNote(note) {
        setCurrentNote(note)
        setNoteContent(note.content)
        setEditing(true)
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-900/50">
                <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate("/student/courses")}
                                className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
                            >
                                <ChevronRight className="h-4 w-4" />
                                Back to courses
                            </button>
                            {course && (
                                <>
                                    <BookOpen className="h-5 w-5 text-slate-500" />
                                    <h1 className="text-xl font-semibold">{course.title}</h1>
                                </>
                            )}
                        </div>
                        <div className="text-sm text-slate-500">
                            {notes.length} {notes.length === 1 ? "note" : "notes"}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
                    {/* Notes List */}
                    <div>
                        {notes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50 py-12 text-center">
                                <FileText className="h-12 w-12 text-slate-600" />
                                <h3 className="mt-4 text-lg font-medium">No notes yet</h3>
                                <p className="mt-2 text-sm text-slate-500 max-w-sm">
                                    Start taking notes on this course. Your notes will be saved and available anytime.
                                </p>
                                <Button onClick={handleCreateNote} className="mt-4 bg-gradient-to-r from-purple-600 to-pink-500">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create first note
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {notes.map(note => (
                                    <div
                                        key={note._id}
                                        className={`group rounded-xl border bg-slate-900 p-4 transition ${
                                            currentNote?._id === note._id
                                                ? "border-purple-500/50 shadow-lg shadow-purple-500/10"
                                                : "border-slate-800 hover:border-slate-700"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(note.updatedAt)}
                                                </div>
                                                <p className="text-sm text-slate-300 line-clamp-2">
                                                    {note.content}
                                                </p>
                                            </div>
                                            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                <button
                                                    onClick={() => openNote(note)}
                                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                                                    title="Open note"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteNote(note._id)}
                                                    className="rounded-lg p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400"
                                                    title="Delete note"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Note Editor */}
                    <div className="lg:pl-8">
                        <div className="sticky top-24">
                            {editing ? (
                                <div className="rounded-xl border border-purple-500/30 bg-slate-900 p-5 shadow-xl shadow-purple-500/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold">
                                            {currentNote ? "Edit note" : "New note"}
                                        </h2>
                                        <button
                                            onClick={() => {
                                                setEditing(false)
                                                setCurrentNote(null)
                                                setNoteContent("")
                                            }}
                                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <Textarea
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        placeholder="Write your notes here... (Markdown supported)"
                                        rows={12}
                                        className="mb-4 min-h-[24rem] resize-none"
                                    />

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={handleSaveNote}
                                            disabled={saving || !noteContent.trim()}
                                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                                        >
                                            {saving ? (
                                                <LoadingSpinner className="h-4 w-4 mr-2" />
                                            ) : (
                                                <Save className="h-4 w-4 mr-2" />
                                            )}
                                            {currentNote ? "Update" : "Create"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setEditing(false)
                                                setCurrentNote(null)
                                                setNoteContent("")
                                            }}
                                            className="border-s late-700 hover:bg-slate-800"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
                                    <FileText className="h-12 w-12 mx-auto text-slate-600" />
                                    <h3 className="mt-4 text-lg font-medium">Note Editor</h3>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Select a note to edit, or create a new one to start taking notes.
                                    </p>
                                    <Button onClick={handleCreateNote} className="mt-4 bg-gradient-to-r from-purple-600 to-pink-500">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create note
                                    </Button>
                                </div>
                            )}

                            {/* Tips */}
                            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                                <h3 className="text-sm font-semibold text-slate-400">Tips</h3>
                                <ul className="mt-2 space-y-2 text-xs text-slate-500">
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-400">•</span>
                                        Notes are saved per course and visible only to you
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-400">•</span>
                                        Use this space to track key concepts, code snippets, and questions
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-400">•</span>
                                        Your notes persist across sessions
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
