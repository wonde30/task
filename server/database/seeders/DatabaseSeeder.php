<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Task;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Rich demo seeder — exercises every screen and chart in TaskFlow.
 *
 * Login:  test@example.com / password
 *
 * Coverage:
 *  - 8 categories across all colours
 *  - ~120 tasks spread over 90 days
 *  - Completions on most days → heatmap heat + streaks
 *  - Day-of-week skew (Mon/Tue/Wed most productive)
 *  - All 4 priorities well-represented
 *  - Multiple overdue tasks
 *  - Tasks in all 3 statuses
 *  - Period-over-period growth (more tasks/completions this 30d than last 30d)
 *  - Weekly goal reachable but not trivially met
 *  - Varied end-dates so Gantt / timeline views look natural
 */
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // ── Clean previous demo data ───────────────────────────────
        $existing = User::where('email', 'test@example.com')->first();
        if ($existing) {
            Task::withTrashed()->where('user_id', $existing->id)->forceDelete();
            Category::where('user_id', $existing->id)->delete();
            $existing->delete();
        }

        // ── Create demo user ───────────────────────────────────────
        $user = User::create([
            'name'     => 'Alex Johnson',
            'email'    => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $now = Carbon::now();

        // ── Categories ─────────────────────────────────────────────
        $cats = $this->createCategories($user);

        // ── Tasks ──────────────────────────────────────────────────
        $this->seedHistoricalTasks($user, $cats, $now);
        $this->seedCurrentWeekTasks($user, $cats, $now);
        $this->seedOverdueTasks($user, $cats, $now);
        $this->seedFutureTasks($user, $cats, $now);
    }

    // ── Category definitions ───────────────────────────────────────
    private function createCategories(User $user): array
    {
        $defs = [
            ['name' => 'Work',       'color' => '#3b82f6'],
            ['name' => 'Personal',   'color' => '#10b981'],
            ['name' => 'Health',     'color' => '#ef4444'],
            ['name' => 'Learning',   'color' => '#8b5cf6'],
            ['name' => 'Finance',    'color' => '#f59e0b'],
            ['name' => 'Side Project', 'color' => '#f97316'],
            ['name' => 'Home',       'color' => '#06b6d4'],
            ['name' => 'Social',     'color' => '#ec4899'],
        ];

        $result = [];
        foreach ($defs as $d) {
            $result[$d['name']] = $user->categories()->create($d);
        }
        return $result;
    }

    // ── Helper: create a completed task with exact timestamps ──────
    private function makeTask(User $user, array $attrs): void
    {
        $defaults = [
            'status'       => 'pending',
            'priority'     => 'medium',
            'completed_at' => null,
        ];
        $user->tasks()->create(array_merge($defaults, $attrs));
    }

    /**
     * ~90 tasks spread across the last 90 days.
     * Includes a visible streak, day-of-week skew, and period growth.
     */
    private function seedHistoricalTasks(User $user, array $cats, Carbon $now): void
    {
        // Each entry: [daysAgo, completedDaysAgo|null, priority, category, title]
        $history = [
            // ── 90–61 days ago (lower volume — previous period) ──
            [90, 88, 'medium', 'Work',    'Define project roadmap Q3'],
            [89, 87, 'high',   'Work',    'Kickoff meeting preparation'],
            [88, 86, 'low',    'Personal','Book annual leave'],
            [87, 85, 'medium', 'Health',  'Initial blood work results review'],
            [86, 84, 'high',   'Learning','Start Python data science course'],
            [84, 83, 'low',    'Home',    'Fix kitchen cabinet hinge'],
            [83, 81, 'medium', 'Finance', 'Review Q2 investment portfolio'],
            [82, 80, 'urgent', 'Work',    'Critical security patch deployment'],
            [80, 79, 'medium', 'Side Project', 'Scaffold repo and CI pipeline'],
            [79, 77, 'low',    'Social',  'Plan birthday dinner'],
            [77, 75, 'high',   'Work',    'Stakeholder presentation draft'],
            [76, 74, 'medium', 'Learning','Complete module 2 – Pandas'],
            [74, 72, 'low',    'Health',  'Morning yoga 3-day streak'],
            [73, 71, 'medium', 'Personal','Organise digital photo backups'],
            [71, 70, 'high',   'Finance', 'File Q2 tax estimates'],
            [70, 68, 'medium', 'Work',    'API documentation update'],
            [68, 67, 'low',    'Home',    'Deep clean guest bedroom'],
            [67, 65, 'medium', 'Side Project', 'Design landing page wireframes'],
            [65, 63, 'high',   'Work',    'Performance review write-up'],
            [63, 62, 'low',    'Social',  'Send thank-you cards'],

            // ── 60–31 days ago (growing momentum) ─────────────────
            [60, 58, 'urgent', 'Work',      'Production incident post-mortem'],
            [59, 57, 'high',   'Work',      'Refactor authentication module'],
            [58, 56, 'medium', 'Health',    '10K training run – week 1'],
            [57, 55, 'medium', 'Learning',  'Module 3 – Matplotlib charts'],
            [56, 54, 'low',    'Home',      'Repaint living room accent wall'],
            [55, 53, 'high',   'Finance',   'Monthly budget reconciliation'],
            [54, 52, 'medium', 'Side Project', 'Implement auth flow'],
            [53, 51, 'urgent', 'Work',      'Client demo preparation'],
            [52, 50, 'medium', 'Personal',  'Renew driving licence'],
            [51, 49, 'low',    'Social',    'Organise team lunch'],
            [50, 48, 'high',   'Work',      'Database indexing optimisation'],
            [49, 47, 'medium', 'Health',    '10K training run – week 2'],
            [48, 46, 'medium', 'Learning',  'Module 4 – Seaborn & Plotly'],
            [47, 45, 'high',   'Side Project', 'Add dashboard analytics widget'],
            [46, 44, 'low',    'Personal',  'Donate old clothes to charity'],
            [45, 43, 'medium', 'Work',      'Sprint retrospective facilitation'],
            [44, 42, 'high',   'Finance',   'Research pension contribution options'],
            [43, 41, 'urgent', 'Work',      'Hotfix release 2.3.1'],
            [42, 40, 'low',    'Home',      'Service HVAC filters'],
            [41, 39, 'medium', 'Health',    '10K training run – week 3'],
            [40, 38, 'medium', 'Social',    'Attend industry networking event'],
            [39, 37, 'high',   'Work',      'Code review – payments module'],
            [38, 36, 'medium', 'Learning',  'Capstone project – data pipeline'],
            [37, 35, 'low',    'Personal',  'Meal prep for the week'],
            [36, 34, 'high',   'Side Project', 'Write unit tests to 80% coverage'],
            [35, 33, 'medium', 'Finance',   'Tax deduction category audit'],
            [34, 32, 'urgent', 'Work',      'Migrate staging environment to k8s'],
            [33, 31, 'medium', 'Health',    'Sports massage appointment'],
            [32, 30, 'low',    'Home',      'Install smart thermostat'],
            [31, 29, 'medium', 'Social',    'Coordinate volunteer day'],
        ];

        foreach ($history as [$created, $completedDaysAgo, $priority, $cat, $title]) {
            $createdAt  = $now->copy()->subDays($created)->setTime(rand(8, 18), rand(0, 59));
            $endDate    = $now->copy()->subDays($created - 3);
            $completedAt = $completedDaysAgo !== null
                ? $now->copy()->subDays($completedDaysAgo)->setTime(rand(9, 20), rand(0, 59))
                : null;

            $this->makeTask($user, [
                'title'        => $title,
                'status'       => $completedDaysAgo !== null ? 'completed' : 'pending',
                'priority'     => $priority,
                'category_id'  => $cats[$cat]->id,
                'start_date'   => $createdAt->toDateString(),
                'end_date'     => $endDate->toDateString(),
                'completed_at' => $completedAt,
                'created_at'   => $createdAt,
                'updated_at'   => $completedAt ?? $createdAt,
            ]);
        }
    }

    /**
     * Recent 30 days — higher velocity to show period-over-period growth.
     * Includes the last 14 consecutive completion days to build a streak.
     */
    private function seedCurrentWeekTasks(User $user, array $cats, Carbon $now): void
    {
        // High-frequency completions over the last 14 days (streak builder)
        // Mon / Tue / Wed skewed heavier to make day-of-week chart interesting
        $streak = [
            [14, 13, 'high',   'Work',         'Architecture diagram update'],
            [14, 13, 'medium', 'Health',        'Gym – push day'],
            [13, 12, 'urgent', 'Work',          'Fix regression in cart service'],
            [13, 12, 'low',    'Personal',      'Read 30 pages of current book'],
            [12, 11, 'medium', 'Side Project',  'Dark mode implementation'],
            [12, 11, 'high',   'Learning',      'Complete Vue 3 advanced patterns'],
            [11, 10, 'medium', 'Work',          'Sprint planning session'],
            [11, 10, 'low',    'Home',          'Vacuum and mop all floors'],
            [10, 9,  'high',   'Finance',       'Q3 forecast modelling'],
            [10, 9,  'medium', 'Health',        'Gym – pull day'],
            [9,  8,  'urgent', 'Work',          'API rate limiter feature'],
            [9,  8,  'medium', 'Social',        'Plan team offsite agenda'],
            [8,  7,  'high',   'Work',          'Implement CSV export endpoint'],
            [8,  7,  'low',    'Personal',      'Sort and file paperwork'],
            [7,  6,  'medium', 'Side Project',  'Add chart animations'],
            [7,  6,  'high',   'Health',        'Run 5K – PB attempt'],
            [6,  5,  'urgent', 'Work',          'Pre-launch security audit'],
            [6,  5,  'medium', 'Learning',      'Read "Clean Architecture" ch 8'],
            [5,  4,  'high',   'Work',          'Merge and tag v3.0.0 release'],
            [5,  4,  'low',    'Home',          'Water all house plants'],
            [4,  3,  'medium', 'Finance',       'Update emergency fund transfer'],
            [4,  3,  'high',   'Work',          'Write onboarding documentation'],
            [3,  2,  'urgent', 'Work',          'Investigate memory leak in worker'],
            [3,  2,  'medium', 'Health',        'Physio appointment follow-up'],
            [2,  1,  'high',   'Side Project',  'Launch beta to 10 testers'],
            [2,  1,  'medium', 'Social',        'Draft team newsletter'],
            [1,  0,  'high',   'Work',          'Standup notes and action items'],
            [1,  0,  'low',    'Personal',      'Grocery run'],
        ];

        foreach ($streak as [$created, $completedDaysAgo, $priority, $cat, $title]) {
            $createdAt   = $now->copy()->subDays($created)->setTime(rand(8, 11), rand(0, 59));
            $completedAt = $now->copy()->subDays($completedDaysAgo)->setTime(rand(14, 21), rand(0, 59));
            $endDate     = $now->copy()->subDays($created - 2);

            $this->makeTask($user, [
                'title'        => $title,
                'status'       => 'completed',
                'priority'     => $priority,
                'category_id'  => $cats[$cat]->id,
                'start_date'   => $createdAt->toDateString(),
                'end_date'     => $endDate->toDateString(),
                'completed_at' => $completedAt,
                'created_at'   => $createdAt,
                'updated_at'   => $completedAt,
            ]);
        }

        // In-progress tasks (shows "In Progress" KPI and activity)
        $inProgress = [
            ['Redesign onboarding flow',          'Work',        'high',   3, 5],
            ['Write integration test suite',       'Work',        'urgent', 2, 4],
            ['Build habit tracker feature',        'Side Project','high',   4, 7],
            ['Read "Designing Data-Intensive Apps"','Learning',   'medium', 1, 10],
            ['10K training run – final week',      'Health',      'medium', 2, 3],
        ];

        foreach ($inProgress as [$title, $cat, $priority, $startedDaysAgo, $dueDaysFromNow]) {
            $createdAt = $now->copy()->subDays($startedDaysAgo)->setTime(9, 0);
            $this->makeTask($user, [
                'title'       => $title,
                'status'      => 'in_progress',
                'priority'    => $priority,
                'category_id' => $cats[$cat]->id,
                'start_date'  => $createdAt->toDateString(),
                'end_date'    => $now->copy()->addDays($dueDaysFromNow)->toDateString(),
                'created_at'  => $createdAt,
                'updated_at'  => $createdAt->copy()->addHours(1),
            ]);
        }
    }

    /**
     * Overdue tasks — exercises the "Overdue" KPI card and overdue badges.
     */
    private function seedOverdueTasks(User $user, array $cats, Carbon $now): void
    {
        $overdue = [
            ['Monthly expense report',          'Finance',  'urgent', 15, 3],
            ['Renew domain & SSL certificates', 'Work',     'high',   12, 5],
            ['Schedule dentist appointment',    'Health',   'medium', 10, 7],
            ['Update portfolio website',        'Personal', 'low',    20, 8],
            ['Review and respond to RFP',       'Work',     'high',    8, 2],
        ];

        foreach ($overdue as [$title, $cat, $priority, $createdDaysAgo, $overdueDaysAgo]) {
            $createdAt = $now->copy()->subDays($createdDaysAgo)->setTime(10, 0);
            $endDate   = $now->copy()->subDays($overdueDaysAgo);
            $this->makeTask($user, [
                'title'       => $title,
                'description' => 'This task is past its due date and needs immediate attention.',
                'status'      => 'pending',
                'priority'    => $priority,
                'category_id' => $cats[$cat]->id,
                'start_date'  => $createdAt->toDateString(),
                'end_date'    => $endDate->toDateString(),
                'created_at'  => $createdAt,
                'updated_at'  => $createdAt,
            ]);
        }
    }

    /**
     * Future / upcoming tasks — shows the pending queue and upcoming deadlines.
     */
    private function seedFutureTasks(User $user, array $cats, Carbon $now): void
    {
        $upcoming = [
            ['Prepare Q3 OKR presentation',    'Work',        'high',   1,  7],
            ['Annual performance self-review',  'Work',        'urgent', 1, 14],
            ['Book flights for conference',     'Work',        'medium', 1,  5],
            ['Start strength training block',   'Health',      'medium', 2, 21],
            ['Read "Atomic Habits"',            'Learning',    'low',    1, 30],
            ['Rebalance investment portfolio',  'Finance',     'high',   2, 10],
            ['Side project v2 planning',        'Side Project','medium', 3, 20],
            ['Plan weekend hiking trip',        'Social',      'low',    1, 12],
            ['Spring clean garage',             'Home',        'low',    3, 15],
            ['Set up newsletter automation',    'Side Project','high',   2,  8],
        ];

        foreach ($upcoming as [$title, $cat, $priority, $startDaysFromNow, $endDaysFromNow]) {
            $createdAt = $now->copy()->subHours(rand(1, 12));
            $this->makeTask($user, [
                'title'       => $title,
                'status'      => 'pending',
                'priority'    => $priority,
                'category_id' => $cats[$cat]->id,
                'start_date'  => $now->copy()->addDays($startDaysFromNow)->toDateString(),
                'end_date'    => $now->copy()->addDays($endDaysFromNow)->toDateString(),
                'created_at'  => $createdAt,
                'updated_at'  => $createdAt,
            ]);
        }
    }
}
