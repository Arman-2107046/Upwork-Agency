<?php

namespace App\Models\Concerns;

use App\Models\Activity;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

/**
 * Writes created/updated/deleted entries to the activity log: who changed which record and
 * which fields (names only for long text, never passwords). Models may set
 * `protected array $activityOnly` (log only these fields; changes to others are not logged) or
 * `protected array $activityHidden` (extra fields to leave out).
 */
trait RecordsActivity
{
    /** Never logged: generated, bookkeeping or secret fields. */
    private const ACTIVITY_IGNORED = [
        'updated_at', 'created_at', 'password', 'remember_token', 'body_html', 'toc', 'reading_minutes', 'views',
    ];

    /** Long text: the log says it changed without copying it. */
    private const ACTIVITY_SUMMARISED = ['body', 'bio', 'overview', 'value', 'message'];

    public static function bootRecordsActivity(): void
    {
        static::created(fn ($model) => $model->logActivity('created'));
        static::updated(fn ($model) => $model->logActivity('updated'));
        static::deleted(fn ($model) => $model->logActivity('deleted'));
    }

    public function activityLabel(): string
    {
        return (string) ($this->getAttribute('title') ?? $this->getAttribute('name') ?? $this->getAttribute('label') ?? "#{$this->getKey()}");
    }

    protected function logActivity(string $event): void
    {
        $changes = null;
        if ($event === 'updated') {
            $fields = array_keys($this->getChanges());
            $only = property_exists($this, 'activityOnly') ? $this->activityOnly : null;
            $hidden = property_exists($this, 'activityHidden') ? $this->activityHidden : [];
            $fields = array_values(array_filter($fields, fn (string $f) => ! in_array($f, [...self::ACTIVITY_IGNORED, ...$hidden], true)
                && ($only === null || in_array($f, $only, true))));
            if ($fields === []) {
                return;
            }
            $changes = [];
            foreach ($fields as $field) {
                $from = $this->getOriginal($field);
                $to = $this->getAttribute($field);
                $changes[$field] = match (true) {
                    // Settings documents: name the sections that changed.
                    is_array($from) && is_array($to) && ! array_is_list($to) => ['changed' => array_values(array_filter(
                        array_unique([...array_keys($from), ...array_keys($to)]),
                        fn ($key) => ($from[$key] ?? null) != ($to[$key] ?? null),
                    ))],
                    in_array($field, self::ACTIVITY_SUMMARISED, true) => ['changed' => true],
                    default => ['from' => self::activityValue($from), 'to' => self::activityValue($to)],
                };
            }
        } elseif (property_exists($this, 'activityOnly') && $event !== 'deleted') {
            // Models that log only some fields (comments) skip creation, which readers do.
            return;
        }

        Activity::query()->create([
            'user_id' => Auth::id(),
            'event' => $event,
            'subject_type' => class_basename($this),
            'subject_id' => $this->getKey(),
            'subject_label' => Str::limit($this->activityLabel(), 250),
            'changes' => $changes,
        ]);
    }

    private static function activityValue(mixed $value): mixed
    {
        if ($value instanceof \DateTimeInterface) {
            return $value->format('Y-m-d H:i');
        }
        if (is_array($value)) {
            $value = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        return is_string($value) ? Str::limit($value, 160) : $value;
    }
}
