<?php

namespace App\Http\Controllers\Api;

use App\Content\PostPayload;
use App\Filament\Resources\PostComments\PostCommentResource;
use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostLike;
use App\Models\User;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Cookie;
use Throwable;

/**
 * What a reader does on a post: the view count, likes (one per reader, remembered by the
 * "reader" cookie) and comments, which wait for a team member's approval.
 */
class PostEngagementController extends Controller
{
    public const READER_COOKIE = 'reader';

    /** Counted once per page load by the browser. Returns the live counts and this reader's like. */
    public function view(Request $request, string $slug): JsonResponse
    {
        $post = $this->post($slug);
        // Straight to the table: a view is not an edit (no updated_at, no activity log entry).
        Post::query()->whereKey($post->id)->toBase()->increment('views');

        return response()->json([
            'views' => $post->views + 1,
            ...$this->likes($post, $this->token($request)),
            'comments' => $post->comments()->approved()->count(),
        ]);
    }

    public function like(Request $request, string $slug): JsonResponse
    {
        $post = $this->post($slug);
        $token = $this->token($request) ?? 'reader:'.Str::random(40);

        $existing = PostLike::query()->where('post_id', $post->id)->where('token', $token)->first();
        if ($existing) {
            $existing->delete();
        } else {
            PostLike::query()->firstOrCreate(['post_id' => $post->id, 'token' => $token]);
        }

        return response()
            ->json($this->likes($post, $token))
            ->withCookie(new Cookie(self::READER_COOKIE, $token, now()->addYear(), '/', null, $request->isSecure(), true, false, Cookie::SAMESITE_LAX));
    }

    /** Rules mirror frontend/src/lib/validators.ts (commentSchema). */
    public function comment(Request $request, string $slug): JsonResponse
    {
        $post = $this->post($slug);

        // Honeypot: bots fill the hidden field. Pretend success and keep nothing.
        if (filled($request->input('website'))) {
            return response()->json(['comment_sent' => true], 201);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'body' => ['required', 'string', 'min:3', 'max:2000'],
        ], [
            'body.min' => 'Write at least a few words.',
        ]);

        $comment = $post->comments()->create([
            'name' => trim($data['name']),
            'email' => trim($data['email']),
            'body' => trim(str_replace("\r\n", "\n", $data['body'])),
            'status' => PostComment::PENDING,
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 490, ''),
        ]);

        $this->notifyTeam($comment, $post);

        return response()->json(['comment_sent' => true], 201);
    }

    private function post(string $slug): Post
    {
        $post = PostPayload::find($slug);
        abort_if($post === null, 404);

        return $post;
    }

    private function token(Request $request): ?string
    {
        $token = (string) $request->cookie(self::READER_COOKIE);

        return preg_match('/^reader:[A-Za-z0-9]{40}$/', $token) ? $token : null;
    }

    /** @return array{liked: bool, likes: int} */
    private function likes(Post $post, ?string $token): array
    {
        return [
            'liked' => $token !== null && PostLike::query()->where('post_id', $post->id)->where('token', $token)->exists(),
            'likes' => PostLike::query()->where('post_id', $post->id)->count(),
        ];
    }

    /** "New comment to approve" in the admin's notification panel, for everyone who moderates. */
    private function notifyTeam(PostComment $comment, Post $post): void
    {
        try {
            $moderators = User::query()->whereIn('role', [User::ADMIN, User::EDITOR])->get();
            if ($moderators->isEmpty()) {
                return;
            }
            Notification::make()
                ->title('New comment to approve')
                ->body(e("{$comment->name} on “{$post->title}”: ").e(Str::limit($comment->body, 120)))
                ->icon('heroicon-o-chat-bubble-left-ellipsis')
                ->actions([
                    Action::make('moderate')->label('Moderate')->button()->url(PostCommentResource::getUrl('index', panel: 'admin')),
                ])
                ->sendToDatabase($moderators);
        } catch (Throwable $e) {
            Log::error('Comment notification failed', ['comment_id' => $comment->id, 'error' => $e->getMessage()]);
        }
    }
}
