<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    use \App\Traits\ApiResponse;


    public function redirect($provider)
    {
        return Socialite::driver($provider)
            ->stateless()
            ->redirect();
    }



    public function callback($provider)
    {
        $socialUser = Socialite::driver($provider)
            ->stateless()
            ->user();


        $user = User::where('email', $socialUser->getEmail())
            ->first();


        if (!$user) {

            $user = User::create([

                'name' => $socialUser->getName(),

                'email' => $socialUser->getEmail(),

                'password' => bcrypt(str()->random(32)),

                'provider' => $provider,

                'provider_id' => $socialUser->getId(),

                'avatar' => $socialUser->getAvatar(),

            ]);

            // same categories as normal registration
            $this->seedCategories($user);
        }


        $user->update([
            'provider' => $provider,
            'provider_id' => $socialUser->getId(),
            'avatar' => $socialUser->getAvatar(),
        ]);


        $user->tokens()->delete();

        $token = $user
            ->createToken('app')
            ->plainTextToken;


        return $this->ok([
            'user' => $this->formatUser($user),
            'token' => $token,

        ], 'Social login successful');

    }



    private function formatUser($user): array
    {
        return [
            'id'=>$user->id,
            'name'=>$user->name,
            'email'=>$user->email,
            'avatar'=>$user->avatar,
            'created_at'=>$user->created_at->format('M d, Y'),
        ];
    }



    private function seedCategories($user): void
    {
        $categories = [
            ['name'=>'Work','color'=>'#3B82F6'],
            ['name'=>'Personal','color'=>'#10B981'],
            ['name'=>'Health','color'=>'#EF4444'],
            ['name'=>'Learning','color'=>'#8B5CF6'],
            ['name'=>'Finance','color'=>'#F59E0B'],
            ['name'=>'Home','color'=>'#EC4899'],
            ['name'=>'Social','color'=>'#06B6D4'],
            ['name'=>'Projects','color'=>'#84CC16'],
            ['name'=>'Other','color'=>'#6B7280'],
        ];


        foreach($categories as $category){
            $user->categories()->create($category);
        }
    }
}
