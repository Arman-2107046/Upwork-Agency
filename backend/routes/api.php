<?php

use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\PostController;
use Illuminate\Support\Facades\Route;

Route::get('/content', ContentController::class)
    ->middleware('cache.headers:public;max_age=60;etag');

Route::get('/posts/{slug}', PostController::class)
    ->where('slug', '[a-z0-9-]+')
    ->middleware('cache.headers:public;max_age=60;etag');

Route::post('/contact', ContactController::class)
    ->middleware('throttle:contact');
