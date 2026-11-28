{{-- Rendered into the <!--app:head--> slot of the built index.html. data-rh tags are replaced by react-helmet-async. --}}
    <title>{{ $meta['title'] }}</title>
    <meta name="description" data-rh="true" content="{{ $meta['description'] }}" />
    <link rel="canonical" data-rh="true" href="{{ $url }}" />
    <meta name="theme-color" data-rh="true" content="{{ $site['themeColor'] }}" />
@if ($meta['noindex'])
    <meta name="robots" data-rh="true" content="noindex, nofollow" />
@endif
    <meta property="og:type" data-rh="true" content="{{ $meta['type'] }}" />
    <meta property="og:site_name" data-rh="true" content="{{ $site['brandName'] }}" />
    <meta property="og:title" data-rh="true" content="{{ $meta['title'] }}" />
    <meta property="og:description" data-rh="true" content="{{ $meta['description'] }}" />
    <meta property="og:url" data-rh="true" content="{{ $url }}" />
    <meta property="og:image" data-rh="true" content="{{ $image }}" />
@if (! $meta['image'] || $meta['imageIsCard'])
    <meta property="og:image:width" data-rh="true" content="1200" />
    <meta property="og:image:height" data-rh="true" content="630" />
@endif
@if ($meta['article'])
    <meta property="article:published_time" data-rh="true" content="{{ $meta['article']['publishedTime'] }}" />
    <meta property="article:modified_time" data-rh="true" content="{{ $meta['article']['modifiedTime'] }}" />
    <meta property="article:section" data-rh="true" content="{{ $meta['article']['section'] }}" />
@foreach ($meta['article']['tags'] as $tag)
    <meta property="article:tag" data-rh="true" content="{{ $tag }}" />
@endforeach
@if ($meta['article']['author'])
    <meta name="author" data-rh="true" content="{{ $meta['article']['author'] }}" />
@endif
@endif
    <meta name="twitter:card" data-rh="true" content="summary_large_image" />
    <meta name="twitter:title" data-rh="true" content="{{ $meta['title'] }}" />
    <meta name="twitter:description" data-rh="true" content="{{ $meta['description'] }}" />
    <meta name="twitter:image" data-rh="true" content="{{ $image }}" />
    <link rel="alternate" type="application/rss+xml" title="{{ $site['brandName'] }} Blog" href="{{ $site['siteUrl'] }}/blog/rss.xml" />
    <script type="application/ld+json">{!! \App\Http\Controllers\SpaController::json($organization) !!}</script>
@if ($meta['jsonLd'])
    <script type="application/ld+json" data-rh="true">{!! \App\Http\Controllers\SpaController::json(count($meta['jsonLd']) === 1 ? $meta['jsonLd'][0] : $meta['jsonLd']) !!}</script>
@endif
