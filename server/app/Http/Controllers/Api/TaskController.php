<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    use \App\Traits\ApiResponse;

    public function index(Request $request)
    {
        $query = Task::where('user_id', $request->user()->id)
            ->with('category:id,name,color')
            ->when($request->search, function ($q) use ($request) {
                $term = '%' . $request->search . '%';
                $q->where(function ($q) use ($term) {
                    $q->where('title', 'like', $term)
                      ->orWhere('description', 'like', $term);
                });
            })
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->priority, fn($q) => $q->where('priority', $request->priority))
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->when($request->overdue, fn($q) => $q->where('end_date', '<', now())->where('status', '!=', 'completed'))
            ->when($request->active, function ($q) {
                $now = now()->startOfDay();
                $q->where('start_date', '<=', $now)->where('end_date', '>=', $now);
            })
            ->when($request->start_from, fn($q) => $q->whereDate('start_date', '>=', $request->start_from))
            ->when($request->end_to, fn($q) => $q->whereDate('end_date', '<=', $request->end_to));

        $sort = in_array($request->sort, ['title', 'start_date', 'end_date', 'priority', 'status', 'created_at'])
            ? $request->sort : 'created_at';
        $direction = $request->direction === 'asc' ? 'asc' : 'desc';

        if ($sort === 'priority') {
            $query->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low') $direction");
        } else {
            $query->orderBy($sort, $direction);
        }

        $tasks = $query->paginate(min((int) $request->per_page, 50) ?: 10);

        return $this->ok($tasks);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'status' => 'in:pending,in_progress,completed',
            'priority' => 'in:low,medium,high,urgent',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        if (($data['status'] ?? '') === 'completed') {
            $data['completed_at'] = now();
        }

        $task = $request->user()->tasks()->create($data);
        return $this->ok($task->load('category:id,name,color'), 'Task created', 201);
    }

    public function show(Request $request, Task $task)
    {
        if ($task->user_id !== $request->user()->id) abort(403);
        return $this->ok($task->load('category:id,name,color'));
    }

    public function update(Request $request, Task $task)
    {
        if ($task->user_id !== $request->user()->id) abort(403);

        $data = $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string|max:5000',
            'status' => 'in:pending,in_progress,completed',
            'priority' => 'in:low,medium,high,urgent',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        if (isset($data['status'])) {
            $data['completed_at'] = $data['status'] === 'completed' ? now() : null;
        }

        $task->update($data);
        return $this->ok($task->fresh()->load('category:id,name,color'), 'Task updated');
    }

    public function destroy(Request $request, Task $task)
    {
        if ($task->user_id !== $request->user()->id) abort(403);
        $task->delete();
        return $this->ok(null, 'Task deleted');
    }

    public function status(Request $request, Task $task)
    {
        if ($task->user_id !== $request->user()->id) abort(403);

        $request->validate(['status' => 'required|in:pending,in_progress,completed']);

        $task->status = $request->status;
        $task->completed_at = $request->status === 'completed' ? now() : null;
        $task->save();

        return $this->ok($task->fresh()->load('category:id,name,color'), 'Status updated');
    }
}