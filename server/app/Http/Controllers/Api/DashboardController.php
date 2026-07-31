<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Task;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use \App\Traits\ApiResponse;

    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $now = now();

        $total = Task::where('user_id', $userId)->count();
        $completed = Task::where('user_id', $userId)->where('status', 'completed')->count();
        $inProgress = Task::where('user_id', $userId)->where('status', 'in_progress')->count();
        $pending = Task::where('user_id', $userId)->where('status', 'pending')->count();
        $overdue = Task::where('user_id', $userId)
            ->where('status', '!=', 'completed')
            ->whereNotNull('end_date')
            ->where('end_date', '<', $now)
            ->count();
        $active = Task::where('user_id', $userId)
            ->where('start_date', '<=', $now)
            ->where('end_date', '>=', $now)
            ->where('status', '!=', 'completed')
            ->count();

        $sevenDaysAgo = now()->subDays(7);
        $fourteenDaysAgo = now()->subDays(14);

        $totalThisWeek = Task::where('user_id', $userId)->where('created_at', '>=', $sevenDaysAgo)->count();
        $totalLastWeek = Task::where('user_id', $userId)->where('created_at', '>=', $fourteenDaysAgo)->where('created_at', '<', $sevenDaysAgo)->count();
        $totalTrend = $totalLastWeek > 0 ? round((($totalThisWeek - $totalLastWeek) / $totalLastWeek) * 100) : ($totalThisWeek > 0 ? 100 : 0);

        $completedThisWeek = Task::where('user_id', $userId)->where('status', 'completed')->where('completed_at', '>=', $sevenDaysAgo)->count();
        $completedLastWeek = Task::where('user_id', $userId)->where('status', 'completed')->where('completed_at', '>=', $fourteenDaysAgo)->where('completed_at', '<', $sevenDaysAgo)->count();
        $completedTrend = $completedLastWeek > 0 ? round((($completedThisWeek - $completedLastWeek) / $completedLastWeek) * 100) : ($completedThisWeek > 0 ? 100 : 0);

        $inProgressThisWeek = Task::where('user_id', $userId)->where('status', 'in_progress')->where('updated_at', '>=', $sevenDaysAgo)->count();
        $inProgressLastWeek = Task::where('user_id', $userId)->where('status', 'in_progress')->where('updated_at', '>=', $fourteenDaysAgo)->where('updated_at', '<', $sevenDaysAgo)->count();
        $inProgressTrend = $inProgressLastWeek > 0 ? round((($inProgressThisWeek - $inProgressLastWeek) / $inProgressLastWeek) * 100) : ($inProgressThisWeek > 0 ? 100 : 0);

        $overdueThisWeek = Task::where('user_id', $userId)->where('status', '!=', 'completed')->where('end_date', '<', $now)->where('end_date', '>=', $sevenDaysAgo)->count();
        $overdueLastWeek = Task::where('user_id', $userId)->where('status', '!=', 'completed')->where('end_date', '<', $sevenDaysAgo)->where('end_date', '>=', $fourteenDaysAgo)->count();
        $overdueTrend = $overdueLastWeek > 0 ? round((($overdueThisWeek - $overdueLastWeek) / $overdueLastWeek) * 100) : ($overdueThisWeek > 0 ? 100 : 0);

        $priorities = Task::where('user_id', $userId)
            ->selectRaw('priority, COUNT(*) as count')
            ->where('status', '!=', 'completed')
            ->groupBy('priority')
            ->get()
            ->mapWithKeys(fn($item) => [$item->priority => $item->count]);

        $topCategories = Category::where('user_id', $userId)
            ->withCount('tasks')
            ->orderByDesc('tasks_count')
            ->limit(5)
            ->get()
            ->map(fn($c) => ['name' => $c->name, 'color' => $c->color, 'count' => $c->tasks_count]);

        $perPage = min((int) $request->get('per_page', 10), 50);
        $recent = Task::where('user_id', $userId)
            ->with('category:id,name,color')
            ->latest('updated_at')
            ->paginate($perPage);

        return $this->ok([
            'stats' => [
                'total' => $total,
                'completed' => $completed,
                'in_progress' => $inProgress,
                'pending' => $pending,
                'overdue' => $overdue,
                'active' => $active,
                'completion_rate' => $total ? round(($completed / $total) * 100) : 0,
                'total_trend' => $totalTrend,
                'completed_trend' => $completedTrend,
                'in_progress_trend' => $inProgressTrend,
                'overdue_trend' => $overdueTrend,
            ],
            'priorities' => $priorities,
            'top_categories' => $topCategories,
            'recent_tasks' => $recent->items(),
            'pagination' => [
                'current_page' => $recent->currentPage(),
                'last_page' => $recent->lastPage(),
                'total' => $recent->total(),
                'from' => $recent->firstItem(),
                'to' => $recent->lastItem(),
            ],
        ]);
    }

    public function charts(Request $request)
    {
        $userId = $request->user()->id;
        $days = (int) ($request->days ?? 30);

        $created = Task::where('user_id', $userId)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $completed = Task::where('user_id', $userId)
            ->selectRaw('DATE(completed_at) as date, COUNT(*) as count')
            ->whereNotNull('completed_at')
            ->where('completed_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $statusDistribution = Task::where('user_id', $userId)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn($item) => [$item->status => $item->count]);

        return $this->ok([
            'created' => $created,
            'completed' => $completed,
            'status_distribution' => $statusDistribution,
        ]);
    }
}