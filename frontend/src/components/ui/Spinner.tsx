export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-4 [animation:spin_var(--dur-spinner)_linear_infinite] rounded-full border-2 border-current border-r-transparent ${className ?? ''}`}
    />
  )
}
