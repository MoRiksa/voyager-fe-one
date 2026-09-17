/**
 * Dialog & Modal Accessibility and Interaction Utilities
 */

/**
 * Handles clicking outside the modal dialog box (on the native ::backdrop).
 * Closes the dialog if the click event originated outside the dialog's bounding rectangle.
 */
export const handleDialogBackdropClick = (event: MouseEvent, onClose?: () => void) => {
  const dialog = event.currentTarget as HTMLDialogElement | null
  if (!dialog) return
  const rect = dialog.getBoundingClientRect()
  const isInside = (
    rect.top <= event.clientY &&
    event.clientY <= rect.top + rect.height &&
    rect.left <= event.clientX &&
    event.clientX <= rect.left + rect.width
  )
  if (!isInside) {
    if (onClose) {
      onClose()
    } else {
      dialog.close()
    }
  }
}
