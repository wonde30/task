<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use \App\Traits\ApiResponse;

    public function index(Request $request)
    {
        $perpage = min((int) $request->query('perpage', 10), 50);
        $categories = Category::where('user_id', $request->user()->id)
            ->withCount('tasks')
            ->orderBy('name')
            ->paginate($perpage);

        return $this->ok($categories);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'color' => 'required|string|size:7',
        ]);

        $data['user_id'] = $request->user()->id;
        $category = Category::create($data);

        return $this->ok($category, 'Category created', 201);
    }

    public function update(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) abort(403);

        $data = $request->validate([
            'name' => 'string|max:100',
            'color' => 'string|size:7',
        ]);

        $category->update($data);
        return $this->ok($category, 'Category updated');
    }

    public function destroy(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) abort(403);
        $category->delete();
        return $this->ok(null, 'Category deleted');
    }
}
