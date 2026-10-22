import { Link } from 'react-router-dom'
import { GraduationCap, Mail, Globe } from 'lucide-react'
import { courseCategories } from '@/config'


function StudentFooter() {
    const year = new Date().getFullYear()
    const featuredCategories = courseCategories.slice(0, 5)

    return (
        <footer className="mt-20 border-t bg-slate-950 text-slate-300">
            <div className="container-page grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
                <div className="lg:col-span-2">
                    <Link to="/home" className="inline-flex items-center gap-2.5 text-white">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
                            <GraduationCap className="h-5 w-5" />
                        </span>
                        <span className="text-lg font-bold">Easy Programming</span>
                    </Link>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                        Practical, project-based programming courses taught by people who build software for a living.
                        Learn a skill, ship your first project, and take the next step in your career.
                    </p>
                    <div className="mt-5 flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <Globe className="h-4 w-4" />
                            Learn anywhere
                        </span>
                        <a href="mailto:hello@easyprogramming.dev" className="flex items-center gap-1.5 transition-colors hover:text-white">
                            <Mail className="h-4 w-4" />
                            Contact
                        </a>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Explore</h3>
                    <ul className="mt-4 space-y-2.5 text-sm">
                        {featuredCategories.map(category => (
                            <li key={category.id}>
                                <Link
                                    to={`/courses?category=${category.id}`}
                                    className="text-slate-400 transition-colors hover:text-white"
                                >
                                    {category.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Platform</h3>
                    <ul className="mt-4 space-y-2.5 text-sm">
                        <li>
                            <Link to="/courses" className="text-slate-400 transition-colors hover:text-white">
                                Browse courses
                            </Link>
                        </li>
                        <li>
                            <Link to="/acquired-courses" className="text-slate-400 transition-colors hover:text-white">
                                My learning
                            </Link>
                        </li>
                        <li>
                            <Link to="/wishlist" className="text-slate-400 transition-colors hover:text-white">
                                Saved courses
                            </Link>
                        </li>
                        <li>
                            <Link to="/certificates" className="text-slate-400 transition-colors hover:text-white">
                                Certificates
                            </Link>
                        </li>
                        <li>
                            <Link to="/courses?sortBy=highest-rated" className="text-slate-400 transition-colors hover:text-white">
                                Top rated courses
                            </Link>
                        </li>
                        <li>
                            <Link to="/courses?sortBy=newest" className="text-slate-400 transition-colors hover:text-white">
                                New releases
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
                    <ul className="mt-4 space-y-2.5 text-sm">
                        <li><span className="text-slate-400">About us</span></li>
                        <li><span className="text-slate-400">Careers</span></li>
                        <li><span className="text-slate-400">Privacy</span></li>
                        <li><span className="text-slate-400">Terms</span></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-slate-500 sm:flex-row">
                    <p>© {year} Easy Programming. All rights reserved.</p>
                    <p>Built for curious minds and future builders.</p>
                </div>
            </div>
        </footer>
    )
}

export default StudentFooter
