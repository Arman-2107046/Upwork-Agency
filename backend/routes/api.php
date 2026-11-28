<?php

use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PostEngagementController;
use Illuminate\Support\Facades\Route;

Route::get('/content', ContentController::class)
    ->middleware(['throttle:content', 'cache.headers:public;max_age=60;etag']);

Route::get('/posts/{slug}', PostController::class)
    ->where('slug', '[a-z0-9-]+')
    ->middleware(['throttle:content', 'cache.headers:public;max_age=60;etag']);

Route::controller(PostEngagementController::class)->prefix('/posts/{slug}')->where(['slug' => '[a-z0-9-]+'])->group(function () {
    Route::post('/view', 'view')->middleware('throttle:blog-view');
    Route::post('/like', 'like')->middleware('throttle:blog-like');
    Route::post('/comments', 'comment')->middleware('throttle:blog-comment');
});

Route::post('/contact', ContactController::class)
    ->middleware('throttle:contact');
