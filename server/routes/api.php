<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'update']);
    Route::put('/password', [AuthController::class, 'password']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/charts', [DashboardController::class, 'charts']);

    Route::apiResource('tasks', TaskController::class);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'status']);

    Route::apiResource('categories', CategoryController::class);

    Route::get('/reports', [ReportController::class, 'index']);
});