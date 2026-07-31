<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use \App\Traits\ApiResponse;

    /**
     * GET /api/reports?range=7d|30d|90d|365d
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $range  = $request->query('range', '30d');

        $days = match ($range) {
            '7d'   => 7,
            '90d'  => 90,
            '365d' => 365,
            default => 30,
        };

        $now  = now();
        $from = $now->copy()->subDays($days)->startOfDay();

        // ── Previous period (for comparison) ──────────────────────
        $prevFrom = $from->copy()->subDays($days)->startOfDay();
        $prevTo   = $from->copy()->subSecond();

        // ── Current-period base query helper ──────────────────────
        // Use tasks.user_id (table-qualified) so JOIN queries don't produce
        // "Column 'user_id' in where clause is ambiguous" errors.
        $base = fn () => Task::where('tasks.user_id', $userId);

        // ── All-time stats ─────────────────────────────────────────
        $total      = $base()->count();
        $completed  = $base()->where('status', 'completed')->count();
        $inProgress = $base()->where('status', 'in_progress')->count();
        $overdue    = $base()
            ->where('status', '!=', 'completed')
            ->whereNotNull('end_date')
            ->where('end_date', '<', $now)
            ->count();
        $completionRate = $total > 0 ? round(($completed / $total) * 100) : 0;

        // ── Range-scoped stats (for trends) ───────────────────────
        $createdInPeriod   = $base()->whereBetween('created_at',   [$from, $now])->count();
        $completedInPeriod = $base()->whereBetween('completed_at', [$from, $now])->count();

        // Previous period
        $createdPrev   = $base()->whereBetween('created_at',   [$prevFrom, $prevTo])->count();
        $completedPrev = $base()->whereBetween('completed_at', [$prevFrom, $prevTo])->count();

        $addedThisWeek = $base()->where('created_at', '>=', $now->copy()->subDays(7))->count();

        // ── Activity series ────────────────────────────────────────
        $createdRaw = $base()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->whereBetween('created_at', [$from, $now])
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date')
            ->map(fn ($v) => (int) $v);

        $completedRaw = $base()
            ->selectRaw('DATE(completed_at) as date, COUNT(*) as count')
            ->whereNotNull('completed_at')
            ->whereBetween('completed_at', [$from, $now])
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date')
            ->map(fn ($v) => (int) $v);

        $activity = [];
        $cursor   = $from->copy();
        while ($cursor->lte($now)) {
            $d          = $cursor->toDateString();
            $activity[] = [
                'date'      => $d,
                'created'   => $createdRaw[$d]  ?? 0,
                'completed' => $completedRaw[$d] ?? 0,
            ];
            $cursor->addDay();
        }

        // ── Status breakdown (all-time) ────────────────────────────
        $bdRaw = $base()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->map(fn ($v) => (int) $v);

        $statusBreakdown = [
            'pending'     => $bdRaw['pending']     ?? 0,
            'in_progress' => $bdRaw['in_progress'] ?? 0,
            'completed'   => $bdRaw['completed']   ?? 0,
        ];

        // ── Priority breakdown (all-time) ─────────────────────────
        $prioRaw = $base()
            ->selectRaw('priority, COUNT(*) as count')
            ->groupBy('priority')
            ->pluck('count', 'priority')
            ->map(fn ($v) => (int) $v);

        $priorityBreakdown = [
            'urgent' => $prioRaw['urgent'] ?? 0,
            'high'   => $prioRaw['high']   ?? 0,
            'medium' => $prioRaw['medium'] ?? 0,
            'low'    => $prioRaw['low']    ?? 0,
        ];

        // ── Category breakdown (range-scoped) ─────────────────────
        $categoryBreakdown = $base()
            ->join('categories', 'tasks.category_id', '=', 'categories.id')
            ->whereBetween('tasks.created_at', [$from, $now])
            ->selectRaw('categories.id, categories.name, categories.color, COUNT(tasks.id) as count')
            ->groupBy('categories.id', 'categories.name', 'categories.color')
            ->orderByDesc('count')
            ->limit(8)
            ->get()
            ->map(fn ($r) => [
                'id'    => $r->id,
                'name'  => $r->name,
                'color' => $r->color,
                'count' => (int) $r->count,
            ]);

        // ── Day-of-week productivity (range-scoped completions) ────
        $dowRaw = $base()
            ->selectRaw('DAYOFWEEK(completed_at) as dow, COUNT(*) as count')
            ->whereNotNull('completed_at')
            ->whereBetween('completed_at', [$from, $now])
            ->groupBy('dow')
            ->pluck('count', 'dow')
            ->map(fn ($v) => (int) $v);

        // DAYOFWEEK: 1=Sun … 7=Sat; we want Mon-Sun order (Mon=1)
        $dowLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        $dayOfWeek = [];
        foreach ([2, 3, 4, 5, 6, 7, 1] as $i => $dow) {
            $dayOfWeek[] = ['day' => $dowLabels[$i], 'count' => $dowRaw[$dow] ?? 0];
        }

        // ── Heatmap (last 12 weeks, per-day completion counts) ────
        $heatmapFrom = $now->copy()->subWeeks(12)->startOfDay();
        $heatRaw = $base()
            ->selectRaw('DATE(completed_at) as date, COUNT(*) as count')
            ->whereNotNull('completed_at')
            ->where('completed_at', '>=', $heatmapFrom)
            ->groupBy('date')
            ->pluck('count', 'date')
            ->map(fn ($v) => (int) $v);

        $heatmap = [];
        $hCursor = $heatmapFrom->copy();
        while ($hCursor->lte($now)) {
            $d         = $hCursor->toDateString();
            $heatmap[] = ['date' => $d, 'count' => $heatRaw[$d] ?? 0];
            $hCursor->addDay();
        }

        // ── Recent activity feed ───────────────────────────────────
        $recentActivity = $base()
            ->with('category:id,name,color')
            ->orderByDesc('updated_at')
            ->limit(15)
            ->get(['id', 'title', 'status', 'priority', 'updated_at', 'created_at', 'completed_at', 'category_id'])
            ->map(fn ($t) => [
                'id'         => $t->id,
                'title'      => $t->title,
                'status'     => $t->status,
                'priority'   => $t->priority,
                'category'   => $t->category ? ['id' => $t->category->id, 'name' => $t->category->name, 'color' => $t->category->color] : null,
                'updated_at' => $t->updated_at->toIso8601String(),
                'created_at' => $t->created_at->toIso8601String(),
                'completed_at' => $t->completed_at?->toIso8601String(),
            ]);

        return $this->ok([
            'stats' => [
                'total'            => $total,
                'completed'        => $completed,
                'in_progress'      => $inProgress,
                'overdue'          => $overdue,
                'completion_rate'  => $completionRate,
                'added_this_week'  => $addedThisWeek,
                // Range-period comparisons
                'created_in_period'   => $createdInPeriod,
                'completed_in_period' => $completedInPeriod,
                'created_prev'        => $createdPrev,
                'completed_prev'      => $completedPrev,
            ],
            'activity'           => $activity,
            'status_breakdown'   => $statusBreakdown,
            'priority_breakdown' => $priorityBreakdown,
            'category_breakdown' => $categoryBreakdown,
            'day_of_week'        => $dayOfWeek,
            'heatmap'            => $heatmap,
            'recent_activity'    => $recentActivity,
        ]);
    }
}
