<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();

            // Category owner
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Category name
            $table->string('name', 100);
            // Category color (optional, for UI badges)
            $table->string('color', 7)->default('#3B82F6');
            $table->timestamps();
            // A user cannot have two categories with the same name
            $table->unique(['user_id', 'name']);

            // Fast user lookups
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};