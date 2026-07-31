<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use \App\Traits\ApiResponse;

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        $this->seedCategories($user);
        $token = $user->createToken('app')->plainTextToken;

        return $this->ok(['user' => $this->formatUser($user), 'token' => $token], 'Account created', 201);
    }

    public function login(Request $request)
    {
        $request->validate(['email' => 'required|email', 'password' => 'required']);
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->fail('Invalid credentials', 401);
        }

        $user->tokens()->delete();
        $token = $user->createToken('app')->plainTextToken;

        return $this->ok(['user' => $this->formatUser($user), 'token' => $token], 'Welcome back');
    }

    public function user(Request $request)
    {
        return $this->ok($this->formatUser($request->user()));
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $request->user()->id,
        ]);

        $request->user()->update($data);
        return $this->ok($this->formatUser($request->user()->fresh()), 'Profile updated');
    }

    public function password(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|min:8|confirmed',
        ]);

        $request->user()->update(['password' => $request->password]);
        $request->user()->tokens()->delete();
        $token = $request->user()->createToken('app')->plainTextToken;

        return $this->ok(['token' => $token], 'Password changed');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return $this->ok(null, 'Logged out');
    }

    private function formatUser($user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'created_at' => $user->created_at->format('M d, Y'),
        ];
    }

    private function seedCategories($user): void
    {
        $categories = [
            ['name' => 'Work', 'color' => '#3B82F6'],
            ['name' => 'Personal', 'color' => '#10B981'],
            ['name' => 'Health', 'color' => '#EF4444'],
            ['name' => 'Learning', 'color' => '#8B5CF6'],
            ['name' => 'Finance', 'color' => '#F59E0B'],
            ['name' => 'Home', 'color' => '#EC4899'],
            ['name' => 'Social', 'color' => '#06B6D4'],
            ['name' => 'Projects', 'color' => '#84CC16'],
            ['name' => 'Other', 'color' => '#6B7280'],
        ];

        foreach ($categories as $cat) {
            $user->categories()->create($cat);
        }
    }
}