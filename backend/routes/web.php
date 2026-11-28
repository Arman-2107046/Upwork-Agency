<?php

use App\Http\Controllers\FeedController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

Route::get('/sitemap.xml', [SitemapController::class, 'sitemap']);
Route::get('/robots.txt', [SitemapController::class, 'robots']);
Route::get('/blog/rss.xml', FeedController::class);

// Every other GET is a page of the React site (the admin registers its own /admin routes).
Route::get('/', SpaController::class);
// Named so the admin can sign draft preview links (SpaController checks the signature).
Route::get('/blog/{slug}', SpaController::class)->name('blog.post');
Route::fallback(SpaController::class);
