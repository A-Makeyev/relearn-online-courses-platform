import {
    Atom,
    BarChart3,
    BrainCircuit,
    BriefcaseBusiness,
    Code2,
    Gamepad2,
    LineChart,
    Megaphone,
    Palette,
    Server,
    ShieldCheck,
    Smartphone,
    Sparkles
} from 'lucide-react'

export const categoryMeta = {
    'web-development': { label: 'Web Development', icon: Code2, tone: 'bg-sky-50 text-sky-700' },
    'backend-development': { label: 'Backend Development', icon: Server, tone: 'bg-indigo-50 text-indigo-700' },
    'data-science': { label: 'Data Science', icon: LineChart, tone: 'bg-emerald-50 text-emerald-700' },
    'machine-learning': { label: 'Machine Learning', icon: BrainCircuit, tone: 'bg-teal-50 text-teal-700' },
    'artificial-intelligence': { label: 'Artificial Intelligence', icon: Sparkles, tone: 'bg-fuchsia-50 text-fuchsia-700' },
    'cyber-security': { label: 'Cyber Security', icon: ShieldCheck, tone: 'bg-rose-50 text-rose-700' },
    'mobile-development': { label: 'Mobile Development', icon: Smartphone, tone: 'bg-cyan-50 text-cyan-700' },
    'game-development': { label: 'Game Development', icon: Gamepad2, tone: 'bg-orange-50 text-orange-700' },
    'software-engineering': { label: 'Software Engineering', icon: Atom, tone: 'bg-violet-50 text-violet-700' },
    marketing: { label: 'Marketing', icon: Megaphone, tone: 'bg-amber-50 text-amber-700' },
    design: { label: 'Design', icon: Palette, tone: 'bg-pink-50 text-pink-700' },
    business: { label: 'Business', icon: BriefcaseBusiness, tone: 'bg-slate-100 text-slate-700' }
}

export const getCategoryMeta = (category) => {
    return categoryMeta[category] || {
        label: formatCategory(category) || 'Course',
        icon: BarChart3,
        tone: 'bg-muted text-muted-foreground'
    }
}

export const formatCategory = (category = '') => {
    return String(category)
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export const levelBadge = {
    beginner: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    intermediate: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    advanced: 'bg-rose-50 text-rose-700 ring-rose-600/20'
}

export const getLevelClass = (level) => levelBadge[level] || 'bg-muted text-muted-foreground ring-border'

export const getLectureLabel = (count) => `${count} ${count === 1 ? 'lecture' : 'lectures'}`
