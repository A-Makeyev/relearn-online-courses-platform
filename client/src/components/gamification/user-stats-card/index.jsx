import { useGamification } from "@/context/gamification"
import { Progress } from "@/components/ui/progress"
import { getLevelProgress } from "@/services/gamification-service"
import { BookOpen, Flame, Trophy, Star, Zap } from "lucide-react"
import { toast } from "sonner"

export function UserStatsCard() {
    const { stats, loading } = useGamification()

    if (loading || !stats) {
        return (
            <div className="rounded-xl border bg-card p-5 animate-pulse">
                <div className="h-4 w-24 bg-muted rounded mb-4"></div>
                <div className="h-20 w-full bg-muted rounded mb-2"></div>
                <div className="h-2 w-full bg-muted rounded"></div>
            </div>
        )
    }

    const levelProgress = getLevelProgress(stats.xp)

    return (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Your Progress</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5" />
                    <span>Level {stats.level}</span>
                </div>
            </div>

            {/* Level Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">
                        {levelProgress.xpInCurrentLevel} / {levelProgress.xpForNextLevel} XP
                    </span>
                    <span className="text-primary font-medium">{Math.round(levelProgress.progress)}%</span>
                </div>
                <Progress value={levelProgress.progress} className="h-2 bg-muted" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                    <Zap className="h-4 w-4 text-primary mb-1" />
                    <span className="text-lg font-bold">{stats.xp}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">XP</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                    <Fire className="h-4 w-4 text-orange-500 mb-1" />
                    <span className="text-lg font-bold">{stats.currentStreak}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Streak</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                    <Trophy className="h-4 w-4 text-yellow-500 mb-1" />
                    <span className="text-lg font-bold">{stats.badges?.length || 0}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Badges</span>
                </div>
            </div>

            {/* Badges Section */}
            {stats.badges && stats.badges.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex flex-wrap gap-2">
                        {stats.badges.slice(0, 4).map(badge => (
                            <div
                                key={badge.badgeId}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs"
                            >
                                <span>{badge.icon}</span>
                                <span className="font-medium">{badge.name}</span>
                            </div>
                        ))}
                        {stats.badges.length > 4 && (
                            <span className="text-xs text-muted-foreground self-center">
                                +{stats.badges.length - 4} more
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
