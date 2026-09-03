# Home hero video

The production hero video is stored at `public/videos/home-hero.mp4`.

It is encoded as H.264 High Profile, 8-bit `yuv420p`, 1920×1080 at 30fps, with the MP4 metadata
placed at the start for progressive playback. Audio is omitted because the hero always autoplays muted.
`home-hero-poster.webp` is generated from the video's first second and is used as the loading fallback,
so none of the legacy image hero variants are used.
