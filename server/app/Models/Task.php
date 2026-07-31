<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use SoftDeletes;

        protected $fillable = [
        'user_id', 'category_id', 'title', 'description',
        'status', 'priority', 'start_date', 'end_date', 'completed_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'completed_at' => 'datetime',
    ];

    protected $appends = ['is_overdue', 'is_active'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function getIsOverdueAttribute(): bool
    {
        if (!$this->end_date) return false;
        if ($this->status === 'completed') return false;
        return $this->end_date->isPast();
    }

    public function getIsActiveAttribute(): bool
    {
        if (!$this->start_date || !$this->end_date) return false;
        $now = now()->startOfDay();
        return $this->start_date->lte($now) && $this->end_date->gte($now);
    }
}
