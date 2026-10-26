<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    use ApiResponse;


    public function redirect(string $provider)
    {
        $this->checkProvider($provider);

        return Socialite::driver($provider)
            ->stateless()
            ->redirect();
    }


    public function callback(string $provider)
    {
        $this->checkProvider($provider);

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        try {
            $socialUser = Socialite::driver($provider)
                ->stateless()
                ->user();
        } catch (\Throwable $e) {
    dd($e->getMessage(), $e->getTraceAsString());
}

        if (!$socialUser->getEmail()) {
            return redirect()->away($frontendUrl . '/auth/callback?error=' . urlencode('Email permission is required from your social account.'));
        }

        DB::beginTransaction();

        try {
            $user = User::where('email', $socialUser->getEmail())->first();

            if (!$user) {
                $user = User::create([
                    'name'        => $socialUser->getName() ?? 'User',
                    'email'       => $socialUser->getEmail(),
                    'password'    => str()->random(40),
                    'provider'    => $provider,
                    'provider_id' => $socialUser->getId(),
                    'avatar'      => $socialUser->getAvatar(),
                ]);

                $this->createDefaultCategories($user);
            } else {
                $user->update([
                    'provider'    => $provider,
                    'provider_id' => $socialUser->getId(),
                    'avatar'      => $socialUser->getAvatar(),
                ]);
            }

            $user->tokens()->delete();

            $token = $user->createToken('app')->plainTextToken;

            DB::commit();

            return redirect()->away($frontendUrl . '/auth/callback?token=' . $token);

        } catch (\Throwable $e) {
            DB::rollBack();

            return redirect()->away($frontendUrl . '/auth/callback?error=' . urlencode('Unable to login with social account.'));
        }
    }

    private function checkProvider(string $provider): void
    {
        abort_unless(
            in_array($provider, [
                'google',
                'facebook'
            ]),
            404
        );
    }



    private function createDefaultCategories(User $user): void
    {
        $user->categories()->createMany([

            [
                'name' => 'Work',
                'color' => '#3B82F6'
            ],

            [
                'name' => 'Personal',
                'color' => '#10B981'
            ],

            [
                'name' => 'Health',
                'color' => '#EF4444'
            ],

            [
                'name' => 'Learning',
                'color' => '#8B5CF6'
            ],

            [
                'name' => 'Finance',
                'color' => '#F59E0B'
            ],

            [
                'name' => 'Home',
                'color' => '#EC4899'
            ],

            [
                'name' => 'Social',
                'color' => '#06B6D4'
            ],

            [
                'name' => 'Projects',
                'color' => '#84CC16'
            ],

            [
                'name' => 'Other',
                'color' => '#6B7280'
            ],

        ]);
    }
}
