// Augment the Window interface to include YouTube IFrame API globals
interface Window {
  YT: typeof YT
  onYouTubeIframeAPIReady: (() => void) | undefined
}
